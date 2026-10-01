<?php

require_once __DIR__ . '/../validators/AuthValidator.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../helpers/response.php';

class AuthController
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(array $data): never
    {
        $errors = AuthValidator::validateRegister($data);

        if (!empty($errors)) {
            jsonResponse(
                [
                    'message' => 'Dados inválidos.',
                    'fields' => $errors
                ],
                422
            );
        }

        $result = $this->authService->register(
            $data['name'],
            $data['email'],
            $data['password']
        );

        if (!$result['success']) {
            jsonResponse(
                [
                    'message' => $result['message']
                ],
                409
            );
        }

        jsonResponse(
            [
                'message' => 'Usuário cadastrado com sucesso.',
                'user' => $result['user']
            ],
            201
        );
    }
}