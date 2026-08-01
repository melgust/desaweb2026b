<?php

/**
 * api/index.php
 *
 * Punto de entrada de la API. Aquí se hace el "ruteo": se lee el método
 * HTTP y la URL de la petición, y se decide a qué método del
 * PersonController debe delegarse cada solicitud.
 */

require_once __DIR__ . '/../controllers/PersonController.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

$controller = new PersonController();

// GET /api/persons/{id}/age
if ($method === 'GET' && preg_match('#^/api/persons/(\d+)/age$#', $uri, $matches)) {
    $controller->getAge($matches[1]);

// /api/persons/{id}
} elseif (preg_match('#^/api/persons/(\d+)$#', $uri, $matches)) {
    $id = $matches[1];

    switch ($method) {
        case 'GET':
            $controller->getById($id);
            break;
        case 'PUT':
            $controller->update($id);
            break;
        case 'DELETE':
            $controller->delete($id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método no permitido']);
    }

// /api/persons
} elseif ($uri === '/api/persons') {
    switch ($method) {
        case 'GET':
            $controller->getAll();
            break;
        case 'POST':
            $controller->create();
            break;
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método no permitido']);
    }

// Cualquier otra ruta
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint not found']);
}
