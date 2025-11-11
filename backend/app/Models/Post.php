<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'body',
        'cover_url',
        'meta_title',
        'meta_description',
        'keywords',
        'cta_text',
        'cta_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'keywords'     => 'array',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}
