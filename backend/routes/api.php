<?php

use Illuminate\Support\Facades\Route;

// --- Публичные контроллеры (были) ---
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\ContactSubmissionController;

// --- ЛК/чат (авторизованный клиент через Sanctum) ---
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\MessageController;

// --- Админские контроллеры ---
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\Admin\ProjectAdminController;

/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/

// заявки (CTA)
Route::post('/contact-submissions', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:20,1');
Route::get('/contact-submissions', [ContactSubmissionController::class, 'index']);

// портфолио (публичный каталог)
Route::apiResource('portfolio', PortfolioController::class)->only(['index', 'show']);

// заказы: создание публичное; чтение/отметка — в админ-блоке ниже
Route::post('/orders', [OrderController::class, 'store']);

/*
|--------------------------------------------------------------------------
| AUTH (SANCTUM) — Личный кабинет пользователя
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',           [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/projects',                    [ProjectController::class, 'index']);
    Route::get('/projects/{project}',          [ProjectController::class, 'show']);
    Route::patch('/projects/{project}/progress', [ProjectController::class, 'updateProgress']);

    Route::get('/projects/{project}/messages', [MessageController::class, 'index']);
    Route::post('/projects/{project}/messages',[MessageController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| ADMIN API (X-Admin-Token) — только для админки
|--------------------------------------------------------------------------
*/
// стало (без алиаса — напрямую по классу)
Route::prefix('admin')->middleware(\App\Http\Middleware\AdminToken::class)->group(function () {

    Route::get('/ping', fn () => response()->json(['ok' => true]));
    // Users
    Route::get('/users',                [UserAdminController::class, 'index']);
    Route::patch('/users/{user}/role',  [UserAdminController::class, 'updateRole']);
    Route::get('/staff',                [UserAdminController::class, 'staff']);

    // Projects
    Route::get('/projects',             [ProjectAdminController::class, 'index']);
    Route::post('/projects',            [ProjectAdminController::class, 'store']);
    Route::get('/projects/{project}',   [ProjectAdminController::class, 'show']);
    Route::patch('/projects/{project}', [ProjectAdminController::class, 'update']);
    Route::delete('/projects/{project}',[ProjectAdminController::class, 'destroy']);

    // Orders (админские действия)
    Route::get('/orders',               [OrderController::class, 'index']);
    Route::put('/orders/{order}/read',  [OrderController::class, 'markRead']);

    // Если нужно админ-редактирование портфолио — держим здесь же:
    Route::apiResource('portfolio', PortfolioController::class)->only(['store','update','destroy']);

    
});
