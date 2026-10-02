<?php

require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';

class CartMergeException extends RuntimeException
{
}

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

    private function getOrCreateUserCart(int $userId): array
    {
        $cart = $this->cartModel->findActiveByUserId($userId);
        if ($cart) {
            return $cart;
        }

        $cartId = $this->cartModel->createUserCart($userId);
        return [
            'id' => $cartId,
            'user_id' => $userId,
            'guest_token' => null,
            'status' => 'active'
        ];
    }

    /**
     * Merge must be called inside the caller's transaction so authentication
     * token creation and cart changes commit or roll back together.
     */
    public function mergeGuestCart(int $userId, string $guestToken): void
    {
        $guestCart = $this->cartModel->findActiveGuestByToken($guestToken);
        if (!$guestCart) {
            throw new CartMergeException('O carrinho de visitante não está mais disponível. Atualize o carrinho e tente novamente.');
        }

        $userCart = $this->cartModel->findActiveByUserId($userId, true);
        $guestItems = $this->cartModel->findItemsForMerge((int) $guestCart['id']);

        if (!$userCart) {
            $stocks = $this->cartModel->getProductStocks(array_column($guestItems, 'product_id'));
            $conflicts = [];
            foreach ($guestItems as $item) {
                $productId = (int) $item['product_id'];
                $stock = $stocks[$productId]['stock'] ?? 0;
                if (!isset($stocks[$productId]) || !$stocks[$productId]['is_active'] || (int) $item['quantity'] > $stock) {
                    $conflicts[] = "produto {$productId}: solicitado {$item['quantity']}, estoque {$stock}";
                }
            }
            if ($conflicts !== []) {
                throw new CartMergeException('Não foi possível mesclar o carrinho por conflito de estoque: ' . implode('; ', $conflicts));
            }

            $this->cartModel->assignGuestCartToUser((int) $guestCart['id'], $userId);
            return;
        }

        $userItems = $this->cartModel->findItemsForMerge((int) $userCart['id']);
        $guestByProduct = [];
        $userByProduct = [];
        foreach ($guestItems as $item) {
            $guestByProduct[(int) $item['product_id']] = $item;
        }
        foreach ($userItems as $item) {
            $userByProduct[(int) $item['product_id']] = $item;
        }

        $productIds = array_values(array_unique(array_merge(array_keys($guestByProduct), array_keys($userByProduct))));
        $stocks = $this->cartModel->getProductStocks($productIds);
        $conflicts = [];
        foreach ($productIds as $productId) {
            $quantity = (int) ($guestByProduct[$productId]['quantity'] ?? 0)
                + (int) ($userByProduct[$productId]['quantity'] ?? 0);
            $stock = $stocks[$productId]['stock'] ?? 0;
            if (!isset($stocks[$productId]) || !$stocks[$productId]['is_active'] || $quantity > $stock) {
                $conflicts[] = "produto {$productId}: solicitado {$quantity}, estoque {$stock}";
            }
        }
        if ($conflicts !== []) {
            throw new CartMergeException('Não foi possível mesclar o carrinho por conflito de estoque: ' . implode('; ', $conflicts));
        }

        foreach ($guestByProduct as $productId => $item) {
            $guestQuantity = (int) $item['quantity'];
            if (isset($userByProduct[$productId])) {
                $this->cartModel->updateCartItemQuantity(
                    (int) $userCart['id'],
                    (int) $productId,
                    (int) $userByProduct[$productId]['quantity'] + $guestQuantity
                );
            } else {
                $this->cartModel->moveCartItem((int) $userCart['id'], (int) $productId, $guestQuantity);
            }
        }

        $this->cartModel->clearCartItems((int) $guestCart['id']);
        $this->cartModel->invalidateGuestCart((int) $guestCart['id']);
    }

    public function getCart(?string $guestToken, ?int $userId = null): array
    {
        $cart = $userId !== null
            ? $this->getOrCreateUserCart($userId)
            : $this->getOrCreateGuestCart($guestToken);

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
        int $quantity,
        ?int $userId = null
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

        $cart = $userId !== null
            ? $this->getOrCreateUserCart($userId)
            : $this->getOrCreateGuestCart($guestToken);

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

        return $this->getCart($cart['guest_token'], $userId);
    }

    public function updateItem(
        ?string $guestToken,
        int $itemId,
        int $quantity,
        ?int $userId = null
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

        $cart = $userId !== null
            ? $this->getOrCreateUserCart($userId)
            : $this->getOrCreateGuestCart($guestToken);

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

        return $this->getCart($cart['guest_token'], $userId);
    }

    public function removeItem(
        ?string $guestToken,
        int $itemId,
        ?int $userId = null
    ): array {
        if ($itemId <= 0) {
            throw new InvalidArgumentException(
                'ID do item inválido.'
            );
        }

        $cart = $userId !== null
            ? $this->getOrCreateUserCart($userId)
            : $this->getOrCreateGuestCart($guestToken);

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

        return $this->getCart($cart['guest_token'], $userId);
    }
}
