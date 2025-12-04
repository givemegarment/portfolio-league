/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Transpile OnchainKit to fix CSS @layer issue
  transpilePackages: ['@coinbase/onchainkit'],
};

module.exports = nextConfig;
