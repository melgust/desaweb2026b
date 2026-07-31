<?php

class PersonDTO
{
    private $id;
    private $name;
    private $birthday;
    private $email;

    public function __construct($id, $name, $birthday, $email)
    {
        $this->id = $id;
        $this->name = $name;
        $this->birthday = $birthday;
        $this->email = $email;
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getBirthday()
    {
        return $this->birthday;
    }

    public function getEmail()
    {
        return $this->email;
    }

    // Setters
    public function setId($id)
    {
        $this->id = $id;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setBirthday($birthday)
    {
        $this->birthday = $birthday;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    // Convertir el objeto a un arreglo
    public function toArray()
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "birthday" => $this->birthday,
            "email" => $this->email
        ];
    }
}