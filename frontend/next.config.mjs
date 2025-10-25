/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://api.overcreate.co';

const MEDIA_HOST =
  process.env.NEXT_PUBLIC_MEDIA_HOST?.trim() || '';

/** Собираем список разрешённых хостов для next/image */
const remotePatterns = [
  { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/**' },
  { protocol: 'http',  hostname: 'api.overcreate.co', pathname: '/**' },
];

// Разрешим медиахост (R2/CDN), если указан
if (MEDIA_HOST) {
  remotePatterns.push(
    { protocol: 'https', hostname: MEDIA_HOST, pathname: '/**' },
    { protocol: 'http',  hostname: MEDIA_HOST, pathname: '/**' },
  );
}

// Для локалки
remotePatterns.push(
  { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/**' },
  { protocol: 'http', hostname: 'localhost',  port: '8080', pathname: '/**' },
);

const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_BASE_URL: API_BASE,
    NEXT_PUBLIC_MEDIA_HOST: MEDIA_HOST,
  },

  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)',        destination: '/',        permanent: true },
    ];
  },

  async rewrites() {
    // Проксируем /storage/* на API
    const rules = [
      { source: '/storage/:path*', destination: `${API_BASE}/storage/:path*` },
    ];
    if (!isProd) {
      rules.push(
        { source: '/api/:path*',          destination: `${API_BASE}/api/:path*` },
        { source: '/broadcasting/:path*', destination: `${API_BASE}/broadcasting/:path*` },
      );
    }
    return rules;
  },

  // ⬇️ Явно отдадим корректный тип для favicon.ico (мы его переписываем на PNG)
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Content-Type', value: 'image/png' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
