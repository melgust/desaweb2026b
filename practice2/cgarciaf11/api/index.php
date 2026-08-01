<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/PersonController.php';

$controller = new PersonController();
$method = $_SERVER['REQUEST_METHOD'];

// Obtener la URI limpia
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Detectar si la petición viene hacia persons
if (strpos($uri, '/persons') !== false) {
    // Extraer segmentos después de /persons
    $parts = explode('/persons', $uri);
    $subPath = isset($parts[1]) ? trim($parts[1], '/') : '';
    $subParts = $subPath !== '' ? explode('/', $subPath) : [];

    $id = isset($subParts[0]) && is_numeric($subParts[0]) ? (int)$subParts[0] : null;
    $isAge = isset($subParts[1]) && $subParts[1] === 'age';

    switch ($method) {
        case 'GET':
            if ($id && $isAge) {
                $controller->getAge($id);
            } elseif ($id) {
                $controller->getById($id);
            } else {
                $controller->getAll();
            }
            break;
        case 'POST':
            $controller->create();
            break;
        case 'PUT':
            if ($id) {
                $controller->update($id);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID es requerido para actualizar"]);
            }
            break;
        case 'DELETE':
            if ($id) {
                $controller->delete($id);
            } else {
                http_response_code(400);
                echo json_encode(["message" => "ID es requerido para eliminar"]);
            }
            break;
        default:
            http_response_code(455);
            echo json_encode(["message" => "Método no permitido"]);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint no encontrado"]);
}