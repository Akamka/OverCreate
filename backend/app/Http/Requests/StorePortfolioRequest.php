<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\ServiceType;

class StorePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // админ-мидлварь уже защищает
    }

    // ...
    public function rules(): array
        {
            return [
                'title'        => ['required','string','max:255'],
                'slug'         => ['nullable','string','max:255','unique:portfolios,slug'],
                'service_type' => ['required','string','in:'.implode(',', ServiceType::ALL)],

                'cover_url'    => ['nullable','url'],
                'gallery'      => ['nullable','array'],
                'gallery.*'    => ['nullable','url'],

                'video_url'    => ['nullable','url','regex:/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i'], // ⬅️

                'cover'           => ['nullable','file','mimetypes:image/jpeg,image/png,image/webp','max:102400'],
                'gallery_files'   => ['nullable','array'],
                'gallery_files.*' => ['file','mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm','max:102400'],

                'client'       => ['nullable','string','max:255'],
                'tags'         => ['nullable','string','max:255'],
                'excerpt'      => ['nullable','string'],
                'body'         => ['nullable','string'],
                'is_published' => ['boolean'],
                'is_featured'  => ['boolean'],
                'sort_order'   => ['integer','min:0'],
                'meta_title'   => ['nullable','string','max:255'],
                'meta_description' => ['nullable','string','max:500'],
            ];
        }


    /** Нормализуем вход до валидации/после авторизации */
    protected function prepareForValidation(): void
    {
        $norm = ServiceType::normalize($this->input('service_type'));
        if ($norm) {
            $this->merge(['service_type' => $norm]);
        }
    }
}
