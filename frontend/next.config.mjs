/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'https://api.overcreate.co';

const MEDIA_HOST_ENV =
  process.env.NEXT_PUBLIC_MEDIA_HOST ||
  process.env.AWS_BUCKET_HOST ||
  '';

const remotePatterns = [
  { protocol: 'https', hostname: 'api.overcreate.co', pathname: '/**' },
  { protocol: 'http',  hostname: 'api.overcreate.co', pathname: '/**' },
];

if (MEDIA_HOST_ENV) {
  remotePatterns.push(
    { protocol: 'https', hostname: MEDIA_HOST_ENV, pathname: '/**' },
    { protocol: 'http',  hostname: MEDIA_HOST_ENV, pathname: '/**' },
  );
}

remotePatterns.push(
  { protocol: 'http', hostname: '127.0.0.1', port: '8080', pathname: '/**' },
  { protocol: 'http', hostname: 'localhost',  port: '8080', pathname: '/**' },
);

const API_ORIGIN = API_BASE.replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,

  env: {
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

  // ⬇️ ВСЕГДА проксируем /storage/* через наш домен, чтобы не было CORS
  async rewrites() {
    const rules = [
      { source: '/storage/:path*', destination: `${API_ORIGIN}/storage/:path*` },
    ];
    if (!isProd) {
      rules.push(
        { source: '/api/:path*',          destination: `${API_ORIGIN}/api/:path*` },
        { source: '/broadcasting/:path*', destination: `${API_ORIGIN}/broadcasting/:path*` },
      );
    }
    return rules;
  },

  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
