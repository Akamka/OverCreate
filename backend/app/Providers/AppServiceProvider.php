<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Генерим ссылку на форму сброса пароля во фронте
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $front = rtrim(env('FRONTEND_ORIGIN', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());
            return "{$front}/reset-password?token={$token}&email={$email}";
        });
    }
}
