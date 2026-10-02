<?php

require_once __DIR__ . '/../config/database.php';

class Order
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO orders (
                user_id, address_id,
                shipping_street, shipping_number, shipping_complement,
                shipping_neighborhood, shipping_city, shipping_state,
                shipping_zip_code, status, subtotal, shipping, total
            ) VALUES (
                :user_id, :address_id,
                :shipping_street, :shipping_number, :shipping_complement,
                :shipping_neighborhood, :shipping_city, :shipping_state,
                :shipping_zip_code, 'pending_payment', :subtotal, :shipping, :total
            )
        ");
        $stmt->execute($data);

        return (int) $this->db->lastInsertId();
    }

    public function createItems(int $orderId, array $items): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO order_items (
                order_id, product_id, product_name,
                unit_price, quantity, subtotal
            ) VALUES (
                :order_id, :product_id, :product_name,
                :unit_price, :quantity, :subtotal
            )
        ");

        foreach ($items as $item) {
            $stmt->execute([
                'order_id' => $orderId,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['subtotal']
            ]);
        }
    }

    public function findAllForUser(int $userId): array
    {
        $stmt = $this->db->prepare('
            SELECT id, status, subtotal, shipping, total, paid_at, created_at
            FROM orders
            WHERE user_id = :user_id
            ORDER BY created_at DESC, id DESC
        ');
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    public function findForUser(int $orderId, int $userId, bool $forUpdate = false): array|false
    {
        $sql = '
            SELECT id, user_id, address_id, status, subtotal, shipping, total,
                   paid_at, created_at, updated_at,
                   shipping_street, shipping_number, shipping_complement,
                   shipping_neighborhood, shipping_city, shipping_state,
                   shipping_zip_code
            FROM orders
            WHERE id = :id AND user_id = :user_id
            LIMIT 1
        ';

        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $orderId,
            'user_id' => $userId
        ]);

        return $stmt->fetch();
    }

    public function findItems(int $orderId, bool $forUpdate = false): array
    {
        $sql = '
            SELECT id, product_id, product_name, unit_price, quantity, subtotal
            FROM order_items
            WHERE order_id = :order_id
            ORDER BY id
        ';

        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['order_id' => $orderId]);

        return $stmt->fetchAll();
    }

    public function markPaid(int $orderId, int $userId): bool
    {
        $stmt = $this->db->prepare("
            UPDATE orders
            SET status = 'paid', paid_at = CURRENT_TIMESTAMP
            WHERE id = :id AND user_id = :user_id AND status = 'pending_payment'
        ");
        $stmt->execute([
            'id' => $orderId,
            'user_id' => $userId
        ]);

        return $stmt->rowCount() === 1;
    }

    public function markCancelled(int $orderId, int $userId): bool
    {
        $stmt = $this->db->prepare("
            UPDATE orders
            SET status = 'cancelled'
            WHERE id = :id AND user_id = :user_id AND status = 'pending_payment'
        ");
        $stmt->execute([
            'id' => $orderId,
            'user_id' => $userId
        ]);

        return $stmt->rowCount() === 1;
    }
}
