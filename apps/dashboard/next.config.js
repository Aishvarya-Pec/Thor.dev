/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle WebSocket and other node modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Handle Monaco Editor
    config.module.rules.push({
      test: /\.woff2?$/,
      type: 'asset/resource',
    });

    return config;
  },
  async rewrites() {
    return [
      // Proxy WebSocket connections during development
      {
        source: '/api/ws/:path*',
        destination: 'http://localhost:8080/:path*',
      },
      // Preview generated apps
      {
        source: '/preview/:id/:path*',
        destination: '/api/preview/:id/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;