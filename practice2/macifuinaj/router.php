<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

// Si existe un archivo real, PHP lo sirve normalmente.
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}

// Todas las rutas que comiencen con /api/persons
// se envían al punto de entrada de la API.
if (
    $uri === '/api/persons' ||
    str_starts_with($uri, '/api/persons/')
) {
    require __DIR__ . '/api/index.php';
    exit;
}

http_response_code(404);

header('Content-Type: application/json; charset=utf-8');

echo json_encode(
    [
        'success' => false,
        'message' => 'Ruta no encontrada.'
    ],
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);