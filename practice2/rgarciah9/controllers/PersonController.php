<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController
{
    private $fileManager;

    public function __construct()
    {
        // Ruta del archivo JSON donde se guardan las personas
        $this->fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    }

    // GET /api/persons
    public function getAll()
    {
        $persons = $this->fileManager->readAll();
        $this->jsonResponse(200, $persons);
    }

    // GET /api/persons/{id}
    public function getById($id)
    {
        $persons = $this->fileManager->readAll();

        foreach ($persons as $person) {
            if ($person['id'] == $id) {
                $this->jsonResponse(200, $person);
                return;
            }
        }

        $this->jsonResponse(404, ["message" => "Person not found"]);
    }

    // POST /api/persons
    public function create($body)
    {
        $errors = $this->validate($body);

        if (!empty($errors)) {
            $this->jsonResponse(400, ["errors" => $errors]);
            return;
        }

        $persons = $this->fileManager->readAll();

        // Validar correo duplicado
        foreach ($persons as $person) {
            if ($person['email'] === $body['email']) {
                $this->jsonResponse(400, ["message" => "Email already exists"]);
                return;
            }
        }

        // Generar nuevo ID (el siguiente disponible)
        $newId = 1;
        foreach ($persons as $person) {
            if ($person['id'] >= $newId) {
                $newId = $person['id'] + 1;
            }
        }

        $dto = new PersonDTO($newId, $body['name'], $body['birthday'], $body['email']);
        $persons[] = $dto->toArray();

        $this->fileManager->writeAll($persons);

        $this->jsonResponse(201, $dto->toArray());
    }

    // PUT /api/persons/{id}
    public function update($id, $body)
    {
        $errors = $this->validate($body);

        if (!empty($errors)) {
            $this->jsonResponse(400, ["errors" => $errors]);
            return;
        }

        $persons = $this->fileManager->readAll();
        $found = false;

        foreach ($persons as &$person) {
            if ($person['id'] == $id) {
                // Validar correo duplicado (ignorando el propio registro)
                foreach ($persons as $other) {
                    if ($other['id'] != $id && $other['email'] === $body['email']) {
                        $this->jsonResponse(400, ["message" => "Email already exists"]);
                        return;
                    }
                }

                $person['name'] = $body['name'];
                $person['birthday'] = $body['birthday'];
                $person['email'] = $body['email'];
                $found = true;
                break;
            }
        }
        unset($person);

        if (!$found) {
            $this->jsonResponse(404, ["message" => "Person not found"]);
            return;
        }

        $this->fileManager->writeAll($persons);
        $this->jsonResponse(200, ["message" => "Person updated"]);
    }

    // DELETE /api/persons/{id}
    public function delete($id)
    {
        $persons = $this->fileManager->readAll();
        $newList = [];
        $found = false;

        foreach ($persons as $person) {
            if ($person['id'] == $id) {
                $found = true;
                continue; // se omite, es decir, se elimina
            }
            $newList[] = $person;
        }

        if (!$found) {
            $this->jsonResponse(404, ["message" => "Person not found"]);
            return;
        }

        $this->fileManager->writeAll($newList);
        $this->jsonResponse(200, ["message" => "Person deleted"]);
    }

    // GET /api/persons/{id}/age
    public function getAge($id)
    {
        $persons = $this->fileManager->readAll();

        foreach ($persons as $person) {
            if ($person['id'] == $id) {
                $birthDate = new DateTime($person['birthday']);
                $today = new DateTime();
                $age = $birthDate->diff($today)->y;

                $this->jsonResponse(200, [
                    "id" => $person['id'],
                    "name" => $person['name'],
                    "age" => $age
                ]);
                return;
            }
        }

        $this->jsonResponse(404, ["message" => "Person not found"]);
    }

    // Valida los campos requeridos para crear/actualizar una persona
    private function validate($body)
    {
        $errors = [];

        if (empty($body['name'])) {
            $errors[] = "El campo 'name' es obligatorio";
        }

        if (empty($body['email'])) {
            $errors[] = "El campo 'email' es obligatorio";
        } elseif (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "El campo 'email' no tiene un formato válido";
        }

        if (empty($body['birthday'])) {
            $errors[] = "El campo 'birthday' es obligatorio";
        } elseif (!$this->isValidDate($body['birthday'])) {
            $errors[] = "El campo 'birthday' debe tener el formato YYYY-MM-DD";
        } elseif (new DateTime($body['birthday']) > new DateTime()) {
            $errors[] = "El campo 'birthday' no puede ser una fecha futura";
        }

        return $errors;
    }

    // Verifica que la fecha tenga el formato YYYY-MM-DD válido
    private function isValidDate($date)
    {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    // Envía una respuesta en formato JSON con el código HTTP indicado
    private function jsonResponse($statusCode, $data)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}