<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'first_name'   => 'required|string|max:120',
            'last_name'    => 'required|string|max:120',
            'email'        => 'required|email|max:190',
            'phone'        => 'required|string|max:64',
            'message'      => 'nullable|string|max:5000',
            'service_type' => 'nullable|in:web,graphic,motion,dev,printing',
        ];
    }
}
