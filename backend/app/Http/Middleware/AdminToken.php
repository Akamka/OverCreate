<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->headers->get('X-Admin-Token');
        $valid  = config('app.admin_token', env('ADMIN_TOKEN'));

        if (!$header || !$valid || !hash_equals((string) $valid, (string) $header)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
