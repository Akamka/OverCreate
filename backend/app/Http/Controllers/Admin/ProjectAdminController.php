<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectAdminController extends Controller
{
    public function index(Request $request)
    {
        $q = Project::query()
            ->with(['user:id,name,email','assignee:id,name,email,role'])
            ->select(['id','title','description','status','progress','user_id','assignee_id','created_at']);

        if ($search = trim((string) $request->query('q'))) {
            $q->where(function ($x) use ($search) {
                $x->where('title','like',"%{$search}%")
                  ->orWhere('description','like',"%{$search}%");
            });
        }

        if ($status = $request->query('status'))      $q->where('status', $status);
        if ($uid = $request->query('user_id'))        $q->where('user_id', $uid);
        if ($aid = $request->query('assignee_id'))    $q->where('assignee_id', $aid);

        $q->orderByDesc('id');

        return response()->json($q->paginate(20));
    }

    public function show(Project $project)
    {
        return response()->json(
            $project->load(['user:id,name,email','assignee:id,name,email,role'])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'status'       => 'nullable|in:new,in_progress,paused,done',
            'progress'     => 'nullable|integer|min:0|max:100',
            'user_id'      => 'required|exists:users,id',
            'assignee_id'  => 'nullable|exists:users,id',
        ]);

        $data['status']   = $data['status']   ?? 'new';
        $data['progress'] = $data['progress'] ?? 0;

        $p = Project::create($data);

        return response()->json(
            $p->load(['user:id,name,email','assignee:id,name,email,role']),
            201
        );
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'description'  => 'nullable|string',
            'status'       => 'nullable|in:new,in_progress,paused,done',
            'progress'     => 'nullable|integer|min:0|max:100',
            'user_id'      => 'nullable|exists:users,id',
            'assignee_id'  => 'nullable|exists:users,id',
        ]);

        $project->fill($data)->save();

        return response()->json(
            $project->load(['user:id,name,email','assignee:id,name,email,role'])
        );
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json([], 204);
    }
}
