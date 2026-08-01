<?php

class FileManager
{
    private $filePath;

    public function __construct($filePath)
    {
        $this->filePath = $filePath;

        // Si el archivo no existe, lo crea con un arreglo vacío
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }
    }

    // Lee todo el contenido del archivo JSON y lo retorna como arreglo
    public function readAll()
    {
        $content = file_get_contents($this->filePath);
        $data = json_decode($content, true);

        return $data ?? [];
    }

    // Escribe un arreglo completo en el archivo JSON, sobrescribiendo el contenido anterior
    public function writeAll($data)
    {
        file_put_contents(
            $this->filePath,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }
}