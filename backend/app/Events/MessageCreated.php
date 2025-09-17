<?php
namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public Message $message) {
        $this->message->load('sender:id,name');
    }

    public function broadcastOn(): Channel {
        // Публичный канал (без auth). Для приватного понадобятся private-каналы и auth.
        return new Channel('project.'.$this->message->project_id);
    }

    public function broadcastAs(): string {
        return 'message.created';
    }
}
