<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(6)],
            'password_confirmation' => ['required'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Пытаемся отправить письмо с подтверждением, но НЕ роняем регистрацию,
        // если SMTP/почта не настроены — просто логируем.
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            Log::warning('Email verification send failed: '.$e->getMessage());
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'user'  => $user->only(['id','name','email','email_verified_at']),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required','string','email:rfc'],
            'password' => ['required','string'],
        ]);

        /** @var \App\Models\User|null $user */
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ])->status(422);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'user'  => $user->only(['id','name','email','email_verified_at']),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return response()->json([
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'email_verified_at' => $user->email_verified_at,
        ]);
    }
}
