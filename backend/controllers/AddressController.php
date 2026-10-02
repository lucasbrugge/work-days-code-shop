<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/AddressService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AddressController
{
    private static ?AddressService $service = null;

    private static function getService(): AddressService
    {
        return self::$service ??= new AddressService();
    }

    private static function userId(): int
    {
        $user = AuthMiddleware::user() ?? AuthMiddleware::requireAuth();
        return (int) $user['id'];
    }

    public static function index(): never
    {
        try {
            jsonResponse(self::getService()->listForUser(self::userId()));
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar endereços.', 500);
        }
    }

    public static function store(): never
    {
        try {
            jsonResponse(self::getService()->create(self::userId(), getJsonBody()), 201);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cadastrar endereço.', 500);
        }
    }

    public static function update(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->update(self::userId(), $id, getJsonBody()));
        } catch (AddressNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao atualizar endereço.', 500);
        }
    }

    public static function destroy(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->delete(self::userId(), $id));
        } catch (AddressNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (AddressConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (PDOException $e) {
            if (($e->errorInfo[0] ?? $e->getCode()) === '23000') {
                jsonResponse('Este endereço está associado a pedidos e não pode ser excluído.', 409);
            }
            jsonResponse('Erro ao excluir endereço.', 500);
        } catch (Throwable $e) {
            jsonResponse('Erro ao excluir endereço.', 500);
        }
    }
}
