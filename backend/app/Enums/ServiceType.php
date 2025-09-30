<?php

namespace App\Enums;

final class ServiceType
{
    public const WEB      = 'web';
    public const MOTION   = 'motion';
    public const GRAPHIC  = 'graphic';
    public const DEV      = 'dev';
    public const PRINTING = 'printing';

    /** Все допустимые значения */
    public const ALL = [
        self::WEB,
        self::MOTION,
        self::GRAPHIC,
        self::DEV,
        self::PRINTING,
    ];

    /** Нормализация входного значения */
    public static function normalize(?string $v): ?string
    {
        if ($v === null) return null;
        $v = strtolower(trim($v));
        return in_array($v, self::ALL, true) ? $v : null;
    }
}
