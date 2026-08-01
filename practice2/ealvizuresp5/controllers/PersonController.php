<?php

declare(strict_types=1);

class PersonController
{
    public function __construct(private FileManager $fileManager)
    {
    }

    public function getAll(): void
    {
        $this->respond($this->fileManager->read());
    }

    public function getById(int $id): void
    {
        $person = $this->findPerson($id);

        if ($person === null) {
            $this->respond(['message' => 'Person not found'], 404);
            return;
        }

        $this->respond($person);
    }

    public function create(array $data): void
    {
        $persons = $this->fileManager->read();
        $errors = $this->validate($data, $persons);

        if ($errors !== []) {
            $this->validationError($errors);
            return;
        }

        $highestId = 0;
        foreach ($persons as $person) {
            $highestId = max($highestId, (int) ($person['id'] ?? 0));
        }

        $person = new PersonDTO(
            $highestId + 1,
            trim($data['name']),
            $data['birthday'],
            trim($data['email'])
        );

        $persons[] = $person->toArray();
        $this->fileManager->write($persons);
        $this->respond($person->toArray(), 201);
    }

    public function update(int $id, array $data): void
    {
        $persons = $this->fileManager->read();
        $index = $this->findIndex($persons, $id);

        if ($index === null) {
            $this->respond(['message' => 'Person not found'], 404);
            return;
        }

        $errors = $this->validate($data, $persons, $id);

        if ($errors !== []) {
            $this->validationError($errors);
            return;
        }

        $person = new PersonDTO(
            $id,
            trim($data['name']),
            $data['birthday'],
            trim($data['email'])
        );

        $persons[$index] = $person->toArray();
        $this->fileManager->write(array_values($persons));
        $this->respond($person->toArray());
    }

    public function delete(int $id): void
    {
        $persons = $this->fileManager->read();
        $index = $this->findIndex($persons, $id);

        if ($index === null) {
            $this->respond(['message' => 'Person not found'], 404);
            return;
        }

        array_splice($persons, $index, 1);
        $this->fileManager->write($persons);
        $this->respond(['message' => 'Person deleted']);
    }

    public function getAge(int $id): void
    {
        $person = $this->findPerson($id);

        if ($person === null) {
            $this->respond(['message' => 'Person not found'], 404);
            return;
        }

        $birthday = DateTime::createFromFormat('!Y-m-d', $person['birthday']);
        $today = new DateTime('today');

        $this->respond([
            'id' => $person['id'],
            'name' => $person['name'],
            'age' => $birthday->diff($today)->y,
        ]);
    }

    private function validate(array $data, array $persons, ?int $currentId = null): array
    {
        $errors = [];

        foreach (['name', 'birthday', 'email'] as $field) {
            if (!array_key_exists($field, $data)) {
                $errors[$field] = 'This field is required';
            }
        }

        if (array_key_exists('name', $data)) {
            if (!is_string($data['name'])) {
                $errors['name'] = 'Name must be a string';
            } elseif (trim($data['name']) === '') {
                $errors['name'] = 'Name cannot be empty';
            }
        }

        if (array_key_exists('email', $data)) {
            if (!is_string($data['email'])) {
                $errors['email'] = 'Email must be a string';
            } else {
                $email = trim($data['email']);

                if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                    $errors['email'] = 'Email is invalid';
                } elseif ($this->emailExists($email, $persons, $currentId)) {
                    $errors['email'] = 'Email is already registered';
                }
            }
        }

        if (array_key_exists('birthday', $data)) {
            if (!is_string($data['birthday'])) {
                $errors['birthday'] = 'Birthday must be a string';
            } elseif (!$this->isValidBirthday($data['birthday'])) {
                $errors['birthday'] = 'Birthday must be a valid date in YYYY-MM-DD format and cannot be in the future';
            }
        }

        return $errors;
    }

    private function isValidBirthday(string $birthday): bool
    {
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthday) !== 1) {
            return false;
        }

        $date = DateTime::createFromFormat('!Y-m-d', $birthday);
        $errors = DateTime::getLastErrors();

        if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return false;
        }

        return $date->format('Y-m-d') === $birthday && $date <= new DateTime('today');
    }

    private function emailExists(string $email, array $persons, ?int $currentId): bool
    {
        foreach ($persons as $person) {
            if ((int) ($person['id'] ?? 0) === $currentId) {
                continue;
            }

            if (isset($person['email']) && strcasecmp($person['email'], $email) === 0) {
                return true;
            }
        }

        return false;
    }

    private function findPerson(int $id): ?array
    {
        foreach ($this->fileManager->read() as $person) {
            if ((int) ($person['id'] ?? 0) === $id) {
                return $person;
            }
        }

        return null;
    }

    private function findIndex(array $persons, int $id): ?int
    {
        foreach ($persons as $index => $person) {
            if ((int) ($person['id'] ?? 0) === $id) {
                return $index;
            }
        }

        return null;
    }

    private function validationError(array $errors): void
    {
        $this->respond([
            'message' => 'Validation failed',
            'errors' => $errors,
        ], 400);
    }

    private function respond(array $body, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
    }
}
