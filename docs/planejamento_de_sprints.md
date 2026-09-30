# 📋 Planejamento de Sprints do Projeto

---

## 🚀 Sprint 1: Fundação, Autenticação e Catálogo Público

> **Objetivo:** Subir a estrutura base da API e do Frontend, permitir cadastro/login de usuários e exibir os produtos na página inicial.

### 👤 Tech Lead

- [ ] Criar a estrutura de pastas do projeto (`backend/` e `frontend/`).
- [ ] Configurar a conexão PDO com o banco de dados no arquivo `config/database.php`.
- [ ] Configurar os cabeçalhos CORS no PHP para permitir chamadas do Frontend.
- [ ] Criar a biblioteca `frontend/js/api.js` contendo a função global `apiFetch()` para as requisições fetch da equipe.

### 👤 Mariana

- [ ] Criar a estrutura HTML base com Bootstrap (header com Navbar responsiva, contador de carrinho e footer).
- [ ] Definir o CSS global do projeto.

### 👤 Rogger

- [ ] Criar a tabela de `usuarios` no script SQL (`schema.sql`).
- [ ] Implementar os endpoints `POST /api/auth/register` e `POST /api/auth/login` em PHP (retornando token e dados do usuário).
- [ ] Criar as telas `login.html` e `registro.html` conectadas com a API, salvando o token retornado no `localStorage`.

### 👤 Diego & Elian

- [ ] Criar as tabelas de categorias e produtos no script SQL.
- [ ] Implementar o endpoint público `GET /api/products` em PHP com busca por nome, filtro por categoria e paginação SQL (`LIMIT`/`OFFSET`).
- [ ] Desenvolver o código JS para renderizar dinamicamente os cards de produtos do Bootstrap na `index.html`.

---

## 🛒 Sprint 2: Carrinho sem Login e Painel do Administrador

> **Objetivo:** Permitir que visitantes naveguem e montem um carrinho sem login, e liberar a gestão de produtos e categorias para administradores.

### 👤 Bruno

- [ ] Criar as tabelas `carrinhos` e `itens_carrinho` no banco de dados.
- [ ] Implementar os endpoints de carrinho (`GET /api/cart`, `POST /api/cart/items`, `PATCH` e `DELETE`).
- [ ] Desenvolver a lógica do token opaco de visitante para identificar o carrinho no banco antes do login.
- [ ] Criar a página `carrinho.html` exibindo os itens, subtotais e valor total (sempre calculados pelo servidor).

### 👤 Elian & Diego

- [ ] Implementar os endpoints administrativos `POST/PUT/DELETE /api/admin/products` e `/api/admin/categories` em PHP.
- [ ] Bloquear o acesso de usuários comuns (não-admin) a esses endpoints, retornando erro HTTP 403.
- [ ] Criar a interface `admin/painel.html` com tabelas Bootstrap e modais para criar, editar e desativar produtos/categorias.

### 👤 Tech Lead & Mariana

- [ ] Validar a integração JS das telas administrativas.
- [ ] Padronizar o estilo dos alertas e mensagens de feedback do Bootstrap em todas as telas ativas.

---

## 💳 Sprint 3: Fusão do Carrinho, Checkout e Pedidos

> **Objetivo:** Executar a fusão do carrinho ao logar, permitir a finalização da compra com baixa de estoque e simular o pagamento.

### 👤 Bruno, Rogger & Tech Lead

- [ ] Implementar no PHP a regra de fusão do carrinho: ao autenticar, mesclar os itens do carrinho de visitante ao carrinho da conta e invalidar o token de visitante.
- [ ] Ajustar a requisição de login no JS para enviar o token do visitante e atualizar o contador do carrinho na Navbar.

### 👤 Gustavo

- [ ] Criar as tabelas `pedidos`, `itens_pedido` e `enderecos` no script SQL.
- [ ] Implementar o endpoint `POST /api/orders` utilizando transação no banco (`$pdo->beginTransaction()`) para validar/decrementar estoque e congelar os preços praticados.
- [ ] Implementar os endpoints de pagamento simulado (`POST /api/orders/{id}/pay`) e cancelamento de pedido (`POST /api/orders/{id}/cancel` com devolução de estoque).

### 👤 Mariana & Gustavo

- [ ] Criar a página `checkout.html` para preenchimento/seleção de endereço e revisão dos itens.
- [ ] Criar a página `meus-pedidos.html` para listagem e detalhamento das compras do cliente com ação de pagamento simulado.

---

## 🧪 Sprint 4: Docker, Seeders, QA e Polimento

> **Objetivo:** Garantir a entrega sem erros, preparar o ambiente Docker e validar todas as regras do projeto.

### 👤 Tech Lead

- [ ] Criar o arquivo `compose.yaml` para subir a API PHP, a aplicação Frontend e o banco de dados com um único comando.
- [ ] Escrever o script SQL com os Seeders obrigatórios:
  - [ ] 1 usuário administrador e 3 clientes cadastrados.
  - [ ] 3 categorias e pelo menos 30 produtos variados.
  - [ ] Produtos de teste: pelo menos 1 sem estoque (quantidade 0) e 1 inativo.
  - [ ] Carrinhos e pedidos populados em status diferentes (aguardando pagamento, pago, enviado, entregue e cancelado).

### 👥 Toda a Equipe (Garantia de Qualidade / QA em Duplas)

- [ ] Executar o fluxo completo em janela anônima: navegar sem login $\rightarrow$ adicionar ao carrinho $\rightarrow$ fazer login $\rightarrow$ verificar fusão $\rightarrow$ realizar checkout $\rightarrow$ confirmar pagamento simulado $\rightarrow$ consultar status no painel do admin.
- [ ] Remover da interface qualquer elemento sem funcionamento (ex: botões de frete por CEP ou campos de cupom não validados).
