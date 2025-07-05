/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  env: {
    PORT: '3000',
  },
};

export default nextConfig;
