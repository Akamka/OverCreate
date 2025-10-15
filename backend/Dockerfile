# backend/Dockerfile
FROM webdevops/php-nginx:8.3-alpine

# Рабочая директория и document root
WORKDIR /app
ENV WEB_DOCUMENT_ROOT=/app/public \
    APP_ENV=production \
    APP_DEBUG=false

# Системные пакеты и PHP-расширения
RUN apk add --no-cache \
      git unzip bash tzdata icu-dev libzip-dev oniguruma-dev \
      freetype-dev libpng-dev libjpeg-turbo-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" pdo_mysql zip intl mbstring bcmath gd opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

# Сначала только composer.* (кеш слоёв)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Потом весь код приложения
COPY . .

# Права на storage и cache
RUN mkdir -p storage bootstrap/cache \
 && chown -R application:application storage bootstrap/cache \
 && chmod -R ug+rwx storage bootstrap/cache

# Hook: команды artisan при старте контейнера (после подхвата ENV от Render)
# Не генерируем APP_KEY автоматически (сделаешь вручную), ошибки игнорируем.
RUN printf '#!/bin/sh\n'                                  >  /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && printf 'php artisan package:discover --ansi || true\n' >> /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && printf 'php artisan config:cache      || true\n'       >> /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && printf 'php artisan route:cache       || true\n'       >> /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && printf 'php artisan view:cache        || true\n'       >> /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && printf 'php artisan storage:link      || true\n'       >> /opt/docker/provision/entrypoint.d/99-artisan.sh \
 && chmod +x /opt/docker/provision/entrypoint.d/99-artisan.sh

# ВАЖНО: не переопределяем CMD — дефолтный entrypoint образа сам стартует supervisord (nginx+php-fpm).
