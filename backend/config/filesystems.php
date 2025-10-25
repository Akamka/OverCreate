<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Диск по умолчанию
    |--------------------------------------------------------------------------
    |
    | В проде задаём через .env: FILESYSTEM_DISK=r2
    |
    */

    'default' => env('FILESYSTEM_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Облачный диск (опционально)
    |--------------------------------------------------------------------------
    */

    'cloud' => env('FILESYSTEM_CLOUD', null),

    /*
    |--------------------------------------------------------------------------
    | Диски
    |--------------------------------------------------------------------------
    */

    'disks' => [

        // Приватное локальное хранилище (не раздаётся напрямую)
        'local' => [
            'driver' => 'local',
            'root'   => storage_path('app/private'),
            'throw'  => false,
            'report' => false,
        ],

        // Публичное локальное хранилище (отдаётся через /public/storage)
        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => rtrim(env('APP_URL', ''), '/') . '/storage',
            'visibility' => 'public',
            'throw'      => false,
            'report'     => false,
        ],

        // Классический AWS S3 (или совместимые сервисы, но не R2)
        's3' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'bucket'                  => env('AWS_BUCKET'),
            // Публичный CDN/домен (если используется)
            'url'                     => env('AWS_URL', env('AWS_CDN_URL')),
            // Endpoint для S3-совместимых решений (не обязателен для «настоящего» AWS S3)
            'endpoint'                => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => (bool) env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'visibility'              => 'public',
            'throw'                   => false,
            'report'                  => false,
        ],

        // Cloudflare R2 (через s3-драйвер)
        'r2' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'auto'),
            'bucket'                  => env('AWS_BUCKET'),

            /**
             * ВАЖНО: публичный URL ДОЛЖЕН содержать имя бакета в конце!
             * Пример (r2.dev): https://pub-XXXXXXXXXXXX.r2.dev/overcreate-media
             * Или ваш CDN-домен, тоже с /<bucket>.
             */
            'url'                     => env('MEDIA_PUBLIC_URL'),

            // API endpoint для SDK (без имени бакета!)
            // Пример: https://<accountid>.r2.cloudflarestorage.com
            'endpoint'                => env('AWS_ENDPOINT'),

            // Для R2 обязательно path-style
            'use_path_style_endpoint' => (bool) env('AWS_USE_PATH_STYLE_ENDPOINT', true),

            'visibility'              => 'public',
            'throw'                   => false,
            'report'                  => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Символические ссылки (для локальной разработки)
    |--------------------------------------------------------------------------
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
