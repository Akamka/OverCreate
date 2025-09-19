<?php

use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('project.{projectId}', function ($user, $projectId) {
    // Разрешаем клиенту/исполнителю проекта слушать канал
    return \App\Models\Project::whereKey($projectId)
        ->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('assignee_id', $user->id);
        })->exists();
});

