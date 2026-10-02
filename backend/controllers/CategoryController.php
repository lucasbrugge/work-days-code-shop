<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/CategoryService.php';

class CategoryController
{
    private static ?CategoryService $service = null;

    public static function getService(): CategoryService
    {
        return self::$service ??= new CategoryService();
    }

    public static function setService(CategoryService $service): void
    {
        self::$service = $service;
    }

    public static function index(): never
    {
        try {
            jsonResponse(self::getService()->list());
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar categorias.', 500);
        }
    }

    public static function store(): never
    {
        try {
            jsonResponse(self::getService()->create(getJsonBody()), 201);
        } catch (CategoryConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (PDOException $e) {
            self::handleDatabaseException($e);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cadastrar categoria.', 500);
        }
    }

    public static function update(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->update($id, getJsonBody()));
        } catch (CategoryNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (CategoryConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (PDOException $e) {
            self::handleDatabaseException($e);
        } catch (Throwable $e) {
            jsonResponse('Erro ao atualizar categoria.', 500);
        }
    }

    public static function destroy(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->delete($id));
        } catch (CategoryNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (CategoryConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (PDOException $e) {
            self::handleDatabaseException($e);
        } catch (Throwable $e) {
            jsonResponse('Erro ao excluir categoria.', 500);
        }
    }

    private static function handleDatabaseException(PDOException $e): never
    {
        if (($e->errorInfo[0] ?? $e->getCode()) === '23000') {
            jsonResponse('Já existe uma categoria com esse nome ou slug, ou ela está associada a produtos.', 409);
        }
        jsonResponse('Erro ao salvar categoria.', 500);
    }
}
