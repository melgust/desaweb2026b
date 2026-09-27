<?php

class FileManager
{
    private string $file;

    public function __construct()
    {
        $this->file = __DIR__ . "/../data/persons.json";

        if (!file_exists($this->file)) {
            file_put_contents($this->file, "[]");
        }
    }

    public function read()
    {
        return json_decode(file_get_contents($this->file), true);
    }

    public function write($persons)
    {
        file_put_contents(
            $this->file,
            json_encode($persons, JSON_PRETTY_PRINT)
        );
    }
}