<?php

header("Content-Type: application/json; charset=UTF-8");

require_once dirname(__DIR__) . '/controllers/PersonController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));


// Instanciar controlador
$controller = new PersonController();

try {
    // Manejo de lectura de Body JSON para POST/PUT
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // Mapeo básico de URLs
    // Se espera estructura como: /api/persons o /api/persons/{id} o /api/persons/{id}/age
    if (isset($uriSegments[0]) && $uriSegments[0] === 'api' && isset($uriSegments[1]) && $uriSegments[1] === 'persons') {
        
        $id = isset($uriSegments[2]) && is_numeric($uriSegments[2]) ? (int)$uriSegments[2] : null;
        $subResource = $uriSegments[3] ?? null;

        switch ($method) {
            case 'GET':
                if ($id && $subResource === 'age') {
                    $response = $controller->getAge($id);
                    http_response_code($response['code']);
                    echo json_encode($response['data']);
                } elseif ($id) {
                    $person = $controller->getById($id);
                    if ($person) {
                        http_response_code(200);
                        echo json_encode($person);
                    } else {
                        http_response_code(404);
                        echo json_encode(['message' => 'Person not found']);
                    }
                } else {
                    http_response_code(200);
                    echo json_encode($controller->getAll());
                }
                break;

            case 'POST':
                $response = $controller->create($input);
                http_response_code($response['code']);
                echo json_encode($response['data']);
                break;

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['message' => 'ID no proporcionado']);
                    break;
                }
                $response = $controller->update($id, $input);
                http_response_code($response['code']);
                echo json_encode($response['data']);
                break;

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['message' => 'ID no proporcionado']);
                    break;
                }
                $response = $controller->delete($id);
                http_response_code($response['code']);
                echo json_encode($response['data']);
                break;

            default:
                http_response_code(405);
                echo json_encode(['message' => 'Método no permitido']);
                break;
        }
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint no encontrado']);
    }

} catch (Exception $e) {
    $code = $e->getCode() >= 400 && $e->getCode() <= 500 ? $e->getCode() : 500;
    http_response_code($code);
    echo json_encode(['message' => $e->getMessage()]);
}