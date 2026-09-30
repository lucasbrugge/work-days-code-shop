<?php

function jsonResponse(mixed $data, int $status = 200): never
{
    http_response_code($status);

    echo json_encode([
        'success' => $status < 400,
        'data' => $status < 400 ? $data : null,
        'error' => $status >= 400 ? $data : null
    ]);

    exit;
}

function getJsonBody(): array
{
    $input = file_get_contents('php://input');

    if (!$input) {
        return [];
    }

    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse('JSON inválido', 422);
    }

    return $data;
}

$method = $_SERVER['REQUEST_METHOD'];

$uri = parse_url(
    $_SERVER['REQUEST_URI'],
    PHP_URL_PATH
);

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

if ($method === 'GET' && $uri === '/api/health') {
    jsonResponse([
        'message' => 'API funcionando'
    ]);
}

/*
|--------------------------------------------------------------------------
| Rotas de autenticação
|--------------------------------------------------------------------------
*/

if ($method === 'POST' && $uri === '/api/auth/register') {
    jsonResponse('Endpoint de registro ainda não implementado', 501);
}

if ($method === 'POST' && $uri === '/api/auth/login') {
    jsonResponse('Endpoint de login ainda não implementado', 501);
}

if ($method === 'POST' && $uri === '/api/auth/logout') {
    jsonResponse('Endpoint de logout ainda não implementado', 501);
}

if ($method === 'GET' && $uri === '/api/auth/me') {
    jsonResponse('Endpoint /auth/me ainda não implementado', 501);
}

/*
|--------------------------------------------------------------------------
| Produtos
|--------------------------------------------------------------------------
*/

if ($method === 'GET' && $uri === '/api/products') {
    jsonResponse('Endpoint de produtos ainda não implementado', 501);
}

/*
|--------------------------------------------------------------------------
| Categorias
|--------------------------------------------------------------------------
*/

if ($method === 'GET' && $uri === '/api/categories') {
    jsonResponse('Endpoint de categorias ainda não implementado', 501);
}

/*
|--------------------------------------------------------------------------
| Carrinho
|--------------------------------------------------------------------------
*/

if ($method === 'GET' && $uri === '/api/cart') {
    jsonResponse('Endpoint de carrinho ainda não implementado', 501);
}

if ($method === 'POST' && $uri === '/api/cart/items') {
    jsonResponse('Endpoint de adicionar item ainda não implementado', 501);
}

/*
|--------------------------------------------------------------------------
| Rota não encontrada
|--------------------------------------------------------------------------
*/

jsonResponse('Rota não encontrada', 404);