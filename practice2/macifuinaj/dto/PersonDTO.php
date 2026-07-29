<?php
class PersonDTO{
    private ?int $id;
    private string $nombre;
    private string $dob;
    private string $correo;
    //constructor
    public function __construct(?int $id,string $nombre,string $dob,string $correo){
        $this-> id = $id;
        $this-> nombre = $nombre;
        $this-> dob = $dob;
        $this-> correo = $correo;
    }
    //getters y setters
    public function getId():?int{
        return $this->id;
    }
    public function setId(?int $id): void{
        $this->id = $id;
    }
    public function getNombre(): string{
        return $this->nombre;
    }
    public function setNombre(string $nombre): void{
        $this->nombre = $nombre;
    }
    public function getDob(): string{
        return $this->dob;
    }
    public function setDob(string $dob): void{
        $this->dob = $dob;
    }
    public function getCorreo(): string{
        return $this->correo;
    }
    public function setCorreo(string $correo): void{
        $this->correo = $correo;
    }

    public function toArray(): array{
        return[
            'id' => $this.id,
            'nombre' => $this.nombre,
            'dob' => $this.dob,
            'correo' => $this.correo
        ];
    }
}
?>