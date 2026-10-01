<?php

class AuthValidator
{
    public static function validateRegister(array $data): array
    {
        $errors = [];

        // Nome
        if (
            !isset($data['name']) ||
            trim($data['name']) === ''
        ) {
            $errors['name'] = 'O nome é obrigatório.';
        } elseif (
            mb_strlen(trim($data['name'])) < 3
        ) {
            $errors['name'] =
                'O nome deve possuir pelo menos 3 caracteres.';
        }

        // Email
        if (
            !isset($data['email']) ||
            trim($data['email']) === ''
        ) {
            $errors['email'] = 'O email é obrigatório.';
        } elseif (
            !filter_var(
                $data['email'],
                FILTER_VALIDATE_EMAIL
            )
        ) {
            $errors['email'] = 'Informe um email válido.';
        }

        // Senha
        if (
            !isset($data['password']) ||
            $data['password'] === ''
        ) {
            $errors['password'] = 'A senha é obrigatória.';
        } elseif (
            strlen($data['password']) < 8
        ) {
            $errors['password'] =
                'A senha deve possuir pelo menos 8 caracteres.';
        }

        // Confirmação da senha
        if (
            !isset($data['password_confirmation']) ||
            $data['password_confirmation'] === ''
        ) {
            $errors['password_confirmation'] =
                'A confirmação da senha é obrigatória.';
        } elseif (
            isset($data['password']) &&
            $data['password'] !== $data['password_confirmation']
        ) {
            $errors['password_confirmation'] =
                'As senhas não coincidem.';
        }

        return $errors;
    }

    public static function validateLogin(array $data): array
    {
        $errors = [];

        // Email
        if (
            !isset($data['email']) ||
            trim($data['email']) === ''
        ) {
            $errors['email'] = 'O email é obrigatório.';
        } elseif (
            !filter_var(
                $data['email'],
                FILTER_VALIDATE_EMAIL
            )
        ) {
            $errors['email'] = 'Informe um email válido.';
        }

        // Senha
        if (
            !isset($data['password']) ||
            $data['password'] === ''
        ) {
            $errors['password'] = 'A senha é obrigatória.';
        }

        return $errors;
    }
}