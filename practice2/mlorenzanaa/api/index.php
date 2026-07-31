<?php

header("Content-Type: application/json");

require_once __DIR__ . '/../controllers/PersonController.php';

$controller = new PersonController();

$method = $_SERVER["REQUEST_METHOD"];

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$path = trim($path, "/");

$segments = explode("/", $path);

// Buscar la posición de "api"
$apiIndex = array_search("api", $segments);

if ($apiIndex === false) {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint not found"]);
    exit;
}

// Obtener los segmentos después de /api
$route = array_slice($segments, $apiIndex + 1);

if (count($route) == 1 && $route[0] == "persons") {

    switch ($method) {

        case "GET":
            echo json_encode($controller->getAllPersons());
            break;

        case "POST":
            $data = json_decode(file_get_contents("php://input"), true);
            $response = $controller->createPerson($data);

            http_response_code($response["status"]);

            echo json_encode(
                isset($response["data"])
                    ? $response["data"]
                    : ["message" => $response["message"]]
            );
            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
    }

} elseif (count($route) == 2 && $route[0] == "persons") {

    $id = (int)$route[1];

    switch ($method) {

        case "GET":

            $person = $controller->getPersonById($id);

            if (isset($person["status"])) {
                http_response_code(404);
                echo json_encode(["message" => $person["message"]]);
            } else {
                echo json_encode($person);
            }

            break;

        case "PUT":

            $data = json_decode(file_get_contents("php://input"), true);

            $response = $controller->updatePerson($id, $data);

            http_response_code($response["status"]);

            echo json_encode(
                isset($response["data"])
                    ? $response["data"]
                    : ["message" => $response["message"]]
            );

            break;

        case "DELETE":

            $response = $controller->deletePerson($id);

            http_response_code($response["status"]);

            echo json_encode(["message" => $response["message"]]);

            break;

        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
    }

} elseif (
    count($route) == 3 &&
    $route[0] == "persons" &&
    $route[2] == "age"
) {

    $id = (int)$route[1];

    $response = $controller->getPersonAge($id);

    http_response_code($response["status"]);

    echo json_encode(
        isset($response["data"])
            ? $response["data"]
            : ["message" => $response["message"]]
    );

} else {

    http_response_code(404);

    echo json_encode([
        "message" => "Endpoint not found"
    ]);
}