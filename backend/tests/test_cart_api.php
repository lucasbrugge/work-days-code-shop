<?php

require_once __DIR__ . '/../config/database.php';

$baseUrl = 'http://localhost/api';
$passed = 0;
$failed = 0;

function cartRequest(string $method, string $url, ?array $body = null, ?string $authToken = null, ?string $guestToken = null): array
{
    $headers = ['Accept: application/json'];
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
    }
    if ($authToken !== null) {
        $headers[] = "Authorization: Bearer {$authToken}";
    }
    if ($guestToken !== null) {
        $headers[] = "X-Guest-Token: {$guestToken}";
    }

    $options = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'ignore_errors' => true
        ]
    ];
    if ($body !== null) {
        $options['http']['content'] = json_encode($body);
    }

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $status = 0;
    $responseGuestToken = null;
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('#HTTP/\S+\s+(\d+)#', $header, $matches)) {
            $status = (int) $matches[1];
        }
        if (stripos($header, 'X-Guest-Token:') === 0) {
            $responseGuestToken = trim(substr($header, strlen('X-Guest-Token:')));
        }
    }

    return [
        'status' => $status,
        'json' => $response ? json_decode($response, true) : null,
        'guest_token' => $responseGuestToken
    ];
}

function cartAssert(string $name, bool $condition): void
{
    global $passed, $failed;
    if ($condition) {
        echo "✅ {$name}\n";
        $passed++;
    } else {
        echo "❌ {$name}\n";
        $failed++;
    }
}

$db = Database::getConnection();
$product = $db->query('SELECT id, stock FROM products WHERE is_active = 1 AND stock > 0 ORDER BY stock DESC, id LIMIT 1')->fetch();
if (!$product) {
    fwrite(STDERR, "Nenhum produto ativo com estoque foi encontrado.\n");
    exit(1);
}
$productId = (int) $product['id'];
$stock = (int) $product['stock'];

$guestCart = cartRequest('GET', "{$baseUrl}/cart");
$guestToken = $guestCart['json']['data']['guest_token'] ?? null;
cartAssert('GET visitante cria carrinho e token', $guestCart['status'] === 200 && is_string($guestToken) && $guestToken !== '');
cartAssert('Header X-Guest-Token corresponde ao token criado', $guestCart['guest_token'] === $guestToken);

$guestAdd = cartRequest('POST', "{$baseUrl}/cart/items", ['product_id' => $productId, 'quantity' => $stock], null, $guestToken);
cartAssert('Visitante adiciona até o estoque', $guestAdd['status'] === 201);
$guestQuantity = $guestAdd['json']['data']['items'][0]['quantity'] ?? null;
cartAssert('Resposta mantém a quantidade adicionada', $guestQuantity === $stock);
$guestItemId = $guestAdd['json']['data']['items'][0]['id'] ?? null;
$guestUpdate = cartRequest('PATCH', "{$baseUrl}/cart/items/{$guestItemId}", ['quantity' => max(1, $stock - 1)], null, $guestToken);
cartAssert('Visitante atualiza quantidade do próprio item', $guestUpdate['status'] === 200 && ($guestUpdate['json']['data']['items'][0]['quantity'] ?? null) === max(1, $stock - 1));
$guestRestore = cartRequest('PATCH', "{$baseUrl}/cart/items/{$guestItemId}", ['quantity' => $stock], null, $guestToken);
cartAssert('Visitante pode ajustar novamente até o estoque', $guestRestore['status'] === 200 && ($guestRestore['json']['data']['items'][0]['quantity'] ?? null) === $stock);
$overStockAdd = cartRequest('POST', "{$baseUrl}/cart/items", ['product_id' => $productId, 'quantity' => 1], null, $guestToken);
cartAssert('Visitante não consegue ultrapassar o estoque', $overStockAdd['status'] === 422);
$guestRemove = cartRequest('DELETE', "{$baseUrl}/cart/items/{$guestItemId}", null, null, $guestToken);
cartAssert('Visitante remove o próprio item', $guestRemove['status'] === 200 && empty($guestRemove['json']['data']['items']));
$guestAddAgain = cartRequest('POST', "{$baseUrl}/cart/items", ['product_id' => $productId, 'quantity' => $stock], null, $guestToken);
cartAssert('Item removido pode ser adicionado novamente', $guestAddAgain['status'] === 201);

$email = 'cart.' . bin2hex(random_bytes(6)) . '@workdays.com';
$password = 'CartTest123!';
$register = cartRequest('POST', "{$baseUrl}/auth/register", [
    'name' => 'Teste Carrinho',
    'email' => $email,
    'password' => $password,
    'password_confirmation' => $password
]);
cartAssert('Cadastro de usuário de teste', $register['status'] === 201);

$login = cartRequest('POST', "{$baseUrl}/auth/login", ['email' => $email, 'password' => $password]);
$authToken = $login['json']['data']['token'] ?? null;
cartAssert('Login do usuário de teste', $login['status'] === 200 && is_string($authToken));

$userAdd = cartRequest('POST', "{$baseUrl}/cart/items", ['product_id' => $productId, 'quantity' => 1], $authToken);
cartAssert('Usuário adiciona produto ao carrinho da conta', $userAdd['status'] === 201);
$activeCartCount = $db->prepare("SELECT COUNT(*) FROM carts c INNER JOIN users u ON u.id = c.user_id WHERE u.email = :email AND c.status = 'active'");
$activeCartCount->execute(['email' => $email]);
cartAssert('Usuário mantém somente um carrinho ativo', (int) $activeCartCount->fetchColumn() === 1);

$merge = cartRequest('POST', "{$baseUrl}/auth/login", [
    'email' => $email,
    'password' => $password,
    'guest_token' => $guestToken
]);
$mergedAuthToken = $merge['json']['data']['token'] ?? null;
cartAssert('Login executa merge do carrinho visitante', $merge['status'] === 200 && is_string($mergedAuthToken));

$mergedCart = cartRequest('GET', "{$baseUrl}/cart", null, $mergedAuthToken);
$mergedQuantity = $mergedCart['json']['data']['items'][0]['quantity'] ?? null;
cartAssert('Merge soma itens e limita ao estoque', $mergedQuantity === $stock);
cartAssert('Merge retorna aviso quando limita quantidade', $stock > 1 ? !empty($merge['json']['data']['cart_merge_warnings']) : true);

$oldGuestTokenCart = cartRequest('GET', "{$baseUrl}/cart", null, null, $guestToken);
$oldGuestId = $guestCart['json']['data']['id'] ?? null;
$newGuestId = $oldGuestTokenCart['json']['data']['id'] ?? null;
cartAssert('Token antigo não recupera o carrinho convertido', $oldGuestTokenCart['status'] === 200 && $newGuestId !== $oldGuestId && empty($oldGuestTokenCart['json']['data']['items']));

echo "\nResultado: {$passed} aprovados, {$failed} falharam.\n";
exit($failed === 0 ? 0 : 1);
