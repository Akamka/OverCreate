<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    // GET /api/portfolio
    public function index(Request $request)
    {
        $q = Portfolio::query()
            ->when($request->boolean('published', true), fn($qq) => $qq->where('is_published', true))
            ->when($request->filled('service_type'), fn($qq) => $qq->where('service_type', $request->string('service_type')))
            ->orderBy('sort_order')
            ->orderByDesc('id');

        return $q->paginate($request->integer('per_page', 12));
    }

    // POST /api/portfolio (админ) — поддерживает multipart/form-data
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolios,slug',
            'service_type' => 'required|string|max:50',
            'cover_url' => 'nullable|url', // на случай если всё-таки передадут URL
            'gallery' => 'nullable|array', // массив URL'ов (альтернатива файлам)
            'gallery.*' => 'nullable|url',

            // файлы:
            'cover' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm|max:102400',
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => 'file|mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm|max:102400',

            'client' => 'nullable|string|max:255',
            'tags' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']).'-'.Str::random(6);
        }

        // обложка: либо URL, либо файл "cover"
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', 'public');
            $data['cover_url'] = Storage::url($path); // => /storage/portfolio/...
        }

        // галерея: либо массив URL'ов, либо файлы "gallery_files[]" или "gallery[]"
        $galleryUrls = [];

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                $p = $file->store('portfolio', 'public');
                $galleryUrls[] = Storage::url($p);
            }
        } elseif ($request->hasFile('gallery')) { // если прислали как gallery[]
            foreach ($request->file('gallery') as $file) {
                $p = $file->store('portfolio', 'public');
                $galleryUrls[] = Storage::url($p);
            }
        } elseif (!empty($data['gallery']) && is_array($data['gallery'])) {
            $galleryUrls = $data['gallery'];
        }

        if (!empty($galleryUrls)) {
            $data['gallery'] = $galleryUrls;
        }

        $created = Portfolio::create($data);
        return response()->json($created, 201);
    }

    // GET /api/portfolio/{portfolio}
    public function show(Portfolio $portfolio)
    {
        return $portfolio;
    }

    // PUT/PATCH /api/portfolio/{portfolio} (админ) — также поддержка файлов
    public function update(Request $request, Portfolio $portfolio)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolios,slug,'.$portfolio->id,
            'service_type' => 'sometimes|required|string|max:50',
            'cover_url' => 'nullable|url',
            'gallery' => 'nullable|array',
            'gallery.*' => 'nullable|url',

            'cover' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm|max:102400',
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => 'file|mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm|max:102400',

            'client' => 'nullable|string|max:255',
            'tags' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']).'-'.Str::random(6);
        }

        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('portfolio', 'public');
            $data['cover_url'] = Storage::url($path);
        }

        if ($request->hasFile('gallery_files')) {
            $galleryUrls = [];
            foreach ($request->file('gallery_files') as $file) {
                $p = $file->store('portfolio', 'public');
                $galleryUrls[] = Storage::url($p);
            }
            $data['gallery'] = $galleryUrls;
        } elseif ($request->hasFile('gallery')) {
            $galleryUrls = [];
            foreach ($request->file('gallery') as $file) {
                $p = $file->store('portfolio', 'public');
                $galleryUrls[] = Storage::url($p);
            }
            $data['gallery'] = $galleryUrls;
        }

        $portfolio->update($data);
        return $portfolio;
    }

    // DELETE /api/portfolio/{portfolio}
    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();
        return response()->noContent();
    }
}
