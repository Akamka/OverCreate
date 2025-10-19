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
         * Всегда используем правильный корневой URL из .env,
         * чтобы подпись verify-ссылок не ломалась за обратным прокси.
         *
         * В .env:
         *   APP_URL=https://api.overcreate.co
         *   FRONTEND_ORIGIN=https://overcreate.co
         */
        $appUrl = rtrim((string) env('APP_URL', ''), '/');
        if ($appUrl !== '') {
            // Принудительно задаём корень для генерации ссылок (route(), URL::signedRoute() и т.п.)
            URL::forceRootUrl($appUrl);
            // На всякий случай синхронизируем config('app.url')
            config(['app.url' => $appUrl]);
            // И public disk url, чтобы Storage::url() выдавал абсолютные HTTPS-ссылки
            config(['filesystems.disks.public.url' => $appUrl . '/storage']);
        }

        // В проде насильно HTTPS (за прокси иначе Laravel видит http)
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        /**
         * Ссылка на фронтовую форму сброса пароля.
         */
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $front = rtrim((string) env('FRONTEND_ORIGIN', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());
            return "{$front}/reset-password?token={$token}&email={$email}";
        });
    }
}
