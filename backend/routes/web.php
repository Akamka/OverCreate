<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/*
|--------------------------------------------------------------------------
| Self-test: БД + сторадж + storage:link
|--------------------------------------------------------------------------
*/
Route::get('/self-test', function () {
    $start = microtime(true);
    $out = [];

    // 1) DB
    try {
        $tables = DB::select('SHOW TABLES');
        $out['db'] = ['ok' => true, 'tables_count' => count($tables)];
    } catch (\Throwable $e) {
        $out['db'] = ['ok' => false, 'error' => $e->getMessage()];
    }

    // 2) Storage
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $fs = Storage::disk($diskName);

    $test = 'selftest_'.uniqid().'.txt';
    $payload = 'self-test @ '.now()->toIso8601String();

    try {
        $fs->put($test, $payload);
        $readBack = $fs->get($test);
        // Intelephense не знает про url(); защита через method_exists
        $url = method_exists($fs, 'url') ? $fs->url($test) : null;
        $fs->delete($test);

        $out['storage'] = [
            'ok'         => $readBack === $payload,
            'disk'       => $diskName,
            'root'       => config("filesystems.disks.$diskName.root") ?? null,
            'url_sample' => $url,
        ];
    } catch (\Throwable $e) {
        $out['storage'] = ['ok' => false, 'disk' => $diskName, 'error' => $e->getMessage()];
    }

    // 3) storage:link
    $link = public_path('storage');
    $out['storage_link'] = [
        'exists'    => is_link($link),
        'points_to' => is_link($link) ? readlink($link) : null,
    ];

    // 4) Ключевые env
    $out['env'] = [
        'APP_ENV'         => env('APP_ENV'),
        'APP_URL'         => config('app.url'),
        'FILESYSTEM_DISK' => $diskName,
        'DB_CONNECTION'   => env('DB_CONNECTION'),
        'DB_HOST'         => env('DB_HOST'),
    ];

    $out['_meta'] = [
        'ok'          => (bool) (($out['db']['ok'] ?? false) && ($out['storage']['ok'] ?? false)),
        'duration_ms' => round((microtime(true) - $start) * 1000, 2),
        'time'        => now()->toIso8601String(),
    ];

    return response()->json($out);
});

/*
|--------------------------------------------------------------------------
| CDN/Storage proxy: /storage/{path} → текущий диск (GET/HEAD)
| Работает для локального public и S3/R2. С нормализацией путей.
|--------------------------------------------------------------------------
*/
Route::match(['GET', 'HEAD'], '/storage/{path}', function (Request $r, string $path) {
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    // Нормализуем входящий путь:
    // - снимаем URL-экранирование
    // - убираем возможные префиксы "api/" и "storage/"
    // - удаляем ведущие слэши
    $rawPath = $path;
    $path = rawurldecode($path);
    $path = ltrim($path, '/');
    $path = preg_replace('~^api/~i', '', $path);
    $path = preg_replace('~^storage/~i', '', $path);
    $path = ltrim($path, '/');

    // Проверка существования
    if (!$disk->exists($path)) {
        Log::warning('Storage proxy 404', [
            'disk'      => $diskName,
            'raw_path'  => $rawPath,
            'normalized'=> $path,
            'app_url'   => config('app.url'),
        ]);
        abort(404);
    }

    // Метаданные (через method_exists — чтобы IDE не ругалась)
    $mime  = method_exists($disk, 'mimeType')     ? ($disk->mimeType($path)     ?? 'application/octet-stream') : 'application/octet-stream';
    $size  = method_exists($disk, 'size')         ? ($disk->size($path)         ?? null)                       : null;
    $mtime = method_exists($disk, 'lastModified') ? ($disk->lastModified($path) ?? null)                       : null;

    // Кэш-заголовки
    $etag = '"'.md5($diskName.'|'.$path.'|'.($size ?? '-').'|'.($mtime ?? '-')).'"';
    $headers = [
        'Content-Type'  => $mime,
        'Cache-Control' => 'public, max-age=31536000, immutable',
        'ETag'          => $etag,
    ];
    if ($size !== null) {
        $headers['Content-Length'] = (string) $size;
    }
    if ($mtime !== null) {
        $headers['Last-Modified'] = gmdate('D, d M Y H:i:s', (int) $mtime).' GMT';
    }

    // 304?
    $ifNoneMatch = $r->headers->get('If-None-Match');
    $ifModified  = $r->headers->get('If-Modified-Since');
    if ($ifNoneMatch === $etag || ($ifModified && $mtime && strtotime($ifModified) >= (int) $mtime)) {
        return response('', 304, $headers);
    }

    // HEAD — только заголовки
    if ($r->isMethod('HEAD')) {
        return response('', 200, $headers);
    }

    // GET — потоковая отдача
    $stream = $disk->readStream($path);
    if ($stream === false) {
        Log::warning('Storage proxy readStream() returned false', ['disk' => $diskName, 'path' => $path]);
        abort(404);
    }

    return new StreamedResponse(function () use ($stream) {
        fpassthru($stream);
        if (is_resource($stream)) {
            fclose($stream);
        }
    }, 200, $headers);
})->where('path', '.*');

/*
|--------------------------------------------------------------------------
| Простые проверки
|--------------------------------------------------------------------------
*/
Route::get('/healthz', fn () => response('OK', 200));

Route::get('/', fn () => response()->json([
    'name'   => config('app.name', 'API'),
    'status' => 'ok',
    'time'   => now()->toIso8601String(),
]));
