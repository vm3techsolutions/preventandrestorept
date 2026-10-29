// Writes a JSON snapshot of the main content tables to server/backups/ (non-destructive).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const prisma = require('../src/lib/prisma');

(async () => {
  const tables = ['treatment', 'service', 'serviceTreatment', 'urlRedirect', 'blog', 'page', 'admin'];
  const out = {};
  for (const t of tables) out[t] = await prisma[t].findMany();
  if (out.admin) out.admin = out.admin.map(({ passwordHash, ...a }) => a);
  const dir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`[backup] ${file} ${Object.entries(out).map(([k, v]) => `${k}=${v.length}`).join(' ')}`);
  await prisma.$disconnect();
})();
