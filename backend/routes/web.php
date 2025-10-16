<?php

// routes/web.php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/healthz', fn() => response('OK', 200));
Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'API'),
        'status' => 'ok',
        'time' => now()->toIso8601String(),
    ]);
    // или: return redirect()->away('https://overcreate.co');
});


Route::get('/debug/db', function () {
    try {
        $count = DB::table('portfolios')->count();
        return response()->json(['ok' => true, 'portfolios' => $count]);
    } catch (\Throwable $e) {
        return response()->json([
            'ok' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});