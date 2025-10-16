<?php

// routes/web.php
use Illuminate\Support\Facades\Route;

Route::get('/healthz', fn() => response('OK', 200));
Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'API'),
        'status' => 'ok',
        'time' => now()->toIso8601String(),
    ]);
    // или: return redirect()->away('https://overcreate.co');
});
