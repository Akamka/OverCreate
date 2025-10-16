# backend/Dockerfile
FROM webdevops/php-nginx:8.3-alpine

WORKDIR /app
ENV WEB_DOCUMENT_ROOT=/app/public \
    APP_ENV=production \
    APP_DEBUG=false

# Системные пакеты и расширения PHP
RUN apk add --no-cache \
      git unzip bash tzdata icu-dev libzip-dev oniguruma-dev \
      freetype-dev libpng-dev libjpeg-turbo-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" pdo_mysql zip intl mbstring bcmath gd opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

# Кэш слоёв: сначала composer.*
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Затем код приложения
COPY . .

# Папки и права
RUN set -eux; \
    mkdir -p storage bootstrap/cache \
             storage/framework/{cache,data,sessions,testing,views} \
             storage/logs; \
    chown -R application:application storage bootstrap/cache; \
    chmod -R ug+rwX storage bootstrap/cache

# Подключаем стартовый hook (webdevops сам исполняет всё в этой папке до запуска nginx/php-fpm)
COPY docker/entrypoint/99-artisan.sh /opt/docker/provision/entrypoint.d/99-artisan.sh
RUN chmod +x /opt/docker/provision/entrypoint.d/99-artisan.sh

# Важно: CMD/ENTRYPOINT не трогаем — их даёт базовый образ (supervisord с nginx+php-fpm)
