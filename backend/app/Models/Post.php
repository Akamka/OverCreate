<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $fillable = [
        'title','slug','excerpt','body','cover_url',
        'meta_title','meta_description','keywords',
        'cta_text','cta_url','is_published','published_at',
    ];

    protected $casts = [
        'keywords'     => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Post $p) {
            if (!$p->slug) $p->slug = Str::slug($p->title);
            if ($p->is_published && !$p->published_at) $p->published_at = now();
        });

        static::updating(function (Post $p) {
            if ($p->isDirty('is_published') && $p->is_published && !$p->published_at) {
                $p->published_at = now();
            }
        });
    }
}
