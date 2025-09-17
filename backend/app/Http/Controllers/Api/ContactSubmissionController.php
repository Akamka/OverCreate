<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactSubmissionController extends Controller
{
    public function store(Request $request)
    {
        // антиспам: если honeypot заполнен — это бот
        if ($request->filled('honeypot')) {
            return response()->json(['ok' => true], 200);
        }

        $v = Validator::make($request->all(), [
            'first_name' => 'required|string|max:120',
            'last_name'  => 'required|string|max:120',
            'email'      => 'required|email|max:160',
            'phone'      => 'nullable|string|max:60',
            'subject'    => 'nullable|string|max:200',
            'message'    => 'required|string|max:5000',
            'page'       => 'nullable|string|max:200',
            'utm_source'   => 'nullable|string|max:100',
            'utm_medium'   => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $v->validated();
        $data['ip'] = $request->ip();

        $submission = ContactSubmission::create($data);

        return response()->json(['ok' => true, 'id' => $submission->id], 201);
    }

    public function index(Request $request)
    {
        // простая защита админ-эндпоинта токеном
        $token = $request->header('X-Admin-Token');
        if ($token !== env('ADMIN_TOKEN', 'changeme')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return ContactSubmission::orderByDesc('id')->paginate(20);
    }
}
