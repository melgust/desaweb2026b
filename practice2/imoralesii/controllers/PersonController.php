<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController {
    private FileManager $fileManager;

    public function __construct() {
        $this->fileManager = new FileManager();
    }

    // Respuesta genérica JSON con código de estado HTTP
    private function jsonResponse(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Validaciones (Se corrigió ?mixed a mixed)
    private function validatePersonData(array $inputData, mixed $currentId = null): array {
        $errors = [];

        // 1. Campos obligatorios
        if (!isset($inputData['name']) || !isset($inputData['birthday']) || !isset($inputData['email'])) {
            return ['Los campos name, birthday y email son obligatorios.'];
        }

        $name = trim($inputData['name']);
        $birthday = trim($inputData['birthday']);
        $email = trim($inputData['email']);

        // 2. Nombre no vacío
        if (empty($name)) {
            $errors[] = 'El nombre no puede estar vacío.';
        }

        // 3. Formato de correo válido
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El correo electrónico no tiene un formato válido.';
        }

        // 4. Correo no duplicado
        $persons = $this->fileManager->readData();
        foreach ($persons as $person) {
            if ($person['email'] === $email && ($currentId === null || $person['id'] != $currentId)) {
                $errors[] = 'El correo electrónico ya se encuentra registrado.';
                break;
            }
        }

        // 5. Formato de fecha YYYY-MM-DD
        $dateObj = DateTime::createFromFormat('Y-m-d', $birthday);
        if (!$dateObj || $dateObj->format('Y-m-d') !== $birthday) {
            $errors[] = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.';
        } else {
            // 6. Fecha no futura
            $today = new DateTime('today');
            if ($dateObj > $today) {
                $errors[] = 'La fecha de nacimiento no puede ser una fecha futura.';
            }
        }

        return $errors;
    }

    // GET /api/persons
    public function getAll(): void {
        $persons = $this->fileManager->readData();
        $this->jsonResponse($persons, 200);
    }

    // GET /api/persons/{id}
    public function getById(mixed $id): void {
        $persons = $this->fileManager->readData();
        foreach ($persons as $person) {
            if ($person['id'] == $id) {
                $this->jsonResponse($person, 200);
            }
        }
        $this->jsonResponse(['message' => 'Person not found'], 404);
    }

    // POST /api/persons
    public function create(): void {
        $rawInput = file_get_contents('php://input');
        $inputData = json_decode($rawInput, true) ?? [];

        $errors = $this->validatePersonData($inputData);
        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
        }

        $persons = $this->fileManager->readData();

        // Generar ID único autoincremental
        $maxId = 0;
        foreach ($persons as $person) {
            if (isset($person['id']) && $person['id'] > $maxId) {
                $maxId = (int)$person['id'];
            }
        }
        $newId = $maxId + 1;

        // Uso del DTO
        $dto = new PersonDTO(
            $newId,
            trim($inputData['name']),
            trim($inputData['birthday']),
            trim($inputData['email'])
        );

        $newPerson = $dto->toArray();
        $persons[] = $newPerson;
        $this->fileManager->writeData($persons);

        $this->jsonResponse($newPerson, 201);
    }

    // PUT /api/persons/{id}
    public function update(mixed $id): void {
        $persons = $this->fileManager->readData();
        $foundIndex = -1;

        foreach ($persons as $index => $person) {
            if ($person['id'] == $id) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
        }

        $rawInput = file_get_contents('php://input');
        $inputData = json_decode($rawInput, true) ?? [];

        $errors = $this->validatePersonData($inputData, $id);
        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
        }

        // Uso del DTO para la actualización
        $dto = new PersonDTO(
            $persons[$foundIndex]['id'],
            trim($inputData['name']),
            trim($inputData['birthday']),
            trim($inputData['email'])
        );

        $updatedPerson = $dto->toArray();
        $persons[$foundIndex] = $updatedPerson;
        $this->fileManager->writeData($persons);

        $this->jsonResponse($updatedPerson, 200);
    }

    // DELETE /api/persons/{id}
    public function delete(mixed $id): void {
        $persons = $this->fileManager->readData();
        $filteredPersons = [];
        $found = false;

        foreach ($persons as $person) {
            if ($person['id'] == $id) {
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
    public function getAge(mixed $id): void {
        $persons = $this->fileManager->readData();
        $foundPerson = null;

        foreach ($persons as $person) {
            if ($person['id'] == $id) {
                $foundPerson = $person;
                break;
            }
        }

        if (!$foundPerson) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
        }

        // Cálculo dinámico de edad usando DateTime
        $birthDate = new DateTime($foundPerson['birthday']);
        $today = new DateTime('today');
        $age = $birthDate->diff($today)->y;

        $this->jsonResponse([
            'id' => $foundPerson['id'],
            'name' => $foundPerson['name'],
            'age' => $age
        ], 200);
    }
}