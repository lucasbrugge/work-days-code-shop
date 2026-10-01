<?php

require_once __DIR__ . '/../config/database.php';

class Cart
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findByGuestToken(string $guestToken): array|false
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

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'guest_token' => $guestToken
        ]);

        return $stmt->fetch();
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
