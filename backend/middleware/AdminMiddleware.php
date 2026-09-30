<?php

class AdminMiddleware
{
    public static function requireAdmin(array $user): void
    {
        if (($user['role'] ?? null) !== 'admin') {
            jsonResponse(
                'Acesso permitido somente para administradores',
                403
            );
        }
    }
}