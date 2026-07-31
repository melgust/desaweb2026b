<?php

/**
 * PersonDTO
 *
 * Data Transfer Object que representa la información de una persona.
 */
class PersonDTO
{
    private ?int $id;
    private string $name;
    private string $birthday; // formato: YYYY-MM-DD
    private string $email;

    public function __construct(?int $id, string $name, string $birthday, string $email)
    {
        $this->id = $id;
        $this->name = $name;
        $this->birthday = $birthday;
        $this->email = $email;
    }

    // ----- Getters -----

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getBirthday(): string
    {
        return $this->birthday;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    // ----- Setters -----

    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function setBirthday(string $birthday): void
    {
        $this->birthday = $birthday;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    /**
     * Convierte el objeto en un arreglo asociativo.
     */
    public function toArray(): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'birthday' => $this->birthday,
            'email'    => $this->email,
        ];
    }

    /**
     * Crea un PersonDTO a partir de un arreglo asociativo
     * (por ejemplo, datos leídos desde el JSON o el body de la petición).
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['id'] ?? null,
            $data['name'] ?? '',
            $data['birthday'] ?? '',
            $data['email'] ?? ''
        );
    }
}
