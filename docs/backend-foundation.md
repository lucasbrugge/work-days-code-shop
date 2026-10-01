# Backend Foundation — Work Days Code Shop

## 1. Objetivo

Esta etapa foi responsável pela criação da fundação do backend do projeto **Work Days Code Shop**, utilizando PHP puro, Docker e MySQL.

O objetivo foi estabelecer uma base para que os demais integrantes possam desenvolver autenticação, produtos, categorias, carrinho, pedidos e checkout utilizando uma arquitetura comum.

---

## 2. Tecnologias utilizadas

* PHP 8.3
* MySQL 8.0
* PDO
* Docker
* Docker Compose
* HTTP/REST
* JSON
* Vanilla JavaScript
* Bootstrap 5

---

## 3. Arquitetura

A comunicação do backend segue o fluxo:

```text
Frontend
   ↓
HTTP Request
   ↓
public/index.php
   ↓
Router
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Model / PDO
   ↓
MySQL
```

A aplicação utiliza um **Front Controller**, onde as requisições passam pelo:

```text
backend/public/index.php
```

O roteamento é realizado pelo:

```text
backend/routes/Router.php
```

---

# 4. Estrutura implementada

```text
backend/
├── config/
│   └── database.php
│
├── controllers/
│   ├── HealthController.php
│   └── NotImplementedController.php
│
├── helpers/
│   └── response.php
│
├── middleware/
│   ├── AuthMiddleware.php
│   └── AdminMiddleware.php
│
├── public/
│   └── index.php
│
├── routes/
│   ├── Router.php
│   └── api.php
│
└── Dockerfile
```

Banco:

```text
database/
├── schema.sql
└── seeder.sql
```

---

# 5. Docker

O backend utiliza a imagem:

```dockerfile
FROM php:8.3-cli
```

As extensões necessárias para MySQL foram adicionadas:

```text
pdo
pdo_mysql
```

A aplicação é executada pelo servidor embutido do PHP:

```text
php -S 0.0.0.0:80
```

A porta externa utilizada pelo backend é:

```text
localhost:8000
```

O MySQL é executado em um container separado.

A comunicação interna entre os containers utiliza:

```text
backend → db:3306
```

A porta externa do MySQL pode ser configurada pelo `.env`.

---

# 6. Banco de dados

Foi criada uma estrutura inicial contendo:

```text
users
categories
products
carts
cart_items
addresses
orders
order_items
```

Os relacionamentos principais são:

```text
users
  ├── addresses
  ├── carts
  └── orders

categories
  └── products

carts
  └── cart_items

products
  ├── cart_items
  └── order_items

orders
  └── order_items
```

O banco utiliza `utf8mb4` e chaves estrangeiras para manter a integridade dos relacionamentos.

---

# 7. Conexão com o banco

Foi criada a classe:

```text
backend/config/database.php
```

A conexão utiliza PDO.

As configurações são obtidas através das variáveis de ambiente:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Também foram configuradas:

```php
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
```

para tratamento de erros através de exceções.

E:

```php
PDO::ATTR_EMULATE_PREPARES => false
```

para utilizar prepared statements reais do MySQL.

A conexão é centralizada na classe `Database`.

---

# 8. Front Controller

O arquivo:

```text
backend/public/index.php
```

é responsável por receber as requisições da aplicação.

Também foram configurados:

* `Content-Type`
* CORS
* métodos HTTP permitidos
* headers permitidos
* tratamento de requisições `OPTIONS`

Os headers incluem:

```text
Authorization
X-Guest-Token
```

O `X-Guest-Token` será utilizado posteriormente pelo sistema de carrinho para visitantes.

---

# 9. Router

Foi criado um Router próprio para o projeto.

Ele possui suporte aos métodos:

```text
GET
POST
PUT
PATCH
DELETE
```

Exemplo:

```php
$router->get(
    '/api/products/{id}',
    fn ($id) => ...
);
```

