<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// --- ВРЕМЕННЫЙ ДЕБАГ ЭНДПОИНТ ---
// Пример вызова:
//   https://api.overcreate.co/_debug/storage?path=portfolio/WJhBSLQudE3LAzR61yM2Vj5Y8KJRceB6p4lhEdEB.png
// Можно передать и с префиксом /storage/... — он будет отрезан
Route::get('/_debug/storage', function (Request $r) {
    // берём path
    $raw = (string) ($r->query('path') ?? '');

    // нормализуем: убираем ведущие префиксы /storage, /api/storage и т.п.
    $path = ltrim($raw, '/');
    $path = preg_replace('~^api/~i', '', $path);
    $path = preg_replace('~^storage/~i', '', $path);

    $disk = Storage::disk('public');
    $existsOnDisk = $disk->exists($path);
    $fullFsPath   = storage_path('app/public/'.$path);

    return response()->json([
        'given'                => $raw,
        'normalized_path'      => $path,
        'app_url'              => config('app.url'),
        'disk_root'            => config('filesystems.disks.public.root'),
        'storage_link_exists'  => is_link(public_path('storage')),
        'storage_link_points'  => is_link(public_path('storage')) ? readlink(public_path('storage')) : null,
        'full_fs_path'         => $fullFsPath,
        'file_exists_on_fs'    => file_exists($fullFsPath),
        'storage_public_exists'=> $existsOnDisk,
        'storage_url' => \Illuminate\Support\Facades\Storage::url($path),
 // что Laravel сгенерит
    ]);
});

// простые пробы
Route::get('/healthz', fn() => response('OK', 200));

Route::get('/', function () {
    return response()->json([
        'name'   => config('app.name', 'API'),
        'status' => 'ok',
        'time'   => now()->toIso8601String(),
    ]);
});

Route::get('/debug/db', function () {
    try {
        $count = DB::table('portfolios')->count();
        return response()->json(['ok' => true, 'portfolios' => $count]);
    } catch (\Throwable $e) {
        return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
    }
});
