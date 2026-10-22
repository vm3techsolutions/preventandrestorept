// Local recovery tool for admin accounts. Usage (from server/):
//   yarn admin list
//   yarn admin activate <email>
//   yarn admin reset-password <email> <newPassword>
//   yarn admin create <email> <password> [full name]
require('../src/config/env');
const bcrypt = require('bcrypt');
const prisma = require('../src/lib/prisma');

const [cmd, emailArg, pw, ...nameParts] = process.argv.slice(2);
const email = emailArg && emailArg.trim().toLowerCase();
const strong = (p) => p && p.length >= 10 && /[A-Za-z]/.test(p) && /\d/.test(p);
const USAGE = 'Usage: yarn admin list | activate <email> | reset-password <email> <password> | create <email> <password> [full name]';

async function run() {
  if (!['list', 'activate', 'reset-password', 'create'].includes(cmd)) throw new Error(USAGE);
  if (cmd === 'list') {
    const rows = await prisma.admin.findMany({ orderBy: { id: 'asc' }, select: { id: true, email: true, name: true, isActive: true, createdAt: true } });
    if (!rows.length) console.log('No admins. Use /admin/setup (yarn setup:token) or `yarn admin create`.');
    rows.forEach((a) => console.log(`#${a.id}  ${a.isActive ? 'ACTIVE     ' : 'DEACTIVATED'}  ${a.email}  ${a.name || ''}`));
    return;
  }
  if (!email) throw new Error(`Email is required. ${USAGE}`);
  if (cmd === 'activate') {
    const a = await prisma.admin.update({ where: { email }, data: { isActive: true } });
    await prisma.loginAttempt.deleteMany({ where: { identifier: { endsWith: `|${email}` } } });
    console.log(`Activated #${a.id} ${a.email}`);
    return;
  }
  if (!strong(pw)) throw new Error('Password must be at least 10 characters with letters and numbers');
  const passwordHash = await bcrypt.hash(pw, 12);
  if (cmd === 'reset-password') {
    const a = await prisma.admin.update({ where: { email }, data: { passwordHash, isActive: true, sessionVersion: { increment: 1 } } });
    await prisma.loginAttempt.deleteMany({ where: { identifier: { endsWith: `|${email}` } } });
    console.log(`Password reset and account activated for #${a.id} ${a.email}`);
    return;
  }
    const isOwner = (await prisma.admin.count()) === 0;
    const a = await prisma.admin.create({ data: { email, passwordHash, isOwner, name: nameParts.join(' ') || null } });
    console.log(`Created active admin #${a.id} ${a.email}${isOwner ? ' (owner)' : ''}`);
}

run()
  .catch((e) => {
    console.error(e.code === 'P2025' ? 'No admin with that email' : e.code === 'P2002' ? 'An admin with that email already exists' : e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
