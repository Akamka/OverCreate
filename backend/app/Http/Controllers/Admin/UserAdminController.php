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
        $data = $request->validate([
            'role' => ['required', 'in:client,staff,admin'],
        ]);

        $user->update(['role' => $data['role']]);

        return response()->json(['ok' => true, 'user' => $user]);
    }

    public function staff()
    {
        return User::where('role', 'staff')->get();
    }

    // 🔥 Новый метод — удаление пользователя
    public function destroy(User $user, Request $request)
    {
        // запретим удалять себя
        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json(['message' => 'Нельзя удалить свой аккаунт'], 422);
        }
        $user->delete();
        return response()->json(['ok' => true]);
    }

}
