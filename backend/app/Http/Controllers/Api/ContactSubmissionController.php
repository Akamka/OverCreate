<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactSubmissionController extends Controller
{
    /**
     * Публичный/админский список:
     * - поддерживает пагинацию (?page, ?per_page)
     * - фильтр по статусу (?status=...)
     * - поиск (?q=...) по имени/email/телефону/сообщению
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 20);
        $status  = $request->string('status')->toString();
        $q       = trim($request->string('q')->toString());

        $query = ContactSubmission::query()->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('first_name', 'like', "%{$q}%")
                   ->orWhere('last_name',  'like', "%{$q}%")
                   ->orWhere('email',      'like', "%{$q}%")
                   ->orWhere('phone',      'like', "%{$q}%")
                   ->orWhere('message',    'like', "%{$q}%");
            });
        }

        // Возвращаем пагинацию (как и сейчас)
        return $query->paginate($perPage);
    }

    /**
     * Публичное создание заявки из формы (как было).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required','string','max:120'],
            'last_name'  => ['required','string','max:120'],
            'email'      => ['required','email','max:160'],
            'phone'      => ['nullable','string','max:60'],
            'page'       => ['nullable','string','max:255'],
            'subject'    => ['nullable','string','max:255'],
            'message'    => ['required','string'],
            'utm_source'   => ['nullable','string','max:120'],
            'utm_medium'   => ['nullable','string','max:120'],
            'utm_campaign' => ['nullable','string','max:120'],
            'honeypot'     => ['nullable','string','max:255'],
            'ip'           => ['nullable','ip'],
        ]);

        // Базовый антиспам: если заполнен honeypot — игнорируем запись "тихо"
        if (!empty($data['honeypot'])) {
            return response()->json(['ok' => true], 201);
        }

        $data['status'] = 'new';
        $created = ContactSubmission::create($data);

        return response()->json($created, 201);
    }

    /**
     * Админ: смена статуса или частичное обновление (PATCH).
     * Подключается в /api/admin/... ( см. routes ).
     */
    public function update(Request $request, ContactSubmission $contactSubmission)
    {
        $allowed = ContactSubmission::allowedStatuses();

        $data = $request->validate([
            'status' => ['sometimes','required', Rule::in($allowed)],
        ]);

        $contactSubmission->fill($data)->save();

        return $contactSubmission;
    }

    /**
     * Админ: удаление одной заявки.
     */
    public function destroy(ContactSubmission $contactSubmission)
    {
        $contactSubmission->delete();

        return response()->noContent();
    }

    /**
     * Админ: массовое удаление по списку id.
     * body: { ids: number[] }
     */
    public function bulkDestroy(Request $request)
    {
        $ids = $request->validate([
            'ids'   => ['required','array','min:1'],
            'ids.*' => ['integer','min:1'],
        ])['ids'];

        ContactSubmission::whereIn('id', $ids)->delete();

        return response()->json(['deleted' => count($ids)]);
    }
}
