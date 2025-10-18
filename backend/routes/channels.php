<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('project.{projectId}', function ($user, $projectId) {
    return \App\Models\Project::whereKey($projectId)
        ->where(fn ($q) => $q->where('user_id', $user->id)
                            ->orWhere('assignee_id', $user->id))
        ->exists();
});
