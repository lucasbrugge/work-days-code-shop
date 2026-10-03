<?php

class AuthValidator
{
    private const NAME_MIN_LENGTH = 3;
    private const NAME_MAX_LENGTH = 100;
    private const EMAIL_MAX_LENGTH = 150;
    private const PASSWORD_MIN_LENGTH = 8;

    public static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    public static function validateRegister(array $data): array
    {
        $errors = [];
        $name = $data['name'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $confirmation = $data['password_confirmation'] ?? null;

        if (!is_string($name)) {
            $errors['name'] = 'O nome é obrigatório e deve ser texto.';
        } else {
            $name = trim($name);
            $nameLength = self::characterLength($name);

            if ($nameLength === null) {
                $errors['name'] = 'O nome possui uma codificação inválida.';
            } elseif ($nameLength < self::NAME_MIN_LENGTH) {
                $errors['name'] = 'O nome deve possuir pelo menos 3 caracteres.';
            } elseif ($nameLength > self::NAME_MAX_LENGTH) {
                $errors['name'] = 'O nome deve possuir no máximo 100 caracteres.';
            }
        }

        if (!is_string($email) || trim($email) === '') {
            $errors['email'] = 'O e-mail é obrigatório e deve ser texto.';
        } else {
            $normalizedEmail = self::normalizeEmail($email);
            $emailLength = self::characterLength($normalizedEmail);

            if (!filter_var($normalizedEmail, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Informe um e-mail válido.';
            } elseif ($emailLength === null || $emailLength > self::EMAIL_MAX_LENGTH) {
                $errors['email'] = 'O e-mail deve possuir no máximo 150 caracteres.';
            }
        }

        if (!is_string($password) || $password === '') {
            $errors['password'] = 'A senha é obrigatória e deve ser texto.';
        } else {
            $passwordLength = self::characterLength($password);

            if ($passwordLength === null) {
                $errors['password'] = 'A senha possui uma codificação inválida.';
            } elseif ($passwordLength < self::PASSWORD_MIN_LENGTH) {
                $errors['password'] = 'A senha deve possuir pelo menos 8 caracteres.';
            }
        }

        if (!is_string($confirmation) || $confirmation === '') {
            $errors['password_confirmation'] = 'A confirmação da senha é obrigatória.';
        } elseif (is_string($password) && $password !== $confirmation) {
            $errors['password_confirmation'] = 'As senhas não coincidem.';
        }

        return $errors;
    }

    public static function validateLogin(array $data): array
    {
        $errors = [];
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!is_string($email) || trim($email) === '') {
            $errors['email'] = 'O e-mail é obrigatório e deve ser texto.';
        } else {
            $normalizedEmail = self::normalizeEmail($email);
            $emailLength = self::characterLength($normalizedEmail);

            if (!filter_var($normalizedEmail, FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'Informe um e-mail válido.';
            } elseif ($emailLength === null || $emailLength > self::EMAIL_MAX_LENGTH) {
                $errors['email'] = 'O e-mail deve possuir no máximo 150 caracteres.';
            }
        }

        if (!is_string($password) || $password === '') {
            $errors['password'] = 'A senha é obrigatória e deve ser texto.';
        }

        return $errors;
    }

    private static function characterLength(string $value): ?int
    {
        $length = preg_match_all('/./us', $value);

        return $length === false ? null : $length;
    }
}
