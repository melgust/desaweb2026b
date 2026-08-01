<?php

require_once __DIR__ . '/../dto/PersonDTO.php';
require_once __DIR__ . '/../helpers/FileManager.php';
require_once __DIR__ . '/../controllers/PersonController.php';

use App\Controllers\PersonController;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$parsedUrl = parse_url($requestUri, PHP_URL_PATH);

$path = trim($parsedUrl, '/');
$segments = array_values(array_filter(explode('/', $path)));

$apiIndex = array_search('api', $segments);
if ($apiIndex !== false && isset($segments[$apiIndex + 1]) && $segments[$apiIndex + 1] === 'persons') {
    $relevantSegments = array_slice($segments, $apiIndex + 1);
} elseif (count($segments) > 0 && $segments[0] === 'persons') {
    $relevantSegments = $segments;
} else {
    $relevantSegments = ['persons'];
}

$method = $_SERVER['REQUEST_METHOD'];
$controller = new PersonController();

$inputData = [];
if ($method === 'POST' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            $inputData = $decoded;
        }
    }
    if (empty($inputData) && !empty($_POST)) {
        $inputData = $_POST;
    }
}

if (count($relevantSegments) === 1 && $relevantSegments[0] === 'persons') {
    if ($method === 'GET') {
        $controller->getAll();
    } elseif ($method === 'POST') {
        $controller->create($inputData);
    } else {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['message' => 'Method Not Allowed']);
        exit;
    }
} elseif (count($relevantSegments) === 2 && $relevantSegments[0] === 'persons' && is_numeric($relevantSegments[1])) {
    $id = (int)$relevantSegments[1];
    if ($method === 'GET') {
        $controller->getById($id);
    } elseif ($method === 'PUT') {
        $controller->update($id, $inputData);
    } elseif ($method === 'DELETE') {
        $controller->delete($id);
    } else {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['message' => 'Method Not Allowed']);
        exit;
    }
} elseif (count($relevantSegments) === 3 && $relevantSegments[0] === 'persons' && is_numeric($relevantSegments[1]) && $relevantSegments[2] === 'age') {
    $id = (int)$relevantSegments[1];
    if ($method === 'GET') {
        $controller->getAge($id);
    } else {
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['message' => 'Method Not Allowed']);
        exit;
    }
} else {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Endpoint not found']);
    exit;
}
