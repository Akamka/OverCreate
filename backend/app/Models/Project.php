<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;
    protected $fillable = ['title','description','status','progress','user_id','assignee_id','start_at','due_at',];
    
    public function user(){ return $this->belongsTo(\App\Models\User::class,'user_id'); }
    public function client()   { return $this->belongsTo(User::class, 'user_id'); }
    public function assignee() { return $this->belongsTo(User::class, 'assignee_id'); }
    public function messages() { return $this->hasMany(Message::class, 'project_id'); }


    protected $casts = [
        'progress' => 'integer',
        'start_at' => 'date',   // ← вернёт 'YYYY-MM-DD'
        'due_at'   => 'date',   // ← вернёт 'YYYY-MM-DD'
    ];

    }
