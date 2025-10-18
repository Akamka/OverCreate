<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    /**
     * Список сообщений проекта (по возрастанию id).
     */
    public function index(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        return $project->messages()
            ->with(['sender:id,name', 'attachments'])
            ->orderBy('id')
            ->get();
    }

    /**
     * Создать сообщение (текст + опциональные файлы).
     */
    public function store(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        $validated = $request->validate([
            'body'    => ['nullable', 'string', 'max:5000'],
            'files'   => ['nullable', 'array', 'max:10'],
            'files.*' => [
                'file',
                'max:20480', // 20MB
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg,application/pdf,application/zip,application/x-zip-compressed,text/plain',
            ],
        ]);

        $hasBody  = filled($validated['body'] ?? null);
        $hasFiles = count($request->file('files', [])) > 0;

        if (!$hasBody && !$hasFiles) {
            return response()->json(['message' => 'Пустое сообщение'], 422);
        }

        $msg = Message::create([
            'project_id' => $project->id,
            'sender_id'  => $request->user()->id,
            'body'       => $validated['body'] ?? '',
        ]);

        // Сохраняем вложения (если есть)
        $files   = $request->file('files', []);
        $disk    = config('filesystems.default', 'public'); // по умолчанию public
        $baseDir = "chat/{$project->id}/" . date('Y/m');

        foreach ($files as $file) {
            $ext  = (string) $file->getClientOriginalExtension();
            $name = Str::uuid()->toString() . ($ext !== '' ? '.' . $ext : '');

            $path = $file->storePubliclyAs($baseDir, $name, $disk);

            // ---------- Публичный URL ----------
            // Для public-диска Storage::url вернёт /storage/...,
            // для S3/HTTPS-дисков — полный https-URL.
            /** @var FilesystemAdapter $fs */
            $fs     = Storage::disk($disk);
            $rawUrl = $fs->url($path);

            // Если драйвер вернул относительный путь (бывает с public),
            // сделаем абсолютным к текущему APP_URL:
            $url = preg_match('#^https?://#i', $rawUrl) ? $rawUrl : asset($rawUrl);
            // -----------------------------------

            $mime = $file->getClientMimeType() ?: $file->getMimeType();
            $size = (int) ($file->getSize() ?? 0);

            $width = $height = $duration = null;
            if (is_string($mime) && str_starts_with($mime, 'image/')) {
                [$width, $height] = @getimagesize($file->getRealPath()) ?: [null, null];
            }

            MessageAttachment::create([
                'message_id'    => $msg->id,
                'original_name' => (string) $file->getClientOriginalName(),
                'path'          => $path,
                'url'           => $url,
                'mime'          => (string) $mime,
                'size'          => $size,
                'width'         => $width,
                'height'        => $height,
                'duration'      => $duration,
            ]);
        }

        // Подтягиваем отправителя и вложения для ответа и бродкаста
        $msg->load(['sender:id,name', 'attachments']);

        // Не роняем запрос, если брокер недоступен — просто логируем
        try {
            broadcast(new MessageCreated($msg))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return response()->json($msg, 201);
    }

    /**
     * Доступ к проекту: либо владелец, либо исполнитель.
     */
    private function authorizeProject(?int $userId, Project $project): void
    {
        abort_unless($userId, 401, 'Unauthorized');

        if ($project->user_id !== $userId && $project->assignee_id !== $userId) {
            abort(403, 'Forbidden');
        }
    }
}
