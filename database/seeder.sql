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
    '$2y$12$8Q2bWiEHXW4SGKW600IN3uPpisScK52n5HGZ584TyNpBXUmDMWj6K',
    'customer'
);

INSERT INTO categories
    (name, slug)
VALUES
    ('Vinil', 'vinil'),
    ('CD', 'cd'),
    ('Cassete', 'cassete');

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
        'Pink Floyd - The Dark Side of the Moon',
        'Álbum clássico do Pink Floyd em formato vinil.',
        189.90,
        10,
        NULL,
        TRUE
    ),
    (
        1,
        'Michael Jackson - Thriller',
        'Um dos álbuns mais conhecidos de Michael Jackson em vinil.',
        159.90,
        8,
        NULL,
        TRUE
    ),
    (
        2,
        'Nirvana - Nevermind',
        'Álbum Nevermind da banda Nirvana em CD.',
        59.90,
        15,
        NULL,
        TRUE
    ),
    (
        2,
        'The Beatles - Abbey Road',
        'Álbum Abbey Road dos Beatles em CD.',
        69.90,
        12,
        NULL,
        TRUE
    ),
    (
        3,
        'Metallica - Master of Puppets',
        'Álbum Master of Puppets em fita cassete.',
        89.90,
        5,
        NULL,
        TRUE
    ),
    (
        3,
        'Legião Urbana - Dois',
        'Álbum Dois da Legião Urbana em fita cassete.',
        49.90,
        0,
        NULL,
        TRUE
    ),
    (
        1,
        'Produto Inativo - Teste',
        'Produto utilizado para testar a desativação do catálogo.',
        99.90,
        10,
        NULL,
        FALSE
    );