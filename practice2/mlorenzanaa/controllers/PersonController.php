<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController
{
    private $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager();
    }

    // Obtener todas las personas
    public function getAllPersons()
    {
        return $this->fileManager->readData();
    }

    // Obtener una persona por ID
    public function getPersonById($id)
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $person) {
            if ($person["id"] == $id) {
                return $person;
            }
        }

        return [
            "status" => 404,
            "message" => "Person not found"
        ];
    }

    // Crear una persona
    public function createPerson($data)
    {
        $persons = $this->fileManager->readData();

        // Validar campos obligatorios
        if (
            empty($data["name"]) ||
            empty($data["birthday"]) ||
            empty($data["email"])
        ) {
            return [
                "status" => 400,
                "message" => "Todos los campos son obligatorios."
            ];
        }

        // Validar correo
        if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
            return [
                "status" => 400,
                "message" => "Correo electrónico no válido."
            ];
        }

        // Validar correo duplicado
        foreach ($persons as $person) {
            if ($person["email"] == $data["email"]) {
                return [
                    "status" => 400,
                    "message" => "El correo ya existe."
                ];
            }
        }

        // Validar fecha
        $date = DateTime::createFromFormat("Y-m-d", $data["birthday"]);

        if (!$date || $date->format("Y-m-d") != $data["birthday"]) {
            return [
                "status" => 400,
                "message" => "La fecha debe tener formato YYYY-MM-DD."
            ];
        }

        if ($date > new DateTime()) {
            return [
                "status" => 400,
                "message" => "La fecha no puede ser futura."
            ];
        }

        // Generar ID
        $id = empty($persons)
            ? 1
            : max(array_column($persons, "id")) + 1;

        // Crear DTO
        $person = new PersonDTO(
            $id,
            $data["name"],
            $data["birthday"],
            $data["email"]
        );

        $persons[] = $person->toArray();

        $this->fileManager->saveData($persons);

        return [
            "status" => 201,
            "data" => $person->toArray()
        ];
    }

    // Actualizar persona
    public function updatePerson($id, $data)
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as &$person) {

            if ($person["id"] == $id) {

                if (
                    empty($data["name"]) ||
                    empty($data["birthday"]) ||
                    empty($data["email"])
                ) {
                    return [
                        "status" => 400,
                        "message" => "Todos los campos son obligatorios."
                    ];
                }

                if (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
                    return [
                        "status" => 400,
                        "message" => "Correo electrónico no válido."
                    ];
                }

                foreach ($persons as $p) {
                    if (
                        $p["email"] == $data["email"] &&
                        $p["id"] != $id
                    ) {
                        return [
                            "status" => 400,
                            "message" => "El correo ya existe."
                        ];
                    }
                }

                $date = DateTime::createFromFormat(
                    "Y-m-d",
                    $data["birthday"]
                );

                if (!$date || $date->format("Y-m-d") != $data["birthday"]) {
                    return [
                        "status" => 400,
                        "message" => "Fecha inválida."
                    ];
                }

                if ($date > new DateTime()) {
                    return [
                        "status" => 400,
                        "message" => "La fecha no puede ser futura."
                    ];
                }

                $person["name"] = $data["name"];
                $person["birthday"] = $data["birthday"];
                $person["email"] = $data["email"];

                $this->fileManager->saveData($persons);

                return [
                    "status" => 200,
                    "data" => $person
                ];
            }
        }

        return [
            "status" => 404,
            "message" => "Person not found"
        ];
    }

    // Eliminar persona
    public function deletePerson($id)
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $index => $person) {

            if ($person["id"] == $id) {

                array_splice($persons, $index, 1);

                $this->fileManager->saveData($persons);

                return [
                    "status" => 200,
                    "message" => "Person deleted successfully"
                ];
            }
        }

        return [
            "status" => 404,
            "message" => "Person not found"
        ];
    }

    // Obtener edad
    public function getPersonAge($id)
    {
        $persons = $this->fileManager->readData();

        foreach ($persons as $person) {

            if ($person["id"] == $id) {

                $birthday = new DateTime($person["birthday"]);
                $today = new DateTime();

                $age = $today->diff($birthday)->y;

                return [
                    "status" => 200,
                    "data" => [
                        "id" => $person["id"],
                        "name" => $person["name"],
                        "age" => $age
                    ]
                ];
            }
        }

        return [
            "status" => 404,
            "message" => "Person not found"
        ];
    }
}