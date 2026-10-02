<?php

require_once __DIR__ . '/../models/Address.php';

class AddressNotFoundException extends RuntimeException
{
}

class AddressConflictException extends RuntimeException
{
}

class AddressService
{
    private Address $addressModel;

    public function __construct(?Address $addressModel = null)
    {
        $this->addressModel = $addressModel ?? new Address();
    }

    public function listForUser(int $userId): array
    {
        return $this->addressModel->findAllForUser($userId);
    }

    public function create(int $userId, array $input): array
    {
        $data = $this->validate($input);
        $id = $this->addressModel->create($userId, $data);

        return $this->addressModel->findForUser($id, $userId) ?: throw new RuntimeException('Não foi possível carregar o endereço criado.');
    }

    public function update(int $userId, mixed $addressId, array $input): array
    {
        $id = $this->positiveInteger($addressId);
        $data = $this->validate($input);
        if (!$this->addressModel->findForUser($id, $userId)) {
            throw new AddressNotFoundException('Endereço não encontrado.');
        }
        $this->addressModel->updateForUser($id, $userId, $data);

        return $this->addressModel->findForUser($id, $userId) ?: throw new AddressNotFoundException('Endereço não encontrado.');
    }

    public function delete(int $userId, mixed $addressId): array
    {
        $id = $this->positiveInteger($addressId);
        if (!$this->addressModel->findForUser($id, $userId)) {
            throw new AddressNotFoundException('Endereço não encontrado.');
        }
        if ($this->addressModel->hasOrders($id)) {
            throw new AddressConflictException('Este endereço está associado a pedidos e não pode ser excluído.');
        }
        if (!$this->addressModel->deleteForUser($id, $userId)) {
            throw new AddressConflictException('O endereço foi utilizado em um pedido e não pode ser excluído.');
        }

        return ['message' => 'Endereço excluído com sucesso.'];
    }

    private function validate(array $input): array
    {
        $limits = [
            'street' => 150,
            'number' => 20,
            'complement' => 100,
            'neighborhood' => 100,
            'city' => 100,
            'state' => 2,
            'zip_code' => 10
        ];
        $data = [];

        foreach ($limits as $field => $maxLength) {
            $value = $input[$field] ?? null;
            if ($field === 'complement' && $value === null) {
                $data[$field] = null;
                continue;
            }
            if (!is_string($value)) {
                throw new InvalidArgumentException("O campo {$field} é obrigatório e deve ser texto.");
            }

            $value = trim($value);
            if ($field === 'state') {
                $value = strtoupper($value);
            }
            if ($value === '' && $field === 'complement') {
                $value = null;
            } elseif ($value === '') {
                throw new InvalidArgumentException("O campo {$field} é obrigatório.");
            }

            if ($value !== null && mb_strlen($value) > $maxLength) {
                throw new InvalidArgumentException("O campo {$field} deve ter no máximo {$maxLength} caracteres.");
            }
            $data[$field] = $value;
        }

        if (!preg_match('/^[A-Z]{2}$/', $data['state'])) {
            throw new InvalidArgumentException('O estado deve conter duas letras.');
        }
        if (!preg_match('/^\d{5}-?\d{3}$/', $data['zip_code'])) {
            throw new InvalidArgumentException('Informe um CEP válido.');
        }

        return $data;
    }

    private function positiveInteger(mixed $value): int
    {
        $id = filter_var($value, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            throw new InvalidArgumentException('ID de endereço inválido.');
        }

        return $id;
    }
}
