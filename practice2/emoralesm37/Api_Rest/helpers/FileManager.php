<?php

class FileManager {
    private string $filePath;

    public function __construct(string $filePath = null) {
        // Asigna la ruta absoluta por defecto a data/persons.json
        $this->filePath = $filePath ?? dirname(__DIR__) . '/data/persons.json';
        
        // Crear el directorio /data si no existe
        $directory = dirname($this->filePath);
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        // Crear el archivo persons.json con un arreglo vacío [] si no existe
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    // Leer todas las personas almacenadas en el JSON
    public function read(): array {
        if (!file_exists($this->filePath)) {
            return [];
        }
        $content = file_get_contents($this->filePath);
        return json_decode($content, true) ?? [];
    }

    // Sobrescribir el archivo JSON con los datos actualizados
    public function write(array $data): bool {
        return file_put_contents($this->filePath, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }

    // Helper para obtener el siguiente ID autoincrementable
    public function getNextId(): int {
        $items = $this->read();
        if (empty($items)) {
            return 1;
        }
        $ids = array_column($items, 'id');
        return max($ids) + 1;
    }
}