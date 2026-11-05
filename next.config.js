/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: 'file:./dev.db',
    AUTH_SECRET: 'english-miami-ultra-secure-jwt-secret-key-production-32chars',
  },
};

module.exports = nextConfig;
