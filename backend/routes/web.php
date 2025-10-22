<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/*
|--------------------------------------------------------------------------
| Self-test: БД + сторедж + storage:link
|--------------------------------------------------------------------------
*/
Route::get('/self-test', function () {
    $start = microtime(true);
    $results = [];

    // 1) DB
    try {
        $tables = DB::select('SHOW TABLES');
        $results['db'] = ['ok' => true, 'tables_count' => count($tables)];
    } catch (\Throwable $e) {
        $results['db'] = ['ok' => false, 'error' => $e->getMessage()];
    }

    // 2) Storage
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $fs = Storage::disk($diskName);

    $testFile = 'selftest_'.uniqid().'.txt';
    $content  = 'self-test at '.now()->toIso8601String();

    try {
        $fs->put($testFile, $content);
        $readBack = $fs->get($testFile);

        // Intelephense не знает про url(), добавим защиту
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
            'ok'   => false,
            'disk' => $diskName,
            'error'=> $e->getMessage(),
        ];
    }

    // 3) storage:link
    $storageLink = public_path('storage');
    $results['storage_link'] = [
        'exists'    => is_link($storageLink),
        'points_to' => is_link($storageLink) ? readlink($storageLink) : null,
    ];

    // 4) env summary
    $results['env'] = [
        'APP_ENV'         => env('APP_ENV'),
        'APP_URL'         => config('app.url'),
        'FILESYSTEM_DISK' => $diskName,
        'DB_CONNECTION'   => env('DB_CONNECTION'),
        'DB_HOST'         => env('DB_HOST'),
    ];

    $results['_meta'] = [
        'ok'          => (bool) (($results['db']['ok'] ?? false) && ($results['storage']['ok'] ?? false)),
        'duration_ms' => round((microtime(true) - $start) * 1000, 2),
        'time'        => now()->toIso8601String(),
    ];

    return response()->json($results);
});


/*
|--------------------------------------------------------------------------
| CDN-/Storage-прокси: /storage/{path} → текущий диск
| Работает и для локального "public", и для S3/R2.
|--------------------------------------------------------------------------
*/
Route::get('/storage/{path}', function (Request $r, string $path) {
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    // нормализуем путь, уберём лишние префиксы
    $path = ltrim($path, '/');

    if (!$disk->exists($path)) {
        abort(404);
    }

    // Intelephense не видит mimeType(); делаем через method_exists + fallback
    $mime = method_exists($disk, 'mimeType')
        ? ($disk->mimeType($path) ?? 'application/octet-stream')
        : 'application/octet-stream';

    // stream (readStream существует у FilesystemAdapter)
    $stream = $disk->readStream($path);
    if ($stream === false) {
        abort(404);
    }

    return new StreamedResponse(function () use ($stream) {
        while (!feof($stream)) {
            echo fread($stream, 1024 * 8);
            @ob_flush();
            flush();
        }
        if (is_resource($stream)) {
            fclose($stream);
        }
    }, 200, [
        'Content-Type'        => $mime,
        'Cache-Control'       => 'public, max-age=31536000, immutable',
        // Если нужно — можно добавить inline/attachment:
        // 'Content-Disposition' => 'inline; filename="'.basename($path).'"',
    ]);
})->where('path', '.*');


/*
|--------------------------------------------------------------------------
| Простейшие хелсы
|--------------------------------------------------------------------------
*/
Route::get('/healthz', fn() => response('OK', 200));

Route::get('/', function () {
    return response()->json([
        'name'   => config('app.name', 'API'),
        'status' => 'ok',
        'time'   => now()->toIso8601String(),
    ]);
});
