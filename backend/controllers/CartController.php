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

    private static function sendGuestToken(array $cart): void
    {
        $token = $cart['guest_token'] ?? null;
        if (is_string($token) && $token !== '') {
            header('X-Guest-Token: ' . $token);
        }
    }

    private static function positiveInteger(mixed $value, string $field): int
    {
        if (!is_int($value) || $value <= 0) {
            throw new InvalidArgumentException("O campo {$field} deve ser um inteiro positivo.");
        }

        return $value;
    }

    private static function internalError(string $operation, Throwable $e): never
    {
        error_log("{$operation}: {$e}");
        jsonResponse('Não foi possível concluir a operação do carrinho.', 500);
    }

    public static function index(): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $cart = self::getService()->getCart($guestToken, $userId);

            self::sendGuestToken($cart);

            jsonResponse($cart, 200);
        } catch (Throwable $e) {
            self::internalError('Erro ao carregar carrinho', $e);
        }
    }

    public static function store(): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $input = getJsonBody();
            $productId = self::positiveInteger($input['product_id'] ?? null, 'product_id');
            $quantity = self::positiveInteger($input['quantity'] ?? null, 'quantity');

            $cart = self::getService()->addItem(
                $guestToken,
                $productId,
                $quantity,
                $userId
            );

            self::sendGuestToken($cart);

            jsonResponse($cart, 201);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (PDOException $e) {
            self::internalError('Erro PDO ao adicionar produto ao carrinho', $e);
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            self::internalError('Erro ao adicionar produto ao carrinho', $e);
        }
    }

    public static function update(int $id): never
    {
        try {
            $guestToken = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? null;
            $userId = self::authenticatedUserId();

            $input = getJsonBody();
            $quantity = self::positiveInteger($input['quantity'] ?? null, 'quantity');

            $cart = self::getService()->updateItem(
                $guestToken,
                $id,
                $quantity,
                $userId
            );

            self::sendGuestToken($cart);

            jsonResponse($cart, 200);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (PDOException $e) {
            self::internalError('Erro PDO ao atualizar item do carrinho', $e);
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            self::internalError('Erro ao atualizar item do carrinho', $e);
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

            self::sendGuestToken($cart);

            jsonResponse($cart, 200);
        } catch (InvalidArgumentException $e) {
            jsonResponse(
                $e->getMessage(),
                400
            );
        } catch (PDOException $e) {
            self::internalError('Erro PDO ao remover item do carrinho', $e);
        } catch (RuntimeException $e) {
            jsonResponse(
                $e->getMessage(),
                422
            );
        } catch (Throwable $e) {
            self::internalError('Erro ao remover item do carrinho', $e);
        }
    }
}
