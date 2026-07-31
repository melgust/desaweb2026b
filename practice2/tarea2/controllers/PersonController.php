<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController
{
    private FileManager $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    /**
     * Obtener todas las personas
     */
    public function getAll(): void
    {
        http_response_code(200);
        echo json_encode($this->fileManager->readData());
    }

    /**
     * Obtener una persona por ID
     */
    public function getById(int $id): void
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $person) {
            if ($person["id"] == $id) {
                http_response_code(200);
                echo json_encode($person);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(["message" => "Person not found"]);
    }

    /**
     * Crear una persona
     */
    public function create(array $data): void
    {
        if (
            empty($data["name"]) ||
            empty($data["birthday"]) ||
            empty($data["email"])
        ) {
            http_response_code(400);
            echo json_encode(["message" => "All fields are required"]);
            return;
        }

        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid email"]);
            return;
        }

        if (!$this->validDate($data["birthday"])) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid birthday"]);
            return;
        }

        $persons = $this->fileManager->readData();

        foreach ($persons as $person) {
            if ($person["email"] === $data["email"]) {
                http_response_code(400);
                echo json_encode(["message" => "Email already exists"]);
                return;
            }
        }

        $nextId = 1;

        if (!empty($persons)) {
            $ids = array_column($persons, "id");
            $nextId = max($ids) + 1;
        }

        $dto = new PersonDTO(
            $nextId,
            $data["name"],
            $data["birthday"],
            $data["email"]
        );

        $persons[] = $dto->toArray();

        $this->fileManager->writeData($persons);

        http_response_code(201);
        echo json_encode($dto->toArray());
    }

    /**
     * Actualizar una persona
     */
    public function update(int $id, array $data): void
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as &$person) {

            if ($person["id"] == $id) {

                if (
                    empty($data["name"]) ||
                    empty($data["birthday"]) ||
                    empty($data["email"])
                ) {
                    http_response_code(400);
                    echo json_encode(["message" => "All fields are required"]);
                    return;
                }

                if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode(["message" => "Invalid email"]);
                    return;
                }

                if (!$this->validDate($data["birthday"])) {
                    http_response_code(400);
                    echo json_encode(["message" => "Invalid birthday"]);
                    return;
                }

                foreach ($persons as $p) {
                    if (
                        $p["email"] == $data["email"] &&
                        $p["id"] != $id
                    ) {
                        http_response_code(400);
                        echo json_encode(["message" => "Email already exists"]);
                        return;
                    }
                }

                $person["name"] = $data["name"];
                $person["birthday"] = $data["birthday"];
                $person["email"] = $data["email"];

                $this->fileManager->writeData($persons);

                http_response_code(200);
                echo json_encode($person);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(["message" => "Person not found"]);
    }

    /**
     * Eliminar una persona
     */
    public function delete(int $id): void
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $index => $person) {

            if ($person["id"] == $id) {

                array_splice($persons, $index, 1);

                $this->fileManager->writeData($persons);

                http_response_code(200);
                echo json_encode(["message" => "Person deleted"]);

                return;
            }
        }

        http_response_code(404);
        echo json_encode(["message" => "Person not found"]);
    }

    /**
     * Obtener edad
     */
    public function getAge(int $id): void
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $person) {

            if ($person["id"] == $id) {

                $birthday = new DateTime($person["birthday"]);
                $today = new DateTime();

                $age = $today->diff($birthday)->y;

                http_response_code(200);

                echo json_encode([
                    "id" => $person["id"],
                    "name" => $person["name"],
                    "age" => $age
                ]);

                return;
            }
        }

        http_response_code(404);
        echo json_encode(["message" => "Person not found"]);
    }

    /**
     * Validar fecha
     */
    private function validDate(string $date): bool
    {
        $d = DateTime::createFromFormat("Y-m-d", $date);

        if (!$d || $d->format("Y-m-d") !== $date) {
            return false;
        }

        return $d <= new DateTime();
    }
}