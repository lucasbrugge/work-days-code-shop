<?php

require_once __DIR__ . '/../config/database.php';

class Cart
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findByGuestToken(string $guestToken, bool $forUpdate = false): array|false
    {
        $sql = "
            SELECT
                id,
                user_id,
                guest_token,
                status
            FROM carts
            WHERE guest_token = :guest_token
              AND status = 'active'
            LIMIT 1
        ";

        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'guest_token' => $guestToken
        ]);

        return $stmt->fetch();
    }

    public function lockActiveCart(int $cartId): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM carts WHERE id = :id AND status = 'active' FOR UPDATE");
        $stmt->execute(['id' => $cartId]);

        return $stmt->fetch() !== false;
    }

    public function findActiveByUserId(int $userId, bool $forUpdate = false): array|false
    {
        $sql = "
            SELECT id, user_id, guest_token, status
            FROM carts
            WHERE user_id = :user_id AND status = 'active'
            LIMIT 1
        ";

        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetch();
    }

    public function findActiveGuestByToken(string $guestToken): array|false
    {
        $stmt = $this->db->prepare("
            SELECT id, user_id, guest_token, status
            FROM carts
            WHERE guest_token = :guest_token AND user_id IS NULL AND status = 'active'
            LIMIT 1
            FOR UPDATE
        ");
        $stmt->execute(['guest_token' => $guestToken]);

        return $stmt->fetch();
    }

    public function findItemsForMerge(int $cartId): array
    {
        $stmt = $this->db->prepare('SELECT id, product_id, quantity FROM cart_items WHERE cart_id = :cart_id ORDER BY product_id FOR UPDATE');
        $stmt->execute(['cart_id' => $cartId]);

        return $stmt->fetchAll();
    }

    public function findItemsForOrder(int $cartId): array
    {
        $stmt = $this->db->prepare('
            SELECT ci.id, ci.product_id, ci.quantity,
                   p.name AS product_name, p.price, p.stock, p.is_active
            FROM cart_items ci
            INNER JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = :cart_id
            ORDER BY p.id
            FOR UPDATE
        ');
        $stmt->execute(['cart_id' => $cartId]);

        return $stmt->fetchAll();
    }

    public function getProductStocks(array $productIds): array
    {
        if ($productIds === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $stmt = $this->db->prepare("SELECT id, stock, is_active FROM products WHERE id IN ({$placeholders}) ORDER BY id FOR UPDATE");
        $stmt->execute($productIds);

        $stocks = [];
        foreach ($stmt->fetchAll() as $row) {
            $stocks[(int) $row['id']] = [
                'stock' => (int) $row['stock'],
                'is_active' => (bool) $row['is_active']
            ];
        }

        return $stocks;
    }

    public function assignGuestCartToUser(int $cartId, int $userId): void
    {
        $stmt = $this->db->prepare("UPDATE carts SET user_id = :user_id, guest_token = NULL, status = 'active' WHERE id = :id");
        $stmt->execute(['user_id' => $userId, 'id' => $cartId]);
    }

    public function updateCartItemQuantity(int $cartId, int $productId, int $quantity): void
    {
        $stmt = $this->db->prepare('UPDATE cart_items SET quantity = :quantity WHERE cart_id = :cart_id AND product_id = :product_id');
        $stmt->execute(['quantity' => $quantity, 'cart_id' => $cartId, 'product_id' => $productId]);
    }

    public function moveCartItem(int $cartId, int $productId, int $quantity): void
    {
        $stmt = $this->db->prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)');
        $stmt->execute(['cart_id' => $cartId, 'product_id' => $productId, 'quantity' => $quantity]);
    }

    public function clearCartItems(int $cartId): void
    {
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE cart_id = :cart_id');
        $stmt->execute(['cart_id' => $cartId]);
    }

    public function invalidateGuestCart(int $cartId): void
    {
        $stmt = $this->db->prepare("UPDATE carts SET guest_token = NULL, status = 'converted' WHERE id = :id");
        $stmt->execute(['id' => $cartId]);
    }

    public function createGuestCart(string $guestToken): int
    {
        $sql = "
            INSERT INTO carts (
                guest_token,
                status
            ) VALUES (
                :guest_token,
                'active'
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'guest_token' => $guestToken
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function createUserCart(int $userId): int
    {
        $stmt = $this->db->prepare("INSERT INTO carts (user_id, status) VALUES (:user_id, 'active')");
        $stmt->execute(['user_id' => $userId]);

        return (int) $this->db->lastInsertId();
    }

    public function findItems(int $cartId): array
    {
        $sql = "
            SELECT
                ci.id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.stock,
                p.image_url,
                (p.price * ci.quantity) AS subtotal
            FROM cart_items ci
            INNER JOIN products p
                ON p.id = ci.product_id
            WHERE ci.cart_id = :cart_id
            ORDER BY ci.id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'cart_id' => $cartId
        ]);

        return $stmt->fetchAll();
    }

    public function findItem(int $cartId, int $productId): array|false
    {
        $sql = "
        SELECT
            id,
            cart_id,
            product_id,
            quantity
        FROM cart_items
        WHERE cart_id = :cart_id
          AND product_id = :product_id
        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'cart_id' => $cartId,
            'product_id' => $productId
        ]);

        return $stmt->fetch();
    }

    public function addItem(int $cartId, int $productId, int $quantity): int
    {
        $sql = "
        INSERT INTO cart_items (
            cart_id,
            product_id,
            quantity
        ) VALUES (
            :cart_id,
            :product_id,
            :quantity
        )
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'cart_id' => $cartId,
            'product_id' => $productId,
            'quantity' => $quantity
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function updateItemQuantity(int $itemId, int $quantity): bool
    {
        $sql = "
        UPDATE cart_items
        SET quantity = :quantity
        WHERE id = :id
    ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $itemId,
            'quantity' => $quantity
        ]);
    }

    public function findItemById(int $cartId, int $itemId): array|false
    {
        $sql = "
        SELECT
            id,
            cart_id,
            product_id,
            quantity
        FROM cart_items
        WHERE id = :item_id
          AND cart_id = :cart_id
        LIMIT 1
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'item_id' => $itemId,
            'cart_id' => $cartId
        ]);

        return $stmt->fetch();
    }
    public function deleteItem(int $cartId, int $itemId): bool
    {
        $sql = "
        DELETE FROM cart_items
        WHERE id = :item_id
          AND cart_id = :cart_id
    ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'item_id' => $itemId,
            'cart_id' => $cartId
        ]);
    }
}
