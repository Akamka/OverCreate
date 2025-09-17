<?php

return [

    // К каким путям применять CORS
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Разрешённые методы (можно сузить до GET, POST, PUT, PATCH, DELETE)
    'allowed_methods' => ['*'],

    // Разрешённые источники (фронт и админ в dev)
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    // Какие заголовки можно присылать
    'allowed_headers' => ['*'],

    // Какие заголовки отдавать клиенту
    'exposed_headers' => [],

    // Кэш preflight (OPTIONS)
    'max_age' => 0,

    // Куки/креды — нам не нужно, т.к. используем заголовки; оставим false
    'supports_credentials' => true,
];
