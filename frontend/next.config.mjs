/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ i18n больше не нужен
  // i18n: { ... },

  async redirects() {
    return [
      // /en/whatever → /whatever
      {
        source: '/:locale(uk|en|pl|ru)/:path*',
        destination: '/:path*',
        permanent: true,
      },
      // /en → /
      {
        source: '/:locale(uk|en|pl|ru)',
        destination: '/',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://127.0.0.1:8080/api/:path*" },
      { source: "/broadcasting/:path*", destination: "http://127.0.0.1:8080/broadcasting/:path*" },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8080", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost",  port: "8080", pathname: "/storage/**" },
    ],
  },
};

export default nextConfig;
