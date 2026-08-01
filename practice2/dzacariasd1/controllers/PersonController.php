<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController {
    private FileManager $fileManager;

    public function __construct() {
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    public function getAll(): void {
        $persons = $this->fileManager->readAll();
        $this->sendResponse(200, $persons);
    }

    public function getById(int $id): void {
        $person = $this->fileManager->findById($id);
        
        if ($person === null) {
            $this->sendResponse(404, ['message' => 'Person not found']);
            return;
        }
        
        $this->sendResponse(200, $person);
    }

    public function create(): void {
        $input = $this->getInputData();
        
        $errors = $this->validatePersonData($input);
        if (!empty($errors)) {
            $this->sendResponse(400, ['errors' => $errors]);
            return;
        }
        
        if ($this->isEmailDuplicate($input['email'])) {
            $this->sendResponse(400, ['message' => 'Email already exists']);
            return;
        }
        
        $personDTO = new PersonDTO(null, $input['name'], $input['birthday'], $input['email']);
        $created = $this->fileManager->create($personDTO->toArray());
        $this->sendResponse(201, $created);
    }

    public function update(int $id): void {
        $input = $this->getInputData();
        
        $existing = $this->fileManager->findById($id);
        if ($existing === null) {
            $this->sendResponse(404, ['message' => 'Person not found']);
            return;
        }
        
        $errors = $this->validatePersonData($input);
        if (!empty($errors)) {
            $this->sendResponse(400, ['errors' => $errors]);
            return;
        }
        
        if ($this->isEmailDuplicate($input['email'], $id)) {
            $this->sendResponse(400, ['message' => 'Email already exists']);
            return;
        }
        
        $personDTO = new PersonDTO($id, $input['name'], $input['birthday'], $input['email']);
        $updated = $this->fileManager->update($id, $personDTO->toArray());
        $this->sendResponse(200, $updated);
    }

    public function delete(int $id): void {
        $existing = $this->fileManager->findById($id);
        if ($existing === null) {
            $this->sendResponse(404, ['message' => 'Person not found']);
            return;
        }
        
        $deleted = $this->fileManager->delete($id);
        if ($deleted) {
            $this->sendResponse(200, ['message' => 'Person deleted successfully']);
        } else {
            $this->sendResponse(500, ['message' => 'Error deleting person']);
        }
    }

    public function getAge(int $id): void {
        $person = $this->fileManager->findById($id);
        
        if ($person === null) {
            $this->sendResponse(404, ['message' => 'Person not found']);
            return;
        }
        
        $birthday = new DateTime($person['birthday']);
        $today = new DateTime('today');
        $age = $birthday->diff($today)->y;
        
        $this->sendResponse(200, [
            'id' => $person['id'],
            'name' => $person['name'],
            'age' => $age
        ]);
    }

    private function validatePersonData(array $data): array {
        $errors = [];
        
        if (empty($data['name']) || trim($data['name']) === '') {
            $errors[] = 'Name is required and cannot be empty';
        }
        
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'A valid email is required';
        }
        
        if (empty($data['birthday'])) {
            $errors[] = 'Birthday is required';
        } else {
            $date = DateTime::createFromFormat('Y-m-d', $data['birthday']);
            if (!$date || $date->format('Y-m-d') !== $data['birthday']) {
                $errors[] = 'Birthday must be in YYYY-MM-DD format';
            } else {
                $today = new DateTime('today');
                if ($date > $today) {
                    $errors[] = 'Birthday cannot be a future date';
                }
            }
        }
        
        return $errors;
    }

    private function isEmailDuplicate(string $email, ?int $excludeId = null): bool {
        $persons = $this->fileManager->readAll();
        foreach ($persons as $person) {
            if ($person['email'] === $email && ($excludeId === null || $person['id'] !== $excludeId)) {
                return true;
            }
        }
        return false;
    }

    private function getInputData(): array {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    private function sendResponse(int $statusCode, $data): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}