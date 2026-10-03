# work-days-code-shop

E-commerce acadêmico desenvolvido em equipe com PHP puro, MVC simplificado, API REST e MySQL.

## Estrutura do projeto

- `backend/`: API PHP. Controllers recebem requisições, services concentram as regras de negócio, models acessam o MySQL e routes registram os endpoints.
- `frontend/public/`: raiz pública servida pelo Apache. `index.html` é a página inicial; `pages/` guarda as telas da loja, `scripts/` os scripts compartilhados e `admin/` concentra o painel administrativo.
- `database/`: schema e dados locais de demonstração.
- `docs/`: documentação, planejamento e arquivos de apoio.
- `scripts/`: comandos auxiliares do projeto, incluindo o teste de autenticação.
- `compose.yaml`: configuração dos serviços Docker.

Edite as páginas e os recursos do site dentro de `frontend/public/`. O Docker não serve arquivos que fiquem diretamente em `frontend/`.

## Inicialização local

Crie o arquivo de ambiente usado pelo Docker Compose e preencha as credenciais do MySQL:

```bash
cp .env.example .env
```

O Compose monta `database/schema.sql` e `database/seeder.sql` na inicialização de um volume MySQL vazio. Consulte a seção abaixo para reaplicar os dados de demonstração em um banco existente.

Regras de commits: https://www.conventionalcommits.org/pt-br/v1.0.0-beta.4/

## Dados locais de demonstração

O `database/seeder.sql` cria contas, categorias, produtos, endereços, carrinhos e pedidos para desenvolvimento. As credenciais padrão são:

- Administrador: `admin@workdays.com` / `Admin123!`
- Clientes: `cliente1@workdays.com`, `cliente2@workdays.com` ou `cliente3@workdays.com` / `Cliente123!`

O MySQL do Docker executa os scripts de `docker-entrypoint-initdb.d` somente quando inicializa um volume vazio. Em um volume já existente, execute `database/seeder.sql` manualmente para aplicar ou atualizar esses dados de demonstração. O script pode ser reaplicado sem duplicar os registros criados por ele.

## Testes de autenticação

O projeto possui um teste de integração para validar os principais fluxos de autenticação e autorização da API, incluindo:

- cadastro de usuário;
- login;
- geração e validação de token;
- acesso ao perfil;
- autorização de cliente e administrador;
- logout;
- invalidação do token após logout.

### Pré-requisitos

Os containers do projeto precisam estar em execução:

```bash
docker compose up -d
./scripts/test-auth.sh
```
