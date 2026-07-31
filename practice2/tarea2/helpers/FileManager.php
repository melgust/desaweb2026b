<?php

class FileManager
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;

        // Si el archivo no existe, lo crea con un arreglo vacío
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    /**
     * Lee todas las personas del archivo JSON.
     */
    public function readData(): array
    {
        $json = file_get_contents($this->filePath);

        $data = json_decode($json, true);

        return $data ?? [];
    }

    /**
     * Guarda el arreglo de personas en el archivo JSON.
     */
    public function writeData(array $data): bool
    {
        return file_put_contents(
            $this->filePath,
            json_encode($data, JSON_PRETTY_PRINT)
        ) !== false;
    }
}