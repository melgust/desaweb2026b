<?php

/**
 * FileManager (Helper)
 *
 * Encapsula todas las operaciones de lectura y escritura sobre el
 * archivo JSON que actúa como almacenamiento de la aplicación.
 * Ninguna otra clase debe abrir/leer/escribir el archivo directamente.
 */
class FileManager
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;

        $dir = dirname($this->filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }
    }

    /**
     * Lee y decodifica todo el contenido del archivo JSON.
     */
    public function readAll(): array
    {
        $content = file_get_contents($this->filePath);
        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Codifica y escribe un arreglo completo en el archivo JSON.
     */
    public function writeAll(array $data): bool
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return file_put_contents($this->filePath, $json) !== false;
    }

    /**
     * Calcula el siguiente id autoincremental en base a los registros existentes.
     */
    public function getNextId(array $data): int
    {
        if (empty($data)) {
            return 1;
        }

        $ids = array_column($data, 'id');

        return (int)max($ids) + 1;
    }
}
