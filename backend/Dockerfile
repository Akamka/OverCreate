# Dockerfile (для Render)
FROM webdevops/php-nginx:8.3-alpine

# Рабочая директория и document root
WORKDIR /app
ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_ENV=production
ENV APP_DEBUG=false

# Ставим нужные расширения для Laravel + MySQL
RUN apk add --no-cache git unzip icu-dev libzip-dev oniguruma-dev \
 && docker-php-ext-install intl pdo pdo_mysql zip opcache

# Composer внутри контейнера
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Копируем composer.* отдельно для cache layer
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Копируем приложение
COPY . .

# Симлинк на storage, очистка кешей (ошибки игнорируем, если .env ещё нет)
RUN php artisan storage:link || true \
 && php artisan config:clear || true \
 && php artisan route:clear || true \
 && php artisan view:clear || true

# На старте прогреем кеши (если ENV уже есть), затем запустим supervisor (nginx+php-fpm)
CMD bash -lc "php artisan config:cache || true && php artisan route:cache || true && php artisan view:cache || true && supervisord"
