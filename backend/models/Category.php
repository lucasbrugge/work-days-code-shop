<?php

require_once __DIR__ . '/../config/database.php';

class Category
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT id, name, slug FROM categories ORDER BY id ASC');
        return array_map([$this, 'format'], $stmt->fetchAll());
    }

    public function findById(int $id): array|false
    {
        $stmt = $this->db->prepare('SELECT id, name, slug FROM categories WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row === false ? false : $this->format($row);
    }

    public function existsByNameOrSlug(string $name, string $slug, ?int $exceptId = null): bool
    {
        $sql = 'SELECT 1 FROM categories WHERE (name = :name OR slug = :slug)';
        $params = ['name' => $name, 'slug' => $slug];
        if ($exceptId !== null) {
            $sql .= ' AND id <> :except_id';
            $params['except_id'] = $exceptId;
        }
        $sql .= ' LIMIT 1';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchColumn() !== false;
    }

    public function create(string $name, string $slug): int
    {
        $stmt = $this->db->prepare('INSERT INTO categories (name, slug) VALUES (:name, :slug)');
        $stmt->execute(['name' => $name, 'slug' => $slug]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, string $name, string $slug): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE categories SET name = :name, slug = :slug WHERE id = :id'
        );

        return $stmt->execute(['id' => $id, 'name' => $name, 'slug' => $slug]);
    }

    public function hasProducts(int $id): bool
    {
        $stmt = $this->db->prepare('SELECT 1 FROM products WHERE category_id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);

        return $stmt->fetchColumn() !== false;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->execute(['id' => $id]);

        return $stmt->rowCount() > 0;
    }

    private function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug']
        ];
    }
}
