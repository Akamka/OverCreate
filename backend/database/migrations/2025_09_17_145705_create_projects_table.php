<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();     // клиент
                $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete(); // исполнитель
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('status', ['new','in_progress','review','done','cancelled'])->default('new')->index();
                $table->unsignedTinyInteger('progress')->default(0); // 0..100
                $table->timestamps();
            });
        }
    }
    public function down(): void {
        Schema::dropIfExists('projects');
    }
};
