<?php

/**
 * FileManager (Helper)
 *
 * Encapsula todas las operaciones de lectura y escritura sobre el
 * archivo JSON que actúa como "base de datos" de la aplicación.
 * Ni el Controller ni el DTO necesitan saber CÓMO se guardan los
 * datos en disco: solo le piden a este Helper que lea o escriba.
 */
class FileManager
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
        $this->ensureFileExists();
    }

    /**
     * Crea la carpeta y el archivo JSON si todavía no existen,
     * para que la API funcione desde el primer arranque.
     */
    private function ensureFileExists(): void
    {
        $directory = dirname($this->filePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    /**
     * Lee todos los registros del archivo JSON.
     * Devuelve un arreglo vacío si el archivo está vacío o corrupto.
     */
    public function readAll(): array
    {
        $content = file_get_contents($this->filePath);
        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Sobreescribe el archivo JSON completo con el arreglo dado.
     * Se reindexan las llaves (array_values) para que el JSON
     * resultante sea siempre una lista [ ... ], no un objeto { ... }.
     */
    public function writeAll(array $records): bool
    {
        $json = json_encode(
            array_values($records),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );

        return file_put_contents($this->filePath, $json) !== false;
    }

    /**
     * Calcula el siguiente id disponible (el mayor id actual + 1).
     */
    public function getNextId(array $records): int
    {
        $maxId = 0;

        foreach ($records as $record) {
            if (isset($record['id']) && (int) $record['id'] > $maxId) {
                $maxId = (int) $record['id'];
            }
        }

        return $maxId + 1;
    }
}
