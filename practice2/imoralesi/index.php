<?php

header("Content-Type: application/json");

// Sample data (No Database)
$users = [
    [
        "id" => 1,
        "name" => "Isaias Morales",
        "email" => "mor@example.com"
    ],
    [
        "id" => 2,
        "name" => "Nicolle Donis",
        "email" => "donis@example.com"
    ],
    [
        "id" => 3,
        "name" => "Dei V ",
        "email" => "deiv@example.com"
    ]
];

$method = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {

    // GET /users
    case "GET":

        if ($id) {

            foreach ($users as $user) {
                if ($user["id"] == $id) {
                    echo json_encode([
                        "success" => true,
                        "data" => $user
                    ], JSON_PRETTY_PRINT);
                    exit;
                }
            }

            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "User not found"
            ], JSON_PRETTY_PRINT);

        } else {

            echo json_encode([
                "success" => true,
                "data" => $users
            ], JSON_PRETTY_PRINT);

        }

        break;

    // POST /users
    case "POST":

        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Invalid JSON"
            ], JSON_PRETTY_PRINT);
            exit;
        }

        $newUser = [
            "id" => count($users) + 1,
            "name" => $input["name"] ?? "",
            "email" => $input["email"] ?? ""
        ];

        http_response_code(201);

        echo json_encode([
            "success" => true,
            "message" => "User created",
            "data" => $newUser
        ], JSON_PRETTY_PRINT);

        break;

    // PUT /users?id=1
    case "PUT":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "User ID required"
            ], JSON_PRETTY_PRINT);
            exit;
        }

        $input = json_decode(file_get_contents("php://input"), true);

        echo json_encode([
            "success" => true,
            "message" => "User updated (simulation)",
            "id" => $id,
            "data" => $input
        ], JSON_PRETTY_PRINT);

        break;

    // DELETE /users?id=1
    case "DELETE":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "User ID required"
            ], JSON_PRETTY_PRINT);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "User deleted (simulation)",
            "id" => $id
        ], JSON_PRETTY_PRINT);

        break;

    default:

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method Not Allowed"
        ], JSON_PRETTY_PRINT);
}