O Router identifica o parâmetro:

```text
/api/products/15
```

e envia:

```text
15
```

para o handler.

Também foi implementado suporte a middleware por rota.

Exemplo:

```php
$router->get(
    '/api/orders',
    fn () => ...,
    [
        fn () => AuthMiddleware::requireAuth()
    ]
);
```

---

# 10. Respostas JSON

Foi criado:

```text
backend/helpers/response.php
```

A função:

```php
jsonResponse()
```

padroniza as respostas da API.

Resposta de sucesso:

```json
{
    "success": true,
    "data": {},
    "error": null
}
```

Resposta de erro:

```json
{
    "success": false,
    "data": null,
    "error": "Mensagem de erro"
}
```

Também foi criado tratamento para JSON inválido através de:

```php
getJsonBody()
```

---

# 11. Middleware de autenticação

Foi criado:

```text
backend/middleware/AuthMiddleware.php
```

O middleware verifica o header:

```text
Authorization: Bearer TOKEN
```

Caso o header não exista, a API retorna:

```text
401 Unauthorized
```

### Importante

Nesta etapa o middleware ainda verifica apenas a existência/formato do Bearer Token.

A validação real do token e a identificação do usuário serão integradas posteriormente ao sistema de autenticação.

---

# 12. Middleware administrativo

Foi criado:

```text
backend/middleware/AdminMiddleware.php
```

Sua responsabilidade será verificar se o usuário autenticado possui:

```text
role = admin
```

Caso contrário:

```text
403 Forbidden
```

A integração completa depende do sistema de autenticação fornecer o usuário autenticado ao middleware.

---

# 13. Rotas

Foram cadastradas as rotas principais da aplicação.

## Health

```text
GET /api/health
GET /api/health/db
```

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Profile

```text
GET /api/profile
PUT /api/profile
```

## Addresses

```text
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}
```

## Products

```text
GET /api/products
GET /api/products/{id}
```

## Categories

```text
GET /api/categories
```

## Cart

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/{id}
DELETE /api/cart/items/{id}
```

## Orders

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/{id}
POST /api/orders/{id}/pay
POST /api/orders/{id}/cancel
```

## Admin Products

```text
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

## Admin Categories

```text
POST   /api/admin/categories
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

## Admin Orders

```text
GET   /api/admin/orders
PATCH /api/admin/orders/{id}/status
```

---

# 14. Rotas protegidas

As seguintes rotas já possuem `AuthMiddleware`:

```text
POST /api/auth/logout
GET  /api/auth/me

GET /api/profile
PUT /api/profile

GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}

POST /api/orders
GET  /api/orders
GET  /api/orders/{id}
POST /api/orders/{id}/pay
POST /api/orders/{id}/cancel
```

As rotas do carrinho permanecem sem `AuthMiddleware` neste momento porque o projeto suporta carrinho de visitante através do:

```text
X-Guest-Token
```

---

# 15. Endpoint de teste

Foi criado:

```text
GET /api/health
```

Resposta esperada:

```json
{
    "success": true,
    "data": {
        "message": "API funcionando"
    },
    "error": null
}
```

Também foi criado:

```text
GET /api/health/db
```

Esse endpoint testa a comunicação entre PHP e MySQL.

Resposta validada:

```json
{
    "success": true,
    "data": {
        "message": "API e banco funcionando",
        "database": 1
    },
    "error": null
}
```

---

# 16. Testes realizados

## Teste 1 — API

```bash
curl -i http://localhost:8000/api/health
```

Resultado esperado:

```text
HTTP/1.1 200 OK
```

---

## Teste 2 — conexão com banco

```bash
curl -i http://localhost:8000/api/health/db
```

Resultado esperado:

```text
HTTP/1.1 200 OK
```

E:

```json
"database": 1
```

Esse teste confirma:

```text
PHP
 ↓
PDO
 ↓
MySQL
```

---

## Teste 3 — rota inexistente

