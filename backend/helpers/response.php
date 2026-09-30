<?php

function jsonResponse(
    mixed $data,
    int $status = 200
): never {
    http_response_code($status);

    echo json_encode([
        'success' => $status < 400,
        'data' => $status < 400 ? $data : null,
        'error' => $status >= 400 ? $data : null
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

function getJsonBody(): array
{
    $input = file_get_contents('php://input');

    if ($input === false || trim($input) === '') {
        return [];
    }

    $data = json_decode($input, true);

    if (
        json_last_error() !== JSON_ERROR_NONE ||
        !is_array($data)
    ) {
        jsonResponse('JSON inválido', 422);
    }

    return $data;
}