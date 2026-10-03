<?php

/*
|--------------------------------------------------------------------------
| Configuração
|--------------------------------------------------------------------------
*/
$baseUrl = 'http://localhost/api';

$passed = 0;
$failed = 0;


/*
|--------------------------------------------------------------------------
| Request HTTP
|--------------------------------------------------------------------------
*/

function request(
    string $method,
    string $url,
    ?array $body = null,
    ?string $token = null
): array {

    $headers = [
        'Accept: application/json'
    ];

    if ($body !== null) {
        $headers[] =
            'Content-Type: application/json';
    }

    if ($token !== null) {
        $headers[] =
            "Authorization: Bearer {$token}";
    }

    $options = [
        'http' => [
            'method' => $method,

            'header' =>
                implode("\r\n", $headers),

            'ignore_errors' => true
        ]
    ];

    if ($body !== null) {
        $options['http']['content'] =
            json_encode($body);
    }

    $context =
        stream_context_create($options);

    $response =
        file_get_contents(
            $url,
            false,
            $context
        );

    $status = 0;

    foreach (
        $http_response_header ?? []
        as $header
    ) {

        if (
            preg_match(
                '#HTTP/\S+\s+(\d+)#',
                $header,
                $matches
            )
        ) {
            $status =
                (int) $matches[1];

            break;
        }
    }

    return [
        'status' => $status,

        'json' =>
            $response
                ? json_decode(
                    $response,
                    true
                )
                : null
    ];
}


/*
|--------------------------------------------------------------------------
| Assertions
|--------------------------------------------------------------------------
*/

function assertStatus(
    string $test,
    int $expected,
    array $response
): void {

    global $passed;
    global $failed;

    if (
        $response['status']
        === $expected
    ) {

        echo "✅ {$test}\n";

        $passed++;

        return;
    }

    echo "❌ {$test}\n";

    echo "   Esperado: {$expected}\n";

    echo "   Recebido: "
        . $response['status']
        . "\n";

    echo "   Resposta: "
        . json_encode(
            $response['json'],
            JSON_UNESCAPED_UNICODE
        )
        . "\n";

    $failed++;
}


function assertTrue(
    string $test,
    bool $condition
): void {

    global $passed;
    global $failed;

    if ($condition) {

        echo "✅ {$test}\n";

        $passed++;

        return;
    }

    echo "❌ {$test}\n";

    $failed++;
}


/*
|--------------------------------------------------------------------------
| Início
|--------------------------------------------------------------------------
*/

echo PHP_EOL;

echo "=====================================\n";
echo " Testes de Autenticação / Autorização\n";
echo "=====================================\n";

echo PHP_EOL;


/*
|--------------------------------------------------------------------------
| Usuário único para cada execução
|--------------------------------------------------------------------------
*/

$unique =
    time();

$email =
    "teste.{$unique}@workdays.com";

$password =
    'Teste12345!';


/*
|--------------------------------------------------------------------------
| 1 - Cadastro
|--------------------------------------------------------------------------
*/

$register =
    request(
        'POST',
        "{$baseUrl}/auth/register",
        [
            'name' =>
                'Usuário Teste',

            'email' =>
                $email,

            'password' =>
                $password,

            'password_confirmation' =>
                $password
        ]
    );

assertStatus(
    'Cadastro válido retorna 201',
    201,
    $register
);


/*
|--------------------------------------------------------------------------
| 2 - E-mail duplicado
|--------------------------------------------------------------------------
*/

$duplicate =
    request(
        'POST',
        "{$baseUrl}/auth/register",
        [
            'name' =>
                'Usuário Duplicado',

            'email' =>
                $email,

            'password' =>
                $password,

            'password_confirmation' =>
                $password
        ]
    );

assertStatus(
    'Cadastro duplicado retorna 409',
    409,
    $duplicate
);


/*
|--------------------------------------------------------------------------
| 3 - Login com senha errada
|--------------------------------------------------------------------------
*/

$wrongPassword =
    request(
        'POST',
        "{$baseUrl}/auth/login",
        [
            'email' =>
                $email,

            'password' =>
                'senha-errada'
        ]
    );

assertStatus(
    'Login inválido retorna 401',
    401,
    $wrongPassword
);


/*
|--------------------------------------------------------------------------
| 4 - Login válido
|--------------------------------------------------------------------------
*/

$login =
    request(
        'POST',
        "{$baseUrl}/auth/login",
        [
            'email' =>
                $email,

            'password' =>
                $password
        ]
    );

assertStatus(
    'Login válido retorna 200',
    200,
    $login
);

