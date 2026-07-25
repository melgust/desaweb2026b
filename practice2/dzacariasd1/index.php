<?php

header("Content-Type: application/json");

$products = [
    [
        "id" => 1,
        "name" => "Laptop",
        "price" => 1200
    ],
    [
        "id" => 2,
        "name" => "Mouse",
        "price" => 25
    ],
    [
        "id" => 3,
        "name" => "Keyboard",
        "price" => 50
    ]
];

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {

    case "GET":

        if ($id) {

            foreach ($products as $product) {
                if ($product["id"] == $id) {
                    echo json_encode([
                        "success" => true,
                        "data" => $product
                    ]);
                    exit;
                }
            }

            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Product not found"
            ]);

        } else {

            echo json_encode([
                "success" => true,
                "data" => $products
            ]);

        }

        break;

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

        $newProduct = [
            "id" => count($products) + 1,
            "name" => $input["name"] ?? "",
            "price" => $input["price"] ?? 0
        ];

        http_response_code(201);

        echo json_encode([
            "success" => true,
            "message" => "Product created",
            "data" => $newProduct
        ]);

        break;

    case "PUT":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Product ID required"
            ]);
            exit;
        }

        $input = json_decode(file_get_contents("php://input"), true);

        echo json_encode([
            "success" => true,
            "message" => "Product updated (simulation)",
            "id" => $id,
            "data" => $input
        ]);

        break;

    case "DELETE":

        if (!$id) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Product ID required"
            ]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Product deleted (simulation)",
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
