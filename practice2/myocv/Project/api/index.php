<?php

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../controllers/PersonController.php';

$fileManager = new FileManager(__DIR__ . '/../data/persons.json');
$controller  = new PersonController($fileManager);

// ----- Obtener la ruta solicitada (sin query string) -----
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = '/' . trim($path, '/');

$method = $_SERVER['REQUEST_METHOD'];

// ----- Body de la petición (JSON) -----
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ----- Enrutamiento -----

// GET /api/persons/{id}/age
if ($method === 'GET' && preg_match('#^/api/persons/(\d+)/age$#', $path, $m)) {
    $controller->getAge((int) $m[1]);
    exit;
}

// /api/persons/{id}
if (preg_match('#^/api/persons/(\d+)$#', $path, $m)) {
    $id = (int) $m[1];

    switch ($method) {
        case 'GET':
            $controller->getById($id);
            break;
        case 'PUT':
            $controller->update($id, getJsonBody());
            break;
        case 'DELETE':
            $controller->delete($id);
            break;
        default:
            http_response_code(405);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['message' => 'Método no permitido.']);
    }
    exit;
}

// /api/persons
if ($path === '/api/persons') {
    switch ($method) {
        case 'GET':
            $controller->getAll();
            break;
        case 'POST':
            $controller->create(getJsonBody());
            break;
        default:
            http_response_code(405);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['message' => 'Método no permitido.']);
    }
    exit;
}

// ----- Ruta no encontrada -----
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['message' => 'Ruta no encontrada.']);
