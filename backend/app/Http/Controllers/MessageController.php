<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Models\Message;
use App\Models\Project;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // GET /api/projects/{project}/messages
    public function index(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        return $project->messages()
            ->with(['sender:id,name'])
            ->orderBy('id')
            ->get();
    }

    // POST /api/projects/{project}/messages
    public function store(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        $data = $request->validate([
            'body' => ['required','string','max:5000'],
        ]);

        $msg = Message::create([
            'project_id' => $project->id,
            'sender_id'  => $request->user()->id,
            'body'       => $data['body'],
        ])->load('sender:id,name');

        // моментальная рассылка (ShouldBroadcastNow)
        broadcast(new MessageCreated($msg))->toOthers();

        return response()->json($msg, 201);
    }

    private function authorizeProject(?int $userId, Project $project): void
    {
        abort_unless($userId, 401, 'Unauthorized');
        if ($project->user_id !== $userId && $project->assignee_id !== $userId) {
            abort(403, 'Forbidden');
        }
    }
}
