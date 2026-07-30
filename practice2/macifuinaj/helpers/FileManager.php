<?php

class FileManager
{
    private string $filePath;

    // Constructor
    public function __construct()
    {
        $this->filePath = __DIR__ . '/../data/persons.json';
    }

    // Función para leer
    public function read(): array
    {
        // Verifico que exista el archivo
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }

        // Guardo el contenido del archivo
        $json = file_get_contents($this->filePath);

        // Convierto el JSON a un arreglo de PHP
        return json_decode($json, true) ?? [];
    }

    // Función para escribir
    public function write(array $persons): void
    {
        $json = json_encode(
            $persons,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );

        file_put_contents($this->filePath, $json);
    }

    // Obtener el siguiente ID
    public function nextId(): int
    {
        $persons = $this->read();
        $max = 0;

        foreach ($persons as $person) {
            if (isset($person['id']) && $person['id'] > $max) {
                $max = $person['id'];
            }
        }

        return $max + 1;
    }

    //Buscar un id y obtener el arrelog del humano
    public function buscarxID(int $id): ?array{
        //Leo las personas existentes
        $persons = $this->read();

        foreach($persons as $person){
            if((int) $person['id'] === $id){
                return $person;
            }
        }  
        return null;
    }

    //Buscar id, obtener arreglo y posición del humano
    public function buscarIndicexId(int $id): ?int{
        $persons = $this->read();

        foreach($persons as $index => $person){
            if((int) $person['id'] === $id){
                return $index;
            }
        }
        return null;
    }
}