work-days-code-shop/
├── backend/                     # API REST em PHP
│   ├── config/database.php      # Conexão PDO com MySQL/PostgreSQL
│   ├── controllers/             # Recebem requisições e retornam JSON
│   ├── models/                  # Consultas e manipulação do banco de dados
│   ├── services/                # Regras de negócio (Carrinho, Estoque, Pedidos)
│   ├── sql/schema.sql           # Migrações e Seeders de banco
│   └── index.php                # Roteador básico da API
│
├── frontend/                    # Cliente desacoplado
│   ├── index.html               # Vitrine e catálogo público
│   ├── produto.html             # Detalhe do produto
│   ├── carrinho.html            # Gestão do carrinho
│   ├── checkout.html            # Finalização de compra
│   ├── login.html               # Login e Cadastro
│   ├── meus-pedidos.html        # Histórico do cliente
│   ├── admin/painel.html        # Painel administrativo
│   └── js/                      # Lógica do lado do cliente
│       ├── api.js               # Cliente Fetch global (Tech Lead)
│       ├── auth.js              # Token e estado da sessão
│       ├── carrinho.js          # Ações do carrinho
│       └── produtos.js          # Renderização de cards e filtros
│
└── compose.yaml                 # Dockerização única do projeto[cite: 1]

