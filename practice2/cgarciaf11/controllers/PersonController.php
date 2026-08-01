<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController {
    private FileManager $fileManager;

    public function __construct() {
        $this->fileManager = new FileManager();
    }

    /**
     * Helper para obtener el JSON enviado en el cuerpo de la petición
     */
    private function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Helper para enviar respuestas JSON estandarizadas
     */
    private function jsonResponse(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Validaciones requeridas para los datos de entrada
     */
    private function validateData(array $data, ?int $currentId = null): ?string {
        if (!isset($data['name']) || !isset($data['birthday']) || !isset($data['email'])) {
            return "Todos los campos (name, birthday, email) son obligatorios.";
        }

        if (trim($data['name']) === '') {
            return "El nombre no puede estar vacío.";
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return "El correo electrónico no tiene un formato válido.";
        }

        // Validación de fecha YYYY-MM-DD
        $d = DateTime::createFromFormat('Y-m-d', $data['birthday']);
        if (!$d || $d->format('Y-m-d') !== $data['birthday']) {
            return "La fecha de nacimiento debe tener el formato YYYY-MM-DD.";
        }

        // Fecha de nacimiento no futura
        $today = new DateTime();
        if ($d > $today) {
            return "La fecha de nacimiento no puede ser una fecha futura.";
        }

        // Validar correo duplicado
        $persons = $this->fileManager->getAll();
        foreach ($persons as $p) {
            if (isset($p['email']) && $p['email'] === $data['email']) {
                if ($currentId !== null && isset($p['id']) && $p['id'] == $currentId) {
                    continue; // Permitir el mismo correo si es la misma persona al actualizar
                }
                return "El correo electrónico ya se encuentra registrado.";
            }
        }

        return null;
    }

    // GET /api/persons
    public function getAll(): void {
        $persons = $this->fileManager->getAll();
        $this->jsonResponse($persons, 200);
    }

    // GET /api/persons/{id}
    public function getById(int $id): void {
        $persons = $this->fileManager->getAll();
        foreach ($persons as $p) {
            if ($p['id'] == $id) {
                $this->jsonResponse($p, 200);
            }
        }
        $this->jsonResponse(["message" => "Person not found"], 404);
    }

    // POST /api/persons
    public function create(): void {
        $data = $this->getJsonInput();
        $error = $this->validateData($data);
        if ($error) {
            $this->jsonResponse(["message" => $error], 400);
        }

        $nextId = $this->fileManager->generateNextId();
        $dto = new PersonDTO($nextId, trim($data['name']), $data['birthday'], trim($data['email']));

        $persons = $this->fileManager->getAll();
        $persons[] = $dto->toArray();
        $this->fileManager->saveAll($persons);

        $this->jsonResponse($dto->toArray(), 201);
    }

    // PUT /api/persons/{id}
    public function update(int $id): void {
        $data = $this->getJsonInput();
        $persons = $this->fileManager->getAll();
        $indexFound = -1;

        foreach ($persons as $index => $p) {
            if ($p['id'] == $id) {
                $indexFound = $index;
                break;
            }
        }

        if ($indexFound === -1) {
            $this->jsonResponse(["message" => "Person not found"], 404);
        }

        $error = $this->validateData($data, $id);
        if ($error) {
            $this->jsonResponse(["message" => $error], 400);
        }

        $dto = new PersonDTO($id, trim($data['name']), $data['birthday'], trim($data['email']));
        $persons[$indexFound] = $dto->toArray();
        $this->fileManager->saveAll($persons);

        $this->jsonResponse($dto->toArray(), 200);
    }

    // DELETE /api/persons/{id}
    public function delete(int $id): void {
        $persons = $this->fileManager->getAll();
        $filtered = array_filter($persons, fn($p) => $p['id'] != $id);

        if (count($persons) === count($filtered)) {
            $this->jsonResponse(["message" => "Person not found"], 404);
        }

        $this->fileManager->saveAll(array_values($filtered));
        $this->jsonResponse(["message" => "Person deleted successfully"], 200);
    }

    // GET /api/persons/{id}/age
    public function getAge(int $id): void {
        $persons = $this->fileManager->getAll();
        foreach ($persons as $p) {
            if ($p['id'] == $id) {
                $birthday = new DateTime($p['birthday']);
                $today = new DateTime();
                $age = $today->diff($birthday)->y;

                $this->jsonResponse([
                    "id" => $p['id'],
                    "name" => $p['name'],
                    "age" => $age
                ], 200);
            }
        }
        $this->jsonResponse(["message" => "Person not found"], 404);
    }
}