<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\Portfolio;

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
| Вспомогательная нормализация пути для стораджа
|--------------------------------------------------------------------------
*/
function _normalize_storage_path(string $raw): string {
    $p = rawurldecode($raw);
    $p = ltrim($p, '/');
    $p = preg_replace('~^api/~i', '', $p);
    $p = preg_replace('~^storage/~i', '', $p);
    $p = ltrim($p, '/');
    // на всякий случай удалим возможный повтор storage/
    $p = preg_replace('~^storage/~i', '', $p);
    return $p;
}

/*
|--------------------------------------------------------------------------
| CDN/Storage proxy: /storage/{path}  (GET/HEAD, с debug-заголовками)
|--------------------------------------------------------------------------
*/
Route::match(['GET', 'HEAD'], '/storage/{path}', function (Request $r, string $path) {
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    $rawPath = $path;
    $path = _normalize_storage_path($path);
    $exists = $disk->exists($path);

    if (!$exists) {
        Log::warning('Storage proxy 404', [
            'disk'      => $diskName,
            'raw_path'  => $rawPath,
            'normalized'=> $path,
            'app_url'   => config('app.url'),
        ]);
        abort(404);
    }

    $mime  = method_exists($disk, 'mimeType')     ? ($disk->mimeType($path)     ?? 'application/octet-stream') : 'application/octet-stream';
    $size  = method_exists($disk, 'size')         ? ($disk->size($path)         ?? null)                       : null;
    $mtime = method_exists($disk, 'lastModified') ? ($disk->lastModified($path) ?? null)                       : null;

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

    // debug-заголовки по запросу
    if ($r->boolean('debug')) {
        $headers['X-Storage-Disk']   = $diskName;
        $headers['X-Storage-Path']   = $path;
        $headers['X-Storage-Exists'] = $exists ? '1' : '0';
        $headers['X-ETag']           = trim($etag, '"');
    }

    $ifNoneMatch = $r->headers->get('If-None-Match');
    $ifModified  = $r->headers->get('If-Modified-Since');
    if ($ifNoneMatch === $etag || ($ifModified && $mtime && strtotime($ifModified) >= (int) $mtime)) {
        return response('', 304, $headers);
    }

    if ($r->isMethod('HEAD')) {
        return response('', 200, $headers);
    }

    $stream = $disk->readStream($path);
    if ($stream === false) {
        Log::warning('Storage proxy readStream() returned false', ['disk' => $diskName, 'path' => $path]);
        abort(404);
    }

    return new StreamedResponse(function () use ($stream) {
        fpassthru($stream);
        if (is_resource($stream)) fclose($stream);
    }, 200, $headers);
})->where('path', '.*');

/*
|--------------------------------------------------------------------------
| DIAG 1: подробная проверка одного файла
| GET /_diag/storage?path=portfolio/xxx.png
|--------------------------------------------------------------------------
*/
Route::get('/_diag/storage', function (Request $r) {
    $raw = (string) $r->query('path', '');
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    $normalized = _normalize_storage_path($raw);
    $exists = $normalized !== '' ? $disk->exists($normalized) : false;

    $mime  = $exists && method_exists($disk,'mimeType')     ? ($disk->mimeType($normalized)     ?? null) : null;
    $size  = $exists && method_exists($disk,'size')         ? ($disk->size($normalized)         ?? null) : null;
    $mtime = $exists && method_exists($disk,'lastModified') ? ($disk->lastModified($normalized) ?? null) : null;

    $etag = $exists ? md5($diskName.'|'.$normalized.'|'.($size ?? '-').'|'.($mtime ?? '-')) : null;

    $firstBytesHex = null;
    if ($exists) {
        $s = $disk->readStream($normalized);
        if (is_resource($s)) {
            $chunk = fread($s, 32);
            $firstBytesHex = $chunk !== false ? bin2hex($chunk) : null;
            fclose($s);
        }
    }

    // Абсолютный URL, если доступен
    $url = ($normalized !== '' && method_exists($disk, 'url')) ? $disk->url($normalized) : null;

    // Прямой путь в ФС (для локального диска)
    $root = config("filesystems.disks.$diskName.root");
    $fsPath = $root ? rtrim($root,'/\\').DIRECTORY_SEPARATOR.$normalized : null;
    $fsExists = $fsPath ? file_exists($fsPath) : null;

    return response()->json([
        'input' => [
            'given'      => $raw,
            'normalized' => $normalized,
        ],
        'disk' => [
            'name' => $diskName,
            'root' => $root,
        ],
        'exists' => $exists,
        'meta' => [
            'mime'  => $mime,
            'size'  => $size,
            'mtime' => $mtime,
            'etag'  => $etag,
        ],
        'url' => $url,
        'fs' => [
            'path'   => $fsPath,
            'exists' => $fsExists,
        ],
        'sample' => [
            'first_32_bytes_hex' => $firstBytesHex,
        ],
    ]);
});

/*
|--------------------------------------------------------------------------
| DIAG 2: листинг каталога на диске
| GET /_diag/list?dir=portfolio
|--------------------------------------------------------------------------
*/
Route::get('/_diag/list', function (Request $r) {
    $dir = trim((string) $r->query('dir', 'portfolio'), '/');
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
    $disk = Storage::disk($diskName);

    $files = $disk->files($dir);
    $out = [];
    foreach ($files as $f) {
        $out[] = [
            'path'   => $f,
            'exists' => $disk->exists($f),
            'url'    => method_exists($disk,'url') ? $disk->url($f) : null,
            'size'   => method_exists($disk,'size') ? $disk->size($f) : null,
        ];
    }

    return response()->json([
        'disk'  => $diskName,
        'dir'   => $dir,
        'count' => count($out),
        'files' => $out,
    ]);
});

/*
|--------------------------------------------------------------------------
| DIAG 3: посмотреть запись Portfolio из БД
| GET /_diag/portfolio/123
|--------------------------------------------------------------------------00,
*/
Route::get('/_diag/portfolio/{id}', function (int $id) {
    $p = Portfolio::find($id);
    if (!$p) return response()->json(['ok' => false, 'error' => 'not-found'], 404);
    return $p; // json
});

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
