require('../src/config/env');
const prisma = require('../src/lib/prisma');
const { createSetupToken } = require('../src/services/setupToken');

(async () => {
  const result = await createSetupToken();
  if (!result) console.log('An admin account already exists. Setup is disabled.');
  else console.log(`Setup token (expires ${result.expiresAt.toISOString()}):\n${result.token}`);
  await prisma.$disconnect();
})();
