<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * За Render/Cloudflare/Ingress доверяем всем прокси.
     */
    protected $proxies = '*';

    /**
     * Заголовки, из которых брать исходные host/port/scheme.
     */
    protected $headers =
          Request::HEADER_X_FORWARDED_FOR
        | Request::HEADER_X_FORWARDED_HOST
        | Request::HEADER_X_FORWARDED_PORT
        | Request::HEADER_X_FORWARDED_PROTO
        | Request::HEADER_X_FORWARDED_AWS_ELB;
}
