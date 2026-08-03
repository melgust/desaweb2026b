<?php

class FileManager {
    private string $filePath;

    public function __construct(string $filePath = __DIR__ . '/../data/persons.json') {
        $this->filePath = $filePath;
        
        // Si el directorio data no existe, lo crea
        $dir = dirname($this->filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        // Si el archivo JSON no existe, lo inicializa con un arreglo vacío
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    // Leer todas las personas del archivo JSON
    public function readData(): array {
        if (!file_exists($this->filePath)) {
            return [];
        }
        $content = file_get_contents($this->filePath);
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    // Guardar el arreglo completo de personas en el archivo JSON
    public function writeData(array $data): bool {
        $json = json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents($this->filePath, $json) !== false;
    }
}