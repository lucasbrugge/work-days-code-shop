<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/CartService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CartController
{
    private static ?CartService $service = null;

    public static function getService(): CartService
    {
        if (self::$service === null) {
            self::$service = new CartService();
        }

        return self::$service;
    }

    public static function setService(CartService $service): void
    {
        self::$service = $service;
    }

    private static function authenticatedUserId(): ?int
    {
        if (AuthMiddleware::getToken() === null) {
            return null;
        }

        $user = AuthMiddleware::requireAuth();
        return (int) $user['id'];
    }

    public static function index(): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $cart = self::getService()->getCart($guestToken, $userId);

            $token = $cart['guest_token'] ?? null;

            if ($token) {
                header('X-Cart-Token: ' . $token);
            }

            jsonResponse($cart, 200);
        } catch (Throwable $e) {
            jsonResponse(
                'Erro ao carregar carrinho: ' . $e->getMessage(),
                500
            );
        }
    }

    public static function store(): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $input = json_decode(
                file_get_contents('php://input'),
                true
            );

            $productId = (int) ($input['product_id'] ?? 0);
            $quantity = (int) ($input['quantity'] ?? 0);

            $cart = self::getService()->addItem(
                $guestToken,
                $productId,
                $quantity,
                $userId
            );

            $token = $cart['guest_token'] ?? null;

            if ($token) {
                header('X-Cart-Token: ' . $token);
            }

            jsonResponse($cart, 201);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            jsonResponse(
                'Erro ao adicionar produto ao carrinho: ' . $e->getMessage(),
                500
            );
        }
    }

    public static function update(int $id): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $input = json_decode(
                file_get_contents('php://input'),
                true
            );

            $quantity = (int) ($input['quantity'] ?? 0);

            $cart = self::getService()->updateItem(
                $guestToken,
                $id,
                $quantity,
                $userId
            );

            $token = $cart['guest_token'] ?? null;

            if ($token) {
                header('X-Cart-Token: ' . $token);
            }

            jsonResponse($cart, 200);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            jsonResponse(
                'Erro ao atualizar item do carrinho: ' . $e->getMessage(),
                500
            );
        }
    }
    public static function destroy(int $id): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $cart = self::getService()->removeItem(
                $guestToken,
                $id,
                $userId
            );

            $token = $cart['guest_token'] ?? null;

            if ($token) {
                header('X-Cart-Token: ' . $token);
            }

            jsonResponse($cart, 200);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            jsonResponse(
                'Erro ao remover item do carrinho: ' . $e->getMessage(),
                500
            );
        }
    }
}
