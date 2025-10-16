#!/bin/sh
# Выполняется на старте контейнера (hook образа webdevops/php-nginx).
# Цель: гарантированно почистить и пересобрать кэши, создать папки и права.
# ВАЖНО: НЕ кэшируем роуты (route:cache), т.к. есть Closure-маршруты.

set -e

APP_DIR="/app"

# Если почему-то нет artisan — тихо выходим
if [ ! -f "$APP_DIR/artisan" ]; then
  exit 0
fi

# 1) Папки и права
mkdir -p \
  "$APP_DIR/storage/logs" \
  "$APP_DIR/storage/framework/cache" \
  "$APP_DIR/storage/framework/data" \
  "$APP_DIR/storage/framework/sessions" \
  "$APP_DIR/storage/framework/testing" \
  "$APP_DIR/storage/framework/views" \
  "$APP_DIR/bootstrap/cache"

# пользователь "application" — дефолт в webdevops/php-nginx
chown -R application:application "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true
chmod -R ug+rwX                  "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true

# 2) Полная очистка кэшей
php "$APP_DIR/artisan" optimize:clear || true
rm -f "$APP_DIR/bootstrap/cache/"*.php || true

# 3) Пересборка безопасных кэшей и полезные штуки
php "$APP_DIR/artisan" package:discover --ansi || true
php "$APP_DIR/artisan" config:cache            || true
php "$APP_DIR/artisan" event:cache             || true
php "$APP_DIR/artisan" view:cache              || true
php "$APP_DIR/artisan" storage:link            || true

# 4) Миграции (мягко — не валим контейнер, если БД временно недоступна)
php "$APP_DIR/artisan" migrate --force --no-interaction || true

# Без artisan down/up, чтобы не ловить 503 во время прогрева.
