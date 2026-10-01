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
}
