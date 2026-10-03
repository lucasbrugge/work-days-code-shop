#!/usr/bin/env bash

set -e

echo "========================="
echo " Testes de carrinho"
echo "========================="

docker compose exec backend php tests/test_cart_api.php
