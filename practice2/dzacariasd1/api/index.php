<?php

require_once __DIR__ . '/../controllers/PersonController.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Eliminar /api/
$path = preg_replace('#^/api/#', '', $path);

// Eliminar index.php si viene en la URL
$path = preg_replace('#^index\.php/?#', '', $path);

$segments = explode('/', trim($path, '/'));
$controller = new PersonController();

try {
    if ($method === 'GET' && count($segments) === 1 && $segments[0] === 'persons') {
        $controller->getAll();
    }
    elseif ($method === 'GET' && count($segments) === 2 && $segments[0] === 'persons') {
        $id = (int)$segments[1];
        $controller->getById($id);
    }
    elseif ($method === 'GET' && count($segments) === 3 && $segments[0] === 'persons' && $segments[2] === 'age') {
        $id = (int)$segments[1];
        $controller->getAge($id);
    }
    elseif ($method === 'POST' && count($segments) === 1 && $segments[0] === 'persons') {
        $controller->create();
    }
    elseif ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'persons') {
        $id = (int)$segments[1];
        $controller->update($id);
    }
    elseif ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'persons') {
        $id = (int)$segments[1];
        $controller->delete($id);
    }
    else {
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}