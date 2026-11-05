/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
      '/*': ['./prisma/dev.db', './prisma/schema.prisma'],
    },
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET || 'english-miami-ultra-secure-jwt-secret-key-production-32chars',
  },
};

module.exports = nextConfig;
