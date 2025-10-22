<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;


Route::get('/self-test', function () {
    $start = microtime(true);
    $results = [];

    // 1️⃣ Проверка базы данных
    try {
        $tables = DB::select('SHOW TABLES');
        $results['db']['ok'] = true;
        $results['db']['tables_count'] = count($tables);
    } catch (\Throwable $e) {
        $results['db'] = [
            'ok' => false,
            'error' => $e->getMessage(),
        ];
    }

    // 2️⃣ Проверка стораджа
    $diskName = config('filesystems.default', 'public');
    $fs = Storage::disk($diskName);
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $testFile = 'selftest_'.uniqid().'.txt';
    $content  = 'self-test at '.now()->toIso8601String();

    try {
        $fs->put($testFile, $content);
        $readBack = $fs->get($testFile);
        $url = method_exists($fs, 'url') ? $fs->url($testFile) : null;
        $fs->delete($testFile);

        $results['storage'] = [
            'ok'         => $readBack === $content,
            'disk'       => $diskName,
            'url_sample' => $url,
            'root'       => config("filesystems.disks.$diskName.root") ?? null,
        ];
    } catch (\Throwable $e) {
        $results['storage'] = [
            'ok' => false,
            'disk' => $diskName,
            'error' => $e->getMessage(),
        ];
    }

    // 3️⃣ Проверка storage:link
    $storageLink = public_path('storage');
    $results['storage_link'] = [
        'exists' => is_link($storageLink),
        'points_to' => is_link($storageLink) ? readlink($storageLink) : null,
    ];

    // 4️⃣ Проверка ключевых env
    $results['env'] = [
        'APP_ENV'   => env('APP_ENV'),
        'APP_URL'   => config('app.url'),
        'FILESYSTEM_DISK' => $diskName,
        'DB_CONNECTION'   => env('DB_CONNECTION'),
        'DB_HOST'         => env('DB_HOST'),
    ];

    // 5️⃣ Финальный статус
    $results['_meta'] = [
        'ok' => $results['db']['ok'] ?? false
                && $results['storage']['ok'] ?? false,
        'duration_ms' => round((microtime(true) - $start) * 1000, 2),
        'time' => now()->toIso8601String(),
    ];

    return response()->json($results);
});
