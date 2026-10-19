const env = require('./config/env');
const app = require('./app');
const { ensureSetupTokenOnBoot } = require('./services/setupToken');

app.listen(env.port, '0.0.0.0', async () => {
  console.log(`[server] API listening on :${env.port} (storage: ${env.s3Enabled ? 'S3' : 'local disk'})`);
  try {
    await ensureSetupTokenOnBoot();
  } catch (e) {
    console.error('[setup] Could not check admin setup state:', e.message);
  }
});
