<?php

require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';

class CartService
{
    private Cart $cartModel;
    private Product $productModel;

    public function __construct(
        ?Cart $cartModel = null,
        ?Product $productModel = null
    ) {
        $this->cartModel = $cartModel ?? new Cart();
        $this->productModel = $productModel ?? new Product();
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

    public function addItem(
        ?string $guestToken,
        int $productId,
        int $quantity
    ): array {
        if ($productId <= 0) {
            throw new InvalidArgumentException(
                'ID de produto inválido.'
            );
        }

        if ($quantity <= 0) {
            throw new InvalidArgumentException(
                'A quantidade deve ser maior que zero.'
            );
        }

        $product = $this->productModel->findById(
            $productId,
            true
        );

        if (!$product) {
            throw new RuntimeException(
                'Produto não encontrado ou inativo.'
            );
        }

        if ((int) $product['stock'] <= 0) {
            throw new RuntimeException(
                'Produto sem estoque.'
            );
        }

        $cart = $this->getOrCreateGuestCart($guestToken);

        $existingItem = $this->cartModel->findItem(
            (int) $cart['id'],
            $productId
        );

        if ($existingItem) {
            $newQuantity =
                (int) $existingItem['quantity'] + $quantity;

            if ($newQuantity > (int) $product['stock']) {
                throw new RuntimeException(
                    'Quantidade solicitada maior que o estoque disponível.'
                );
            }

            $this->cartModel->updateItemQuantity(
                (int) $existingItem['id'],
                $newQuantity
            );
        } else {
            if ($quantity > (int) $product['stock']) {
                throw new RuntimeException(
                    'Quantidade solicitada maior que o estoque disponível.'
                );
            }

            $this->cartModel->addItem(
                (int) $cart['id'],
                $productId,
                $quantity
            );
        }

        return $this->getCart(
            $cart['guest_token']
        );
    }

    public function updateItem(
        ?string $guestToken,
        int $itemId,
        int $quantity
    ): array {
        if ($itemId <= 0) {
            throw new InvalidArgumentException(
                'ID do item inválido.'
            );
        }

        if ($quantity <= 0) {
            throw new InvalidArgumentException(
                'A quantidade deve ser maior que zero.'
            );
        }

        $cart = $this->getOrCreateGuestCart($guestToken);

        $item = $this->cartModel->findItemById(
            (int) $cart['id'],
            $itemId
        );

        if (!$item) {
            throw new RuntimeException(
                'Item não encontrado no carrinho.'
            );
        }

        $product = $this->productModel->findById(
            (int) $item['product_id'],
            true
        );

        if (!$product) {
            throw new RuntimeException(
                'Produto não encontrado ou inativo.'
            );
        }

        if ($quantity > (int) $product['stock']) {
            throw new RuntimeException(
                'Quantidade solicitada maior que o estoque disponível.'
            );
        }

        $this->cartModel->updateItemQuantity(
            $itemId,
            $quantity
        );

        return $this->getCart(
            $cart['guest_token']
        );
    }

    public function removeItem(
        ?string $guestToken,
        int $itemId
    ): array {
        if ($itemId <= 0) {
            throw new InvalidArgumentException(
                'ID do item inválido.'
            );
        }

        $cart = $this->getOrCreateGuestCart($guestToken);

        $item = $this->cartModel->findItemById(
            (int) $cart['id'],
            $itemId
        );

        if (!$item) {
            throw new RuntimeException(
                'Item não encontrado no carrinho.'
            );
        }

        $this->cartModel->deleteItem(
            (int) $cart['id'],
            $itemId
        );

        return $this->getCart(
            $cart['guest_token']
        );
    }
}
