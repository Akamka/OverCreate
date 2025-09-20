<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function index(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        return $project->messages()
            ->with(['sender:id,name','attachments'])
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()?->id, $project);

        // multipart: body опционально, files[]=...
        $validated = $request->validate([
            'body' => ['nullable','string','max:5000'],
            'files' => ['nullable','array','max:10'],
            'files.*' => [
                'file',
                'max:20480', // 20MB на файл
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg,application/pdf,application/zip,application/x-zip-compressed,text/plain',
            ],
        ]);

        // если нет текста и нет файлов — ошибка
        $hasBody  = !empty($validated['body']);
        $hasFiles = count($request->file('files', [])) > 0;
        if (!$hasBody && !$hasFiles) {
            return response()->json(['error' => 'Пустое сообщение'], 422);
        }

        $msg = Message::create([
            'project_id' => $project->id,
            'sender_id'  => $request->user()->id,
            'body'       => $validated['body'] ?? '',
        ]);

        // сохраняем вложения
        $files  = $request->file('files', []);
        $disk   = config('filesystems.default', 'public'); // у тебя public
        $baseDir = "chat/{$project->id}/".date('Y/m');

        foreach ($files as $file) {
            $ext  = $file->getClientOriginalExtension();
            $name = Str::uuid()->toString().($ext ? '.'.$ext : '');
            $path = $file->storePubliclyAs($baseDir, $name, $disk);

            // Для public-диска формируем URL так (и IDE не ругается):
            $url  = asset('storage/'.$path);
            // Если понадобится через фасад:
            // $url = Storage::disk($disk)->url($path);

            $mime = $file->getClientMimeType() ?: $file->getMimeType();
            $size = $file->getSize() ?? 0;

            $width = $height = $duration = null;
            if (str_starts_with((string) $mime, 'image/')) {
                [$width, $height] = @getimagesize($file->getRealPath()) ?: [null, null];
            }

            MessageAttachment::create([
                'message_id'    => $msg->id,
                'original_name' => $file->getClientOriginalName(),
                'path'          => $path,
                'url'           => $url,
                'mime'          => $mime,
                'size'          => $size,
                'width'         => $width,
                'height'        => $height,
                'duration'      => $duration,
            ]);
        }

        $msg->load(['sender:id,name','attachments']);

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
