<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\ServiceType;

class UpdatePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('portfolio')?->id ?? null;

        return [
            'title'        => ['sometimes','required','string','max:255'],
            'slug'         => ['nullable','string','max:255','unique:portfolios,slug,'.$id],
            'service_type' => ['sometimes','required','string','in:'.implode(',', ServiceType::ALL)],
            'cover_url'    => ['nullable','url'],
            'gallery'      => ['nullable','array'],
            'gallery.*'    => ['nullable','url'],

            'cover'                => ['nullable','file','mimetypes:image/jpeg,image/png,image/webp','max:102400'],
            'gallery_files'        => ['nullable','array'],
            'gallery_files.*'      => ['file','mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm','max:102400'],

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

    protected function prepareForValidation(): void
    {
        if ($this->has('service_type')) {
            $norm = ServiceType::normalize($this->input('service_type'));
            if ($norm) {
                $this->merge(['service_type' => $norm]);
            }
        }
    }
}
