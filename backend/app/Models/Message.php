<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'sender_id', 'body'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments()
    {
        // по умолчанию внешний ключ message_id — совпадает с миграцией
        return $this->hasMany(MessageAttachment::class);
    }
}
