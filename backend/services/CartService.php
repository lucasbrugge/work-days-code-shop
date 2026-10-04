<?php

require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../config/database.php';

class CartMergeException extends RuntimeException
{
}

class CartService
{
    private PDO $db;
    private Cart $cartModel;
    private Product $productModel;

    public function __construct(
        ?Cart $cartModel = null,
        ?Product $productModel = null,
        ?PDO $db = null
    ) {
        $this->db = $db ?? Database::getConnection();
        $this->cartModel = $cartModel ?? new Cart($this->db);
        $this->productModel = $productModel ?? new Product($this->db);
    }

    public function getOrCreateGuestCart(?string $guestToken): array
    {
        if (!empty($guestToken)) {
            $cart = $this->cartModel->findByGuestToken($guestToken, $this->db->inTransaction());

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
        $cart = $this->cartModel->findActiveByUserId($userId, $this->db->inTransaction());
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

    public function mergeGuestCart(int $userId, string $guestToken): array
    {
        $warnings = [];
        $guestCart = $this->cartModel->findActiveGuestByToken($guestToken);
        if (!$guestCart) {
            return ['O carrinho de visitante já foi utilizado ou não está mais disponível.'];
        }

        $guestCartId = (int) $guestCart['id'];
        $userCart = $this->cartModel->findActiveByUserId($userId, true);
        $guestItems = $this->cartModel->findItemsForMerge($guestCartId);

        if (!$userCart) {
            $stocks = $this->cartModel->getProductStocks(array_column($guestItems, 'product_id'));
            foreach ($guestItems as $item) {
                $productId = (int) $item['product_id'];
                $quantity = (int) $item['quantity'];
                $product = $stocks[$productId] ?? null;

                if (!$product || !$product['is_active'] || (int) $product['stock'] <= 0) {
                    $this->cartModel->deleteItem($guestCartId, (int) $item['id']);
                    $warnings[] = "Produto {$productId} indisponível e removido do carrinho.";
                    continue;
                }

                $stock = (int) $product['stock'];
                if ($quantity > $stock) {
                    $this->cartModel->updateCartItemQuantity($guestCartId, $productId, $stock);
                    $warnings[] = "Produto {$productId}: quantidade ajustada de {$quantity} para {$stock} por limite de estoque.";
                }
            }

            $this->cartModel->assignGuestCartToUser($guestCartId, $userId);
            return $warnings;
        }

        $userCartId = (int) $userCart['id'];
        $userItems = $this->cartModel->findItemsForMerge($userCartId);
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
        foreach ($productIds as $productId) {
            $guestItem = $guestByProduct[$productId] ?? null;
            $userItem = $userByProduct[$productId] ?? null;
            $product = $stocks[$productId] ?? null;

            if (!$product || !$product['is_active'] || (int) $product['stock'] <= 0) {
                if ($userItem !== null) {
                    $this->cartModel->deleteItem($userCartId, (int) $userItem['id']);
                }
                $warnings[] = "Produto {$productId} indisponível e removido do carrinho.";
                continue;
            }

            $stock = (int) $product['stock'];
            $userQuantity = (int) ($userItem['quantity'] ?? 0);
            $guestQuantity = (int) ($guestItem['quantity'] ?? 0);
            $requestedQuantity = $userQuantity + $guestQuantity;
            $finalQuantity = min($requestedQuantity, $stock);

            if ($requestedQuantity > $stock) {
                $warnings[] = "Produto {$productId}: quantidade ajustada de {$requestedQuantity} para {$stock} por limite de estoque.";
            }

            if ($userItem !== null) {
                if ($finalQuantity !== $userQuantity) {
                    $this->cartModel->updateCartItemQuantity($userCartId, $productId, $finalQuantity);
                }
            } elseif ($finalQuantity > 0) {
                $this->cartModel->moveCartItem($userCartId, (int) $productId, $finalQuantity);
            }
        }

        $this->cartModel->clearCartItems($guestCartId);
        $this->cartModel->invalidateGuestCart($guestCartId);
        return $warnings;
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
        $this->db->beginTransaction();
        try {
            $cart = $userId !== null
                ? $this->getOrCreateUserCart($userId)
                : $this->getOrCreateGuestCart($guestToken);

            if (!$this->cartModel->lockActiveCart((int) $cart['id'])) {
                throw new RuntimeException('O carrinho não está mais ativo. Atualize a página e tente novamente.');
            }

            if ($productId <= 0) {
                throw new InvalidArgumentException('ID de produto inválido.');
            }
            if ($quantity <= 0) {
                throw new InvalidArgumentException('A quantidade deve ser maior que zero.');
            }

            $product = $this->productModel->findById($productId, true);
            if (!$product) {
                throw new RuntimeException('Produto não encontrado ou inativo.');
            }
            if ((int) $product['stock'] <= 0) {
                throw new RuntimeException('Produto sem estoque.');
            }

            $existingItem = $this->cartModel->findItem((int) $cart['id'], $productId);
            if ($existingItem) {
                $newQuantity = (int) $existingItem['quantity'] + $quantity;
                if ($newQuantity > (int) $product['stock']) {
                    throw new RuntimeException('Quantidade solicitada maior que o estoque disponível.');
                }
                $this->cartModel->updateItemQuantity((int) $existingItem['id'], $newQuantity);
            } else {
                if ($quantity > (int) $product['stock']) {
                    throw new RuntimeException('Quantidade solicitada maior que o estoque disponível.');
                }
                $this->cartModel->addItem((int) $cart['id'], $productId, $quantity);
            }

            $result = $this->getCart($cart['guest_token'], $userId);
            $this->db->commit();
            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    public function updateItem(
        ?string $guestToken,
        int $itemId,
        int $quantity,
        ?int $userId = null
    ): array {
        $this->db->beginTransaction();
        try {
            $cart = $userId !== null
                ? $this->getOrCreateUserCart($userId)
                : $this->getOrCreateGuestCart($guestToken);
            if (!$this->cartModel->lockActiveCart((int) $cart['id'])) {
                throw new RuntimeException('O carrinho não está mais ativo. Atualize a página e tente novamente.');
            }

            if ($itemId <= 0) {
                throw new InvalidArgumentException('ID do item inválido.');
            }
            if ($quantity <= 0) {
                throw new InvalidArgumentException('A quantidade deve ser maior que zero.');
            }

            $item = $this->cartModel->findItemById((int) $cart['id'], $itemId);
            if (!$item) {
                throw new RuntimeException('Item não encontrado no carrinho.');
            }

            $product = $this->productModel->findById((int) $item['product_id'], true);
            if (!$product) {
                throw new RuntimeException('Produto não encontrado ou inativo.');
            }
            if ($quantity > (int) $product['stock']) {
                throw new RuntimeException('Quantidade solicitada maior que o estoque disponível.');
            }

            $this->cartModel->updateItemQuantity($itemId, $quantity);
            $result = $this->getCart($cart['guest_token'], $userId);
            $this->db->commit();
            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    public function removeItem(
        ?string $guestToken,
        int $itemId,
        ?int $userId = null
    ): array {
        $this->db->beginTransaction();
        try {
            $cart = $userId !== null
                ? $this->getOrCreateUserCart($userId)
                : $this->getOrCreateGuestCart($guestToken);
            if (!$this->cartModel->lockActiveCart((int) $cart['id'])) {
                throw new RuntimeException('O carrinho não está mais ativo. Atualize a página e tente novamente.');
            }

            if ($itemId <= 0) {
                throw new InvalidArgumentException('ID do item inválido.');
            }

            $item = $this->cartModel->findItemById((int) $cart['id'], $itemId);
            if (!$item) {
                throw new RuntimeException('Item não encontrado no carrinho.');
            }

            $this->cartModel->deleteItem((int) $cart['id'], $itemId);
            $result = $this->getCart($cart['guest_token'], $userId);
            $this->db->commit();
            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    private function rollBackIfNeeded(): void
    {
        if ($this->db->inTransaction()) {
            $this->db->rollBack();
        }
    }
}
