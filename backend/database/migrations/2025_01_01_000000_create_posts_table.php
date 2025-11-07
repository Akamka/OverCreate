<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('slug')->unique();
            $t->string('excerpt', 600)->nullable();
            $t->longText('body');
            $t->string('cover_url')->nullable();
            $t->string('meta_title', 160)->nullable();
            $t->string('meta_description', 180)->nullable();
            $t->json('keywords')->nullable();
            $t->string('cta_text')->nullable();
            $t->string('cta_url')->nullable();
            $t->boolean('is_published')->default(false)->index();
            $t->timestamp('published_at')->nullable()->index();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
