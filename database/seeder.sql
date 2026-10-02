-- Fixture local de desenvolvimento. Credenciais:
-- Admin: admin@workdays.com / Admin123!
-- Clientes: cliente1@workdays.com, cliente2@workdays.com ou cliente3@workdays.com / Cliente123!
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE work_days;

INSERT INTO users (name, email, password_hash, role) VALUES
    ('Administradora de Demonstração', 'admin@workdays.com', '$2y$12$uR4egV.gsX7ad3J6QNfLte.ALpDuxB5xP5k6G3pejvKjLsNoXzVMu', 'admin'),
    ('Cliente de Demonstração 1', 'cliente1@workdays.com', '$2y$12$8k9bIJ5tAMZYyvoU5VlRdeObUmYzjPZpwFYlx0nCZMRtjjeRvBe7y', 'customer'),
    ('Cliente de Demonstração 2', 'cliente2@workdays.com', '$2y$12$8k9bIJ5tAMZYyvoU5VlRdeObUmYzjPZpwFYlx0nCZMRtjjeRvBe7y', 'customer'),
    ('Cliente de Demonstração 3', 'cliente3@workdays.com', '$2y$12$8k9bIJ5tAMZYyvoU5VlRdeObUmYzjPZpwFYlx0nCZMRtjjeRvBe7y', 'customer')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role);

INSERT INTO categories (name, slug) VALUES
    ('Vinil', 'vinil'),
    ('CD', 'cd'),
    ('Cassete', 'cassete')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    slug = VALUES(slug);

