<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('original_name')->nullable();
            $table->string('path');             // storage path
            $table->string('url');              // public url (Storage::url)
            $table->string('mime', 100)->nullable();
            $table->unsignedBigInteger('size')->default(0); // bytes
            $table->unsignedInteger('width')->nullable();   // для изображений
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration')->nullable();// сек для аудио/видео (опц)
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('message_attachments');
    }
};
