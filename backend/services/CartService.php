<?php

require_once __DIR__ . '/../models/Cart.php';

class CartService
{
    private Cart $cartModel;

    public function __construct(?Cart $cartModel = null)
    {
        $this->cartModel = $cartModel ?? new Cart();
    }

    public function getOrCreateGuestCart(?string $guestToken): array
    {
        if (!empty($guestToken)) {
            $cart = $this->cartModel->findByGuestToken($guestToken);

            if ($cart) {
                return $cart;
            }
        }

        $newToken = bin2hex(random_bytes(32));

        $cartId = $this->cartModel->createGuestCart($newToken);

        return [
            'id' => $cartId,
            'user_id' => null,
            'guest_token' => $newToken,
            'status' => 'active'
        ];
    }

    public function getCart(?string $guestToken): array
    {
        $cart = $this->getOrCreateGuestCart($guestToken);

        $items = $this->cartModel->findItems((int) $cart['id']);

        $total = 0;
        $totalItems = 0;

        foreach ($items as &$item) {
            $item['id'] = (int) $item['id'];
            $item['product_id'] = (int) $item['product_id'];
            $item['quantity'] = (int) $item['quantity'];
            $item['price'] = (float) $item['price'];
            $item['subtotal'] = (float) $item['subtotal'];
            $item['stock'] = (int) $item['stock'];

            $total += $item['subtotal'];
            $totalItems += $item['quantity'];
        }

        return [
            'id' => (int) $cart['id'],
            'items' => $items,
            'total_items' => $totalItems,
            'total' => round($total, 2),
            'guest_token' => $cart['guest_token']
        ];
    }
}
