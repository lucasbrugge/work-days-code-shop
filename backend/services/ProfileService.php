<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

class ProfileEmailConflictException extends RuntimeException
{
}

class ProfileService
{
    private User $userModel;

    public function __construct()
    {
        $db = Database::getConnection();

        $this->userModel =
            new User($db);
    }

    public function getProfile(
        int $userId
    ): array {
        $user =
            $this->userModel->findById(
                $userId
            );

        if ($user === false) {
            throw new RuntimeException(
                'Usuário não encontrado.'
            );
        }

        return $user;
    }

    public function updateProfile(
        int $userId,
        array $data
    ): array {
        $name = trim(
            $data['name'] ?? ''
        );

        $email = strtolower(
            trim($data['email'] ?? '')
        );

        if (mb_strlen($name) < 3) {
            throw new InvalidArgumentException(
                'O nome deve possuir pelo menos 3 caracteres.'
            );
        }

        if (
            !filter_var(
                $email,
                FILTER_VALIDATE_EMAIL
            )
        ) {
            throw new InvalidArgumentException(
                'E-mail inválido.'
            );
        }

        if (
            $this->userModel
                ->emailExistsForOtherUser(
                    $email,
                    $userId
                )
        ) {
            throw new ProfileEmailConflictException(
                'Este e-mail já está em uso.'
            );
        }

        $this->userModel->updateProfile(
            $userId,
            $name,
            $email
        );

        $user =
            $this->userModel->findById(
                $userId
            );

        if ($user === false) {
            throw new RuntimeException(
                'Não foi possível carregar o usuário atualizado.'
            );
        }

        return $user;
    }
}