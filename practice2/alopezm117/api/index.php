<?php

/**
 * Router / Front Controller de la API.
 *
 * Traduce cada solicitud HTTP (método + URL) en una llamada al
 * método correspondiente de PersonController, y se encarga de
 * imprimir la respuesta en formato JSON con el código HTTP correcto.
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../controllers/PersonController.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$segments = array_values(array_filter(explode('/', $path))); // ej: ['api','persons','1','age']

$controller = new PersonController();
$response = ['status' => 404, 'body' => ['message' => 'Route not found']];

$isPersonsRoute = isset($segments[0], $segments[1])
    && $segments[0] === 'api'
    && $segments[1] === 'persons';

if ($isPersonsRoute) {
    $id = $segments[2] ?? null;
    $subResource = $segments[3] ?? null;

    if ($id === null) {
        // /api/persons
        if ($method === 'GET') {
            $response = $controller->index();
        } elseif ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $response = $controller->store(is_array($input) ? $input : []);
        } else {
            $response = ['status' => 405, 'body' => ['message' => 'Method not allowed']];
        }
    } elseif ($subResource === 'age') {
        // /api/persons/{id}/age
        if ($method === 'GET') {
            $response = $controller->age((int) $id);
        } else {
            $response = ['status' => 405, 'body' => ['message' => 'Method not allowed']];
        }
    } elseif ($subResource === null) {
        // /api/persons/{id}
        if ($method === 'GET') {
            $response = $controller->show((int) $id);
        } elseif ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            $response = $controller->update((int) $id, is_array($input) ? $input : []);
        } elseif ($method === 'DELETE') {
            $response = $controller->destroy((int) $id);
        } else {
            $response = ['status' => 405, 'body' => ['message' => 'Method not allowed']];
        }
    }
}

http_response_code($response['status']);
echo json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
