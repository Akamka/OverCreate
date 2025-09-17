<?php
namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $u, Project $p): bool {
        return $u->id === $p->user_id || $u->id === $p->assignee_id || $u->role === 'admin';
    }
    public function updateProgress(User $u, Project $p): bool {
        return $u->role === 'admin' || $u->id === $p->assignee_id;
    }
}
