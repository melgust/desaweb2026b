<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

/**
 * PersonController
 *
 * Gestiona las solicitudes HTTP relacionadas con personas
 * y coordina las operaciones de la API.
 */
class PersonController
{
    private FileManager $fileManager;

    public function __construct(FileManager $fileManager)
    {
        $this->fileManager = $fileManager;
    }

    /**
     * POST /api/persons
     * Crea una nueva persona.
     */
    public function create(array $requestBody): void
    {
        $errors = $this->validate($requestBody);

        if (!empty($errors)) {
            $this->respond(400, ['errors' => $errors]);
            return;
        }

        $dto = new PersonDTO(
            $this->fileManager->nextId(),
            trim($requestBody['name']),
            trim($requestBody['birthday']),
            trim($requestBody['email'])
        );

        $persons = $this->fileManager->readAll();
        $persons[] = $dto->toArray();

        if (!$this->fileManager->writeAll($persons)) {
            $this->respond(500, ['message' => 'No se pudo guardar la persona.']);
            return;
        }

        $this->respond(201, $dto->toArray());
    }

    /**
     * GET /api/persons
     * Obtiene todas las personas.
     */
    public function getAll(): void
    {
        $persons = $this->fileManager->readAll();
        $this->respond(200, $persons);
    }

    /**
     * GET /api/persons/{id}
     * Obtiene una persona por su ID.
     */
    public function getById(int $id): void
    {
        $person = $this->findById($id);

        if ($person === null) {
            $this->respond(404, ['message' => "Person not found"]);
            return;
        }

        $this->respond(200, $person);
    }

    /**
     * PUT /api/persons/{id}
     * Actualiza una persona existente.
     */
    public function update(int $id, array $requestBody): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findIndexById($persons, $id);

        if ($index === null) {
            $this->respond(404, ['message' => "Persona con id {$id} no encontrada."]);
            return;
        }

        $errors = $this->validate($requestBody);
        if (!empty($errors)) {
            $this->respond(400, ['errors' => $errors]);
            return;
        }

        $dto = new PersonDTO(
            $id,
            trim($requestBody['name']),
            trim($requestBody['birthday']),
            trim($requestBody['email'])
        );

        $persons[$index] = $dto->toArray();

        if (!$this->fileManager->writeAll($persons)) {
            $this->respond(500, ['message' => 'No se pudo actualizar la persona.']);
            return;
        }

        $this->respond(200, $dto->toArray());
    }

    /**
     * DELETE /api/persons/{id}
     * Elimina una persona por su ID.
     */
    public function delete(int $id): void
    {
        $persons = $this->fileManager->readAll();
        $index = $this->findIndexById($persons, $id);

        if ($index === null) {
            $this->respond(404, ['message' => "Persona con id {$id} no encontrada."]);
            return;
        }

        array_splice($persons, $index, 1);

        if (!$this->fileManager->writeAll($persons)) {
            $this->respond(500, ['message' => 'No se pudo eliminar la persona.']);
            return;
        }

        $this->respond(200, ['message' => "Persona con id {$id} eliminada correctamente."]);
    }

    /**
     * GET /api/persons/{id}/age
     * Obtiene la edad de una persona calculada a partir de su fecha de nacimiento.
     */
    public function getAge(int $id): void
    {
        $person = $this->findById($id);

        if ($person === null) {
            $this->respond(404, ['message' => "Persona con id {$id} no encontrada."]);
            return;
        }

        try {
            $birthDate = new DateTime($person['birthday']);
            $today = new DateTime('today');
            $age = $birthDate->diff($today)->y;
        } catch (Exception $e) {
            $this->respond(400, ['message' => 'La fecha de nacimiento almacenada no es válida.']);
            return;
        }

        $this->respond(200, [
            'id'   => $person['id'],
            'name' => $person['name'],
            'age'  => $age,
        ]);
    }

    // ----------------- Métodos auxiliares -----------------

    private function findById(int $id): ?array
    {
        $persons = $this->fileManager->readAll();

        foreach ($persons as $person) {
            if ((int) $person['id'] === $id) {
                return $person;
            }
        }

        return null;
    }

    private function findIndexById(array $persons, int $id): ?int
    {
        foreach ($persons as $index => $person) {
            if ((int) $person['id'] === $id) {
                return $index;
            }
        }

        return null;
    }

    /**
     * Valida los campos obligatorios del body de la petición.
     */
    private function validate(array $data): array
    {
        $errors = [];

        if (empty($data['name']) || !is_string($data['name'])) {
            $errors[] = 'El campo "name" es obligatorio y debe ser texto.';
        }

        if (empty($data['birthday']) || !is_string($data['birthday'])) {
            $errors[] = 'El campo "birthday" es obligatorio y debe ser texto.';
        } elseif (!$this->isValidDate($data['birthday'])) {
            $errors[] = 'El campo "birthday" debe tener el formato YYYY-MM-DD.';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El campo "email" es obligatorio y debe ser un correo válido.';
        }

        return $errors;
    }

    private function isValidDate(string $date): bool
    {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    /**
     * Envía una respuesta JSON con el código de estado HTTP indicado.
     */
    private function respond(int $statusCode, $data): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}
