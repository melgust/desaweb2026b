<?php

/**
 * PersonDTO
 *
 * Data Transfer Object que representa la información de una persona.
 * Su único propósito es transportar datos entre capas (Controller <-> Helper)
 * sin mezclar lógica de negocio ni de persistencia.
 */
class PersonDTO
{
    private int $id;
    private string $name;
    private string $birthday;
    private string $email;

    public function __construct(int $id, string $name, string $birthday, string $email)
    {
        $this->id = $id;
        $this->name = $name;
        $this->birthday = $birthday;
        $this->email = $email;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getBirthday(): string
    {
        return $this->birthday;
    }

    public function setBirthday(string $birthday): void
    {
        $this->birthday = $birthday;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    /**
     * Convierte el DTO en un arreglo asociativo, listo para
     * ser codificado como JSON o almacenado en el archivo persons.json
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'birthday' => $this->birthday,
            'email' => $this->email,
        ];
    }

    /**
     * Crea un PersonDTO a partir de un arreglo asociativo
     * (por ejemplo, un registro leído desde persons.json)
     */
    public static function fromArray(array $data): PersonDTO
    {
        return new PersonDTO(
            (int)($data['id'] ?? 0),
            (string)($data['name'] ?? ''),
            (string)($data['birthday'] ?? ''),
            (string)($data['email'] ?? '')
        );
    }
}
