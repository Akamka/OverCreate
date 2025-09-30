<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactSubmission extends Model
{
    protected $fillable = [
        'first_name','last_name','email','phone',
        'page','subject','message',
        'utm_source','utm_medium','utm_campaign',
        'honeypot','ip','status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Небольшой хелпер — список допустимых статусов
    public static function allowedStatuses(): array
    {
        return ['new','in_review','done','spam','archived'];
    }
}
