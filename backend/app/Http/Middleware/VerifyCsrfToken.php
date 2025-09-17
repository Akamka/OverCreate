<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Маршруты, для которых CSRF не применяется.
     *
     * @var array<int, string>
     */
    protected $except = [
        // например: 'api/*'
    ];
}
