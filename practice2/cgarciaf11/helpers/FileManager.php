<?php

class FileManager {
    private string $filePath;

    public function __construct(string $filePath = __DIR__ . '/../data/persons.json') {
        $this->filePath = $filePath;
        
        // Si no existe O si está vacío, inicializarlo con []
        if (!file_exists($this->filePath) || trim((string)file_get_contents($this->filePath)) === '') {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    /**
     * Lee todos los registros del archivo JSON de forma segura
     */
    public function getAll(): array {
        if (!file_exists($this->filePath)) {
            return [];
        }

        $content = file_get_contents($this->filePath);
        
        // Evitar que json_decode falle con cadenas vacías
        if (trim((string)$content) === '') {
            return [];
        }

        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Sobrescribe el archivo JSON con una nueva lista de personas
     */
    public function saveAll(array $persons): bool {
        $jsonContent = json_encode($persons, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents($this->filePath, $jsonContent) !== false;
    }

    /**
     * Genera un ID autoincrementable para una nueva persona
     */
    public function generateNextId(): int {
        $persons = $this->getAll();
        if (empty($persons)) {
            return 1;
        }

        $ids = array_filter(array_column($persons, 'id'), 'is_numeric');
        if (empty($ids)) {
            return 1;
        }

        return max($ids) + 1;
    }
}