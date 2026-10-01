<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

$pdo = Database::getConnection();

$userModel = new User($pdo);

var_dump(
    $userModel->emailExists(
        'admin@workdays.com'
    )
);

var_dump(
    $userModel->emailExists(
        'naoexiste@workdays.com'
    )
);