<?php

declare(strict_types=1);

require_once __DIR__ . '/../controllers/PersonController.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$segments = array_values(array_filter(explode('/', $path), fn ($s) => $s !== ''));

// Se espera algo como: api / persons / {id?} / age?
$personsIndex = array_search('persons', $segments, true);

if ($personsIndex === false) {
    http_response_code(404);
    echo json_encode(['message' => 'Route not found']);
    exit;
}

$id = $segments[$personsIndex + 1] ?? null;
$sub = $segments[$personsIndex + 2] ?? null;

if ($id !== null && !ctype_digit($id)) {
    http_response_code(400);
    echo json_encode(['message' => 'El id debe ser numérico']);
    exit;
}

$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
$input = is_array($input) ? $input : [];

$controller = new PersonController();

switch (true) {
    case $method === 'POST' && $id === null:
        $controller->create($input);
        break;

    case $method === 'GET' && $id === null:
        $controller->getAll();
        break;

    case $method === 'GET' && $id !== null && $sub === 'age':
        $controller->getAge((int)$id);
        break;

    case $method === 'GET' && $id !== null && $sub === null:
        $controller->getById((int)$id);
        break;

    case $method === 'PUT' && $id !== null && $sub === null:
        $controller->update((int)$id, $input);
        break;

    case $method === 'DELETE' && $id !== null && $sub === null:
        $controller->delete((int)$id);
        break;

    default:
        http_response_code(404);
        echo json_encode(['message' => 'Route not found']);
        break;
}
