/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// Подхватываем базу API из любого из используемых имен переменных
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://127.0.0.1:8080';

const nextConfig = {
  reactStrictMode: true,

  // Чтобы на клиенте всегда была валидная база API (даже если .env не задан)
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE ||
      'https://api.overcreate.co',
  },

  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)', destination: '/', permanent: true },
    ];
  },

  // В продакшене прокси не нужен — фронт ходит напрямую на публичный API.
  // В dev проксируем, чтобы избежать CORS и иметь одинаковые пути в коде.
  async rewrites() {
    if (isProd) return [];
    return [
      { source: '/api/:path*',          destination: `${API_BASE}/api/:path*` },
      { source: '/broadcasting/:path*', destination: `${API_BASE}/broadcasting/:path*` },
    ];
  },

  images: {
    // Разрешаем подгрузку превью обложек/галерей со стораджа API
    remotePatterns: [
      // прод
      { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/storage/**' },
      // иногда CDN/прокси может отдать http — разрешим и его
      { protocol: 'http',  hostname: 'api.overcreate.co', pathname: '/storage/**' },

      // локалка
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/storage/**' },
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/storage/**' },
    ],
    // Можно включить современные форматы
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
