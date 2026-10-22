const prisma = require('../lib/prisma');

// Records who changed what. Never throws: a logging failure must not break the change itself.
async function logActivity(req, { action, entityType, entityId = null, entityLabel = null, details = null }) {
  try {
    const a = req.admin;
    await prisma.activityLog.create({
      data: {
        adminId: a?.id ?? null,
        adminName: a?.name || a?.email || 'System',
        adminEmail: a?.email || '',
        action,
        entityType,
        entityId,
        entityLabel: entityLabel ? String(entityLabel).slice(0, 300) : null,
        details,
      },
    });
  } catch (e) {
    console.error('[activity] failed to record:', e.message);
  }
}

const stable = (v) => JSON.stringify(v instanceof Date ? v.toISOString() : v ?? null);
const changedFields = (before, after, keys) => [...new Set(keys)].filter((k) => stable(before?.[k]) !== stable(after?.[k]));

module.exports = { logActivity, changedFields };
