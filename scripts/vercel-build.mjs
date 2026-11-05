import { execSync } from 'child_process';
import process from 'process';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = 'english-miami-ultra-secure-jwt-secret-key-production-32chars';
}

console.log('[Build] Using DATABASE_URL:', process.env.DATABASE_URL);

try {
  console.log('[Build] Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  console.log('[Build] Step 2: Compiling Next.js application...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });

  console.log('[Build] Completed successfully!');
} catch (error) {
  console.error('[Build] Failed:', error.message);
  process.exit(1);
}
