<?php

    class user{
        private PDO $db;
        public function __construct(PDO $db){
            $this ->db = $db;
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
                SELECT *
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
    }