$token =
    $login['json']['data']['token']
    ?? null;

assertTrue(
    'Login retorna token',
    !empty($token)
);


/*
|--------------------------------------------------------------------------
| 5 - /auth/me sem autenticação
|--------------------------------------------------------------------------
*/

$meWithoutToken =
    request(
        'GET',
        "{$baseUrl}/auth/me"
    );

assertStatus(
    '/auth/me sem token retorna 401',
    401,
    $meWithoutToken
);


/*
|--------------------------------------------------------------------------
| 6 - /auth/me autenticado
|--------------------------------------------------------------------------
*/

$me =
    request(
        'GET',
        "{$baseUrl}/auth/me",
        null,
        $token
    );

assertStatus(
    '/auth/me com token retorna 200',
    200,
    $me
);

assertTrue(
    '/auth/me retorna o e-mail correto',
    (
        $me['json']['data']['email']
        ?? null
    ) === $email
);


/*
|--------------------------------------------------------------------------
| 7 - Customer tentando acessar admin
|--------------------------------------------------------------------------
*/

$customerAdmin =
    request(
        'GET',
        "{$baseUrl}/admin/products",
        null,
        $token
    );

assertStatus(
    'Customer em rota admin retorna 403',
    403,
    $customerAdmin
);


/*
|--------------------------------------------------------------------------
| 8 - Perfil
|--------------------------------------------------------------------------
*/

$profile =
    request(
        'GET',
        "{$baseUrl}/profile",
        null,
        $token
    );

assertStatus(
    'GET /profile retorna 200',
    200,
    $profile
);


/*
|--------------------------------------------------------------------------
| 9 - Atualizar perfil
|--------------------------------------------------------------------------
*/

$profileUpdate =
    request(
        'PUT',
        "{$baseUrl}/profile",
        [
            'name' =>
                'Usuário Atualizado',

            'email' =>
                $email
        ],
        $token
    );

assertStatus(
    'PUT /profile retorna 200',
    200,
    $profileUpdate
);


/*
|--------------------------------------------------------------------------
| 10 - Admin
|--------------------------------------------------------------------------
*/

$adminLogin =
    request(
        'POST',
        "{$baseUrl}/auth/login",
        [
            'email' =>
                'admin@workdays.com',

            'password' =>
                'Admin123!'
        ]
    );

assertStatus(
    'Login admin retorna 200',
    200,
    $adminLogin
);

$adminToken =
    $adminLogin['json']['data']['token']
    ?? null;

if ($adminToken) {

    $adminProducts =
        request(
            'GET',
            "{$baseUrl}/admin/products",
            null,
            $adminToken
        );

    assertStatus(
        'Admin acessa rota administrativa',
        200,
        $adminProducts
    );
}

/*
|--------------------------------------------------------------------------
| Perfil sem autenticação
|--------------------------------------------------------------------------
*/

$profileWithoutToken =
    request(
        'GET',
        "{$baseUrl}/profile"
    );

assertStatus(
    'GET /profile sem token retorna 401',
    401,
    $profileWithoutToken
);


/*
|--------------------------------------------------------------------------
| Perfil com e-mail já utilizado
|--------------------------------------------------------------------------
*/

$duplicateProfileEmail =
    request(
        'PUT',
        "{$baseUrl}/profile",
        [
            'name' =>
                'Usuário Teste',

            'email' =>
                'admin@workdays.com'
        ],
        $token
    );

assertStatus(
    'Perfil não aceita e-mail de outro usuário',
    409,
    $duplicateProfileEmail
);


/*
|--------------------------------------------------------------------------
| 11 - Logout
|--------------------------------------------------------------------------
*/

$logout =
    request(
        'POST',
        "{$baseUrl}/auth/logout",
        null,
        $token
    );

assertStatus(
    'Logout retorna sucesso',
    200,
    $logout
);


/*
|--------------------------------------------------------------------------
| 12 - Token deve deixar de funcionar
|--------------------------------------------------------------------------
*/

$afterLogout =
    request(
        'GET',
        "{$baseUrl}/auth/me",
        null,
        $token
    );

assertStatus(
    'Token após logout retorna 401',
    401,
    $afterLogout
);


/*
|--------------------------------------------------------------------------
| Resultado
|--------------------------------------------------------------------------
*/

echo PHP_EOL;

echo "=====================================\n";
echo " Resultado\n";
echo "=====================================\n";

echo "✅ Passaram: {$passed}\n";
echo "❌ Falharam: {$failed}\n";

echo PHP_EOL;

exit(
    $failed > 0
        ? 1
        : 0
);