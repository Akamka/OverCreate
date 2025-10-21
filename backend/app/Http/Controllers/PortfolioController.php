<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
     * GET /api/portfolio
     * Публичный список с фильтрами.
     *
     * ?published=1|0  (по умолчанию 1)
     * ?service_type=web|motion|graphic|dev|printing
     * ?per_page=12
     */
    public function index(Request $request)
    {
        $q = Portfolio::query()
            ->when(
                $request->has('published'),
                fn ($qq) => $qq->where('is_published', filter_var($request->input('published'), FILTER_VALIDATE_BOOL)),
                fn ($qq) => $qq->where('is_published', true) // по умолчанию только опубликованные
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
     * Публичный просмотр одной записи.
     */
    public function show(Portfolio $portfolio)
    {
        return $portfolio;
    }

    /**
     * POST /api/admin/portfolio
     * Создание (админ).
     * Поддерживает:
     *  - видео: field "video_url" (YouTube) — при наличии галерея игнорируется
     *  - обложка: file "cover" ИЛИ поле cover_url
     *  - галерея: files "gallery_files[]" / "gallery[]" ИЛИ массив URL "gallery"
     */
    public function store(StorePortfolioRequest $request)
    {
        $data = $request->validated();

        // slug, если не передали
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        // ---- Видео (YouTube) ----
        $videoUrl = $this->normalizeYouTubeUrl($data['video_url'] ?? null);
        if ($videoUrl) {
            $data['video_url'] = $videoUrl;
            // При видео — игнорируем галерею
            unset($data['gallery']);
        } else {
            unset($data['video_url']);
        }

        // ---- Обложка: приоритет — файл cover, затем cover_url ----
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', 'public');
            $data['cover_url'] = Storage::url($path); // /storage/...
        }

        // ---- Галерея: поддерживаем и файлы, и URL ----
        if (!$videoUrl) {
            $galleryUrls = [];

            // 1) массив файлов gallery_files[]
            if ($request->hasFile('gallery_files')) {
                foreach ((array) $request->file('gallery_files') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', 'public');
                        $galleryUrls[] = Storage::url($p);
                    }
                }
            }

            // 2) альтернативное имя поля для файлов: gallery[]
            if ($request->hasFile('gallery')) {
                foreach ((array) $request->file('gallery') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', 'public');
                        $galleryUrls[] = Storage::url($p);
                    }
                }
            }

            // 3) если пришли URL-ы (gallery), тоже учитываем
            if (!empty($data['gallery']) && is_array($data['gallery'])) {
                $galleryUrls = array_values(array_unique(array_merge($galleryUrls, $data['gallery'])));
            }

            if (!empty($galleryUrls)) {
                $data['gallery'] = $galleryUrls;
            } else {
                unset($data['gallery']); // чтобы в БД не ушёл []
            }
        }

        $created = Portfolio::create($data);

        return response()->json($created, 201);
    }

    /**
     * PATCH /api/admin/portfolio/{portfolio}
     * Обновление (админ). Поддерживает частичные изменения и замену файлов.
     * Пустая строка в video_url очищает поле.
     */
    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio)
    {
        $data = $request->validated();

        // если заголовок меняли, а slug не прислан — сгенерируем новый
        if (array_key_exists('title', $data) && (!array_key_exists('slug', $data) || empty($data['slug']))) {
            $data['slug'] = Str::slug($data['title']) . '-' . Str::random(6);
        }

        // ---- Видео (YouTube) ----
        $videoUrlRaw = $data['video_url'] ?? null;         // null — не присылали ключ; '' — очистка
        $videoUrl    = $this->normalizeYouTubeUrl($videoUrlRaw);

        if ($videoUrlRaw !== null) {
            // ключ прислали — значит хотят изменить/очистить
            $data['video_url'] = $videoUrl; // может стать null, если пришла пустая строка/не youtube
            if ($videoUrl) {
                // если включили видео — игнорируем любую переданную галерею
                unset($data['gallery']);
            }
        } else {
            // ключ не присылали — не трогаем текущее значение
            unset($data['video_url']);
        }

        // ---- Обложка ----
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', 'public');
            $data['cover_url'] = Storage::url($path);
        }
        // Если cover_url пришёл пустым, не трогаем текущее значение — убираем ключ
        if (array_key_exists('cover_url', $data) && ($data['cover_url'] === null || $data['cover_url'] === '')) {
            unset($data['cover_url']);
        }

        // ---- Галерея ----
        if (($videoUrlRaw === null) || !$videoUrl) { // изменяем галерею только если видео не включено
            $galleryUrls = null;

            // 1) если пришли файлы gallery_files[] — полностью пересобираем галерею из них
            if ($request->hasFile('gallery_files')) {
                $galleryUrls = [];
                foreach ((array) $request->file('gallery_files') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', 'public');
                        $galleryUrls[] = Storage::url($p);
                    }
                }
            }

            // 2) если пришли файлы под альтернативным именем gallery[]
            if ($request->hasFile('gallery')) {
                $galleryUrls = $galleryUrls ?? [];
                foreach ((array) $request->file('gallery') as $file) {
                    if ($file) {
                        $p = $file->store('portfolio', 'public');
                        $galleryUrls[] = Storage::url($p);
                    }
                }
            }

            // 3) если прислали массив URL-ов gallery — либо берём его (если не было файлов),
            // либо объединяем с загруженными файлами
            if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
                $galleryUrls = $galleryUrls
                    ? array_values(array_unique(array_merge($galleryUrls, $data['gallery'])))
                    : $data['gallery'];
            }

            if ($galleryUrls !== null) {
                $data['gallery'] = $galleryUrls;
            } else {
                // если ключ gallery не передавали вообще — не трогаем текущее значение
                unset($data['gallery']);
            }
        }

        $portfolio->update($data);

        return $portfolio->refresh();
    }

    /**
     * DELETE /api/admin/portfolio/{portfolio}
     * Мягкое удаление.
     */
    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();
        return response()->noContent();
    }
}
