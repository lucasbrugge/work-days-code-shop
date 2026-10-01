<?php

require_once __DIR__ . '/../models/Product.php';

class ProductService
{
    private Product $productModel;

    public function __construct(?Product $productModel = null)
    {
        $this->productModel = $productModel ?? new Product();
    }

    public function list(array $query = [], bool $isPublic = true): array
    {
        $filters = [];

        if ($isPublic) {
            $filters['is_active'] = 1;
        } elseif (isset($query['is_active']) && $query['is_active'] !== '') {
            $filters['is_active'] = filter_var($query['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $search = $query['search'] ?? $query['name'] ?? $query['q'] ?? null;
        if (!empty($search)) {
            $filters['search'] = trim((string) $search);
        }

        $category = $query['category_id'] ?? $query['category'] ?? null;
        if (!empty($category)) {
            if (is_numeric($category)) {
                $filters['category_id'] = (int) $category;
            } else {
                $filters['category_slug'] = trim((string) $category);
            }
        }

        if (isset($query['min_price']) && is_numeric($query['min_price'])) {
            $filters['min_price'] = (float) $query['min_price'];
        }

        if (isset($query['max_price']) && is_numeric($query['max_price'])) {
            $filters['max_price'] = (float) $query['max_price'];
        }

        $validSorts = ['recent', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
        $sort = strtolower(trim((string) ($query['sort'] ?? 'recent')));
        $filters['sort'] = in_array($sort, $validSorts, true) ? $sort : 'recent';

        $page = max(1, (int) ($query['page'] ?? 1));
        $perPage = max(1, min(100, (int) ($query['per_page'] ?? $query['limit'] ?? 12)));

        $total = $this->productModel->count($filters);
        $offset = ($page - 1) * $perPage;

        $filters['limit'] = $perPage;
        $filters['offset'] = $offset;

        $products = $this->productModel->findAll($filters);
        $lastPage = (int) max(1, ceil($total / $perPage));

        return [
            'data' => $products,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage
            ]
        ];
    }

    
    public function getById(int $id, bool $onlyActive = true): array
    {
        if ($id <= 0) {
            throw new InvalidArgumentException('ID de produto inválido.');
        }

        $product = $this->productModel->findById($id, $onlyActive);

        if (!$product) {
            throw new RuntimeException('Produto não encontrado.');
        }

        return $product;
    }

    
    public function create(array $data): array
    {
        $this->validateCreateData($data);

        $payload = [
            'category_id' => (int) $data['category_id'],
            'name' => trim((string) $data['name']),
            'description' => isset($data['description']) ? trim((string) $data['description']) : null,
            'price' => round((float) $data['price'], 2),
            'stock' => isset($data['stock']) ? max(0, (int) $data['stock']) : 0,
            'image_url' => !empty($data['image_url']) ? trim((string) $data['image_url']) : null,
            'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : true
        ];

        $productId = $this->productModel->create($payload);

        return $this->getById($productId, false);
    }

    
    public function update(int $id, array $data): array
    {
        if ($id <= 0) {
            throw new InvalidArgumentException('ID de produto inválido.');
        }

        $existing = $this->productModel->findById($id, false);
        if (!$existing) {
            throw new RuntimeException('Produto não encontrado.');
        }

        $payload = [];

        if (array_key_exists('name', $data)) {
            $name = trim((string) $data['name']);
            if (mb_strlen($name) < 2 || mb_strlen($name) > 150) {
                throw new InvalidArgumentException('O nome do produto deve ter entre 2 e 150 caracteres.');
            }
            $payload['name'] = $name;
        }

        if (array_key_exists('category_id', $data)) {
            $categoryId = (int) $data['category_id'];
            if ($categoryId <= 0 || !$this->productModel->categoryExists($categoryId)) {
                throw new InvalidArgumentException('Categoria informada é inválida ou não foi encontrada.');
            }
            $payload['category_id'] = $categoryId;
        }

        if (array_key_exists('price', $data)) {
            if (!is_numeric($data['price']) || (float) $data['price'] < 0) {
                throw new InvalidArgumentException('O preço deve ser um valor numérico maior ou igual a zero.');
            }
            $payload['price'] = round((float) $data['price'], 2);
        }

        if (array_key_exists('stock', $data)) {
            if (!is_numeric($data['stock']) || (int) $data['stock'] < 0) {
                throw new InvalidArgumentException('O estoque deve ser um número inteiro maior ou igual a zero.');
            }
            $payload['stock'] = (int) $data['stock'];
        }

        if (array_key_exists('description', $data)) {
            $payload['description'] = $data['description'] !== null ? trim((string) $data['description']) : null;
        }

        if (array_key_exists('image_url', $data)) {
            $payload['image_url'] = !empty($data['image_url']) ? trim((string) $data['image_url']) : null;
        }

        if (array_key_exists('is_active', $data)) {
            $payload['is_active'] = (bool) $data['is_active'];
        }

        if (!empty($payload)) {
            $this->productModel->update($id, $payload);
        }

        return $this->getById($id, false);
    }

    public function delete(int $id, bool $force = false): array
    {
        if ($id <= 0) {
            throw new InvalidArgumentException('ID de produto inválido.');
        }

        $existing = $this->productModel->findById($id, false);
        if (!$existing) {
            throw new RuntimeException('Produto não encontrado.');
        }

        if ($force) {
            try {
                $this->productModel->delete($id);
                return [
                    'message' => 'Produto excluído permanentemente com sucesso.',
                    'id' => $id,
                    'deleted' => true
                ];
            } catch (PDOException $e) {
                $this->productModel->deactivate($id);
                return [
                    'message' => 'O produto possui registros vinculados e foi desativado em vez de excluído permanentemente.',
                    'id' => $id,
                    'deactivated' => true
                ];
            }
        }

        $this->productModel->deactivate($id);

        return [
            'message' => 'Produto desativado com sucesso.',
            'id' => $id,
            'deactivated' => true
        ];
    }

    
    private function validateCreateData(array $data): void
    {
        if (empty($data['name']) || mb_strlen(trim((string) $data['name'])) < 2 || mb_strlen(trim((string) $data['name'])) > 150) {
            throw new InvalidArgumentException('O nome do produto é obrigatório e deve ter entre 2 e 150 caracteres.');
        }

        if (empty($data['category_id']) || !is_numeric($data['category_id']) || (int) $data['category_id'] <= 0) {
            throw new InvalidArgumentException('O ID da categoria é obrigatório.');
        }

        if (!$this->productModel->categoryExists((int) $data['category_id'])) {
            throw new InvalidArgumentException('Categoria informada é inválida ou não foi encontrada.');
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || (float) $data['price'] < 0) {
            throw new InvalidArgumentException('O preço é obrigatório e deve ser um valor numérico maior ou igual a zero.');
        }

        if (isset($data['stock']) && (!is_numeric($data['stock']) || (int) $data['stock'] < 0)) {
            throw new InvalidArgumentException('O estoque deve ser um número inteiro maior ou igual a zero.');
        }

        if (!empty($data['image_url']) && mb_strlen(trim((string) $data['image_url'])) > 500) {
            throw new InvalidArgumentException('A URL da imagem não pode ultrapassar 500 caracteres.');
        }
    }
}
