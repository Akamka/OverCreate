<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;   // ← добавили

class User extends Authenticatable implements MustVerifyEmail   // ← добавили
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = ['name','email','password','role'];

    protected $hidden = ['password','remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',     // ← важно
    ];
}
