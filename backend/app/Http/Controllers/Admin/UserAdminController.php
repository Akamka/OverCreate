<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index()
    {
        return User::orderByDesc('id')->paginate(20);
    }

    public function updateRole(Request $request, User $user)
    {
        // Берём role из тела (JSON/FORM); если пусто — пробуем query (?role=...)
        $role = $request->input('role');
        if ($role === null) {
            $role = $request->query('role');
        }

        // Валидация наличия
        if ($role === null || $role === '') {
            return response()->json([
                'message' => 'The role field is required.',
                'errors'  => ['role' => ['The role field is required.']],
            ], 422);
        }

        // Нормализуем и проверяем допустимые значения
        $role = strtolower(trim((string) $role));
        $allowed = ['client', 'staff', 'admin'];
        if (!in_array($role, $allowed, true)) {
            return response()->json([
                'message' => 'Invalid role value.',
                'errors'  => ['role' => ['Allowed: client, staff, admin']],
            ], 422);
        }

        // Сохраняем
        $user->update(['role' => $role]);

        return response()->json(['ok' => true, 'user' => $user]);
    }

    public function staff()
    {
        return User::where('role', 'staff')->get();
    }

    // 🔥 Удаление пользователя
    public function destroy(User $user, Request $request)
    {
        // Запретить удаление себя
        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json(['message' => 'Нельзя удалить свой аккаунт'], 422);
        }
        $user->delete();
        return response()->json(['ok' => true]);
    }
}
