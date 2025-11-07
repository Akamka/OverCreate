<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /** GET /api/posts — публичный список опубликованных постов */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        $q = trim((string) $request->query('q', ''));

        $query = Post::query()
            ->where('is_published', true)
            ->when($q !== '', function ($qbuilder) use ($q) {
                $qbuilder->where(function ($w) use ($q) {
                    $w->where('title', 'like', "%{$q}%")
                      ->orWhere('excerpt', 'like', "%{$q}%")
                      ->orWhere('body', 'like', "%{$q}%");
                });
            })
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        return $query->paginate($perPage);
    }

    /** GET /api/posts/{slug} — один пост по slug (только опубликованные) */
    public function show(string $slug)
    {
        $post = Post::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return $post;
    }
}
