<?php

class Router
{
    private array $routes = [];

    public function get(
        string $path,
        callable $handler,
        array $middleware = []
    ): void {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(
        string $path,
        callable $handler,
        array $middleware = []
    ): void {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(
        string $path,
        callable $handler,
        array $middleware = []
    ): void {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function patch(
        string $path,
        callable $handler,
        array $middleware = []
    ): void {
        $this->add('PATCH', $path, $handler, $middleware);
    }

    public function delete(
        string $path,
        callable $handler,
        array $middleware = []
    ): void {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    private function add(
        string $method,
        string $path,
        callable $handler,
        array $middleware
    ): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }

    public function dispatch(
        string $method,
        string $uri
    ): void {
        foreach ($this->routes as $route) {

            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = preg_replace(
                '#\{[^}]+\}#',
                '([^/]+)',
                $route['path']
            );

            $pattern = '#^' . $pattern . '$#';

            if (!preg_match($pattern, $uri, $matches)) {
                continue;
            }

            array_shift($matches);

            foreach ($route['middleware'] as $middleware) {
                $middleware();
            }

            ($route['handler'])(...$matches);

            return;
        }

        jsonResponse('Rota não encontrada', 404);
    }
}
