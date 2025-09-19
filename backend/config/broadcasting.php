<?php

return [

    'default' => env('BROADCAST_CONNECTION', 'null'),

    'connections' => [

        'pusher' => [
            'driver' => 'pusher',
            'key'    => env('PUSHER_APP_KEY', 'local'),
            'secret' => env('PUSHER_APP_SECRET', 'secret'),
            'app_id' => env('PUSHER_APP_ID', 'overcreate'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
                'host'    => env('PUSHER_HOST', 'soketi'),
                'port'    => (int) env('PUSHER_PORT', 6001),
                'scheme'  => env('PUSHER_SCHEME', 'http'),
                'useTLS'  => filter_var(env('PUSHER_USETLS', false), FILTER_VALIDATE_BOOL),
            ],
        ],

        'ably' => [
            'driver' => 'ably',
            'key' => env('ABLY_KEY'),
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
