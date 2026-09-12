<?php

require_once "../dto/PersonDTO.php";
require_once "../helpers/FileManager.php";
require_once "../controllers/PersonController.php";

header("Content-Type: application/json");

$controller = new PersonController();

$method = $_SERVER["REQUEST_METHOD"];
$route = $_GET["route"] ?? "";

$segments = array_values(array_filter(explode("/", trim($route, "/"))));

if (count($segments) >= 1 && $segments[0] == "persons") {

    // GET /persons
    if ($method == "GET" && count($segments) == 1) {
        $controller->getAll();
    }

    // POST /persons
    elseif ($method == "POST" && count($segments) == 1) {
        $controller->create();
    }

    // GET /persons/{id}
    elseif ($method == "GET" && count($segments) == 2) {
        $controller->getById($segments[1]);
    }

    // PUT /persons/{id}
    elseif ($method == "PUT" && count($segments) == 2) {
        $controller->update($segments[1]);
    }

    // DELETE /persons/{id}
    elseif ($method == "DELETE" && count($segments) == 2) {
        $controller->delete($segments[1]);
    }

    // GET /persons/{id}/age
    elseif (
        $method == "GET" &&
        count($segments) == 3 &&
        $segments[2] == "age"
    ) {
        $controller->getAge($segments[1]);
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