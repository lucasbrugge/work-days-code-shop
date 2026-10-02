<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Address.php';
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Product.php';

class OrderNotFoundException extends RuntimeException
{
}

class OrderConflictException extends RuntimeException
{
}

class OrderService
{
    private const SHIPPING_CENTS = 2490;
    private const FREE_SHIPPING_THRESHOLD_CENTS = 20000;
    private const MAX_DECIMAL_CENTS = 9999999999;

    private PDO $db;
    private Address $addressModel;
    private Cart $cartModel;
    private Order $orderModel;
    private Product $productModel;

    public function __construct(
        ?PDO $db = null,
        ?Address $addressModel = null,
        ?Cart $cartModel = null,
        ?Order $orderModel = null,
        ?Product $productModel = null
    ) {
        $this->db = $db ?? Database::getConnection();
        $this->addressModel = $addressModel ?? new Address($this->db);
        $this->cartModel = $cartModel ?? new Cart($this->db);
        $this->orderModel = $orderModel ?? new Order($this->db);
        $this->productModel = $productModel ?? new Product($this->db);
    }

    public function createOrder(int $userId, mixed $addressId): array
    {
        $addressId = $this->positiveInteger($addressId, 'Endereço');
        $this->db->beginTransaction();

        try {
            $address = $this->addressModel->findForUser($addressId, $userId, true);
            if (!$address) {
                throw new OrderNotFoundException('Endereço não encontrado.');
            }

            $cart = $this->cartModel->findActiveByUserId($userId, true);
            if (!$cart) {
                throw new OrderConflictException('Carrinho não encontrado.');
            }

            $cartItems = $this->cartModel->findItemsForOrder((int) $cart['id']);
            if ($cartItems === []) {
                throw new OrderConflictException('Não é possível criar um pedido com o carrinho vazio.');
            }

            $items = [];
            $subtotalCents = 0;
            $stockProblems = [];

            foreach ($cartItems as $item) {
                $productId = (int) $item['product_id'];
                $quantity = (int) $item['quantity'];
                $stock = (int) $item['stock'];

                if (!(bool) $item['is_active'] || $quantity <= 0 || $quantity > $stock) {
                    $stockProblems[] = sprintf(
                        '%s (solicitado: %d, estoque: %d)',
                        $item['product_name'],
                        $quantity,
                        $stock
                    );
                    continue;
                }

                $unitPriceCents = $this->toCents($item['price']);
                if ($unitPriceCents > intdiv(self::MAX_DECIMAL_CENTS, $quantity)) {
                    throw new OrderConflictException('O valor do pedido excede o limite suportado.');
                }

                $lineCents = $unitPriceCents * $quantity;
                if ($subtotalCents > self::MAX_DECIMAL_CENTS - $lineCents) {
                    throw new OrderConflictException('O valor do pedido excede o limite suportado.');
                }

                $subtotalCents += $lineCents;
                $items[] = [
                    'product_id' => $productId,
                    'product_name' => $item['product_name'],
                    'unit_price' => $this->fromCents($unitPriceCents),
                    'quantity' => $quantity,
                    'subtotal' => $this->fromCents($lineCents)
                ];
            }

            if ($stockProblems !== []) {
                throw new OrderConflictException(
                    'Estoque insuficiente ou produto indisponível: ' . implode('; ', $stockProblems)
                );
            }

            $shippingCents = $subtotalCents > self::FREE_SHIPPING_THRESHOLD_CENTS
                ? 0
                : self::SHIPPING_CENTS;
            if ($subtotalCents > self::MAX_DECIMAL_CENTS - $shippingCents) {
                throw new OrderConflictException('O valor do pedido excede o limite suportado.');
            }
            $totalCents = $subtotalCents + $shippingCents;

            $orderId = $this->orderModel->create([
                'user_id' => $userId,
                'address_id' => $addressId,
                'shipping_street' => $address['street'],
                'shipping_number' => $address['number'],
                'shipping_complement' => $address['complement'],
                'shipping_neighborhood' => $address['neighborhood'],
                'shipping_city' => $address['city'],
                'shipping_state' => $address['state'],
                'shipping_zip_code' => $address['zip_code'],
                'subtotal' => $this->fromCents($subtotalCents),
                'shipping' => $this->fromCents($shippingCents),
                'total' => $this->fromCents($totalCents)
            ]);

            $this->orderModel->createItems($orderId, $items);

            foreach ($items as $item) {
                if (!$this->productModel->decrementStock($item['product_id'], $item['quantity'])) {
                    throw new OrderConflictException(
                        'O estoque de ' . $item['product_name'] . ' mudou. Atualize o carrinho e tente novamente.'
                    );
                }
            }

            $this->cartModel->clearCartItems((int) $cart['id']);
            $result = $this->loadOrder($orderId, $userId);
            $this->db->commit();

            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    public function listOrders(int $userId): array
    {
        $orders = $this->orderModel->findAllForUser($userId);
        foreach ($orders as &$order) {
            $order['id'] = (int) $order['id'];
        }
        unset($order);

        return $orders;
    }

    public function getOrder(int $userId, mixed $orderId): array
    {
        return $this->loadOrder($this->positiveInteger($orderId, 'Pedido'), $userId);
    }

    public function payOrder(int $userId, mixed $orderId): array
    {
        $orderId = $this->positiveInteger($orderId, 'Pedido');
        $this->db->beginTransaction();

        try {
            $order = $this->orderModel->findForUser($orderId, $userId, true);
            if (!$order) {
                throw new OrderNotFoundException('Pedido não encontrado.');
            }
            if ($order['status'] !== 'pending_payment') {
                throw new OrderConflictException('Somente pedidos aguardando pagamento podem ser pagos.');
            }
            if (!$this->orderModel->markPaid($orderId, $userId)) {
                throw new OrderConflictException('O status do pedido foi alterado. Atualize a página e tente novamente.');
            }

            $result = $this->loadOrder($orderId, $userId);
            $this->db->commit();
            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    public function cancelOrder(int $userId, mixed $orderId): array
    {
        $orderId = $this->positiveInteger($orderId, 'Pedido');
        $this->db->beginTransaction();

        try {
            $order = $this->orderModel->findForUser($orderId, $userId, true);
            if (!$order) {
                throw new OrderNotFoundException('Pedido não encontrado.');
            }
            if ($order['status'] !== 'pending_payment') {
                throw new OrderConflictException('Somente pedidos aguardando pagamento podem ser cancelados.');
            }

            $items = $this->orderModel->findItems($orderId, true);
            foreach ($items as $item) {
                if ($item['product_id'] !== null && (int) $item['product_id'] > 0) {
                    if (!$this->productModel->incrementStock((int) $item['product_id'], (int) $item['quantity'])) {
                        throw new OrderConflictException('Não foi possível restaurar o estoque do pedido.');
                    }
                }
            }

            if (!$this->orderModel->markCancelled($orderId, $userId)) {
                throw new OrderConflictException('O status do pedido foi alterado. Atualize a página e tente novamente.');
            }

            $result = $this->loadOrder($orderId, $userId);
            $this->db->commit();
            return $result;
        } catch (Throwable $e) {
            $this->rollBackIfNeeded();
            throw $e;
        }
    }

    private function loadOrder(int $orderId, int $userId): array
    {
        $order = $this->orderModel->findForUser($orderId, $userId);
        if (!$order) {
            throw new OrderNotFoundException('Pedido não encontrado.');
        }

        $order['id'] = (int) $order['id'];
        $order['address'] = [
            'street' => $order['shipping_street'],
            'number' => $order['shipping_number'],
            'complement' => $order['shipping_complement'],
            'neighborhood' => $order['shipping_neighborhood'],
            'city' => $order['shipping_city'],
            'state' => $order['shipping_state'],
            'zip_code' => $order['shipping_zip_code']
        ];
        unset(
            $order['shipping_street'],
            $order['shipping_number'],
            $order['shipping_complement'],
            $order['shipping_neighborhood'],
            $order['shipping_city'],
            $order['shipping_state'],
            $order['shipping_zip_code']
        );

        $order['items'] = $this->orderModel->findItems($orderId);
        foreach ($order['items'] as &$item) {
            $item['id'] = (int) $item['id'];
            $item['product_id'] = $item['product_id'] === null ? null : (int) $item['product_id'];
            $item['quantity'] = (int) $item['quantity'];
        }
        unset($item);

        return $order;
    }

    private function positiveInteger(mixed $value, string $label): int
    {
        if (is_int($value)) {
            $parsed = $value;
        } elseif (is_string($value) && preg_match('/^[0-9]+$/D', $value)) {
            $parsed = filter_var($value, FILTER_VALIDATE_INT);
        } else {
            $parsed = false;
        }

        if ($parsed === false || $parsed <= 0) {
            throw new InvalidArgumentException("ID de {$label} inválido.");
        }

        return $parsed;
    }

    private function toCents(string|int|float $amount): int
    {
        $amount = (string) $amount;
        if (!preg_match('/^([0-9]{1,8})(?:\.([0-9]{1,2}))?$/D', $amount, $matches)) {
            throw new OrderConflictException('O preço de um produto não é válido.');
        }

        $whole = (int) $matches[1];
        $fraction = (int) str_pad($matches[2] ?? '', 2, '0');
        return $whole * 100 + $fraction;
    }

    private function fromCents(int $amount): string
    {
        return intdiv($amount, 100) . '.' . str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
    }

    private function rollBackIfNeeded(): void
    {
        if ($this->db->inTransaction()) {
            $this->db->rollBack();
        }
    }
}
