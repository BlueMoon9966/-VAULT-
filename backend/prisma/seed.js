const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existing) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({ data: { username: 'admin', email: ADMIN_EMAIL, password: hash, role: 'admin' } });
    console.log('Seeded admin user:', ADMIN_EMAIL);
  } else {
    console.log('Admin already exists');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
