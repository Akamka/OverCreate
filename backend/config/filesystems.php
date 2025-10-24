<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | В продакшене ставим через .env: FILESYSTEM_DISK=r2
    |
    */

    'default' => env('FILESYSTEM_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Диски: local/private, public (локальный), s3 (S3-совместимый), r2 (алиас s3).
    |
    */

    'disks' => [

        // Приватное локальное хранилище
        'local' => [
            'driver'   => 'local',
            'root'     => storage_path('app/private'),
            'throw'    => false,
        ],

        // Публичное локальное хранилище (для dev)
        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => rtrim(env('APP_URL', ''), '/') . '/storage',
            'visibility' => 'public',
            'throw'      => false,
        ],

        // Универсальный S3-диск (AWS S3 / Cloudflare R2 / MinIO)
        's3' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket'                  => env('AWS_BUCKET'),
            // Публичная база-URL (CDN/статический домен для объектов)
            'url'                     => env('AWS_URL'),
            // Для R2/MinIO обязателен кастомный endpoint
            'endpoint'                => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => filter_var(env('AWS_USE_PATH_STYLE_ENDPOINT', true), FILTER_VALIDATE_BOOLEAN),
            'visibility'              => 'public',
            'throw'                   => true,
        ],

        // Алиас для R2 — тот же драйвер s3
        'r2' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket'                  => env('AWS_BUCKET'),
            'url'                     => env('AWS_URL'),
            'endpoint'                => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => filter_var(env('AWS_USE_PATH_STYLE_ENDPOINT', true), FILTER_VALIDATE_BOOLEAN),
            'visibility'              => 'public',
            'throw'                   => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Для локалки: public/storage → storage/app/public
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
