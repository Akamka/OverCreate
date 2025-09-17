<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects — проекты текущего пользователя (клиента)
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Project::query()
            ->with(['user:id,name,email', 'assignee:id,name,email,role'])
            ->where(function ($x) use ($user) {
                // клиент видит свои проекты
                $x->where('user_id', $user->id);

                // если он же назначен исполнителем — тоже видит (на случай staff/admin)
                if (in_array($user->role, ['admin', 'staff'])) {
                    $x->orWhere('assignee_id', $user->id);
                }
            })
            ->orderByDesc('id');

        return response()->json($q->paginate(20));
    }

    // GET /api/projects/{project}
    public function show(Request $request, Project $project)
    {
        $user = $request->user();

        if (
            $project->user_id !== $user->id &&
            $project->assignee_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(
            $project->load(['user:id,name,email', 'assignee:id,name,email,role'])
        );
    }

    // PATCH /api/projects/{project}/progress
    public function updateProgress(Request $request, Project $project)
    {
        $user = $request->user();

        // менять прогресс может исполнитель проекта или админ
        $canEdit =
            $user->role === 'admin' ||
            ($user->role === 'staff' && $project->assignee_id === $user->id);

        if (!$canEdit) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'status'   => 'nullable|in:new,in_progress,paused,done',
        ]);

        $project->progress = $data['progress'];
        if (array_key_exists('status', $data)) {
            $project->status = $data['status'];
        }
        $project->save();

        return response()->json([
            'id'       => $project->id,
            'progress' => $project->progress,
            'status'   => $project->status,
        ]);
    }
}
