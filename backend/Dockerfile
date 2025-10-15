# backend/Dockerfile
FROM php:8.3-cli
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libicu-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) pdo_mysql zip intl mbstring bcmath gd \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html

# теперь без backend/
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# копируем весь код (тоже без backend/)
COPY . ./

RUN mkdir -p storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R ug+rwx storage bootstrap/cache

RUN php artisan package:discover --ansi || true

ENV PORT=8080
EXPOSE 8080
CMD ["bash", "-lc", "php -d variables_order=EGPCS -S 0.0.0.0:${PORT} -t public public/index.php"]
