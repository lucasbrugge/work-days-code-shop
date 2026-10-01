<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

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

            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';

            if ($email === '' || $password === '') {
                jsonResponse(
                    'E-mail e senha são obrigatórios',
                    422
                );
            }

            $result = self::getService()->login(
                $email,
                $password
            );

            jsonResponse($result);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 401);
        } catch (Throwable $e) {
            jsonResponse('Erro ao realizar login', 500);
        }
    }

    public static function me(): never
    {
        $user = AuthMiddleware::user();

        jsonResponse($user);
    }
}
