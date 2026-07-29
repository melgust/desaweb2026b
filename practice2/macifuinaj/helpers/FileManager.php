<?php
class FileManager{
    private string $filePath;
    //constructor
    public function __constructor(){
        $this-> filePath = __DIR__ . '/.../data/persons.json';
    }
    //Funcion para leer
    public function read():array{
        //Verifico que existe el archivo
        if(!file_exists($this->filePath)){
            file_put_contents($this->filePath, json_encode([]));
        }
        //Guardo lo obtenido en la variable json
        $json = file_get_contents($this->filePath);
        //convierto json a texto
        return json_decode($json, true) ?? [];
    }
    //funcion para escribir
    public function write(array $persons): void{
        $json = json_encode($persons, JSON_PRETTY_PRINT);
        file_put_contents($this->filePath, $json);
    }
    //obtener el no. id
    public function nextId(): int{
        $persons = $this->read();
        $max = 0;

        foreach($persons as $person){
            if($person['id']>$max){
                $max = $person['$id'];
            }
        }
        return $max +1;
    }
}
?>