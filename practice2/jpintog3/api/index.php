<?php

require_once "../dto/PersonDTO.php";
require_once "../helpers/FileManager.php";
require_once "../controllers/PersonController.php";

header("Content-Type: application/json");

$controller = new PersonController();

$method = $_SERVER["REQUEST_METHOD"];
$route = $_GET["route"] ?? "";
$segments = array_filter(explode("/", trim($route, "/")));
$segments = array_values($segments);

/*
Ejemplo:
http://localhost:8080/api/persons
$segments = ["api", "persons"]

http://localhost:8080/api/persons/1
$segments = ["api", "persons", "1"]

http://localhost:8080/api/persons/1/age
$segments = ["api", "persons", "1", "age"]
*/

if (count($segments) >= 1 && $segments[0] == "persons"){

    // GET /api/persons
    if ($method == "GET" && count($segments) == 2) {
        $controller->getAll();
    }

    // POST /api/persons
    elseif ($method == "POST" && count($segments) == 2) {
        $controller->create();
    }

    // GET /api/persons/{id}
    elseif ($method == "GET" && count($segments) == 3) {
        $controller->getById($segments[2]);
    }

    // PUT /api/persons/{id}
    elseif ($method == "PUT" && count($segments) == 3) {
        $controller->update($segments[2]);
    }

    // DELETE /api/persons/{id}
    elseif ($method == "DELETE" && count($segments) == 3) {
        $controller->delete($segments[2]);
    }

    // GET /api/persons/{id}/age
    elseif ($method == "GET" && count($segments) == 4 && $segments[3] == "age") {
        $controller->getAge($segments[2]);
    }

    else {
        http_response_code(404);
        echo json_encode([
            "message" => "Endpoint not found"
        ]);
    }

} else {

    http_response_code(404);
    echo json_encode([
        "message" => "Endpoint not found"
    ]);

}