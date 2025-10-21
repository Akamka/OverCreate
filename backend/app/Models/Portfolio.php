<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use SoftDeletes;

    // Разрешаем массовое заполнение нужных полей
    protected $fillable = [
        'title',
        'slug',
        'service_type',
        'cover_url','gallery','video_url',
        'cover_url',
        'gallery',
        'client',
        'tags',
        'excerpt',
        'body',
        'is_published',
        'is_featured',
        'sort_order',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'gallery' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];
}
