#!/bin/sh
# backend/docker/entrypoint/99-artisan.sh
# Выполняется на старте контейнера (hook образа webdevops/php-nginx)
# Цель: гарантированно почистить и пересобрать все кэши, создать папки и права.

set -eu

APP_DIR="/app"

# На всякий: если почему-то нет artisan — тихо выходим
if [ ! -f "$APP_DIR/artisan" ]; then
  exit 0
fi

# 1) Папки и права (лог, cache, sessions, views и т.д.)
mkdir -p \
  "$APP_DIR/storage/logs" \
  "$APP_DIR/storage/framework/cache" \
  "$APP_DIR/storage/framework/data" \
  "$APP_DIR/storage/framework/sessions" \
  "$APP_DIR/storage/framework/testing" \
  "$APP_DIR/storage/framework/views" \
  "$APP_DIR/bootstrap/cache"

# пользователь "application" — это дефолт в webdevops/php-nginx
chown -R application:application "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true
chmod -R ug+rwX                  "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" || true

# 2) Полная очистка кэшей (перед пересборкой)
rm -f "$APP_DIR/bootstrap/cache/"*.php || true
php "$APP_DIR/artisan" cache:clear   || true
php "$APP_DIR/artisan" config:clear  || true
php "$APP_DIR/artisan" route:clear   || true
php "$APP_DIR/artisan" view:clear    || true

# 3) Пересборка кэшей и полезные штуки
php "$APP_DIR/artisan" package:discover --ansi || true
php "$APP_DIR/artisan" config:cache            || true
php "$APP_DIR/artisan" route:cache             || true
php "$APP_DIR/artisan" view:cache              || true
php "$APP_DIR/artisan" storage:link            || true

# (без artisan down/up, чтобы не поймать 503 из-за гонок)
