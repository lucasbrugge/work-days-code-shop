<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/ProfileService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController
{
    private static ?ProfileService $service = null;

    private static function getService(): ProfileService
    {
        return self::$service ??=
            new ProfileService();
    }

    private static function userId(): int
    {
        $user =
            AuthMiddleware::user()
            ?? AuthMiddleware::requireAuth();

        return (int) $user['id'];
    }

    public static function show(): never
    {
        try {
            $profile =
                self::getService()
                    ->getProfile(
                        self::userId()
                    );

            jsonResponse($profile);

        } catch (Throwable $e) {

            jsonResponse(
                'Erro ao carregar perfil.',
                500
            );
        }
    }

    public static function update(): never
    {
        try {
            $profile =
                self::getService()
                    ->updateProfile(
                        self::userId(),
                        getJsonBody()
                    );

            jsonResponse([
                'message' =>
                    'Perfil atualizado com sucesso.',
                'user' =>
                    $profile
            ]);

        } catch (
            ProfileEmailConflictException $e
        ) {

            jsonResponse(
                $e->getMessage(),
                409
            );

        } catch (
            InvalidArgumentException $e
        ) {

            jsonResponse(
                $e->getMessage(),
                422
            );

        } catch (Throwable $e) {

            jsonResponse(
                'Erro ao atualizar perfil.',
                500
            );
        }
    }
}