/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // не валим прод-сборку из-за ESLint
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;
