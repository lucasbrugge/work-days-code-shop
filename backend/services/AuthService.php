<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

class AuthService
{
    private PDO $db;
    private User $userModel;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->userModel = new User($this->db);
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

    public function login(string $email, string $password): array
    {
        $email = trim($email);

        $user = $this->userModel->findByEmail($email);

        if (
            $user === false ||
            !password_verify($password, $user['password_hash'])
        ) {
            throw new RuntimeException(
                'E-mail ou senha inválidos'
            );
        }

        return [
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];
    }
}
