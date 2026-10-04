<?php

require_once __DIR__ . '/../services/CartService.php';

class CartMergeTestModel extends Cart
{
    public array $guestItems;
    public array $userItems;
    public array $stocks;
    public array $updates = [];
    public array $deletions = [];
    public array $moved = [];
    public bool $cleared = false;
    public bool $invalidated = false;
    public bool $assigned = false;
    public ?array $userCart;

    public function __construct(array $guestItems = [], array $userItems = [], array $stocks = [], bool $hasUserCart = true)
    {
        parent::__construct(new class extends PDO { public function __construct() {} });
        $this->guestItems = $guestItems;
        $this->userItems = $userItems;
        $this->stocks = $stocks;
        $this->userCart = $hasUserCart ? ['id' => 20] : null;
    }

    public function findActiveGuestByToken(string $guestToken): array|false { return ['id' => 10]; }
    public function findActiveByUserId(int $userId, bool $forUpdate = false): array|false { return $this->userCart ?? false; }
    public function findItemsForMerge(int $cartId): array { return $cartId === 10 ? $this->guestItems : $this->userItems; }
    public function getProductStocks(array $productIds): array { return $this->stocks; }
    public function updateCartItemQuantity(int $cartId, int $productId, int $quantity): void
    {
        $this->updates[] = [$cartId, $productId, $quantity];
        if ($cartId === 10) {
            foreach ($this->guestItems as &$item) {
                if ((int) $item['product_id'] === $productId) $item['quantity'] = $quantity;
            }
        } else {
            foreach ($this->userItems as &$item) {
                if ((int) $item['product_id'] === $productId) $item['quantity'] = $quantity;
            }
        }
        unset($item);
    }
    public function deleteItem(int $cartId, int $itemId): bool
    {
        $this->deletions[] = [$cartId, $itemId];
        $key = $cartId === 10 ? 'guestItems' : 'userItems';
        $this->{$key} = array_values(array_filter($this->{$key}, fn($item) => (int) $item['id'] !== $itemId));
        return true;
    }
    public function moveCartItem(int $cartId, int $productId, int $quantity): void
    {
        $this->moved[] = [$cartId, $productId, $quantity];
        $this->userItems[] = ['id' => 100 + $productId, 'product_id' => $productId, 'quantity' => $quantity];
    }
    public function assignGuestCartToUser(int $cartId, int $userId): void { $this->assigned = true; }
    public function clearCartItems(int $cartId): void { $this->cleared = true; $this->guestItems = []; }
    public function invalidateGuestCart(int $cartId): void { $this->invalidated = true; }
}

function check(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
    echo "PASS: {$message}\n";
}

function mergeCase(array $guest, array $user, array $stocks, bool $hasUserCart = true): array
{
    $model = new CartMergeTestModel($guest, $user, $stocks, $hasUserCart);
    $service = new CartService($model, null, new class extends PDO { public function __construct() {} });
    return [$service->mergeGuestCart(7, 'guest-token'), $model];
}

[$warnings, $model] = mergeCase([], [], [], true);
check($warnings === [] && $model->cleared && $model->invalidated, 'visitante sem itens conclui merge');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 2]], [], [3 => ['stock' => 5, 'is_active' => true]], false);
check($model->assigned && $model->guestItems[0]['quantity'] === 2, 'usuário sem carrinho assume carrinho visitante disponível');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 2]], [['id' => 2, 'product_id' => 4, 'quantity' => 1]], [3 => ['stock' => 5, 'is_active' => true], 4 => ['stock' => 4, 'is_active' => true]]);
check(count($model->userItems) === 2 && count($model->moved) === 1, 'usuário com carrinho mantém itens e incorpora os do visitante');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 2]], [['id' => 2, 'product_id' => 3, 'quantity' => 2]], [3 => ['stock' => 5, 'is_active' => true]]);
check($model->userItems[0]['quantity'] === 4 && $model->updates[0][2] === 4, 'produto duplicado soma quantidades dentro do estoque');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 4]], [['id' => 2, 'product_id' => 3, 'quantity' => 3]], [3 => ['stock' => 5, 'is_active' => true]]);
check($model->userItems[0]['quantity'] === 5 && count($warnings) === 1, 'soma acima do estoque limita quantidade e avisa');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 1]], [['id' => 2, 'product_id' => 3, 'quantity' => 8]], [3 => ['stock' => 5, 'is_active' => true]]);
check($model->userItems[0]['quantity'] === 5 && count($warnings) === 1, 'quantidade existente acima do estoque é reduzida ao limite');

[$warnings, $model] = mergeCase([], [['id' => 2, 'product_id' => 3, 'quantity' => 8]], [3 => ['stock' => 5, 'is_active' => true]]);
check($model->userItems[0]['quantity'] === 5 && count($warnings) === 1, 'carrinho do usuário acima do estoque é corrigido mesmo sem item visitante duplicado');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 1]], [['id' => 2, 'product_id' => 3, 'quantity' => 2]], [3 => ['stock' => 5, 'is_active' => false]]);
check($model->userItems === [] && count($warnings) === 1 && str_contains($warnings[0], 'indisponível'), 'produto inativo é removido com aviso explícito');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 1]], [['id' => 2, 'product_id' => 3, 'quantity' => 2]], [3 => ['stock' => 0, 'is_active' => true]]);
check($model->userItems === [] && count($warnings) === 1 && str_contains($warnings[0], 'indisponível'), 'produto sem estoque não fica comprável e gera aviso');

[$warnings, $model] = mergeCase([], [['id' => 2, 'product_id' => 3, 'quantity' => 2]], [3 => ['stock' => 0, 'is_active' => true]]);
check($model->userItems === [] && count($warnings) === 1, 'produto indisponível já existente é removido com aviso mesmo sem duplicata visitante');

[$warnings, $model] = mergeCase([['id' => 1, 'product_id' => 3, 'quantity' => 1]], [], [3 => ['stock' => 0, 'is_active' => true]], false);
check($model->guestItems === [] && count($warnings) === 1, 'produto sem estoque no carrinho transferido é removido com aviso');

echo "\nTodos os testes de merge do carrinho passaram.\n";
