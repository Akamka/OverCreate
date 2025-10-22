<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

// строгая валидация/нормализация
use App\Http\Requests\StorePortfolioRequest;
use App\Http\Requests\UpdatePortfolioRequest;

class PortfolioController extends Controller
{
    /**
     * Нормализуем любую youtube/youtu.be ссылку до https://youtu.be/<id>
     */
    private function normalizeYouTubeUrl(?string $url): ?string
    {
        if (!$url) return null;
        $url = trim($url);
        if (!preg_match('~(youtube\.com|youtu\.be)~i', $url)) {
            return null;
        }

        $id = null;
        if (preg_match('~youtu\.be/([^?&#/]+)~i', $url, $m)) $id = $m[1];
        if (!$id && preg_match('~youtube\.com/(?:watch\?v=|embed/|shorts/)([^?&#/]+)~i', $url, $m)) $id = $m[1];
        if (!$id && preg_match('~[?&]v=([^?&#/]+)~i', $url, $m)) $id = $m[1];

        return $id ? "https://youtu.be/{$id}" : $url;
    }

    /**
     * Безопасно получить абсолютный URL для пути на диске.
     * Даёт подсказку типу для Intelephense и fallback для дисков без url().
     */
    private function diskUrl(string $disk, string $path): string
    {
        $fs = Storage::disk($disk);
        /** @var \Illuminate\Filesystem\FilesystemAdapter $fs */
        if (method_exists($fs, 'url')) {
            return $fs->url($path);
        }
        // Fallback: отдадим через публичный /storage (если настроен storage:link)
        return URL::to('/storage/' . ltrim($path, '/'));
    }

    /**
     * GET /api/portfolio
     */
    public function index(Request $request)
    {
        $q = Portfolio::query()
            ->when(
                $request->has('published'),
                fn ($qq) => $qq->where('is_published', filter_var($request->input('published'), FILTER_VALIDATE_BOOL)),
                fn ($qq) => $qq->where('is_published', true)
            )
            ->when(
                $request->filled('service_type'),
                fn ($qq) => $qq->where('service_type', $request->string('service_type')->toString())
            )
            ->orderBy('sort_order')
            ->orderByDesc('id');

        $perPage = max(1, (int) $request->input('per_page', 12));

        return $q->paginate($perPage);
    }

    /**
     * GET /api/portfolio/{portfolio}
     */
    public function show(Portfolio $portfolio)
    {
        return $portfolio;
    }

    /**
     * POST /api/admin/portfolio
     */
    public function store(StorePortfolioRequest $request)
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        $disk = config('filesystems.default');

        // ---- Видео (YouTube) ----
        $videoUrl = $this->normalizeYouTubeUrl($data['video_url'] ?? null);
        if ($videoUrl) {
            $data['video_url'] = $videoUrl;
            unset($data['gallery']); // при видео игнорируем галерею
        } else {
            unset($data['video_url']);
        }

        // ---- Обложка ----
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', $disk);
            $data['cover_url'] = $this->diskUrl($disk, $path);
        }

        // ---- Галерея ----
        if (!$videoUrl) {
            $galleryUrls = [];

            // файлы gallery_files[]
            if ($request->hasFile('gallery_files')) {
                foreach ((array) $request->file('gallery_files') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', $disk);
                        $galleryUrls[] = $this->diskUrl($disk, $p);
                    }
                }
            }

            // файлы gallery[]
            if ($request->hasFile('gallery')) {
                foreach ((array) $request->file('gallery') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', $disk);
                        $galleryUrls[] = $this->diskUrl($disk, $p);
                    }
                }
            }

            // URL-ы в теле
            if (!empty($data['gallery']) && is_array($data['gallery'])) {
                $galleryUrls = array_values(array_unique(array_merge($galleryUrls, $data['gallery'])));
            }

            if (!empty($galleryUrls)) {
                $data['gallery'] = $galleryUrls;
            } else {
                unset($data['gallery']);
            }
        }

        $created = Portfolio::create($data);

        return response()->json($created, 201);
    }

    /**
     * PATCH /api/admin/portfolio/{portfolio}
     */
    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio)
    {
        $data = $request->validated();

        if (array_key_exists('title', $data) && (!array_key_exists('slug', $data) || empty($data['slug']))) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        $disk = config('filesystems.default');

        // ---- Видео (YouTube) ----
        $videoUrlRaw = $data['video_url'] ?? null;   // null — ключ не прислан; '' — очистка
        $videoUrl    = $this->normalizeYouTubeUrl($videoUrlRaw);

        if ($videoUrlRaw !== null) {
            $data['video_url'] = $videoUrl; // может стать null
            if ($videoUrl) {
                unset($data['gallery']); // при видео галерею убираем
            }
        } else {
            unset($data['video_url']);
        }

        // ---- Обложка ----
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', $disk);
            $data['cover_url'] = $this->diskUrl($disk, $path);
        }
        if (array_key_exists('cover_url', $data) && ($data['cover_url'] === null || $data['cover_url'] === '')) {
            unset($data['cover_url']);
        }

        // ---- Галерея ----
        if (($videoUrlRaw === null) || !$videoUrl) {
            $galleryUrls = null;

            if ($request->hasFile('gallery_files')) {
                $galleryUrls = [];
                foreach ((array) $request->file('gallery_files') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', $disk);
                        $galleryUrls[] = $this->diskUrl($disk, $p);
                    }
                }
            }

            if ($request->hasFile('gallery')) {
                $galleryUrls = $galleryUrls ?? [];
                foreach ((array) $request->file('gallery') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', $disk);
                        $galleryUrls[] = $this->diskUrl($disk, $p);
                    }
                }
            }

            if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
                $galleryUrls = $galleryUrls
                    ? array_values(array_unique(array_merge($galleryUrls, $data['gallery'])))
                    : $data['gallery'];
            }

            if ($galleryUrls !== null) {
                $data['gallery'] = $galleryUrls;
            } else {
                unset($data['gallery']);
            }
        }

        $portfolio->update($data);

        return $portfolio->refresh();
    }

    /**
     * DELETE /api/admin/portfolio/{portfolio}
     */
    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();
        return response()->noContent();
    }
}
