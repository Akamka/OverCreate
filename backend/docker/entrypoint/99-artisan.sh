#!/bin/sh
# Выполняется на старте контейнера (webdevops/php-nginx hook)

set -eu
APP_DIR="/app"

# Если по какой-то причине нет artisan — тихо выходим
[ -f "$APP_DIR/artisan" ] || exit 0

# Папки и права
mkdir -p \
  "$APP_DIR/storage/logs" \
  "$APP_DIR/storage/framework/cache" \
  "$APP_DIR/storage/framework/data" \
  "$APP_DIR/storage/framework/sessions" \
  "$APP_DIR/storage/framework/testing" \
  "$APP_DIR/storage/framework/views" \
  "$APP_DIR/bootstrap/cache"

chown -R application:application "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true
chmod -R ug+rwX                  "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true

# Полная очистка кэшей
rm -f "$APP_DIR/bootstrap/cache/"*.php || true
php "$APP_DIR/artisan" cache:clear   || true
php "$APP_DIR/artisan" config:clear  || true
php "$APP_DIR/artisan" route:clear   || true
php "$APP_DIR/artisan" view:clear    || true

# 👉 Миграции (идемпотентно; если всё применено — просто "ничего не делать")
php "$APP_DIR/artisan" migrate --force --no-interaction || true
# (опционально) сиды, если есть
# php "$APP_DIR/artisan" db:seed --force --no-interaction || true

# Пересборка кэшей и полезное
php "$APP_DIR/artisan" package:discover --ansi || true
php "$APP_DIR/artisan" config:cache            || true
php "$APP_DIR/artisan" route:cache             || true
php "$APP_DIR/artisan" view:cache              || true
php "$APP_DIR/artisan" storage:link            || true

# Не делаем artisan down/up (чтобы не ловить 503 на старте)
