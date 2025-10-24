<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
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

    $test    = 'selftest_' . uniqid() . '.txt';
    $payload = 'self-test @ ' . now()->toIso8601String();

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
| /storage/{path}: редиректим на публичный URL диска (R2/S3/CDN)
|--------------------------------------------------------------------------
| _normalize_storage_path() теперь подключается из app/Support/helpers.php
| (через composer autoload "files"), поэтому здесь НИЧЕГО не объявляем.
*/
Route::match(['GET', 'HEAD'], '/storage/{path}', function (Request $r, string $path) {
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $fs = Storage::disk($diskName);

    $normalized = _normalize_storage_path($path);

    if (! $fs->exists($normalized)) {
        Log::warning('Storage redirect 404', [
            'disk'       => $diskName,
            'raw'        => $path,
            'normalized' => $normalized,
        ]);
        abort(404);
    }

    // Если для диска доступен url() — отдаём 302 на фактический публичный адрес
    if (method_exists($fs, 'url')) {
        return redirect()->away($fs->url($normalized), 302);
    }

    // Фоллбек: стримим сами (для локального public-диска)
    $mime  = method_exists($fs, 'mimeType')     ? ($fs->mimeType($normalized)     ?? 'application/octet-stream') : 'application/octet-stream';
    $size  = method_exists($fs, 'size')         ? ($fs->size($normalized)         ?? null) : null;
    $mtime = method_exists($fs, 'lastModified') ? ($fs->lastModified($normalized) ?? null) : null;

    $headers = [
        'Content-Type'  => $mime,
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ];
    if ($size !== null)  $headers['Content-Length'] = (string) $size;
    if ($mtime !== null) $headers['Last-Modified']  = gmdate('D, d M Y H:i:s', (int) $mtime) . ' GMT';

    if ($r->isMethod('HEAD')) {
        return response('', 200, $headers);
    }

    $stream = $fs->readStream($normalized);
    if ($stream === false) abort(404);

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
    $raw      = (string) $r->query('path', '');
    $diskName = config('filesystems.default', 'public');
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $fs = Storage::disk($diskName);

    $normalized = _normalize_storage_path($raw);
    $exists     = $normalized !== '' ? $fs->exists($normalized) : false;

    $mime  = $exists && method_exists($fs, 'mimeType')     ? ($fs->mimeType($normalized)     ?? null) : null;
    $size  = $exists && method_exists($fs, 'size')         ? ($fs->size($normalized)         ?? null) : null;
    $mtime = $exists && method_exists($fs, 'lastModified') ? ($fs->lastModified($normalized) ?? null) : null;

    $firstBytesHex = null;
    if ($exists) {
        $s = $fs->readStream($normalized);
        if (is_resource($s)) {
            $chunk = fread($s, 32);
            $firstBytesHex = $chunk !== false ? bin2hex($chunk) : null;
            fclose($s);
        }
    }

    $url   = ($normalized !== '' && method_exists($fs, 'url')) ? $fs->url($normalized) : null;
    $root  = config("filesystems.disks.$diskName.root");
    $fsPath = $root ? rtrim($root, '/\\') . DIRECTORY_SEPARATOR . $normalized : null;

    return response()->json([
        'input' => ['given' => $raw, 'normalized' => $normalized],
        'disk'  => ['name' => $diskName, 'root' => $root],
        'exists'=> $exists,
        'meta'  => ['mime' => $mime, 'size' => $size, 'mtime' => $mtime],
        'url'   => $url,
        'fs'    => ['path' => $fsPath, 'exists' => $fsPath ? file_exists($fsPath) : null],
        'sample'=> ['first_32_bytes_hex' => $firstBytesHex],
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
    /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
    $fs = Storage::disk($diskName);

    $files = $fs->files($dir);
    $out = [];
    foreach ($files as $f) {
        $out[] = [
            'path' => $f,
            'exists' => $fs->exists($f),
            'url'  => method_exists($fs, 'url') ? $fs->url($f) : null,
            'size' => method_exists($fs, 'size') ? $fs->size($f) : null,
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
|--------------------------------------------------------------------------
*/
Route::get('/_diag/portfolio/{id}', function (int $id) {
    $p = Portfolio::find($id);
    if (! $p) {
        return response()->json(['ok' => false, 'error' => 'not-found'], 404);
    }
    return $p;
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
