/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// База API (dev/preview/prod)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://api.overcreate.co';

// Доп. медиа-хосты (например, CDN/S3: cdn.example.com или bucket.r2.cloudflarestorage.com)
const MEDIA_HOST_ENV = process.env.NEXT_PUBLIC_MEDIA_HOST || process.env.AWS_BUCKET_HOST || '';

/**
 * Собираем список remotePatterns для next/image
 * - api.overcreate.co → только /storage/**
 * - MEDIA_HOST_ENV (если задан) → на всякий случай /** (там могут быть не только /storage)
 */
const remotePatterns = [
  { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/storage/**' },
  { protocol: 'http',  hostname: 'api.overcreate.co', pathname: '/storage/**' },
];

// если задан внешний медиа-домен — разрешим его (и http, и https)
if (MEDIA_HOST_ENV) {
  remotePatterns.push(
    { protocol: 'https', hostname: MEDIA_HOST_ENV, pathname: '/**' },
    { protocol: 'http',  hostname: MEDIA_HOST_ENV, pathname: '/**' },
  );
}

// локалка
remotePatterns.push(
  { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/storage/**' },
  { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/storage/**' },
);

const nextConfig = {
  reactStrictMode: true,

  // Чтобы на клиенте всегда была валидная база API
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      'https://api.overcreate.co',
    // прокинем и медиа-хост (если используешь его в клиентском коде)
    NEXT_PUBLIC_MEDIA_HOST: MEDIA_HOST_ENV,
  },

  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)', destination: '/', permanent: true },
    ];
  },

  // В проде прокси не нужен — фронт ходит напрямую на публичный API.
  // В dev проксируем, чтобы избежать CORS и иметь одинаковые пути в коде.
  async rewrites() {
    if (isProd) return [];
    return [
      { source: '/api/:path*',          destination: `${API_BASE.replace(/\/+$/, '')}/api/:path*` },
      { source: '/broadcasting/:path*', destination: `${API_BASE.replace(/\/+$/, '')}/broadcasting/:path*` },
    ];
  },

  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
