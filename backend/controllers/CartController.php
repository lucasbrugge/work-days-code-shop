<?php

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/CartService.php';

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

    public static function index(): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_CART_TOKEN'] ?? null;

            $cart = self::getService()->getCart($guestToken);

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
}
