<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;           // <-- private
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public Message $message)
    {
        // грузим всё, что нужно показать на фронте
        $this->message->load(['sender:id,name', 'attachments']);
    }

    /** Шлём именно в private-канал project.{id} */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('project.'.$this->message->project_id);
    }

    /** Короткое имя события */
    public function broadcastAs(): string
    {
        return 'message.created';
    }

    /** Полезная нагрузка */
    public function broadcastWith(): array
    {
        $m = $this->message;

        return [
            'message' => [
                'id'         => $m->id,
                'project_id' => $m->project_id,
                'sender'     => $m->sender ? [
                    'id'   => $m->sender->id,
                    'name' => $m->sender->name,
                ] : null,
                'body'       => $m->body,
                'created_at' => $m->created_at?->toISOString(),
                'attachments'=> $m->attachments->map(fn ($a) => [
                    'id'            => $a->id,
                    'url'           => $a->url,
                    'mime'          => $a->mime,
                    'size'          => $a->size,
                    'original_name' => $a->original_name,
                    'type'          => $a->type,
                    'width'         => $a->width,
                    'height'        => $a->height,
                    'duration'      => $a->duration,
                ])->all(),
            ],
        ];
    }
}
