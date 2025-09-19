<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Log; // ← ДОБАВИЛИ

class PasswordResetController extends Controller
{
    // POST /api/auth/forgot-password  { email }
    public function sendLink(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(['email' => $validated['email']]);

        // лог только в локале
        if (app()->isLocal()) {
            Log::info('sendResetLink status', [
                'email'  => $validated['email'],
                'status' => $status,
            ]);
        }

        // Всегда единый ответ (без утечки информации)
        return response()->json(['ok' => true]);
    }

    // POST /api/auth/reset-password { token, email, password, password_confirmation }
    public function reset(Request $request)
    {
        $validated = $request->validate([
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(6)],
        ]);

        $status = Password::reset(
            [
                'email'                 => $validated['email'],
                'password'              => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'), // ← отсюда
                'token'                 => $validated['token'],
            ],
            function ($user) use ($validated) {
                $user->forceFill([
                    'password' => Hash::make($validated['password']),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if (app()->isLocal()) {
            Log::info('password.reset status', [
                'email'  => $validated['email'],
                'status' => $status,
            ]);
        }

        return response()->json(['ok' => $status === Password::PASSWORD_RESET]);
    }
}
