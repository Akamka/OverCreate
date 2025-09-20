<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'original_name',
        'path',
        'url',
        'mime',
        'size',
        'width',
        'height',
        'duration',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    protected $appends = ['type'];

    public function getTypeAttribute(): string
    {
        $mime = (string) ($this->mime ?? '');
        return str_starts_with($mime, 'image/') ? 'image'
             : (str_starts_with($mime, 'video/') ? 'video'
             : (str_starts_with($mime, 'audio/') ? 'audio' : 'file'));
    }
}
