import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('password123', 10);
  await prisma.user.update({
    where: { email: 'admin@goodcarimports.com' },
    data: { password_hash: hash },
  });
  console.log('Password updated to password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
