<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'client',
        ]);

        // выдаём токен (чтобы пользователь мог попасть на /verify-email и нажимать "отправить ещё раз")
        $token = $user->createToken('auth')->plainTextToken;

        // сразу отправляем письмо подтверждения
        $user->sendEmailVerificationNotification();

        return response()->json([
            'token'       => $token,
            'user'        => $user,
            'mustVerify'  => is_null($user->email_verified_at),
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Неверный логин или пароль'], 422);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
            'mustVerify' => is_null($user->email_verified_at),
        ]);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }
}
