const prisma = require('../lib/prisma');

const DEFAULTS = {
  siteName: 'Prevent & Restore Physical Therapy',
  defaultMetaDescription: '',
  defaultOgImage: '',
};

async function getGeneralSettings() {
  const row = await prisma.setting.findUnique({ where: { key: 'general' } });
  return { ...DEFAULTS, ...(row?.value || {}) };
}

async function saveGeneralSettings(value) {
  const merged = { ...(await getGeneralSettings()), ...value };
  await prisma.setting.upsert({ where: { key: 'general' }, update: { value: merged }, create: { key: 'general', value: merged } });
  return merged;
}

module.exports = { getGeneralSettings, saveGeneralSettings, DEFAULTS };
