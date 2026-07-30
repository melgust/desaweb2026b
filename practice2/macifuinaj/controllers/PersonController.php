<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';

class PersonController{
    private FileManager $fileManager;

    public function __construct(){
        $this->fileManager = new FileManager();
    }

    //Crear una persona.
    public function guardar(array $data): array{
        $errores = [];

        // Validar nombre obligatorio.
        if (!isset($data['nombre']) || trim($data['nombre']) === '') {
            $errores[] = 'El nombre es un campo obligatorio.';
        } elseif (!preg_match('/^[\p{L}\s]+$/u', trim($data['nombre']))) {
            $errores[] = 'El nombre solo puede contener letras y espacios.';
        }

        // Validar fecha de nacimiento obligatoria.
        if (!isset($data['dob']) || trim($data['dob']) === '') {
            $errores[] = 'La fecha de nacimiento es obligatoria.';
        } else {
            $fechaNacimiento = trim($data['dob']);
            $dobValidado = DateTime::createFromFormat('Y-m-d', $fechaNacimiento);

            if (
                !$dobValidado ||
                $dobValidado->format('Y-m-d') !== $fechaNacimiento
            ) {
                $errores[] =
                    'La fecha de nacimiento debe tener el formato yyyy-mm-dd.';
            } elseif ($dobValidado > new DateTime()) {
                $errores[] =
                    'La fecha de nacimiento no puede ser futura.';
            }
        }

        // Validar correo obligatorio.
        if (!isset($data['correo']) || trim($data['correo']) === '') {
            $errores[] =
                'El correo electrónico es un campo obligatorio.';
        } elseif (
            !filter_var(
                trim($data['correo']),
                FILTER_VALIDATE_EMAIL
            )
        ) {
            $errores[] = 'El correo no tiene un formato válido.';
        }

        if (!empty($errores)) {
            return [
                'success' => false,
                'errors' => $errores
            ];
        }

        // Obtener el siguiente ID.
        $id = $this->fileManager->nextId();

        // Crear la persona.
        $person = new PersonDTO(
            $id,
            trim($data['nombre']),
            trim($data['dob']),
            trim($data['correo'])
        );

        // Leer las personas existentes.
        $persons = $this->fileManager->read();

        // Agregar la nueva persona al arreglo.
        $persons[] = $person->toArray();

        // Guardar el arreglo completo.
        $this->fileManager->write($persons);

        return [
            'success' => true,
            'message' => 'Persona creada correctamente.',
            'data' => $person->toArray()
        ];
    }

    //Actualizar total o parcialmente una persona.
    public function actualizar(int $id, array $data): array{
        $persons = $this->fileManager->read();

        $index = $this->fileManager->buscarIndicexId($id);

        if ($index === null) {
            return [
                'success' => false,
                'message' => 'Persona no encontrada.'
            ];
        }

        $personaActual = $persons[$index];
        $errores = [];

        $nombre = isset($data['nombre'])
            ? trim($data['nombre'])
            : $personaActual['nombre'];

        $correo = isset($data['correo'])
            ? trim($data['correo'])
            : $personaActual['correo'];

        $dob = isset($data['dob'])
            ? trim($data['dob'])
            : $personaActual['dob'];

        // Validar el nombre final.
        if ($nombre === '') {
            $errores[] = 'El nombre no puede estar vacío.';
        } elseif (!preg_match('/^[\p{L}\s]+$/u', $nombre)) {
            $errores[] =
                'El nombre solo puede contener letras y espacios.';
        }

        // Validar la fecha final.
        if ($dob === '') {
            $errores[] =
                'La fecha de nacimiento no puede estar vacía.';
        } else {
            $dobValidado = DateTime::createFromFormat('Y-m-d', $dob);

            if (
                !$dobValidado ||
                $dobValidado->format('Y-m-d') !== $dob
            ) {
                $errores[] =
                    'La fecha de nacimiento debe tener el formato yyyy-mm-dd.';
            } elseif ($dobValidado > new DateTime()) {
                $errores[] =
                    'La fecha de nacimiento no puede ser futura.';
            }
        }

        // Validar el correo final.
        if ($correo === '') {
            $errores[] =
                'El correo electrónico no puede estar vacío.';
        } elseif (
            !filter_var($correo, FILTER_VALIDATE_EMAIL)
        ) {
            $errores[] = 'El correo no tiene un formato válido.';
        }

        if (!empty($errores)) {
            return [
                'success' => false,
                'errors' => $errores
            ];
        }

        $person = new PersonDTO(
            $id,
            $nombre,
            $dob,
            $correo
        );

        // Sobrescribir la persona en su posición.
        $persons[$index] = $person->toArray();

        // Guardar el arreglo actualizado.
        $this->fileManager->write($persons);

        return [
            'success' => true,
            'message' => 'Datos de la persona actualizados.',
            'data' => $person->toArray()
        ];
    }

    //Eliminar una persona.
    public function borrar(int $id): array{
        $persons = $this->fileManager->read();

        $index = $this->fileManager->buscarIndicexId($id);

        if ($index === null) {
            return [
                'success' => false,
                'message' => 'Persona no encontrada.'
            ];
        }

        unset($persons[$index]);

        // Reordenar los índices del arreglo.
        $persons = array_values($persons);

        $this->fileManager->write($persons);

        return [
            'success' => true,
            'message' => 'Persona eliminada correctamente.'
        ];
    }

    //Mostrar una persona.
    public function mostrar(int $id): array{
        $person = $this->fileManager->buscarxID($id);

        if ($person === null) {
            return [
                'success' => false,
                'message' => 'Persona no encontrada.'
            ];
        }

        return [
            'success' => true,
            'data' => $person
        ];
    }

    // Mostrar todas las personas.
    public function index(): array{
        return [
            'success' => true,
            'data' => $this->fileManager->read()
        ];
    }
}