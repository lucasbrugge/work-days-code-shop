<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

class UserController
{
    private static ?User $userModel = null;

    public static function getUserModel(): User
    {
        if (self::$userModel === null) {
            self::$userModel = new User(Database::getConnection());
        }

        return self::$userModel;
    }

    public static function setUserModel(User $model): void
    {
        self::$userModel = $model;
    }

    public static function adminIndex(): never
    {
        try {
            $users = self::getUserModel()->findAll();
            jsonResponse($users);
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar usuários.', 500);
        }
    }

    public static function adminShow(mixed $id): never
    {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            jsonResponse('ID de usuário inválido.', 422);
        }

        $user = self::getUserModel()->findById((int) $id);
        if (!$user) {
            jsonResponse('Usuário não encontrado.', 404);
        }

        jsonResponse($user);
    }

    public static function store(): never
    {
        try {
            $data = getJsonBody();
            $name = trim((string) ($data['name'] ?? ''));
            $email = strtolower(trim((string) ($data['email'] ?? '')));
            $password = (string) ($data['password'] ?? '');
            $role = ($data['role'] ?? '') === 'admin' ? 'admin' : 'customer';

            if ($name === '' || strlen($name) < 3 || strlen($name) > 100) {
                jsonResponse('O nome é obrigatório (entre 3 e 100 caracteres).', 422);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
                jsonResponse('Informe um e-mail válido.', 422);
            }

            if (strlen($password) < 6) {
                jsonResponse('A senha deve possuir pelo menos 6 caracteres.', 422);
            }

            $model = self::getUserModel();
            if ($model->emailExists($email)) {
                jsonResponse('Este e-mail já está cadastrado.', 409);
            }

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $userId = $model->createAdmin($name, $email, $passwordHash, $role);
            $user = $model->findById($userId);

            jsonResponse($user, 201);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cadastrar usuário.', 500);
        }
    }

    public static function update(mixed $id): never
    {
        try {
            $id = filter_var($id, FILTER_VALIDATE_INT);
            if ($id === false || $id <= 0) {
                jsonResponse('ID de usuário inválido.', 422);
            }

            $model = self::getUserModel();
            $user = $model->findById((int) $id);
            if (!$user) {
                jsonResponse('Usuário não encontrado.', 404);
            }

            $data = getJsonBody();
            $name = trim((string) ($data['name'] ?? $user['name']));
            $email = strtolower(trim((string) ($data['email'] ?? $user['email'])));
            $role = isset($data['role']) ? ($data['role'] === 'admin' ? 'admin' : 'customer') : $user['role'];
            $password = isset($data['password']) && trim((string)$data['password']) !== '' ? (string)$data['password'] : null;

            if ($name === '' || strlen($name) < 3 || strlen($name) > 100) {
                jsonResponse('O nome é obrigatório (entre 3 e 100 caracteres).', 422);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
                jsonResponse('Informe um e-mail válido.', 422);
            }

            if ($model->emailExistsForOtherUser($email, (int) $id)) {
                jsonResponse('Este e-mail já está em uso por outro usuário.', 409);
            }

            if ($password !== null && strlen($password) < 6) {
                jsonResponse('A senha deve possuir pelo menos 6 caracteres.', 422);
            }

            $passwordHash = $password !== null ? password_hash($password, PASSWORD_DEFAULT) : null;
            $model->updateByAdmin((int) $id, $name, $email, $role, $passwordHash);
            $updated = $model->findById((int) $id);

            jsonResponse($updated);
        } catch (Throwable $e) {
            jsonResponse('Erro ao atualizar usuário.', 500);
        }
    }
}