```bash
curl -i http://localhost:8000/api/teste
```

Resultado esperado:

```text
HTTP/1.1 404 Not Found
```

---

## Teste 4 — rota ainda não implementada

```bash
curl -i http://localhost:8000/api/products
```

Resultado esperado:

```text
HTTP/1.1 501 Not Implemented
```

Isso é esperado nesta etapa porque os módulos de produtos ainda serão implementados pelo responsável.

---

## Teste 5 — rota privada sem token

```bash
curl -i http://localhost:8000/api/orders
```

Resultado esperado:

```text
HTTP/1.1 401 Unauthorized
```

---

## Teste 6 — rota privada com Bearer Token

```bash
curl -i \
  -H "Authorization: Bearer teste123" \
  http://localhost:8000/api/orders
```

Resultado esperado nesta etapa:

```text
HTTP/1.1 501 Not Implemented
```

Isso confirma que o middleware foi executado e permitiu a requisição seguir para o controller.

**Observação:** `teste123` não é um token válido. A validação real será implementada junto ao sistema de autenticação.

---

# 17. Como iniciar o projeto

Na raiz do projeto:

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d --build
```

Para verificar os containers:

```bash
docker compose ps
```

Para visualizar logs:

```bash
docker compose logs -f
```

Para parar:

```bash
docker compose down
```

Caso seja necessário recriar o banco do zero:

```bash
docker compose down -v
docker compose up --build
```

**Atenção:** `down -v` remove o volume do MySQL e, consequentemente, os dados armazenados nele.

---

# 18. Git — checkpoint da fundação

A branch utilizada para esta implementação é:

```text
feat/backend-foundation
```

Verificar estado:

```bash
git status
```

O estado esperado após o commit é:

```text
nothing to commit, working tree clean
```

Atualizar a branch:

```bash
git pull
```

Adicionar alterações:

```bash
git add .
```

Criar commit:

```bash
git commit -m "feat: descrição da alteração"
```

Enviar para o GitHub:

```bash
git push
```

---

# 19. Fluxo recomendado para os próximos integrantes

Cada integrante deve trabalhar em sua própria branch.

Exemplo:

```bash
git checkout -b feat/products
```

Depois:

```bash
git add .
git commit -m "feat: implement products"
git push -u origin feat/products
```

A integração deve acontecer através de Pull Request para a branch definida pelo projeto.

Antes de integrar:

```bash
git pull
```

e realizar os testes necessários.

---

# 20. Estado atual da fundação

### Concluído

* Estrutura inicial do backend
* Docker
* PHP 8.3
* PDO
* MySQL
* Variáveis de ambiente
* CORS
* Front Controller
* Router manual
* Parâmetros de rota
* Middleware
* Respostas JSON
* Health check
* Database health check
* Schema inicial
* Rotas da API
* Proteção inicial das rotas privadas

### Em desenvolvimento

* Autenticação real
* Validação dos tokens
* Identificação do usuário autenticado
* Proteção administrativa
* Services
* Integração entre os módulos
* Seeder e dados de teste
* Testes E2E
* Revisão final
* README final

---

# 21. Objetivo da próxima etapa

A próxima etapa da fundação será integrar o `AuthMiddleware` ao sistema de autenticação desenvolvido pelo responsável por autenticação.

O fluxo esperado será:

```text
Login
   ↓
Token
   ↓
Authorization: Bearer TOKEN
   ↓
AuthMiddleware
   ↓
Validação do token
   ↓
Usuário autenticado
   ↓
Controller
```

Depois disso será possível implementar corretamente:

```text
AuthMiddleware
        ↓
AdminMiddleware
        ↓
Rotas administrativas
```

E iniciar a integração completa:

```text
Produtos
   ↓
Carrinho
   ↓
Login
   ↓
Merge do carrinho
   ↓
Checkout
   ↓
Pedido
   ↓
Pagamento
   ↓
Estoque
```
