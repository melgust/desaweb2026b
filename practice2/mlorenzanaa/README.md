# API REST de Personas

## Descripción

Esta práctica consiste en el desarrollo de una API REST utilizando PHP puro, sin frameworks y sin utilizar bases de datos. La información de las personas se almacena en un archivo JSON.

La API permite realizar operaciones CRUD sobre personas y consultar dinámicamente la edad de una persona utilizando su fecha de nacimiento.

## Tecnologías utilizadas

- PHP 8.2
- Apache
- Docker
- JSON
- Programación Orientada a Objetos
- REST API

## Estructura del proyecto

```text
PRACTICA2/
│
├── api/
│   ├── .htaccess
│   └── index.php
│
├── controllers/
│   └── PersonController.php
│
├── data/
│   └── persons.json
│
├── dto/
│   └── PersonDTO.php
│
├── helpers/
│   └── FileManager.php
│
├── Dockerfile
├── docker-compose.yml
└── README.md