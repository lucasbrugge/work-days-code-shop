<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/ProductService.php';

class ProductController
{
    private static ?ProductService $service = null;

   
    public static function getService(): ProductService
    {
        if (self::$service === null) {
            self::$service = new ProductService();
        }
        return self::$service;
    }

    
    public static function setService(ProductService $service): void
    {
        self::$service = $service;
    }

   
    public static function index(): never
    {
        try {
            $result = self::getService()->list($_GET, isPublic: true);
            jsonResponse($result['data'], 200, $result['meta']);
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar produtos: ' . $e->getMessage(), 500);
        }
    }

   
    public static function adminIndex(): never
    {
        try {
            $result = self::getService()->list($_GET, isPublic: false);
            jsonResponse($result['data'], 200, $result['meta']);
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar produtos na área administrativa: ' . $e->getMessage(), 500);
        }
    }

    
    public static function show(mixed $id): never
    {
        try {
            $product = self::getService()->getById((int) $id, onlyActive: true);
            jsonResponse($product, 200);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao carregar detalhes do produto: ' . $e->getMessage(), 500);
        }
    }
   
    public static function adminShow(mixed $id): never
    {
        try {
            $product = self::getService()->getById((int) $id, onlyActive: false);
            jsonResponse($product, 200);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao carregar produto: ' . $e->getMessage(), 500);
        }
    }

    public static function store(): never
    {
        try {
            $data = getJsonBody();
            $created = self::getService()->create($data);
            jsonResponse($created, 201);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cadastrar produto: ' . $e->getMessage(), 500);
        }
    }
    
    public static function update(mixed $id): never
    {
        try {
            $data = getJsonBody();
            $updated = self::getService()->update((int) $id, $data);
            jsonResponse($updated, 200);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao atualizar produto: ' . $e->getMessage(), 500);
        }
    }

    public static function destroy(mixed $id): never
    {
        try {
            $force = filter_var($_GET['force'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $result = self::getService()->delete((int) $id, $force);
            jsonResponse($result, 200);
        } catch (RuntimeException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao excluir/desativar produto: ' . $e->getMessage(), 500);
        }
    }
}
