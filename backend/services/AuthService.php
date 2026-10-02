<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/CartService.php';

class AuthService
{
    private PDO $db;
    private User $userModel;
    private CartService $cartService;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->userModel = new User($this->db);
        $this->cartService = new CartService();
    }

    public function register(array $data): array
    {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($name === '') {
            throw new InvalidArgumentException('Nome é obrigatório');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('E-mail inválido');
        }

        if (strlen($password) < 6) {
            throw new InvalidArgumentException(
                'A senha deve ter pelo menos 6 caracteres'
            );
        }

        if ($this->userModel->emailExists($email)) {
            throw new RuntimeException('E-mail já cadastrado');
        }

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $stmt = $this->db->prepare("
            INSERT INTO users
                (name, email, password_hash, role)
            VALUES
                (:name, :email, :password_hash, 'customer')
        ");

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => $passwordHash
        ]);

        $userId = (int) $this->db->lastInsertId();

        $user = $this->userModel->findById($userId);

        if ($user === false) {
            throw new RuntimeException(
                'Usuário criado, mas não foi possível carregá-lo'
            );
        }

        return $user;
    }

    public function login(
        string $email,
        string $password,
        ?string $guestToken = null
    ): array
    {
        $email = strtolower(
        trim($email)
        );

        $user = $this->userModel->findByEmail(
            $email
        );
        if (
            $user === false ||
            !password_verify($password, $user['password_hash'])
        ) {
            throw new RuntimeException(
                'E-mail ou senha inválidos'
            );
        }

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        $expiresAt = date(
            'Y-m-d H:i:s',
            time() + (60 * 60 * 24)
        );

        $this->db->beginTransaction();
        try {
            if ($guestToken !== null && $guestToken !== '') {
                $this->cartService->mergeGuestCart((int) $user['id'], $guestToken);
            }

            $stmt = $this->db->prepare("
                INSERT INTO auth_tokens
                    (user_id, token_hash, expires_at)
                VALUES
                    (:user_id, :token_hash, :expires_at)
            ");

            $stmt->execute([
                'user_id' => $user['id'],
                'token_hash' => $tokenHash,
                'expires_at' => $expiresAt
            ]);

            $this->db->commit();
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }

        return [
            'token' => $token,
            'expires_at' => $expiresAt,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
    }

    public function logout(string $token): void
    {
        $tokenHash = hash('sha256', $token);

        $stmt = $this->db->prepare("
            DELETE FROM auth_tokens
            WHERE token_hash = :token_hash
        ");

        $stmt->execute([
            'token_hash' => $tokenHash
        ]);
    }
}
