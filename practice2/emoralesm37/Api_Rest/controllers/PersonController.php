<?php

require_once dirname(__DIR__) . '/helpers/FileManager.php';
require_once dirname(__DIR__) . '/dto/PersonDTO.php';

class PersonController {
    private FileManager $fileManager;

    public function __construct() {
        $this->fileManager = new FileManager();
    }

    // GET /api/persons
    public function getAll(): array {
        return $this->fileManager->read();
    }

    // GET /api/persons/{id}
    public function getById(int $id): ?array {
        $persons = $this->fileManager->read();
        foreach ($persons as $person) {
            if ($person['id'] === $id) {
                return $person;
            }
        }
        return null;
    }

    // POST /api/persons
    public function create(array $data): array {
        $this->validate($data);

        $id = $this->fileManager->getNextId();
        $dto = new PersonDTO($id, trim($data['name']), $data['birthday'], trim($data['email']));

        $persons = $this->fileManager->read();
        $persons[] = $dto->toArray();
        $this->fileManager->write($persons);

        return ['code' => 201, 'data' => $dto->toArray()];
    }

    // PUT /api/persons/{id}
    public function update(int $id, array $data): array {
        $persons = $this->fileManager->read();
        $index = -1;

        foreach ($persons as $i => $person) {
            if ($person['id'] === $id) {
                $index = $i;
                break;
            }
        }

        if ($index === -1) {
            return ['code' => 404, 'data' => ['message' => 'Person not found']];
        }

        $this->validate($data, $id);

        $dto = new PersonDTO($id, trim($data['name']), $data['birthday'], trim($data['email']));
        $persons[$index] = $dto->toArray();
        $this->fileManager->write($persons);

        return ['code' => 200, 'data' => $dto->toArray()];
    }

    // DELETE /api/persons/{id}
    public function delete(int $id): array {
        $persons = $this->fileManager->read();
        $filtered = array_filter($persons, fn($p) => $p['id'] !== $id);

        if (count($persons) === count($filtered)) {
            return ['code' => 404, 'data' => ['message' => 'Person not found']];
        }

        $this->fileManager->write(array_values($filtered));
        return ['code' => 200, 'data' => ['message' => 'Person deleted successfully']];
    }

    // GET /api/persons/{id}/age
    public function getAge(int $id): array {
        $person = $this->getById($id);
        if (!$person) {
            return ['code' => 404, 'data' => ['message' => 'Person not found']];
        }

        $birthDate = new DateTime($person['birthday']);
        $today = new DateTime();
        $age = $today->diff($birthDate)->y;

        return [
            'code' => 200,
            'data' => [
                'id' => $person['id'],
                'name' => $person['name'],
                'age' => $age
            ]
        ];
    }

    // Validaciones requeridas
    private function validate(array $data, ?int $currentId = null): void {
        if (empty($data['name']) || empty($data['birthday']) || empty($data['email'])) {
            throw new Exception("Todos los campos son obligatorios", 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("El correo debe tener un formato válido", 400);
        }

        // Validar formato fecha YYYY-MM-DD y fecha no futura
        $d = DateTime::createFromFormat('Y-m-d', $data['birthday']);
        if (!$d || $d->format('Y-m-d') !== $data['birthday']) {
            throw new Exception("La fecha de nacimiento debe tener el formato YYYY-MM-DD", 400);
        }

        if ($d > new DateTime()) {
            throw new Exception("La fecha de nacimiento no puede ser una fecha futura", 400);
        }

        // Validar email único
        $persons = $this->fileManager->read();
        foreach ($persons as $person) {
            if ($person['email'] === $data['email'] && $person['id'] !== $currentId) {
                throw new Exception("El correo ya está registrado", 400);
            }
        }
    }
}