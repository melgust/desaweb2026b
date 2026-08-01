<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

/**
 * PersonController
 *
 * Coordina las solicitudes HTTP relacionadas con "personas".
 * Se encarga de: leer el input, validar, delegar la persistencia
 * al Helper, construir el DTO y devolver la respuesta HTTP en JSON.
 * No contiene lógica de lectura/escritura de archivos (eso es del Helper)
 * ni reglas de negocio ajenas a "personas".
 */
class PersonController
{
    private $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    private function sendResponse($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function getJsonInput(): ?array
    {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Valida los datos de entrada según las reglas del instructivo.
     * $excludeId se usa en update para no comparar el email contra sí mismo.
     */
    private function validate(array $input, $excludeId = null): array
    {
        $errors = [];

        if (empty($input['name']) || trim($input['name']) === '') {
            $errors[] = 'El campo name es obligatorio y no puede estar vacío';
        }

        if (empty($input['birthday'])) {
            $errors[] = 'El campo birthday es obligatorio';
        } else {
            $date = DateTime::createFromFormat('Y-m-d', $input['birthday']);
            $isValidFormat = $date && $date->format('Y-m-d') === $input['birthday'];

            if (!$isValidFormat) {
                $errors[] = 'El campo birthday debe tener el formato YYYY-MM-DD';
            } elseif ($date > new DateTime('today')) {
                $errors[] = 'El campo birthday no puede ser una fecha futura';
            }
        }

        if (empty($input['email'])) {
            $errors[] = 'El campo email es obligatorio';
        } elseif (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El campo email debe tener un formato válido';
        } else {
            $persons = $this->fileManager->readAll();
            foreach ($persons as $p) {
                $isSameEmail = strcasecmp($p['email'], $input['email']) === 0;
                $isDifferentPerson = $p['id'] != $excludeId;
                if ($isSameEmail && $isDifferentPerson) {
                    $errors[] = 'El correo ya está registrado';
                    break;
                }
            }
        }

        return $errors;
    }

    public function create(): void
    {
        $input = $this->getJsonInput();

        if ($input === null) {
            $this->sendResponse(['message' => 'El cuerpo de la solicitud debe ser un JSON válido'], 400);
        }

        $errors = $this->validate($input);
        if (!empty($errors)) {
            $this->sendResponse(['errors' => $errors], 400);
        }

        $persons = $this->fileManager->readAll();
        $newId = $this->fileManager->getNextId($persons);

        $dto = new PersonDTO($newId, $input['name'], $input['birthday'], $input['email']);
        $persons[] = $dto->toArray();

        $this->fileManager->writeAll($persons);

        $this->sendResponse($dto->toArray(), 201);
    }

    public function getAll(): void
    {
        $persons = $this->fileManager->readAll();
        $this->sendResponse($persons, 200);
    }

    public function getById($id): void
    {
        $persons = $this->fileManager->readAll();

        foreach ($persons as $p) {
            if ((string)$p['id'] === (string)$id) {
                $this->sendResponse($p, 200);
            }
        }

        $this->sendResponse(['message' => 'Person not found'], 404);
    }

    public function update($id): void
    {
        $input = $this->getJsonInput();

        if ($input === null) {
            $this->sendResponse(['message' => 'El cuerpo de la solicitud debe ser un JSON válido'], 400);
        }

        $errors = $this->validate($input, $id);
        if (!empty($errors)) {
            $this->sendResponse(['errors' => $errors], 400);
        }

        $persons = $this->fileManager->readAll();
        $found = false;
        $updated = null;

        foreach ($persons as &$p) {
            if ((string)$p['id'] === (string)$id) {
                $dto = new PersonDTO($p['id'], $input['name'], $input['birthday'], $input['email']);
                $p = $dto->toArray();
                $updated = $p;
                $found = true;
                break;
            }
        }
        unset($p);

        if (!$found) {
            $this->sendResponse(['message' => 'Person not found'], 404);
        }

        $this->fileManager->writeAll($persons);
        $this->sendResponse($updated, 200);
    }

    public function delete($id): void
    {
        $persons = $this->fileManager->readAll();

        $filtered = array_values(array_filter($persons, function ($p) use ($id) {
            return (string)$p['id'] !== (string)$id;
        }));

        if (count($filtered) === count($persons)) {
            $this->sendResponse(['message' => 'Person not found'], 404);
        }

        $this->fileManager->writeAll($filtered);
        $this->sendResponse(['message' => 'Person deleted'], 200);
    }

    public function getAge($id): void
    {
        $persons = $this->fileManager->readAll();

        foreach ($persons as $p) {
            if ((string)$p['id'] === (string)$id) {
                $birthday = new DateTime($p['birthday']);
                $today = new DateTime('today');
                $age = $today->diff($birthday)->y;

                $this->sendResponse([
                    'id'   => $p['id'],
                    'name' => $p['name'],
                    'age'  => $age,
                ], 200);
            }
        }

        $this->sendResponse(['message' => 'Person not found'], 404);
    }
}
