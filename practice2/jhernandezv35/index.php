<?php

header("Content-Type: application/json");

// Sample data (No Database)
$users = [
    [
        "id" => 1,
        "name" => "Jimmy Hernandez",
        "email" => "jimmy.hernandez@example.com"
    ],
    [
        "id" => 2,
        "name" => "Maria Lopez",
        "email" => "maria.lopez@example.com"
    ],
    [
        "id" => 3,
        "name" => "Carlos Ramirez",
        "email" => "carlos.ramirez@example.com"
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
                    ]);
                    exit;
                }
            }

            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "User not found"
            ]);

        } else {

            echo json_encode([
                "success" => true,
                "data" => $users
            ]);

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
            ]);
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
        ]);

        break;

    // PUT /users?id=1
    case "PUT":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "User ID required"
            ]);
            exit;
        }

        $input = json_decode(file_get_contents("php://input"), true);

        echo json_encode([
            "success" => true,
            "message" => "User updated (simulation)",
            "id" => $id,
            "data" => $input
        ]);

        break;

    // DELETE /users?id=1
    case "DELETE":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "User ID required"
            ]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "User deleted (simulation)",
            "id" => $id
        ]);

        break;

    default:

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Method Not Allowed"
        ]);
}