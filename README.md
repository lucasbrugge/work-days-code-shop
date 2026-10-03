# work-days-code-shop

E-commerce acadêmico desenvolvido em equipe com PHP puro, MVC simplificado, API REST e MySQL.

MVC simplificado.

regras de commits: https://www.conventionalcommits.org/pt-br/v1.0.0-beta.4/

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

basta rodar ./scripts/test-auth.sh na raiz do projeto ( work-days-code-shop)
