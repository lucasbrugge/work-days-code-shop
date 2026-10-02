<?php

require_once __DIR__ . '/../models/Category.php';

class CategoryNotFoundException extends RuntimeException
{
}

class CategoryConflictException extends RuntimeException
{
}

class CategoryService
{
    private Category $categoryModel;

    public function __construct(?Category $categoryModel = null)
    {
        $this->categoryModel = $categoryModel ?? new Category();
    }

    public function list(): array
    {
        return $this->categoryModel->findAll();
    }

    public function create(array $input): array
    {
        [$name, $slug] = $this->validatedFields($input);
        if ($this->categoryModel->existsByNameOrSlug($name, $slug)) {
            throw new CategoryConflictException('Já existe uma categoria com esse nome ou slug.');
        }

        $id = $this->categoryModel->create($name, $slug);
        return $this->categoryModel->findById($id) ?: throw new RuntimeException('Não foi possível carregar a categoria criada.');
    }

    public function update(mixed $categoryId, array $input): array
    {
        $id = $this->positiveInteger($categoryId);
        if (!$this->categoryModel->findById($id)) {
            throw new CategoryNotFoundException('Categoria não encontrada.');
        }

        [$name, $slug] = $this->validatedFields($input);
        if ($this->categoryModel->existsByNameOrSlug($name, $slug, $id)) {
            throw new CategoryConflictException('Já existe uma categoria com esse nome ou slug.');
        }

        $this->categoryModel->update($id, $name, $slug);
        return $this->categoryModel->findById($id) ?: throw new CategoryNotFoundException('Categoria não encontrada.');
    }

    public function delete(mixed $categoryId): array
    {
        $id = $this->positiveInteger($categoryId);
        if (!$this->categoryModel->findById($id)) {
            throw new CategoryNotFoundException('Categoria não encontrada.');
        }
        if ($this->categoryModel->hasProducts($id)) {
            throw new CategoryConflictException('Não é possível excluir uma categoria que possui produtos.');
        }
        if (!$this->categoryModel->delete($id)) {
            throw new CategoryConflictException('A categoria foi associada a produtos e não pode ser excluída.');
        }

        return ['id' => $id, 'deleted' => true, 'message' => 'Categoria excluída com sucesso.'];
    }

    private function validatedFields(array $input): array
    {
        $name = $input['name'] ?? null;
        $slug = $input['slug'] ?? null;
        if (!is_string($name) || !is_string($slug)) {
            throw new InvalidArgumentException('Nome e slug são obrigatórios e devem ser texto.');
        }

        $name = trim($name);
        $slug = trim($slug);
        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            throw new InvalidArgumentException('O nome deve ter entre 2 e 100 caracteres.');
        }
        if (mb_strlen($slug) > 120 || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) {
            throw new InvalidArgumentException('O slug deve conter letras minúsculas sem acentos, números e hífens entre palavras.');
        }

        return [$name, $slug];
    }

    private function positiveInteger(mixed $value): int
    {
        $id = filter_var($value, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            throw new InvalidArgumentException('ID de categoria inválido.');
        }

        return $id;
    }
}
