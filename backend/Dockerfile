# backend/Dockerfile
FROM php:8.3-cli

ARG DEBIAN_FRONTEND=noninteractive

# Ставим системные зависимости и PHP-расширения, которые чаще всего нужны Laravel
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libicu-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) pdo_mysql zip intl mbstring bcmath gd \
 && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

WORKDIR /var/www/html

# Сначала тащим только composer.* — ускорит кеширование
COPY backend/composer.json backend/composer.lock ./

# Ставим зависимости без скриптов artisan (чтобы не падало во время build)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Теперь копируем весь код
COPY backend/ ./

# Права на storage и bootstrap/cache
RUN mkdir -p storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R ug+rwx storage bootstrap/cache

# Попытка package:discover — если что, не роняем билд (всё равно запустится на runtime)
RUN php artisan package:discover --ansi || true

# Render слушает $PORT
ENV PORT=8080
EXPOSE 8080

# Стартуем простой PHP сервер (без Nginx) из /public
CMD ["bash", "-lc", "php -d variables_order=EGPCS -S 0.0.0.0:${PORT} -t public public/index.php"]
