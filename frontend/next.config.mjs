/** @type {import('next').NextConfig} */
const API = process.env.BACKEND_API_URL; // например https://api.overcreate.co

/** helper для host/port картинок */
function imagePatternFromApi(api) {
  try {
    const u = new URL(api);
    return [{ protocol: u.protocol.replace(':',''), hostname: u.hostname, port: u.port || undefined, pathname: '/storage/**' }];
  } catch { return []; }
}

const nextConfig = {
  async redirects() {
    return [
      { source: '/:locale(uk|en|pl|ru)/:path*', destination: '/:path*', permanent: true },
      { source: '/:locale(uk|en|pl|ru)', destination: '/', permanent: true },
    ];
  },

  async rewrites() {
    if (!API) return []; // в проде без API не проксируем
    return [
      { source: '/api/:path*',          destination: `${API}/api/:path*` },
      { source: '/broadcasting/:path*', destination: `${API}/broadcasting/:path*` },
    ];
  },

  images: {
    remotePatterns: API ? imagePatternFromApi(API) : [],
    // на время без API можно включить:
    // unoptimized: !API,
  },
};

export default nextConfig;
