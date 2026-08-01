<?php

namespace App\Controllers;

use App\DTO\PersonDTO;
use App\Helpers\FileManager;

class PersonController
{
    private FileManager $fileManager;

    public function __construct(?FileManager $fileManager = null)
    {
        $this->fileManager = $fileManager ?? new FileManager();
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function validatePersonData(array $data, ?int $currentId = null): array
    {
        $errors = [];

        // Validación de campos obligatorios presentes
        if (!array_key_exists('name', $data) || !array_key_exists('birthday', $data) || !array_key_exists('email', $data)) {
            return ['All fields (name, birthday, email) are mandatory.'];
        }

        $name = trim((string)$data['name']);
        $birthday = trim((string)$data['birthday']);
        $email = trim((string)$data['email']);

        // Nombre no puede estar vacío
        if (empty($name)) {
            $errors[] = 'Name cannot be empty.';
        }

        // Validación de formato y duplicados de correo electrónico
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format.';
        } else {
            $allPersons = $this->fileManager->readData();
            foreach ($allPersons as $p) {
                if (isset($p['email']) && strtolower($p['email']) === strtolower($email)) {
                    if ($currentId === null || (int)$p['id'] !== (int)$currentId) {
                        $errors[] = 'Email is already in use by another person.';
                        break;
                    }
                }
            }
        }

        // Validación de fecha de nacimiento
        if (empty($birthday)) {
            $errors[] = 'Birthday cannot be empty.';
        } else {
            $d = \DateTime::createFromFormat('Y-m-d', $birthday);
            $dateErrors = \DateTime::getLastErrors();

            if (!$d || ($dateErrors && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) || $d->format('Y-m-d') !== $birthday) {
                $errors[] = 'Birthday must be a valid date in format YYYY-MM-DD.';
            } else {
                $today = new \DateTime('today');
                if ($d > $today) {
                    $errors[] = 'Birthday cannot be a future date.';
                }
            }
        }

        return $errors;
    }

    // GET /api/persons
    public function getAll(): void
    {
        $persons = $this->fileManager->readData();
        $this->jsonResponse($persons, 200);
    }

    // GET /api/persons/{id}
    public function getById(int $id): void
    {
        $persons = $this->fileManager->readData();
        foreach ($persons as $person) {
            if ((int)$person['id'] === $id) {
                $this->jsonResponse($person, 200);
            }
        }

        $this->jsonResponse(['message' => 'Person not found'], 404);
    }

    // POST /api/persons
    public function create(array $input): void
    {
        $errors = $this->validatePersonData($input);
        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
        }

        $persons = $this->fileManager->readData();
        $newId = $this->fileManager->getNextId($persons);

        $dto = new PersonDTO(
            $newId,
            trim($input['name']),
            trim($input['birthday']),
            trim($input['email'])
        );

        $persons[] = $dto->toArray();
        $this->fileManager->writeData($persons);

        $this->jsonResponse($dto->toArray(), 201);
    }

    // PUT /api/persons/{id}
    public function update(int $id, array $input): void
    {
        $persons = $this->fileManager->readData();
        $foundIndex = -1;

        foreach ($persons as $index => $person) {
            if ((int)$person['id'] === $id) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
        }

        $errors = $this->validatePersonData($input, $id);
        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
        }

        $dto = new PersonDTO(
            $id,
            trim($input['name']),
            trim($input['birthday']),
            trim($input['email'])
        );

        $persons[$foundIndex] = $dto->toArray();
        $this->fileManager->writeData($persons);

        $this->jsonResponse($dto->toArray(), 200);
    }

    // DELETE /api/persons/{id}
    public function delete(int $id): void
    {
        $persons = $this->fileManager->readData();
        $filteredPersons = [];
        $found = false;

        foreach ($persons as $person) {
            if ((int)$person['id'] === $id) {
                $found = true;
            } else {
                $filteredPersons[] = $person;
            }
        }

        if (!$found) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
        }

        $this->fileManager->writeData($filteredPersons);
        $this->jsonResponse(['message' => 'Person deleted successfully'], 200);
    }

    // GET /api/persons/{id}/age
    public function getAge(int $id): void
    {
        $persons = $this->fileManager->readData();
        foreach ($persons as $person) {
            if ((int)$person['id'] === $id) {
                $birthday = $person['birthday'];
                $birthDate = \DateTime::createFromFormat('Y-m-d', $birthday);
                $today = new \DateTime('today');
                $age = $birthDate->diff($today)->y;

                $response = [
                    'id' => (int)$person['id'],
                    'name' => $person['name'],
                    'age' => $age
                ];

                $this->jsonResponse($response, 200);
            }
        }

        $this->jsonResponse(['message' => 'Person not found'], 404);
    }
}
