<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Project;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // GET /api/projects/{project}/messages
    public function index(Request $request, Project $project)
    {
        $user = $request->user();

        if (
            $project->user_id !== $user->id &&
            $project->assignee_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = Message::query()
            ->with('sender:id,name,email')
            ->where('project_id', $project->id)
            ->orderBy('created_at')
            ->get(['id','project_id','sender_id','body','created_at']);

        return response()->json($messages);
    }

    // POST /api/projects/{project}/messages
    public function store(Request $request, Project $project)
    {
        $user = $request->user();

        if (
            $project->user_id !== $user->id &&
            $project->assignee_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'project_id' => $project->id,
            'sender_id'  => $user->id,
            'body'       => $data['body'],
        ])->load('sender:id,name,email');

        // если будешь бродкастить — тут вызови событие
        // event(new \App\Events\MessageCreated($message));

        return response()->json($message, 201);
    }
}
