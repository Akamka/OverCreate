<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Маршрут /broadcasting/auth для private/presence каналов (на будущее).
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        // Подключаем определения каналов (если будут private/presence)
        require base_path('routes/channels.php');
    }
}
