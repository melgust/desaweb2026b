<?php

require_once __DIR__ . '/../controllers/PersonController.php';

// Indicar que la API responde en formato JSON.
header('Content-Type: application/json; charset=utf-8');

// Permitir solicitudes desde otros orígenes.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder las solicitudes previas del navegador.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$controller = new PersonController();

$method = $_SERVER['REQUEST_METHOD'];

// Obtener la ruta solicitada.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Separar la ruta en partes.
$segments = array_values(
    array_filter(
        explode('/', trim($uri, '/'))
    )
);

// Buscar la posición de "persons" dentro de la URL.
$personsPosition = array_search('persons', $segments, true);

if ($personsPosition === false) {
    responder(
        [
            'success' => false,
            'message' => 'Ruta no encontrada.'
        ],
        404
    );
}

// Obtener el ID ubicado después de "persons".
$id = $segments[$personsPosition + 1] ?? null;

if ($id !== null && !ctype_digit($id)) {
    responder(
        [
            'success' => false,
            'message' => 'El ID debe ser un número entero.'
        ],
        400
    );
}

$id = $id !== null ? (int)$id : null;

// Leer el cuerpo JSON de la solicitud.
$input = file_get_contents('php://input');
$data = [];

if ($input !== '') {
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        responder(
            [
                'success' => false,
                'message' => 'El cuerpo de la solicitud no contiene un JSON válido.'
            ],
            400
        );
    }

    if (!is_array($data)) {
        responder(
            [
                'success' => false,
                'message' => 'Los datos enviados deben ser un objeto JSON.'
            ],
            400
        );
    }
}

switch ($method) {
    case 'GET':
        if ($id === null) {
            // GET /api/persons
            responder(
                $controller->index(),
                200
            );
        }

        // GET /api/persons/3
        $response = $controller->mostrar($id);

        responder(
            $response,
            $response['success'] ? 200 : 404
        );

    case 'POST':
        if ($id !== null) {
            responder(
                [
                    'success' => false,
                    'message' => 'No debe enviar un ID para crear una persona.'
                ],
                400
            );
        }

        // POST /api/persons
        $response = $controller->guardar($data);

        responder(
            $response,
            $response['success'] ? 201 : 422
        );

    case 'PUT':
    case 'PATCH':
        if ($id === null) {
            responder(
                [
                    'success' => false,
                    'message' => 'Debe indicar el ID de la persona que desea actualizar.'
                ],
                400
            );
        }

        // PUT o PATCH /api/persons/3
        $response = $controller->actualizar($id, $data);

        if ($response['success']) {
            responder($response, 200);
        }

        $statusCode = isset($response['errors']) ? 422 : 404;

        responder(
            $response,
            $statusCode
        );

    case 'DELETE':
        if ($id === null) {
            responder(
                [
                    'success' => false,
                    'message' => 'Debe indicar el ID de la persona que desea eliminar.'
                ],
                400
            );
        }

        // DELETE /api/persons/3
        $response = $controller->borrar($id);

        responder(
            $response,
            $response['success'] ? 200 : 404
        );

    default:
        responder(
            [
                'success' => false,
                'message' => 'Método HTTP no permitido.'
            ],
            405
        );
}

/**
 * Enviar una respuesta JSON y finalizar la ejecución.
 */
function responder(array $response, int $statusCode): void
{
    http_response_code($statusCode);

    echo json_encode(
        $response,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
    );

    exit;
}