#!/usr/bin/env bash

set -e

echo "======================================"
echo " Testes de autenticação/autorização"
echo "======================================"

docker compose exec backend \
    php tests/test_auth_api.php

    