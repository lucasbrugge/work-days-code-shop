FROM php:8.3-cli

WORKDIR /app

RUN docker-php-ext-install pdo pdo_mysql

COPY . .

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public", "public/index.php"]