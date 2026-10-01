<?php

class AuthService
{
    private User $userModel;

    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    public function register(
        string $name,
        string $email,
        string $password
    ): array {
        if ($this->userModel->emailExists($email)) {
            return [
                'success' => false,
                'message' => 'Este email já está cadastrado.'
            ];
        }

        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $userId = $this->userModel->create(
            trim($name),
            strtolower(trim($email)),
            $passwordHash
        );

        $user = $this->userModel->findById($userId);

        return [
            'success' => true,
            'user' => $user
        ];
    }
    public function login(
        string $email,
        string $password
    ): array {
        $user = $this->userModel->findByEmail(
            strtolower(trim($email))
        );

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Credenciais inválidas.'
            ];
        }

        if (
            !password_verify(
                $password,
                $user['password_hash']
            )
        ) {
            return [
                'success' => false,
                'message' => 'Credenciais inválidas.'
            ];
        }

        unset($user['password_hash']);

        return [
            'success' => true,
            'user' => $user
        ];
    }
    
}