<?php

require_once __DIR__ . '/../config/database.php';

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

    public static function requireAuth(): array
    {
        $token = self::getToken();

        if ($token === null) {
            jsonResponse(
                'Token de autenticação obrigatório',
                401
            );
        }

        $tokenHash = hash('sha256', $token);

        try {
            $db = Database::getConnection();

            $stmt = $db->prepare("
                SELECT
                    users.id,
                    users.name,
                    users.email,
                    users.role
                FROM auth_tokens
                INNER JOIN users
                    ON users.id = auth_tokens.user_id
                WHERE auth_tokens.token_hash = :token_hash
                    AND auth_tokens.expires_at > NOW()
                LIMIT 1
            ");

            $stmt->execute([
                'token_hash' => $tokenHash
            ]);

            $user = $stmt->fetch();

            if ($user === false) {
                jsonResponse(
                    'Token inválido ou expirado',
                    401
                );
            }

            return $user;
        } catch (PDOException $e) {
            jsonResponse(
                'Erro ao validar autenticação',
                500
            );
        }
    }
}
