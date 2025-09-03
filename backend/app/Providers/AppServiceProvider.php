<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // В dev-окружении снимем защиту от mass-assignment,
        // чтобы не упереться в кэш/автозагрузку.
        if (config('app.env') !== 'production') {
            Model::unguard();
        }
    }
}
