<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class PostAdminController extends Controller
{
    public function index(Request $r)
    {
        $per = (int)($r->get('per_page', 20));
        $q   = $r->get('q');

        $items = Post::query()
            ->when($q, fn($x)=>$x->where('title','like',"%$q%"))
            ->orderByDesc('created_at')
            ->paginate($per);

        return response()->json($items);
    }

    public function show(int $id)
    {
        return Post::findOrFail($id);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'title'            => 'required|string|max:180',
            'slug'             => 'nullable|string|max:200|unique:posts,slug',
            'excerpt'          => 'nullable|string|max:600',
            'body'             => 'required|string',
            'cover_url'        => 'nullable|string|max:500',
            'meta_title'       => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:180',
            'keywords'         => 'nullable|array',
            'keywords.*'       => 'string|max:60',
            'cta_text'         => 'nullable|string|max:120',
            'cta_url'          => 'nullable|string|max:200',
            'is_published'     => 'boolean',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = $this->makeUniqueSlug(Str::slug($data['title']));
        } else {
            $data['slug'] = $this->makeUniqueSlug(Str::slug($data['slug']));
        }

        if (!empty($data['is_published'])) {
            $data['published_at'] = now();
        }

        if (isset($data['keywords']) && is_array($data['keywords'])) {
            $data['keywords'] = array_values(array_map('strval', $data['keywords']));
        }

        $post = Post::create($data);
        return response()->json($post, 201);
    }

    public function update(Request $r, int $id)
    {
        $post = Post::findOrFail($id);

        $data = $r->validate([
            'title'            => 'sometimes|string|max:180',
            'slug'             => ['sometimes','string','max:200', Rule::unique('posts','slug')->ignore($post->id)],
            'excerpt'          => 'sometimes|nullable|string|max:600',
            'body'             => 'sometimes|string',
            'cover_url'        => 'sometimes|nullable|string|max:500',
            'meta_title'       => 'sometimes|nullable|string|max:160',
            'meta_description' => 'sometimes|nullable|string|max:180',
            'keywords'         => 'sometimes|array',
            'keywords.*'       => 'string|max:60',
            'cta_text'         => 'sometimes|nullable|string|max:120',
            'cta_url'          => 'sometimes|nullable|string|max:200',
            'is_published'     => 'sometimes|boolean',
        ]);

        // нормализуем slug (и сохраняем уникальность)
        if (array_key_exists('slug', $data)) {
            $data['slug'] = $data['slug'] ? $this->makeUniqueSlug(Str::slug($data['slug']), $post->id) : $post->slug;
        }

        // нормализуем keywords
        if (isset($data['keywords']) && is_array($data['keywords'])) {
            $data['keywords'] = array_values(array_map('strval', $data['keywords']));
        }

        $wasDraft = !$post->is_published;

        $post->fill($data);

        if ($wasDraft && $post->is_published && !$post->published_at) {
            $post->published_at = now();
        }
        $post->save();

        return $post;
    }

    public function destroy(int $id)
    {
        Post::findOrFail($id)->delete();
        return response()->noContent();
    }

    /**
     * Делает уникальный slug. Если занят — добавляет -2, -3, ...
     */
    protected function makeUniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $slug = $base ?: 'post';
        $i = 1;
        while ($this->slugExists($slug, $ignoreId)) {
            $i++;
            $slug = $base . '-' . $i;
        }
        return $slug;
    }

    protected function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $q = Post::where('slug', $slug);
        if ($ignoreId) $q->where('id', '!=', $ignoreId);
        return $q->exists();
    }
}
