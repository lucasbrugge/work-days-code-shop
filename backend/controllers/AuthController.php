<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../validators/AuthValidator.php';

class AuthController
{
    private static ?AuthService $service = null;

    public static function getService(): AuthService
    {
        if (self::$service === null) {
            self::$service = new AuthService();
        }

        return self::$service;
    }

    public static function register(): never
    {
        try {
            $data = getJsonBody();

            $user = self::getService()->register($data);

            jsonResponse($user, 201);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cadastrar usuário', 500);
        }
    }

    public static function login(): never
    {
        try {
            $data = getJsonBody();

            $errors = AuthValidator::validateLogin($data);

            if (!empty($errors)) {
                jsonResponse(
                    [
                        'message' => 'Dados inválidos.',
                        'fields' => $errors
                    ],
                    422
                );
            }

            $result = self::getService()->login(
                $data['email'],
                $data['password']
            );

            jsonResponse($result);

        } catch (PDOException $e) {

            jsonResponse(
                'Erro ao realizar login',
                500
            );

        } catch (RuntimeException $e) {

            jsonResponse(
                $e->getMessage(),
                401
            );

        } catch (Throwable $e) {

            jsonResponse(
                'Erro ao realizar login',
                500
            );
        }
    }

    public static function me(): never
    {
        $user = AuthMiddleware::user();

        jsonResponse($user);
    }

    public static function logout(): never
    {
        $token = AuthMiddleware::getToken();

        if ($token === null) {
            jsonResponse(
                'Token de autenticação obrigatório',
                401
            );
        }

        self::getService()->logout($token);

        jsonResponse([
            'message' => 'Logout realizado com sucesso'
        ]);
    }
}
