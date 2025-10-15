# backend/Dockerfile
FROM webdevops/php-nginx:8.3-alpine

# Рабочая директория и document root
WORKDIR /app
ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_ENV=production
ENV APP_DEBUG=false

# Системные пакеты и PHP-расширения (Alpine → apk)
RUN apk add --no-cache \
      git unzip bash icu-dev libzip-dev oniguruma-dev \
      freetype-dev libpng-dev libjpeg-turbo-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo_mysql zip intl mbstring bcmath gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

# Сначала — только composer.* (кеш слоёв)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Затем — остальной код
COPY . .

# Права на storage/bootstrap/cache
RUN mkdir -p storage bootstrap/cache \
 && chown -R application:application storage bootstrap/cache \
 && chmod -R ug+rwx storage bootstrap/cache

# Artisan discover (если .env ещё нет — не падаем)
RUN php artisan package:discover --ansi || true

# Порт Render передаёт сам, супервизор стартует Nginx+PHP-FPM
CMD bash -lc "php artisan config:cache || true && php artisan route:cache || true && php artisan view:cache || true && supervisord"
