<?php

function fixUtf8(mixed $val): mixed
{
    if (is_string($val) && preg_match('/[\xC3-\xC5][\x80-\xBF]/', $val)) {
        $conv = @mb_convert_encoding($val, 'ISO-8859-1', 'UTF-8');
        if ($conv !== false && mb_check_encoding($conv, 'UTF-8')) {
            return $conv;
        }
    }

    return is_array($val) ? array_map('fixUtf8', $val) : $val;
}

function jsonResponse(
    mixed $data,
    int $status = 200,
    ?array $meta = null
): never {
    http_response_code($status);

    $cleanData = fixUtf8($data);

    $response = [
        'success' => $status < 400,
        'data' => $status < 400 ? $cleanData : null,
        'error' => $status >= 400 ? $cleanData : null
    ];

    if ($meta !== null) {
        $response['meta'] = fixUtf8($meta);
    }

    echo json_encode(
        $response,
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
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
