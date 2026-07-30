<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

/**
 * PersonController
 *
 * Coordina las solicitudes HTTP relacionadas con "personas":
 * valida la entrada, delega la persistencia al Helper (FileManager),
 * arma la respuesta usando el DTO y define los códigos HTTP.
 * No contiene lógica de lectura/escritura de archivos.
 */
class PersonController
{
    private FileManager $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    private function jsonResponse($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Valida los campos de entrada para crear/actualizar una persona.
     */
    private function validate(array $input): array
    {
        $errors = [];
        $requiredFields = ['name', 'birthday', 'email'];

        foreach ($requiredFields as $field) {
            if (!isset($input[$field]) || trim((string)$input[$field]) === '') {
                $errors[] = "El campo '$field' es obligatorio.";
            }
        }

        if (!empty($errors)) {
            // Si faltan campos obligatorios, no seguimos validando formato.
            return $errors;
        }

        if (trim($input['name']) === '') {
            $errors[] = 'El nombre no puede estar vacío.';
        }

        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El correo debe tener un formato válido.';
        }

        $birthdayDate = DateTime::createFromFormat('Y-m-d', $input['birthday']);
        if (!$birthdayDate || $birthdayDate->format('Y-m-d') !== $input['birthday']) {
            $errors[] = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.';
        } else {
            $today = new DateTime();
            if ($birthdayDate > $today) {
                $errors[] = 'La fecha de nacimiento no puede ser una fecha futura.';
            }
        }

        return $errors;
    }

    private function emailExists(array $persons, string $email, ?int $excludeId = null): bool
    {
        foreach ($persons as $person) {
            $sameEmail = strtolower($person['email']) === strtolower($email);
            $differentPerson = $excludeId === null || (int)$person['id'] !== $excludeId;

            if ($sameEmail && $differentPerson) {
                return true;
            }
        }

        return false;
    }

    private function findPersonIndex(array $persons, int $id): ?int
    {
        foreach ($persons as $index => $person) {
            if ((int)$person['id'] === $id) {
                return $index;
            }
        }

        return null;
    }

    /** POST /api/persons */
    public function create(array $input): void
    {
        $errors = $this->validate($input);
        $persons = $this->fileManager->readAll();

        if (empty($errors) && $this->emailExists($persons, $input['email'])) {
            $errors[] = 'No se permiten correos duplicados.';
        }

        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
            return;
        }

        $newId = $this->fileManager->getNextId($persons);
        $dto = new PersonDTO($newId, $input['name'], $input['birthday'], $input['email']);

        $persons[] = $dto->toArray();

        if (!$this->fileManager->writeAll($persons)) {
            $this->jsonResponse(['message' => 'No se pudo guardar la información'], 500);
            return;
        }

        $this->jsonResponse($dto->toArray(), 201);
    }

    /** GET /api/persons */
    public function getAll(): void
    {
        $persons = $this->fileManager->readAll();
        $this->jsonResponse($persons, 200);
    }

    /** GET /api/persons/{id} */
    public function getById(int $id): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findPersonIndex($persons, $id);

        if ($index === null) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
            return;
        }

        $this->jsonResponse($persons[$index], 200);
    }

    /** PUT /api/persons/{id} */
    public function update(int $id, array $input): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findPersonIndex($persons, $id);

        if ($index === null) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
            return;
        }

        $errors = $this->validate($input);

        if (empty($errors) && $this->emailExists($persons, $input['email'], $id)) {
            $errors[] = 'No se permiten correos duplicados.';
        }

        if (!empty($errors)) {
            $this->jsonResponse(['errors' => $errors], 400);
            return;
        }

        $dto = new PersonDTO($id, $input['name'], $input['birthday'], $input['email']);
        $persons[$index] = $dto->toArray();

        if (!$this->fileManager->writeAll($persons)) {
            $this->jsonResponse(['message' => 'No se pudo actualizar la información'], 500);
            return;
        }

        $this->jsonResponse($dto->toArray(), 200);
    }

    /** DELETE /api/persons/{id} */
    public function delete(int $id): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findPersonIndex($persons, $id);

        if ($index === null) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
            return;
        }

        array_splice($persons, $index, 1);

        if (!$this->fileManager->writeAll($persons)) {
            $this->jsonResponse(['message' => 'No se pudo eliminar la información'], 500);
            return;
        }

        $this->jsonResponse(['message' => 'Person deleted successfully'], 200);
    }

    /** GET /api/persons/{id}/age */
    public function getAge(int $id): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findPersonIndex($persons, $id);

        if ($index === null) {
            $this->jsonResponse(['message' => 'Person not found'], 404);
            return;
        }

        $person = $persons[$index];
        $birthday = DateTime::createFromFormat('Y-m-d', $person['birthday']);
        $today = new DateTime();
        $age = $birthday->diff($today)->y;

        $this->jsonResponse([
            'id' => (int)$person['id'],
            'name' => $person['name'],
            'age' => $age,
        ], 200);
    }
}
