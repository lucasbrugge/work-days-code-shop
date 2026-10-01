<?php

function jsonResponse(
    mixed $data,
    int $status = 200,
    ?array $meta = null
): never {
    http_response_code($status);

    $response = [
        'success' => $status < 400,
        'data' => $status < 400 ? $data : null,
        'error' => $status >= 400 ? $data : null
    ];

    if ($meta !== null) {
        $response['meta'] = $meta;
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_UNICODE
    );

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
