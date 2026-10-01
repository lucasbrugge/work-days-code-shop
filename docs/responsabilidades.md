# ⏱️ Planejamento Express (2 Dias — Apenas no Período da Manhã)

**Carga Horária:** 2 manhãs de 4 horas (total de 8 horas úteis)  
**Horário de Execução:** 08:00 às 12:00  
**Arquitetura:** PHP POO Nativo (PDO / Arquitetura MVC enxuta) + Vanilla JS + Bootstrap 5  

---

## 📅 DIA 1
> **Objetivo da Manhã:** Subir o ambiente, autenticação, exibição de catálogo e carrinho de visitante funcional.

### ⏰ Alinhamento e Estrutura Base
* **Tech Lead:** Cria a estrutura de pastas PHP POO, o `Database.php` (PDO Singleton), o roteador central (`/public/index.php`) e o middleware/header de CORS.
* **Mariane:** Cria o layout base HTML com Bootstrap 5 (`header` com badge de carrinho, `navbar` e `footer`) e o utilitário `frontend/js/api.js` com a função wrapper `apiFetch()`.
* **Diego & Elian:** Criam o script `schema.sql` inicial (tabelas `usuarios`, `categorias` e `produtos`).
* **Rogger, Bruno & Gustavo:** Auxiliam no setup do banco e validam as entidades do banco.

---

### ⏰ Desenvolvimento em Paralelo dos Módulos Principais
* **Rogger (Autenticação):**
  * *Backend:* `UserModel.php`, `AuthService.php` (hash de senha e validação) e endpoints `POST /api/auth/register` e `POST /api/auth/login`.
  * *Frontend:* Conecta `login.html` e `registro.html` com a API, salvando token e dados do usuário no `localStorage`.
* **Diego & Elian (Catálogo Público):**
  * *Backend:* `ProductModel.php`, `CategoryModel.php` e endpoint público `GET /api/products` (busca por nome, filtro por categoria e paginação SQL `LIMIT/OFFSET`).
  * *Frontend:* Renderização dinâmica de cards de produtos na `index.html` e criação de `produto.html`.
* **Bruno (Carrinho de Visitante):**
  * *Backend:* `CartService.php` com suporte a `guest_token` e endpoints `GET /api/cart`, `POST /api/cart/items`, `PATCH` e `DELETE`.
  * *Frontend:* Desenvolve a página `carrinho.html` consumindo os valores calculados pelo servidor.
* **Gustavo & Tech Lead (Modelagem de Pedidos):**
  * Adicionam as tabelas `carrinhos`, `itens_carrinho`, `pedidos`, `itens_pedido` e `enderecos` ao `schema.sql`.

---

### ⏰ Integração e Checkpoint do Dia 1
* **Toda a Equipe:** Valida a navegação e adicione de itens no carrinho **sem estar logado**, além de testar o login/registro de novos usuários.

---

## 📅 DIA 2 (Manhã: 08:00 às 12:00)
> **Objetivo da Manhã:** Regras de negócio complexas (Fusão, Transações de Estoque, Pedido, Pagamento Simulado, Painel Admin, Seeders e QA).

### ⏰ 08:00 - 09:30 | Regras de Negócio Críticas & Backend
* **Tech Lead, Bruno & Rogger (Regra Central de Fusão):**
  * Implementam no `AuthService` e `CartService` a fusão do carrinho: ao logar, envia o `guest_token`, mescla com os itens do usuário e invalida o token de visitante.
  * Atualizam o fluxo do login no JS para mandar o token de visitante e atualizar a quantidade de itens na Navbar.
* **Gustavo (Módulo de Pedidos e Transação PDO):**
  * Implementa `OrderService.php` usando `$pdo->beginTransaction()` para congelar preços praticados, validar e baixar o estoque.
  * Implementa endpoints: `POST /api/orders`, `POST /api/orders/{id}/pay` (pagamento simulado) e `POST /api/orders/{id}/cancel` (devolução de estoque).
* **Diego & Elian (Rotas Administrativas Protegidas):**
  * Criam verificação de acesso para barrar clientes normais com código **HTTP 403**.
  * Criam endpoints CRUD de administração: `POST/PUT/DELETE /api/admin/products` e `/categories`.

---

### ⏰ 09:30 - 11:00 | Interface de Checkout, Painel e Seeders
* **Mariane & Gustavo:** Desenvolvem `checkout.html` (seleção/cadastro de endereço) e `meus-pedidos.html` (detalhes do pedido e botão para simular pagamento).
* **Diego & Elian:** Criam `admin/painel.html` com tabelas Bootstrap e modais para gerenciar catálogo e atualizar status dos pedidos (`pago`, `enviado`, `entregue`).
* **Tech Lead:**
  * Cria o arquivo `seeder.sql` (1 Admin, 3 Clientes, 3 Categorias, 30 Produtos com casos de teste: sem estoque e inativo, e histórico de pedidos).
  * Monta e ajusta o `compose.yaml` (subida da API PHP, Frontend e Banco de Dados com comando único).

---

### ⏰ 11:00 - 12:00 | QA (Garantia de Qualidade) & Teste E2E Final
* **Toda a Equipe:**
  * Teste do fluxo completo em janela anônima:  
    `Navegar sem login` $\rightarrow$ `Adicionar ao carrinho` $\rightarrow$ `Fazer Login` $\rightarrow$ `Verificar Fusão do Carrinho` $\rightarrow$ `Finalizar Checkout` $\rightarrow$ `Simular Pagamento` $\rightarrow$ `Conferir atualização no Painel Admin`.
  * Remoção de elementos visuais "fake" sem funcionalidade.

---

## 👥 Resumo de Entregas Individuais nas Manhãs

| Integrante | Foco Principal | Entregáveis Principais |
| :--- | :--- | :--- |
| **Tech Lead** | Infra & Arquitetura | Router PHP POO, `Database.php`, `compose.yaml`, `seeder.sql`, Fusão. |
| **Mariane** | Frontend & UI | Grid Bootstrap base, Navbar responsiva, `api.js`, estilização de alertas. |
| **Rogger** | Autenticação | `UserModel`, `AuthService` (login/registro), `login.html`, `registro.html`. |
| **Diego & Elian**| Catálogo & Admin | Endpoints de produtos/categorias, `index.html`, `produto.html`, `admin/painel.html`. |
| **Bruno** | Carrinho de Compras| `CartService` (token opaco e fusão), `carrinho.html`, atualização do contador. |
| **Gustavo** | Pedidos & Checkout | `OrderService` (Transação PDO), `checkout.html`, `meus-pedidos.html`. |