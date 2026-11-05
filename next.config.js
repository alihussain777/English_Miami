/** @type {import('next').NextConfig} */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = 'english-miami-ultra-secure-jwt-secret-key-production-32chars';
}

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    AUTH_SECRET: process.env.AUTH_SECRET || 'english-miami-ultra-secure-jwt-secret-key-production-32chars',
  },
};

module.exports = nextConfig;
