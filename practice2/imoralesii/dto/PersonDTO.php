<?php

class PersonDTO {
    private mixed $id;
    private string $name;
    private string $birthday;
    private string $email;

    public function __construct(mixed $id, string $name, string $birthday, string $email) {
        $this->id = $id;
        $this->name = $name;
        $this->birthday = $birthday;
        $this->email = $email;
    }

    // Getters
    public function getId(): mixed {
        return $this->id;
    }

    public function getName(): string {
        return $this->name;
    }

    public function getBirthday(): string {
        return $this->birthday;
    }

    public function getEmail(): string {
        return $this->email;
    }

    // Setters
    public function setId(mixed $id): void {
        $this->id = $id;
    }

    public function setName(string $name): void {
        $this->name = $name;
    }

    public function setBirthday(string $birthday): void {
        $this->birthday = $birthday;
    }

    public function setEmail(string $email): void {
        $this->email = $email;
    }

    // Método solicitado en el DTO
    public function toArray(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'birthday' => $this->birthday,
            'email' => $this->email
        ];
    }
}