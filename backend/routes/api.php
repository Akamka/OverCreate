<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PortfolioController;

// Публичные (для сайта)
Route::apiResource('portfolio', PortfolioController::class)->only(['index', 'show']);

// Админские (создание/редактирование/удаление)
Route::middleware('admin.guard')->group(function () {
    Route::apiResource('admin/portfolio', PortfolioController::class)->only(['store', 'update', 'destroy']);
});
