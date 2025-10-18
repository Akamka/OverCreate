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
         * Всегда выдаём HTTPS-ссылки в проде, чтобы Next.js <Image> не ломался,
         * и чтобы не было mixed-content.
         *
         * В .env должен быть:
         *   APP_URL=https://api.overcreate.co
         */
        if (app()->environment('production')) {
            URL::forceScheme('https');

            // Подстраховка: убедимся, что app.url реально равен APP_URL
            // (это влияет на asset(), Storage::url() для public и т. п.)
            $appUrl = rtrim((string) env('APP_URL', ''), '/');
            if ($appUrl !== '') {
                config(['app.url' => $appUrl]);

                // Для диска public Laravel формирует /storage/...,
                // а абсолютный префикс берёт из app.url — подстрахуем вручную.
                config(['filesystems.disks.public.url' => $appUrl.'/storage']);
            }
        }

        // Ссылка на форму сброса пароля во фронте
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $front = rtrim((string) env('FRONTEND_ORIGIN', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());
            return "{$front}/reset-password?token={$token}&email={$email}";
        });
    }
}
