<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->string('first_name');
            $t->string('last_name');
            $t->string('email');
            $t->string('phone', 64);
            $t->string('service_type')->nullable(); // web / graphic / motion / dev / printing
            $t->text('message')->nullable();
            $t->string('status')->default('new'); // new|in_progress|done
            $t->boolean('is_new')->default(true); // для бейджа в админке
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
