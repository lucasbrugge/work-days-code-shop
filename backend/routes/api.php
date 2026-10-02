<?php




require_once __DIR__ . '/Router.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/database.php';

require_once __DIR__ . '/../controllers/NotImplementedController.php';
require_once __DIR__ . '/../controllers/HealthController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/CartController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/AddressController.php';

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/AdminMiddleware.php';

$router = new Router();

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/health',
    function (): never {
        jsonResponse([
            'message' => 'API funcionando'
        ]);
    }
);

$router->get(
    '/api/health/db',
    fn() => HealthController::database()
);

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/auth/register',
    fn() => AuthController::register()
);

$router->post(
    '/api/auth/login',
    fn() => AuthController::login()
);

$router->post(
    '/api/auth/logout',
    fn() => AuthController::logout(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/auth/me',
    fn() => AuthController::me(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/profile',
    fn() => NotImplementedController::handle(
        'GET /api/profile'
    ),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->put(
    '/api/profile',
    fn() => NotImplementedController::handle(
        'PUT /api/profile'
    ),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| ADDRESSES
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/addresses',
    fn() => AddressController::index(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/addresses',
    fn() => AddressController::store(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->put(
    '/api/addresses/{id}',
    fn($id) => AddressController::update($id),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->delete(
    '/api/addresses/{id}',
    fn($id) => AddressController::destroy($id),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/products',
    fn() => ProductController::index()
);

$router->get(
    '/api/products/{id}',
    fn($id) => ProductController::show($id)
);

/*
|--------------------------------------------------------------------------
| ADMIN - PRODUCTS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/admin/products',
    fn() => ProductController::adminIndex(),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

$router->get(
    '/api/admin/products/{id}',
    fn($id) => ProductController::adminShow($id),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

$router->post(
    '/api/admin/products',
    fn() => ProductController::store(),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

$router->put(
    '/api/admin/products/{id}',
    fn($id) => ProductController::update($id),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

$router->delete(
    '/api/admin/products/{id}',
    fn($id) => ProductController::destroy($id),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/categories',
    function () {
        try {
            $stmt = Database::getConnection()->query('SELECT id, name, slug FROM categories ORDER BY id ASC');
            jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Throwable $e) {
            jsonResponse('Erro ao listar categorias: ' . $e->getMessage(), 500);
        }
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN - CATEGORIES
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/admin/categories',
    fn() => NotImplementedController::handle(
        'POST /api/admin/categories'
    )
);

$router->put(
    '/api/admin/categories/{id}',
    fn($id) => NotImplementedController::handle(
        "PUT /api/admin/categories/{$id}"
    )
);

$router->delete(
    '/api/admin/categories/{id}',
    fn($id) => NotImplementedController::handle(
        "DELETE /api/admin/categories/{$id}"
    )
);

/*
|--------------------------------------------------------------------------
| CART
|--------------------------------------------------------------------------
*/
$router->get(
    '/api/cart',
    fn() => CartController::index()
);
$router->post(
    '/api/cart/items',
    fn() => CartController::store()
);

$router->patch(
    '/api/cart/items/{id}',
    fn($id) => CartController::update((int) $id)
);

$router->delete(
    '/api/cart/items/{id}',
    fn($id) => CartController::destroy((int) $id)
);

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

$router->post(
    '/api/orders',
    fn() => OrderController::store(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/orders',
    fn() => OrderController::index(),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->get(
    '/api/orders/{id}',
    fn($id) => OrderController::show($id),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/orders/{id}/pay',
    fn($id) => OrderController::pay($id),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

$router->post(
    '/api/orders/{id}/cancel',
    fn($id) => OrderController::cancel($id),
    [
        fn() => AuthMiddleware::requireAuth()
    ]
);

/*
|--------------------------------------------------------------------------
| ADMIN - ORDERS
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/admin/orders',
    fn() => OrderController::adminIndex(),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

$router->patch(
    '/api/admin/orders/{id}/status',
    fn($id) => OrderController::adminUpdateStatus($id),
    [
        fn() => AuthMiddleware::requireAuth(),
        fn() => AdminMiddleware::requireAdmin(
            AuthMiddleware::user() ?? []
        )
    ]
);

/*
|--------------------------------------------------------------------------
| DISPATCH
|--------------------------------------------------------------------------
*/

$method = $_SERVER['REQUEST_METHOD'];

$uri = parse_url(
    $_SERVER['REQUEST_URI'],
    PHP_URL_PATH
);

$router->dispatch($method, $uri);
