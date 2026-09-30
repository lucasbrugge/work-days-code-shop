<?php

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && $uri === '/api/health') {
    http_response_code(200);

    echo json_encode([
        'success' => true,
        'data' => [
            'message' => 'API funcionando'
        ]
    ]);

    exit;
}

http_response_code(404);

echo json_encode([
    'success' => false,
    'error' => 'Rota não encontrada'
]);
