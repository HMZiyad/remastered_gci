const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('==> No users found in database. Seeding initial data (Admin user + sample vehicles)...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('==> Initial database seed finished successfully!');
    } else {
      console.log(`==> Existing database detected with ${userCount} user(s). Skipping initial seed to preserve data.`);
    }
  } catch (err) {
    console.error('==> Database initialization check warning:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
