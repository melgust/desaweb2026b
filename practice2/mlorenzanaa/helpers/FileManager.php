<?php

class FileManager
{
    private $file = __DIR__ . "/../data/persons.json";

    // Leer todas las personas
    public function readData()
    {
        if (!file_exists($this->file)) {
            file_put_contents($this->file, json_encode([]));
        }

        $content = file_get_contents($this->file);

        $data = json_decode($content, true);

        return $data ?: [];
    }

    // Guardar todas las personas
    public function saveData($persons)
    {
        file_put_contents(
            $this->file,
            json_encode($persons, JSON_PRETTY_PRINT)
        );
    }
}