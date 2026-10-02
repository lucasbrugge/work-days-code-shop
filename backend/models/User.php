<?php

class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): array|false
    {
        $sql = "
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'id' => $id
        ]);

        return $stmt->fetch();
    }

    public function findByEmail(string $email): array|false
    {
        $sql = "
            SELECT
                id,
                name,
                email,
                password_hash,
                role
            FROM users
            WHERE email = :email
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'email' => $email
        ]);

        return $stmt->fetch();
    }

    public function emailExists(string $email): bool
    {
        $sql = "
            SELECT COUNT(*)
            FROM users
            WHERE email = :email
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'email' => $email
        ]);

        return $stmt->fetchColumn() > 0;
    }

    public function create(
        string $name,
        string $email,
        string $passwordHash
    ): int {
        $sql = "
            INSERT INTO users (
                name,
                email,
                password_hash
            )
            VALUES (
                :name,
                :email,
                :password_hash
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => $passwordHash
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function emailExistsForOtherUser(
        string $email,
        int $userId
    ): bool {
        $sql = "
            SELECT COUNT(*)
            FROM users
            WHERE email = :email
            AND id != :user_id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'email' => $email,
            'user_id' => $userId
        ]);

        return $stmt->fetchColumn() > 0;
    }

    public function updateProfile(
        int $userId,
        string $name,
        string $email
    ): bool {
        $sql = "
            UPDATE users
            SET
                name = :name,
                email = :email
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'name' => $name,
            'email' => $email,
            'id' => $userId
        ]);
    }
}