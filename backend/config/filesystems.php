<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | По умолчанию используем "public" (локально это /storage, в продакшене
    | можно переключить на s3/r2 через FILESYSTEM_DISK=s3 или r2).
    |
    */

    'default' => env('FILESYSTEM_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Диски: local (приватный), public (публичный через /storage),
    | s3 (также подходит для R2/MinIO), и алиас r2 (тот же драйвер s3).
    |
    */

    'disks' => [

        // Приватное локальное хранилище (не раздаётся напрямую)
        'local' => [
            'driver'   => 'local',
            'root'     => storage_path('app/private'),
            'serve'    => true,
            'throw'    => false,
            'report'   => false,
        ],

        // Публичное локальное хранилище (через public/storage → storage/app/public)
        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => rtrim(env('APP_URL', ''), '/') . '/storage',
            'visibility' => 'public',
            'serve'      => true,   // не влияет на Laravel, но не мешает
            'throw'      => false,
            'report'     => false,
        ],

        // Облачное S3-совместимое хранилище (AWS S3 / Cloudflare R2 / MinIO)
        's3' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION'),
            'bucket'                  => env('AWS_BUCKET'),
            // Если есть CDN — укажи AWS_CDN_URL (или AWS_URL).
            'url'                     => env('AWS_URL', env('AWS_CDN_URL')),
            'endpoint'                => env('AWS_ENDPOINT'), // для R2/MinIO обязателен
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'visibility'              => 'public',
            'throw'                   => false,
            'report'                  => false,
        ],

        // Удобный алиас для R2 — тот же драйвер s3
        'r2' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION'),
            'bucket'                  => env('AWS_BUCKET'),
            'url'                     => env('AWS_URL', env('AWS_CDN_URL')),
            'endpoint'                => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', true),
            'visibility'              => 'public',
            'throw'                   => false,
            'report'                  => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Ссылка public/storage → storage/app/public (для локальной разработки).
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
