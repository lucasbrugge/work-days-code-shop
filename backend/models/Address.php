<?php

require_once __DIR__ . '/../config/database.php';

class Address
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findForUser(int $addressId, int $userId, bool $forUpdate = false): array|false
    {
        $sql = '
            SELECT id, user_id, street, number, complement,
                   neighborhood, city, state, zip_code
            FROM addresses
            WHERE id = :id AND user_id = :user_id
            LIMIT 1
        ';

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
}
