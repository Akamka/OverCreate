<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        $q = User::query()->select(['id','name','email','role','created_at']);

        if ($search = trim((string) $request->query('q'))) {
            $q->where(function ($x) use ($search) {
                $x->where('name', 'like', "%{$search}%")
                  ->orWhere('email','like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $q->where('role', $role);
        }

        $q->orderByDesc('id');

        return response()->json($q->paginate(20));
    }

    public function staff()
    {
        return response()->json(
            User::query()
                ->whereIn('role', ['staff','admin'])
                ->orderBy('name')
                ->get(['id','name','email','role'])
        );
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => 'required|in:client,staff,admin',
        ]);

        $user->role = $data['role'];
        $user->save();

        return response()->json($user);
    }
}
