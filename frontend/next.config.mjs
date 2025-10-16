// next.config.mjs
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8080';

const nextConfig = {
  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)', destination: '/', permanent: true },
    ];
  },

  async rewrites() {
    // В ПРОДЕ — НИКАКИХ localhost!
    if (isProd) return [];
    // Локально удобно проксировать на докер/лару
    return [
      { source: '/api/:path*',           destination: `${API_BASE}/api/:path*` },
      { source: '/broadcasting/:path*',  destination: `${API_BASE}/broadcasting/:path*` },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/storage/**' },
      // на случай локальной разработки
      { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/storage/**' },
      { protocol: 'http', hostname: 'localhost',  port: '8080', pathname: '/storage/**' },
    ],
  },
};

export default nextConfig;
