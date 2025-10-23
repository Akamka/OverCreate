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

        // Intelephense не знает про url(), поэтому — защита:
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
| Работает и для локального "public", и для S3/R2. HEAD и GET.
|--------------------------------------------------------------------------
*/
$storageResponder = function (Request $r, string $path) {
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    // нормализуем путь
    $path = ltrim($path, '/');

    if (!$disk->exists($path)) {
        abort(404);
    }

    // Метаданные (с защитой от предупреждений IDE)
    $mime  = method_exists($disk, 'mimeType')      ? ($disk->mimeType($path)      ?? 'application/octet-stream') : 'application/octet-stream';
    $size  = method_exists($disk, 'size')          ? ($disk->size($path)          ?? null)                        : null;
    $mtime = method_exists($disk, 'lastModified')  ? ($disk->lastModified($path)  ?? null)                        : null;

    // ETag/Last-Modified/Cache
    $etag = '"'.md5($path.'|'.($size ?? '-').'|'.($mtime ?? '-')).'"';
    $headers = [
        'Content-Type'   => $mime,
        'Cache-Control'  => 'public, max-age=31536000, immutable',
        'ETag'           => $etag,
    ];
    if ($size !== null) {
        $headers['Content-Length'] = (string) $size;
    }
    if ($mtime !== null) {
        $headers['Last-Modified'] = gmdate('D, d M Y H:i:s', (int) $mtime) . ' GMT';
    }

    // 304 по условным заголовкам
    $ifNoneMatch = $r->headers->get('If-None-Match');
    $ifModified  = $r->headers->get('If-Modified-Since');
    if ($ifNoneMatch === $etag || ($ifModified && $mtime && strtotime($ifModified) >= (int) $mtime)) {
        return response('', 304, $headers);
    }

    // HEAD — только заголовки
    if ($r->isMethod('HEAD')) {
        return response('', 200, $headers);
    }

    // GET — стримим
    $stream = $disk->readStream($path);
    if ($stream === false) {
        abort(404);
    }

    return new StreamedResponse(function () use ($stream) {
        fpassthru($stream);
        if (is_resource($stream)) {
            fclose($stream);
        }
    }, 200, $headers);
};

Route::match(['GET','HEAD'], '/storage/{path}', $storageResponder)
    ->where('path', '.*');

/*
|--------------------------------------------------------------------------
| Простейшие хелсы
|--------------------------------------------------------------------------
*/
Route::get('/healthz', fn() => response('OK', 200));

Route::get('/', fn() => response()->json([
    'name'   => config('app.name', 'API'),
    'status' => 'ok',
    'time'   => now()->toIso8601String(),
]));
