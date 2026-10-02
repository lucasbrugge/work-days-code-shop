<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/OrderService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class OrderController
{
    private static ?OrderService $service = null;

    public static function getService(): OrderService
    {
        if (self::$service === null) {
            self::$service = new OrderService();
        }

        return self::$service;
    }

    public static function setService(OrderService $service): void
    {
        self::$service = $service;
    }

    private static function userId(): int
    {
        $user = AuthMiddleware::user() ?? AuthMiddleware::requireAuth();
        return (int) $user['id'];
    }

    public static function index(): never
    {
        try {
            jsonResponse(self::getService()->listOrders(self::userId()));
        } catch (PDOException $e) {
            jsonResponse('Erro ao listar pedidos.', 500);
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar pedidos.', 500);
        }
    }

    public static function store(): never
    {
        try {
            $data = getJsonBody();
            $order = self::getService()->createOrder(
                self::userId(),
                $data['address_id'] ?? null
            );

            jsonResponse($order, 201);
        } catch (PDOException $e) {
            jsonResponse('Erro ao criar pedido.', 500);
        } catch (OrderNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (OrderConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao criar pedido.', 500);
        }
    }

    public static function show(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->getOrder(self::userId(), $id));
        } catch (OrderNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao carregar pedido.', 500);
        }
    }

    public static function pay(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->payOrder(self::userId(), $id));
        } catch (PDOException $e) {
            jsonResponse('Erro ao confirmar pagamento.', 500);
        } catch (OrderNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (OrderConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao confirmar pagamento.', 500);
        }
    }

    public static function cancel(mixed $id): never
    {
        try {
            jsonResponse(self::getService()->cancelOrder(self::userId(), $id));
        } catch (PDOException $e) {
            jsonResponse('Erro ao cancelar pedido.', 500);
        } catch (OrderNotFoundException $e) {
            jsonResponse($e->getMessage(), 404);
        } catch (OrderConflictException $e) {
            jsonResponse($e->getMessage(), 409);
        } catch (InvalidArgumentException $e) {
            jsonResponse($e->getMessage(), 422);
        } catch (Throwable $e) {
            jsonResponse('Erro ao cancelar pedido.', 500);
        }
    }
}
