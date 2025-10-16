<?php

// backend/config/cors.php
return [
    'paths' => ['api/*', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
'allowed_origins' => [
    'https://overcreate.co',
    'https://www.overcreate.co',
    'https://admin.overcreate.co',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
],


    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // мы работаем с Bearer-токеном, куки не нужны
];
