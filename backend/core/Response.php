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
    ]);

    exit;
}
