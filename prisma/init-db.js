const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@goodcarimports.com').trim().toLowerCase();
    const targetPassword = process.env.ADMIN_INITIAL_PASSWORD || 'password123';

    if (userCount === 0) {
      console.log('==> No users found in database. Seeding initial data (Admin user + sample vehicles)...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('==> Initial database seed finished successfully!');
    } else {
      console.log(`==> Existing database detected with ${userCount} user(s).`);

      // Ensure admin user exists with a valid password
      const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

      if (!admin) {
        console.log(`==> Admin user (${adminEmail}) not found. Creating admin account...`);
        const passwordHash = bcrypt.hashSync(targetPassword, 10);
        await prisma.user.create({
          data: {
            name: 'M. Rahman',
            email: adminEmail,
            password_hash: passwordHash,
            role: 'admin',
            title: 'Managing Director',
            avatar_initials: 'MR',
          },
        });
        console.log(`==> Admin account created: ${adminEmail}`);
      } else {
        // Check if existing password hash matches targetPassword; if not, sync it
        const matches = bcrypt.compareSync(targetPassword, admin.password_hash);
        if (!matches && process.env.SYNC_ADMIN_PASSWORD !== 'false') {
          console.log(`==> Syncing admin password hash for ${adminEmail} to default credentials...`);
          const passwordHash = bcrypt.hashSync(targetPassword, 10);
          await prisma.user.update({
            where: { email: adminEmail },
            data: { password_hash: passwordHash },
          });
          console.log(`==> Admin password successfully updated.`);
        }
      }
    }
  } catch (err) {
    console.error('==> Database initialization check warning:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
