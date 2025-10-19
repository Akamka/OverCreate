<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log; // ← добавили логер

// --- Публичные контроллеры ---
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\ContactSubmissionController;

// --- ЛК/чат (Sanctum) ---
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PasswordResetController;

// --- Админка ---
use App\Http\Controllers\Admin\UserAdminController;
use App\Http\Controllers\Admin\ProjectAdminController;

// --- Доп. классы для верификации ---
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/

// заявки (CTA)
Route::post('/contact-submissions', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:20,1');
Route::get('/contact-submissions', [ContactSubmissionController::class, 'index']);

// портфолио
Route::apiResource('portfolio', PortfolioController::class)->only(['index', 'show']);

// заказы
Route::post('/orders', [OrderController::class, 'store']);

// регистрация / логин
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// сброс пароля — публично
Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendLink'])
    ->middleware('throttle:5,1');
Route::post('/auth/reset-password',  [PasswordResetController::class, 'reset'])
    ->middleware('throttle:10,1');

// подтверждение по подписанной ссылке
Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
        return response()->json(['message' => 'Invalid verification link.'], 400);
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    $front = rtrim(env('FRONTEND_ORIGIN', 'http://localhost:3000'), '/');
    return redirect($front . '/dashboard?verified=1');
})->middleware('signed')->name('verification.verify');

/*
|--------------------------------------------------------------------------
| AUTH (SANCTUM)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me',           [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // повторная отправка письма верификации
    Route::post('/email/verification-notification', function (Request $request) {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            if ($user->hasVerifiedEmail()) {
                return response()->noContent(); // 204 — уже подтвержден
            }

            $user->sendEmailVerificationNotification();

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            Log::error('Verify mail send failed', [
                'user_id' => optional($request->user())->id,
                'error'   => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Failed to send verification email'], 500);
        }
    })->middleware('throttle:6,1');
});

/*
|--------------------------------------------------------------------------
| AUTH + VERIFIED
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/projects',                      [ProjectController::class, 'index']);
    Route::get('/projects/{project}',            [ProjectController::class, 'show']);
    Route::patch('/projects/{project}/progress', [ProjectController::class, 'updateProgress']);

    Route::get('/projects/{project}/messages',   [MessageController::class, 'index']);
    Route::post('/projects/{project}/messages',  [MessageController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| ADMIN API (X-Admin-Token)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(\App\Http\Middleware\AdminToken::class)->group(function () {

    Route::get('/ping', fn () => response()->json(['ok' => true]));

    // Users
    Route::get('/users',                [UserAdminController::class, 'index']);
    Route::patch('/users/{user}/role',  [UserAdminController::class, 'updateRole']);
    Route::get('/staff',                [UserAdminController::class, 'staff']);
    Route::delete('/users/{user}',      [UserAdminController::class, 'destroy']);

    // Projects
    Route::get('/projects',             [ProjectAdminController::class, 'index']);
    Route::post('/projects',            [ProjectAdminController::class, 'store']);
    Route::get('/projects/{project}',   [ProjectAdminController::class, 'show']);
    Route::patch('/projects/{project}', [ProjectAdminController::class, 'update']);
    Route::delete('/projects/{project}',[ProjectAdminController::class, 'destroy']);

    // Orders
    Route::get('/orders',               [OrderController::class, 'index']);
    Route::put('/orders/{order}/read',  [OrderController::class, 'markRead']);

    // Заявки
    Route::delete('/contact-submissions/{contactSubmission}',
        [ContactSubmissionController::class, 'destroy']);
    Route::delete('/contact-submissions',
        [ContactSubmissionController::class, 'bulkDestroy']);
    Route::patch('/contact-submissions/{contactSubmission}',
        [ContactSubmissionController::class, 'update']);

    // Портфолио (админ)
    Route::apiResource('portfolio', PortfolioController::class)->only(['store','update','destroy']);
});
