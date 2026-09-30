USE work_days;

INSERT INTO users
    (name, email, password_hash, role)
VALUES
(
    'Administrador',
    'admin@workdays.com',
    '$2y$12$ZWb4LZ5jvfAi7wWImz7QrOJs4IVaDqmLf2EWUNZ9/QIsRZGckTTeW',
    'admin'
),
(
    'Cliente Teste',
    'cliente@workdays.com',
    '$2y$12$8Q2WiEHXW4SGKW600IN3uPpisScK52n5HGZ584TyNpBXUmDMWj6K',
    'customer'
);

INSERT INTO categories
    (name, slug)
VALUES
    ('Eletrônicos', 'eletronicos'),
    ('Periféricos', 'perifericos'),
    ('Acessórios', 'acessorios');

INSERT INTO products
    (
        category_id,
        name,
        description,
        price,
        stock,
        image_url,
        is_active
    )
VALUES
    (
        1,
        'Notebook Pro',
        'Notebook para desenvolvimento',
        4500.00,
        10,
        NULL,
        TRUE
    ),
    (
        2,
        'Teclado Mecânico',
        'Teclado mecânico RGB',
        299.90,
        20,
        NULL,
        TRUE
    ),
    (
        2,
        'Mouse Gamer',
        'Mouse óptico',
        149.90,
        15,
        NULL,
        TRUE
    ),
    (
        3,
        'Mousepad',
        'Mousepad grande',
        89.90,
        30,
        NULL,
        TRUE
    ),
    (
        1,
        'Produto Sem Estoque',
        'Produto para teste',
        100.00,
        0,
        NULL,
        TRUE
    ),
    (
        1,
        'Produto Inativo',
        'Produto para teste de inatividade',
        200.00,
        10,
        NULL,
        FALSE
    );