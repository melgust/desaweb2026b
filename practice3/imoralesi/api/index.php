<?php

require_once __DIR__ . '/../controllers/PersonController.php';

// Encabezados para permitir consumo API y JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar la URI para quitar prefijos de carpetas e index.php
$scriptName = dirname($_SERVER['SCRIPT_NAME']);
if (strpos($uri, $_SERVER['SCRIPT_NAME']) === 0) {
    $uri = substr($uri, strlen($_SERVER['SCRIPT_NAME']));
} elseif (strpos($uri, $scriptName) === 0) {
    $uri = substr($uri, strlen($scriptName));
}

// Asegurar formato estandarizado
if (empty($uri)) {
    $uri = '/';
}

$controller = new PersonController();

// Manejo de enrutamiento
if ($uri === '/persons' || $uri === '/persons/' || $uri === '/api/persons' || $uri === '/api/persons/') {
    if ($method === 'GET') {
        $controller->getAll();
    } elseif ($method === 'POST') {
        $controller->create();
    } else {
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
    }
} elseif (preg_match('#^/(?:api/)?persons/([^/]+)/age$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'GET') {
        $controller->getAge($id);
    } else {
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
    }
} elseif (preg_match('#^/(?:api/)?persons/([^/]+)$#', $uri, $matches)) {
    $id = $matches[1];
    if ($method === 'GET') {
        $controller->getById($id);
    } elseif ($method === 'PUT') {
        $controller->update($id);
    } elseif ($method === 'DELETE') {
        $controller->delete($id);
    } else {
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
    }
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint not found']);
}