<?php

class AuthMiddleware
{
    public static function getToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!str_starts_with($header, 'Bearer ')) {
            return null;
        }

        $token = trim(substr($header, 7));

        if ($token === '') {
            return null;
        }

        return $token;
    }

    public static function requireAuth(): string
    {
        $token = self::getToken();

        if ($token === null) {
            jsonResponse(
                'Token de autenticação obrigatório',
                401
            );
        }

        return $token;
    }
}