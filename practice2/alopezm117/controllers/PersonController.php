<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

/**
 * PersonController
 *
 * Centraliza la lógica de los endpoints de /api/persons.
 * Se encarga de: recibir los datos de entrada, validarlos,
 * coordinar el uso del DTO y del FileManager, y devolver una
 * respuesta ya lista para enviarse como JSON (status + body).
 * No sabe nada de cómo se lee/escribe el archivo (eso es
 * responsabilidad del Helper) ni imprime directamente la salida
 * (eso lo hace el router en api/index.php).
 */
class PersonController
{
    private FileManager $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    /**
     * GET /api/persons
     */
    public function index(): array
    {
        return [
            'status' => 200,
            'body' => $this->fileManager->readAll(),
        ];
    }

    /**
     * GET /api/persons/{id}
     */
    public function show(int $id): array
    {
        $person = $this->findById($id);

        if ($person === null) {
            return ['status' => 404, 'body' => ['message' => 'Person not found']];
        }

        return ['status' => 200, 'body' => $person];
    }

    /**
     * POST /api/persons
     */
    public function store(array $input): array
    {
        $errors = $this->validate($input, null);

        if (!empty($errors)) {
            return ['status' => 400, 'body' => ['errors' => $errors]];
        }

        $records = $this->fileManager->readAll();
        $newId = $this->fileManager->getNextId($records);

        $dto = new PersonDTO($newId, trim($input['name']), $input['birthday'], trim($input['email']));
        $records[] = $dto->toArray();
        $this->fileManager->writeAll($records);

        return ['status' => 201, 'body' => $dto->toArray()];
    }

    /**
     * PUT /api/persons/{id}
     */
    public function update(int $id, array $input): array
    {
        $records = $this->fileManager->readAll();
        $index = $this->findIndexById($records, $id);

        if ($index === null) {
            return ['status' => 404, 'body' => ['message' => 'Person not found']];
        }

        $errors = $this->validate($input, $id);

        if (!empty($errors)) {
            return ['status' => 400, 'body' => ['errors' => $errors]];
        }

        $dto = new PersonDTO($id, trim($input['name']), $input['birthday'], trim($input['email']));
        $records[$index] = $dto->toArray();
        $this->fileManager->writeAll($records);

        return ['status' => 200, 'body' => $dto->toArray()];
    }

    /**
     * DELETE /api/persons/{id}
     */
    public function destroy(int $id): array
    {
        $records = $this->fileManager->readAll();
        $index = $this->findIndexById($records, $id);

        if ($index === null) {
            return ['status' => 404, 'body' => ['message' => 'Person not found']];
        }

        unset($records[$index]);
        $this->fileManager->writeAll($records);

        return ['status' => 200, 'body' => ['message' => 'Person deleted successfully']];
    }

    /**
     * GET /api/persons/{id}/age
     * La edad NUNCA se guarda en el JSON: se calcula al vuelo
     * a partir de "birthday" usando DateTime.
     */
    public function age(int $id): array
    {
        $person = $this->findById($id);

        if ($person === null) {
            return ['status' => 404, 'body' => ['message' => 'Person not found']];
        }

        $birthDate = DateTime::createFromFormat('Y-m-d', $person['birthday']);
        $today = new DateTime('today');
        $age = $birthDate->diff($today)->y;

        return [
            'status' => 200,
            'body' => [
                'id' => $person['id'],
                'name' => $person['name'],
                'age' => $age,
            ],
        ];
    }

    // ---------- Métodos privados de apoyo ----------

    private function findById(int $id): ?array
    {
        foreach ($this->fileManager->readAll() as $record) {
            if ((int) $record['id'] === $id) {
                return $record;
            }
        }

        return null;
    }

    private function findIndexById(array $records, int $id): ?int
    {
        foreach ($records as $index => $record) {
            if ((int) $record['id'] === $id) {
                return $index;
            }
        }

        return null;
    }

    /**
     * Valida los datos de entrada para crear/actualizar una persona.
     * $currentId se usa en actualizaciones, para no marcar como
     * "correo duplicado" el propio correo de la persona que se edita.
     */
    private function validate(array $input, ?int $currentId): array
    {
        $errors = [];

        foreach (['name', 'birthday', 'email'] as $field) {
            if (!isset($input[$field]) || trim((string) $input[$field]) === '') {
                $errors[] = "El campo '{$field}' es obligatorio.";
            }
        }

        // Si faltan campos obligatorios, no seguimos validando formato/duplicados.
        if (!empty($errors)) {
            return $errors;
        }

        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El correo electrónico no tiene un formato válido.';
        } else {
            foreach ($this->fileManager->readAll() as $record) {
                $sameEmail = strcasecmp($record['email'], $input['email']) === 0;
                $isOtherPerson = (int) $record['id'] !== (int) $currentId;

                if ($sameEmail && $isOtherPerson) {
                    $errors[] = 'Ya existe una persona registrada con ese correo electrónico.';
                    break;
                }
            }
        }

        $errors = array_merge($errors, $this->validateBirthday($input['birthday']));

        return $errors;
    }

    private function validateBirthday(string $birthday): array
    {
        $errors = [];

        $date = DateTime::createFromFormat('Y-m-d', $birthday);
        $isValidFormat = $date && $date->format('Y-m-d') === $birthday;

        if (!$isValidFormat) {
            $errors[] = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.';
            return $errors; // no tiene sentido validar "futuro" con una fecha inválida
        }

        if ($date > new DateTime('today')) {
            $errors[] = 'La fecha de nacimiento no puede ser una fecha futura.';
        }

        return $errors;
    }
}
