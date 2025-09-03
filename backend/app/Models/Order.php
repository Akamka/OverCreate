<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $fillable = [
        'first_name','last_name','email','phone','service_type','message','status','is_new'
    ];
}
