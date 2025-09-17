# docker/php/Dockerfile
FROM php:8.3-fpm

# Пакеты и PHP-расширения, нужные Laravel
RUN apt-get update && apt-get install -y --no-install-recommends \
    git zip unzip libzip-dev \
 && docker-php-ext-install pdo pdo_mysql zip \
 && rm -rf /var/lib/apt/lists/*

# Composer внутри контейнера (удобно)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
