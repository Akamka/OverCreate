<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminGuard
{
    public function handle(Request $request, Closure $next)
    {
        $allowedEmails = array_filter(array_map('trim', explode(',', (string) env('ADMIN_EMAILS'))));
        $headerEmail = (string) $request->header('X-Admin-Email');
        $headerToken = (string) $request->header('X-Admin-Token');

        if (!in_array($headerEmail, $allowedEmails, true)) {
            return response()->json(['message' => 'Forbidden (email)'], 403);
        }
        if ($headerToken !== (string) env('ADMIN_TOKEN')) {
            return response()->json(['message' => 'Forbidden (token)'], 403);
        }
        return $next($request);
    }
}
