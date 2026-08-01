<?php

declare(strict_types=1);

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';
require_once __DIR__ . '/../controllers/PersonController.php';

function respond(array $body, int $status): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
}

function readJsonBody(): ?array
{
    $body = file_get_contents('php://input');

    if ($body === false) {
        return null;
    }

    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        return null;
    }

    return $data;
}

try {
    $fileManager = new FileManager(__DIR__ . '/../data/persons.json');
    $controller = new PersonController($fileManager);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $path = rtrim($path ?? '', '/');
    $path = $path === '' ? '/' : $path;

    if ($path === '/api/persons') {
        if ($method === 'GET') {
            $controller->getAll();
        } elseif ($method === 'POST') {
            $data = readJsonBody();

            if ($data === null) {
                respond(['message' => 'Invalid JSON body'], 400);
            } else {
                $controller->create($data);
            }
        } else {
            respond(['message' => 'Method not allowed'], 405);
        }

        exit;
    }

    if (preg_match('#^/api/persons/(\d+)/age$#', $path, $matches) === 1) {
        if ($method === 'GET') {
            $controller->getAge((int) $matches[1]);
        } else {
            respond(['message' => 'Method not allowed'], 405);
        }

        exit;
    }

    if (preg_match('#^/api/persons/(\d+)$#', $path, $matches) === 1) {
        $id = (int) $matches[1];

        if ($method === 'GET') {
            $controller->getById($id);
        } elseif ($method === 'PUT') {
            $data = readJsonBody();

            if ($data === null) {
                respond(['message' => 'Invalid JSON body'], 400);
            } else {
                $controller->update($id, $data);
            }
        } elseif ($method === 'DELETE') {
            $controller->delete($id);
        } else {
            respond(['message' => 'Method not allowed'], 405);
        }

        exit;
    }

    respond(['message' => 'Route not found'], 404);
} catch (Throwable) {
    respond(['message' => 'Internal server error'], 500);
}
