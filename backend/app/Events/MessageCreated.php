<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;            // ← вот это
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public Message $message) {
        $this->message->load(['sender:id,name', 'attachments']);
    }

    // БЫЛО: Channel → public
    // СТАЛО: PrivateChannel → private
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('project.'.$this->message->project_id);
    }

    public function broadcastAs(): string
    {
        return 'message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id'         => $this->message->id,
                'project_id' => $this->message->project_id,
                'sender'     => $this->message->sender ? [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                ] : null,
                'body'       => $this->message->body,
                'created_at' => $this->message->created_at?->toISOString(),
                'attachments'=> $this->message->attachments->map(fn($a)=>[
                    'id'=>$a->id,'url'=>$a->url,'mime'=>$a->mime,'size'=>$a->size,
                    'original_name'=>$a->original_name,'type'=>$a->type,
                    'width'=>$a->width,'height'=>$a->height,'duration'=>$a->duration,
                ])->all(),
            ],
        ];
    }
}
