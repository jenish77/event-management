/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable persistent disk caching in dev mode to prevent chunk corruption on Windows
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
