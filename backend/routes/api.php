<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\OrderController;

use App\Http\Controllers\Api\ContactSubmissionController;

Route::post('/contact-submissions', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:20,1'); // защита от спама: 20 запросов/мин

Route::get('/contact-submissions', [ContactSubmissionController::class, 'index']);



// Публичные (для сайта)
Route::apiResource('portfolio', PortfolioController::class)->only(['index', 'show']);

// Админские (создание/редактирование/удаление)
Route::middleware('admin.guard')->group(function () {
    Route::apiResource('admin/portfolio', PortfolioController::class)->only(['store', 'update', 'destroy']);

Route::get('/orders', [OrderController::class, 'index']);         // админка (позже защитим)
Route::post('/orders', [OrderController::class, 'store']);        // публичная форма
Route::put('/orders/{order}/read', [OrderController::class, 'markRead']);
});
