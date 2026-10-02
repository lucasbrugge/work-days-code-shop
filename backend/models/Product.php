<?php

require_once __DIR__ . '/../config/database.php';

class Product
{
    private PDO $db;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Database::getConnection();
    }


    public function findAll(array $filters = []): array
    {
        $sql = "
            SELECT
                p.id,
                p.category_id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_url,
                p.is_active,
                p.created_at,
                p.updated_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE 1=1
        ";

        $params = [];

        // Filtro por status ativo (padrão para catálogo público)
        if (isset($filters['is_active']) && $filters['is_active'] !== null) {
            $sql .= " AND p.is_active = :is_active";
            $params['is_active'] = (int) (bool) $filters['is_active'];
        }

        // Busca textual por nome ou descrição
        if (!empty($filters['search'])) {
            $sql .= " AND (p.name LIKE :search_name OR p.description LIKE :search_desc)";
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params['search_name'] = $searchTerm;
            $params['search_desc'] = $searchTerm;
        }

        // Filtro por categoria (ID)
        if (!empty($filters['category_id'])) {
            $sql .= " AND p.category_id = :category_id";
            $params['category_id'] = (int) $filters['category_id'];
        }

        // Filtro por slug de categoria
        if (!empty($filters['category_slug'])) {
            $sql .= " AND c.slug = :category_slug";
            $params['category_slug'] = trim($filters['category_slug']);
        }

        // Filtro por faixa de preço
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $sql .= " AND p.price >= :min_price";
            $params['min_price'] = (float) $filters['min_price'];
        }

        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $sql .= " AND p.price <= :max_price";
            $params['max_price'] = (float) $filters['max_price'];
        }

        // Ordenação
        $sort = $filters['sort'] ?? 'recent';
        switch ($sort) {
            case 'price_asc':
                $sql .= " ORDER BY p.price ASC, p.id DESC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY p.price DESC, p.id DESC";
                break;
            case 'name_asc':
                $sql .= " ORDER BY p.name ASC";
                break;
            case 'name_desc':
                $sql .= " ORDER BY p.name DESC";
                break;
            case 'recent':
            case 'newest':
            default:
                $sql .= " ORDER BY p.id DESC";
                break;
        }

        // Paginação (inteiros sanitizados interpolados com segurança)
        if (isset($filters['limit'])) {
            $limit = max(1, (int) $filters['limit']);
            $offset = max(0, (int) ($filters['offset'] ?? 0));
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $rows = $stmt->fetchAll();

        return array_map([$this, 'format'], $rows);
    }


    public function count(array $filters = []): int
    {
        $sql = "
            SELECT COUNT(*)
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE 1=1
        ";

        $params = [];

        if (isset($filters['is_active']) && $filters['is_active'] !== null) {
            $sql .= " AND p.is_active = :is_active";
            $params['is_active'] = (int) (bool) $filters['is_active'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (p.name LIKE :search_name OR p.description LIKE :search_desc)";
            $searchTerm = '%' . trim($filters['search']) . '%';
            $params['search_name'] = $searchTerm;
            $params['search_desc'] = $searchTerm;
        }

        if (!empty($filters['category_id'])) {
            $sql .= " AND p.category_id = :category_id";
            $params['category_id'] = (int) $filters['category_id'];
        }

        if (!empty($filters['category_slug'])) {
            $sql .= " AND c.slug = :category_slug";
            $params['category_slug'] = trim($filters['category_slug']);
        }

        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $sql .= " AND p.price >= :min_price";
            $params['min_price'] = (float) $filters['min_price'];
        }

        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $sql .= " AND p.price <= :max_price";
            $params['max_price'] = (float) $filters['max_price'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return (int) $stmt->fetchColumn();
    }


    public function findById(int $id, ?bool $onlyActive = null): array|false
    {
        $sql = "
            SELECT
                p.id,
                p.category_id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image_url,
                p.is_active,
                p.created_at,
                p.updated_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
        ";

        $params = ['id' => $id];

        if ($onlyActive === true) {
            $sql .= " AND p.is_active = 1";
        }

        $sql .= " LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $row = $stmt->fetch();

        if (!$row) {
            return false;
        }

        return $this->format($row);
    }


    public function create(array $data): int
    {
        $sql = "
            INSERT INTO products (
                category_id,
                name,
                description,
                price,
                stock,
                image_url,
                is_active
            ) VALUES (
                :category_id,
                :name,
                :description,
                :price,
                :stock,
                :image_url,
                :is_active
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'category_id' => (int) $data['category_id'],
            'name' => trim($data['name']),
            'description' => $data['description'] ?? null,
            'price' => (float) $data['price'],
            'stock' => isset($data['stock']) ? (int) $data['stock'] : 0,
            'image_url' => $data['image_url'] ?? null,
            'is_active' => isset($data['is_active']) ? (int) (bool) $data['is_active'] : 1
        ]);

        return (int) $this->db->lastInsertId();
    }


    public function update(int $id, array $data): bool
    {
        $allowedFields = [
            'category_id',
            'name',
            'description',
            'price',
            'stock',
            'image_url',
            'is_active'
        ];

        $fields = [];
        $params = ['id' => $id];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";

                if ($field === 'category_id' || $field === 'stock') {
                    $params[$field] = (int) $data[$field];
                } elseif ($field === 'price') {
                    $params[$field] = (float) $data[$field];
                } elseif ($field === 'is_active') {
                    $params[$field] = (int) (bool) $data[$field];
                } else {
                    $params[$field] = $data[$field];
                }
            }
        }

        if (empty($fields)) {
            return true;
        }

        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }


    public function delete(int $id): bool
    {
        $sql = "DELETE FROM products WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }


    public function deactivate(int $id): bool
    {
        $sql = "UPDATE products SET is_active = 0 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }


    public function activate(int $id): bool
    {
        $sql = "UPDATE products SET is_active = 1 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }


    public function exists(int $id): bool
    {
        $sql = "SELECT COUNT(*) FROM products WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return (int) $stmt->fetchColumn() > 0;
    }


    public function categoryExists(int $categoryId): bool
    {
        $sql = "SELECT COUNT(*) FROM categories WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $categoryId]);
        return (int) $stmt->fetchColumn() > 0;
    }
    public function updateStock(int $id, int $newStock): bool
    {
        $sql = "UPDATE products SET stock = :stock WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'stock' => max(0, $newStock)
        ]);
    }

    public function decrementStock(int $id, int $quantity): bool
    {
        $sql = "
            UPDATE products
            SET stock = stock - :quantity
            WHERE id = :id AND stock >= :quantity
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'id' => $id,
            'quantity' => $quantity
        ]);

        return $stmt->rowCount() > 0;
    }

    public function incrementStock(int $id, int $quantity): bool
    {
        if ($quantity <= 0) {
            return false;
        }

        $stmt = $this->db->prepare('UPDATE products SET stock = stock + :quantity WHERE id = :id');
        $stmt->execute([
            'id' => $id,
            'quantity' => $quantity
        ]);

        return $stmt->rowCount() > 0;
    }

    public function format(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => (float) $row['price'],
            'stock' => (int) $row['stock'],
            'image_url' => $row['image_url'],
            'is_active' => (bool) $row['is_active'],
            'category_id' => (int) $row['category_id'],
            'category' => [
                'id' => (int) $row['category_id'],
                'name' => $row['category_name'] ?? null,
                'slug' => $row['category_slug'] ?? null
            ],
            'category_name' => $row['category_name'] ?? null,
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
}
