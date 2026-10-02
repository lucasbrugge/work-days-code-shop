<?php

require_once __DIR__ . '/../config/database.php';

class Address
{
    private const FIELDS = 'id, user_id, street, number, complement, neighborhood, city, state, zip_code';

    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findForUser(int $addressId, int $userId, bool $forUpdate = false): array|false
    {
        $sql = 'SELECT ' . self::FIELDS . ' FROM addresses WHERE id = :id AND user_id = :user_id LIMIT 1';

        if ($forUpdate) {
            $sql .= ' FOR UPDATE';
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $addressId,
            'user_id' => $userId
        ]);

        return $stmt->fetch();
    }

    public function findAllForUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT ' . self::FIELDS . ' FROM addresses WHERE user_id = :user_id ORDER BY id DESC'
        );
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    public function create(int $userId, array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO addresses (user_id, street, number, complement, neighborhood, city, state, zip_code)
             VALUES (:user_id, :street, :number, :complement, :neighborhood, :city, :state, :zip_code)'
        );
        $stmt->execute($data + ['user_id' => $userId]);

        return (int) $this->db->lastInsertId();
    }

    public function updateForUser(int $addressId, int $userId, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE addresses SET street = :street, number = :number, complement = :complement,
             neighborhood = :neighborhood, city = :city, state = :state, zip_code = :zip_code
             WHERE id = :id AND user_id = :user_id'
        );

        return $stmt->execute($data + ['id' => $addressId, 'user_id' => $userId]);
    }

    public function deleteForUser(int $addressId, int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM addresses WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $addressId, 'user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }

    public function hasOrders(int $addressId): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM orders WHERE address_id = :id LIMIT 1');
        $stmt->execute(['id' => $addressId]);

        return $stmt->fetchColumn() !== false;
    }
}
