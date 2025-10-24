/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// База API (dev/preview/prod)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://api.overcreate.co';

// Доп. медиа-хост (CDN/S3 и т.п.), если используете
const MEDIA_HOST_ENV =
  process.env.NEXT_PUBLIC_MEDIA_HOST ||
  process.env.AWS_BUCKET_HOST ||
  '';

/**
 * ВАЖНО: разрешаем ЛЮБОЙ путь на api.overcreate.co, а не только /storage/**
 * (т.к. иногда обложки идут как /api/media/.../cover и проксируются сервером).
 */
const remotePatterns = [
  { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/**' },
  { protocol: 'http',  hostname: 'api.overcreate.co', pathname: '/**' },
];

// если задан внешний медиа-домен — разрешим его целиком
if (MEDIA_HOST_ENV) {
  remotePatterns.push(
    { protocol: 'https', hostname: MEDIA_HOST_ENV, pathname: '/**' },
    { protocol: 'http',  hostname: MEDIA_HOST_ENV, pathname: '/**' },
  );
}

// локалка
remotePatterns.push(
  { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/**' },
  { protocol: 'http', hostname: 'localhost',  port: '8080', pathname: '/**' },
);

const nextConfig = {
  reactStrictMode: true,

  env: {
    // Всегда прокидываем базу API на клиент
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      'https://api.overcreate.co',
    NEXT_PUBLIC_MEDIA_HOST: MEDIA_HOST_ENV,
  },

  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)',        destination: '/',        permanent: true },
    ];
  },

  // В dev проксируем /api -> реальный API, чтобы не упираться в CORS
  async rewrites() {
    if (isProd) return [];
    const base = API_BASE.replace(/\/+$/, '');
    return [
      { source: '/api/:path*',          destination: `${base}/api/:path*` },
      { source: '/broadcasting/:path*', destination: `${base}/broadcasting/:path*` },
    ];
  },

  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
