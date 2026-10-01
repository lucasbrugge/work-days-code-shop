<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../validators/AuthValidator.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../core/Response.php';

$pdo = Database::getConnection();

$userModel = new User($pdo);

$authService = new AuthService($userModel);

$authController = new AuthController(
    $authService
);

$data = [
    'name' => 'Ro',
    'email' => 'email-invalido',
    'password' => '123',
    'password_confirmation' => '456'
];

$authController->register($data);