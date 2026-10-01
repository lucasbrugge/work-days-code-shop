<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/AuthService.php';

$pdo = Database::getConnection();

$userModel = new User($pdo);

$authService = new AuthService($userModel);

$result = $authService->login(
    'ninguem@workdays.com',
    '12345678'
);

print_r($result);