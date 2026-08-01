<?php

/**
 * FileManager (Helper)
 *
 * Encapsula toda la lógica de lectura y escritura del archivo JSON
 * que sirve como mecanismo de persistencia. El Controller no debe
 * saber cómo se guardan los datos en disco; solo le pide al Helper
 * que lea o escriba, y este se encarga del detalle técnico.
 */
class FileManager
{
    private $filePath;

    public function __construct($filePath)
    {
        $this->filePath = $filePath;

        // Si el archivo no existe todavía, se crea vacío.
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }
    }

    /**
     * Lee todo el contenido del archivo JSON y lo devuelve
     * como un arreglo asociativo de PHP.
     */
    public function readAll(): array
    {
        $content = file_get_contents($this->filePath);
        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Sobrescribe el archivo JSON con el arreglo recibido.
     */
    public function writeAll(array $data): bool
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents($this->filePath, $json) !== false;
    }

    /**
     * Calcula el siguiente ID autoincremental en base
     * a los registros existentes.
     */
    public function getNextId(array $data): int
    {
        if (empty($data)) {
            return 1;
        }

        $ids = array_column($data, 'id');
        return max($ids) + 1;
    }
}
