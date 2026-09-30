FROM php:8.3-cli

WORKDIR /app

COPY public/ public/
COPY routes/ routes/
COPY config/ config/

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public", "public/index.php"]