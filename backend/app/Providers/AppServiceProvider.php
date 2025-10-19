<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        /**
         * Фикс корневого URL и схемы за обратным прокси.
         * (.env должен содержать APP_URL=https://api.overcreate.co)
         */
        $appUrl = rtrim((string) env('APP_URL', ''), '/');
        if ($appUrl !== '') {
            URL::forceRootUrl($appUrl);
            config(['app.url' => $appUrl]);
            config(['filesystems.disks.public.url' => $appUrl . '/storage']);
        }

        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        // Ссылка на фронтовую форму сброса пароля
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $front = rtrim((string) env('FRONTEND_ORIGIN', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());
            return "{$front}/reset-password?token={$token}&email={$email}";
        });
    }
}
