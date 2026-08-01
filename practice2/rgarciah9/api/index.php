<?php

require_once __DIR__ . '/../controllers/PersonController.php';

header('Content-Type: application/json');

$controller = new PersonController();

// Se obtiene la parte de la URL después de /api/
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Se elimina el prefijo "/api/" para quedarnos solo con "persons", "persons/1", "persons/1/age", etc.
$path = preg_replace('#^.*?/api/?#', '', $path);
$path = trim($path, '/');

// Se divide la ruta en segmentos, ejemplo: ["persons", "1", "age"]
$segments = $path === '' ? [] : explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];

// Se lee el body en caso de POST o PUT
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// El primer segmento siempre debe ser "persons"
if (!isset($segments[0]) || $segments[0] !== 'persons') {
    http_response_code(404);
    echo json_encode(["message" => "Route not found"]);
    exit;
}

$id = $segments[1] ?? null;
$subResource = $segments[2] ?? null;

switch ($method) {

    case 'GET':
        if ($id === null) {
            $controller->getAll();
        } elseif ($subResource === 'age') {
            $controller->getAge($id);
        } else {
            $controller->getById($id);
        }
        break;

    case 'POST':
        $controller->create($body);
        break;

    case 'PUT':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["message" => "ID is required to update"]);
            exit;
        }
        $controller->update($id, $body);
        break;

    case 'DELETE':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["message" => "ID is required to delete"]);
            exit;
        }
        $controller->delete($id);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method Not Allowed"]);
}