DROP TEMPORARY TABLE IF EXISTS seed_products;
CREATE TEMPORARY TABLE seed_products (
    category_slug VARCHAR(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    name VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    price DECIMAL(10,2) NOT NULL,
    stock INT UNSIGNED NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO seed_products (category_slug, name, description, price, stock, is_active) VALUES
    ('vinil', 'Pink Floyd - The Dark Side of the Moon', 'Edição em vinil do álbum clássico do Pink Floyd.', 189.90, 10, TRUE),
    ('vinil', 'Michael Jackson - Thriller', 'Clássico pop em vinil, com encarte ilustrado.', 159.90, 8, TRUE),
    ('vinil', 'Queen - A Night at the Opera (Vinil)', 'Álbum marcante do Queen em edição de vinil.', 179.90, 7, TRUE),
    ('vinil', 'Fleetwood Mac - Rumours (Vinil)', 'Edição remasterizada em vinil de 180 gramas.', 169.90, 6, TRUE),
    ('vinil', 'David Bowie - Heroes (Vinil)', 'Álbum de David Bowie em formato LP.', 149.90, 5, TRUE),
    ('vinil', 'Legião Urbana - Dois', 'Rock brasileiro em edição especial de vinil.', 139.90, 4, TRUE),
    ('vinil', 'Clube da Esquina - Milton Nascimento (Vinil)', 'Álbum brasileiro em vinil, com repertório clássico.', 199.90, 3, TRUE),
    ('vinil', 'Chico Buarque - Construção (Vinil)', 'Edição em vinil do álbum de Chico Buarque.', 129.90, 9, TRUE),
    ('vinil', 'Elis Regina - Falso Brilhante (Vinil)', 'Registro histórico da música brasileira em LP.', 119.90, 5, TRUE),
    ('vinil', 'Tim Maia - Racional (Vinil)', 'Soul brasileiro em edição de vinil.', 189.90, 2, TRUE),
    ('vinil', 'The Cure - Disintegration (Vinil)', 'Álbum alternativo em vinil duplo.', 219.90, 4, TRUE),
    ('vinil', 'Miles Davis - Kind of Blue (Vinil)', 'Jazz clássico em edição de vinil.', 159.90, 6, TRUE),
    ('cd', 'Nirvana - Nevermind', 'Álbum Nevermind da banda Nirvana em CD.', 59.90, 15, TRUE),
    ('cd', 'The Beatles - Abbey Road', 'Edição em CD do álbum Abbey Road.', 69.90, 12, TRUE),
    ('cd', 'Daft Punk - Discovery (CD)', 'Música eletrônica em edição de CD.', 54.90, 8, TRUE),
    ('cd', 'Amy Winehouse - Back to Black (CD)', 'Álbum de Amy Winehouse em CD.', 49.90, 10, TRUE),
    ('cd', 'Radiohead - OK Computer (CD)', 'Edição remasterizada em CD.', 64.90, 7, TRUE),
    ('cd', 'Marisa Monte - Verde, Anil, Amarelo, Cor-de-Rosa e Carvão (CD)', 'Álbum de Marisa Monte em CD.', 44.90, 5, TRUE),
    ('cd', 'Sepultura - Roots (CD)', 'Metal brasileiro em edição de CD.', 49.90, 4, TRUE),
    ('cd', 'Milton Nascimento - Travessia (CD)', 'Seleção de canções de Milton Nascimento em CD.', 39.90, 0, TRUE),
    ('cd', 'Adele - 21 (CD)', 'Álbum de Adele em edição de CD.', 42.90, 11, TRUE),
    ('cd', 'Caetano Veloso - Transa (CD)', 'Álbum de Caetano Veloso em CD.', 54.90, 3, TRUE),
    ('cd', 'Produto Inativo - Teste', 'Produto de demonstração para testar itens inativos.', 99.90, 10, FALSE),
    ('cassete', 'Metallica - Master of Puppets', 'Álbum Master of Puppets em fita cassete.', 89.90, 5, TRUE),
    ('cassete', 'Legião Urbana - Que País É Este (Cassete)', 'Rock brasileiro em edição de fita cassete.', 69.90, 6, TRUE),
    ('cassete', 'Os Paralamas do Sucesso - Selvagem? (Cassete)', 'Álbum dos Paralamas em fita cassete.', 64.90, 4, TRUE),
    ('cassete', 'Racionais MCs - Sobrevivendo no Inferno (Cassete)', 'Hip-hop brasileiro em edição de fita cassete.', 79.90, 3, TRUE),
    ('cassete', 'Madonna - Like a Prayer (Cassete)', 'Álbum pop em fita cassete.', 59.90, 7, TRUE),
    ('cassete', 'Cazuza - Ideologia (Cassete)', 'Rock brasileiro em fita cassete.', 54.90, 2, TRUE),
    ('cassete', 'New Order - Power, Corruption & Lies (Cassete)', 'Edição de colecionador em fita cassete.', 74.90, 3, TRUE),
    ('cassete', 'Gal Costa - Índia (Cassete)', 'Música brasileira em edição de fita cassete.', 49.90, 5, TRUE);

UPDATE products p
INNER JOIN seed_products s ON p.name = s.name
INNER JOIN categories c ON c.slug = s.category_slug
SET p.category_id = c.id,
    p.description = s.description,
    p.price = s.price,
    p.stock = s.stock,
    p.is_active = s.is_active;

INSERT INTO products (category_id, name, description, price, stock, is_active)
SELECT c.id, s.name, s.description, s.price, s.stock, s.is_active
FROM seed_products s
INNER JOIN categories c ON c.slug = s.category_slug
WHERE NOT EXISTS (
    SELECT 1 FROM products p WHERE p.name = s.name
);

DROP TEMPORARY TABLE seed_products;

INSERT INTO addresses (user_id, street, number, complement, neighborhood, city, state, zip_code)
SELECT u.id, 'Rua das Mídias', '101', NULL, 'Centro', 'Curitiba', 'PR', '80010-000'
FROM users u
WHERE u.email = 'cliente1@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.street = 'Rua das Mídias' AND a.number = '101');

INSERT INTO addresses (user_id, street, number, complement, neighborhood, city, state, zip_code)
SELECT u.id, 'Avenida do Vinil', '202', 'Apto 4', 'Botafogo', 'Rio de Janeiro', 'RJ', '22250-040'
FROM users u
WHERE u.email = 'cliente2@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.street = 'Avenida do Vinil' AND a.number = '202');

INSERT INTO addresses (user_id, street, number, complement, neighborhood, city, state, zip_code)
SELECT u.id, 'Rua da Música', '303', NULL, 'Pinheiros', 'São Paulo', 'SP', '05422-000'
FROM users u
WHERE u.email = 'cliente3@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.street = 'Rua da Música' AND a.number = '303');

INSERT INTO carts (user_id, status)
SELECT u.id, 'active'
FROM users u
WHERE u.email IN ('cliente1@workdays.com', 'cliente2@workdays.com')
  AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id AND c.status = 'active');

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 1
FROM users u
INNER JOIN carts c ON c.user_id = u.id AND c.status = 'active'
INNER JOIN products p ON p.name = 'Pink Floyd - The Dark Side of the Moon'
WHERE u.email = 'cliente1@workdays.com'
  AND c.id = (SELECT MIN(c2.id) FROM carts c2 WHERE c2.user_id = u.id AND c2.status = 'active')
  AND NOT EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id AND ci.product_id = p.id);

INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT c.id, p.id, 2
FROM users u
INNER JOIN carts c ON c.user_id = u.id AND c.status = 'active'
INNER JOIN products p ON p.name = 'Nirvana - Nevermind'
WHERE u.email = 'cliente1@workdays.com'
  AND c.id = (SELECT MIN(c2.id) FROM carts c2 WHERE c2.user_id = u.id AND c2.status = 'active')
  AND NOT EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id AND ci.product_id = p.id);

-- Pedidos de demonstração em todos os estados do fluxo.
INSERT INTO orders (user_id, address_id, shipping_street, shipping_number, shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_zip_code, status, subtotal, shipping, total, paid_at, created_at)
SELECT u.id, a.id, a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zip_code,
       'pending_payment', 59.90, 24.90, 84.80, NULL, '2026-09-01 10:00:00'
FROM users u INNER JOIN addresses a ON a.user_id = u.id AND a.street = 'Rua das Mídias' AND a.number = '101'
WHERE u.email = 'cliente1@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'pending_payment' AND o.created_at = '2026-09-01 10:00:00');

INSERT INTO orders (user_id, address_id, shipping_street, shipping_number, shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_zip_code, status, subtotal, shipping, total, paid_at, created_at)
SELECT u.id, a.id, a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zip_code,
       'paid', 69.90, 24.90, 94.80, '2026-09-02 12:00:00', '2026-09-02 11:00:00'
FROM users u INNER JOIN addresses a ON a.user_id = u.id AND a.street = 'Avenida do Vinil' AND a.number = '202'
WHERE u.email = 'cliente2@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid' AND o.created_at = '2026-09-02 11:00:00');

INSERT INTO orders (user_id, address_id, shipping_street, shipping_number, shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_zip_code, status, subtotal, shipping, total, paid_at, created_at)
SELECT u.id, a.id, a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zip_code,
       'shipped', 49.90, 24.90, 74.80, '2026-09-03 12:00:00', '2026-09-03 11:00:00'
FROM users u INNER JOIN addresses a ON a.user_id = u.id AND a.street = 'Rua da Música' AND a.number = '303'
WHERE u.email = 'cliente3@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'shipped' AND o.created_at = '2026-09-03 11:00:00');

INSERT INTO orders (user_id, address_id, shipping_street, shipping_number, shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_zip_code, status, subtotal, shipping, total, paid_at, created_at)
SELECT u.id, a.id, a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zip_code,
       'delivered', 89.90, 24.90, 114.80, '2026-09-04 12:00:00', '2026-09-04 11:00:00'
FROM users u INNER JOIN addresses a ON a.user_id = u.id AND a.street = 'Rua das Mídias' AND a.number = '101'
WHERE u.email = 'cliente1@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'delivered' AND o.created_at = '2026-09-04 11:00:00');

INSERT INTO orders (user_id, address_id, shipping_street, shipping_number, shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_zip_code, status, subtotal, shipping, total, paid_at, created_at)
SELECT u.id, a.id, a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.zip_code,
       'cancelled', 54.90, 24.90, 79.80, NULL, '2026-09-05 11:00:00'
FROM users u INNER JOIN addresses a ON a.user_id = u.id AND a.street = 'Avenida do Vinil' AND a.number = '202'
WHERE u.email = 'cliente2@workdays.com'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'cancelled' AND o.created_at = '2026-09-05 11:00:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT o.id, p.id, p.name, p.price, 1, p.price
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.name = 'Nirvana - Nevermind'
WHERE u.email = 'cliente1@workdays.com' AND o.status = 'pending_payment' AND o.created_at = '2026-09-01 10:00:00'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT o.id, p.id, p.name, p.price, 1, p.price
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.name = 'The Beatles - Abbey Road'
WHERE u.email = 'cliente2@workdays.com' AND o.status = 'paid' AND o.created_at = '2026-09-02 11:00:00'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT o.id, p.id, p.name, p.price, 1, p.price
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.name = 'Amy Winehouse - Back to Black (CD)'
WHERE u.email = 'cliente3@workdays.com' AND o.status = 'shipped' AND o.created_at = '2026-09-03 11:00:00'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT o.id, p.id, p.name, p.price, 1, p.price
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.name = 'Metallica - Master of Puppets'
WHERE u.email = 'cliente1@workdays.com' AND o.status = 'delivered' AND o.created_at = '2026-09-04 11:00:00'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT o.id, p.id, p.name, p.price, 1, p.price
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN products p ON p.name = 'Daft Punk - Discovery (CD)'
WHERE u.email = 'cliente2@workdays.com' AND o.status = 'cancelled' AND o.created_at = '2026-09-05 11:00:00'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id);
