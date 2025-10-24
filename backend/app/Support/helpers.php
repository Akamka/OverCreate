<?php

if (! function_exists('_normalize_storage_path')) {
    function _normalize_storage_path(string $path): string
    {
        $path = ltrim($path, '/');
        // убираем возможный префикс "storage/"
        return preg_replace('~^storage/+~', '', $path) ?? $path;
    }
}
