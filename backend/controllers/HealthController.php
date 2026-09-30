<?php

require_once __DIR__ . '/../config/database.php';

class HealthController
{
    public static function database(): never
    {
        try {
            $pdo = Database::getConnection();

            $stmt = $pdo->query('SELECT 1');

            jsonResponse([
                'message' => 'API e banco funcionando',
                'database' => $stmt->fetchColumn()
            ]);
        } catch (PDOException $e) {
            jsonResponse(
                'Erro ao conectar ao banco de dados',
                500
            );
        }
    }
}