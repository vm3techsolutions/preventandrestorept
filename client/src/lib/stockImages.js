// Licensed stock photos (Unsplash/Pexels), illustrative only. A CMS featured image always takes priority.
export const SERVICE_STOCK = {
  'physical-therapy': '/images/stock/neck.webp',
  'remote-strength-and-conditioning': '/images/stock/barbell.webp',
  'in-person-personal-training': '/images/stock/kettlebell.webp',
  'shockwave-therapy': '/images/stock/assess.webp',
  'dry-needling': '/images/stock/knee-exam.webp',
  'injury-prevention-workshops': '/images/stock/rehab-gym.webp',
  'injury-prevention-screening': '/images/stock/performance-testing.webp',
  'functional-movement-screening': '/images/stock/lift-woman.webp',
  'manual-therapy': '/images/stock/stretch.webp',
  'blood-flow-restriction-therapy': '/images/stock/knee-device.webp',
  cupping: '/images/stock/desk.webp',
};

export const REGION_STOCK = {
  'neck-pain': '/images/stock/neck.webp',
  'shoulder-pain': '/images/stock/stretch.webp',
  'elbow-pain': '/images/stock/barbell.webp',
  'low-back-pain': '/images/stock/desk.webp',
  'hip-pain': '/images/stock/kettlebell.webp',
  'knee-pain': '/images/stock/knee-exam.webp',
  'ankle-foot-pain': '/images/stock/ankle.webp',
  headaches: '/images/stock/headache.webp',
  tmj: '/images/stock/jaw.webp',
  'muscle-strains': '/images/stock/lift-woman.webp',
  'nerve-pain': '/images/stock/assess.webp',
};

const POOL = ['/images/stock/rehab-gym.webp', '/images/stock/performance-testing.webp', '/images/stock/knee-device.webp'];

const CONDITION_POOL = ['/images/stock/assess.webp', '/images/stock/stretch.webp', '/images/stock/rehab-gym.webp', '/images/stock/knee-exam.webp', '/images/stock/neck.webp', '/images/stock/knee-device.webp', '/images/stock/performance-testing.webp', '/images/stock/kettlebell.webp', '/images/stock/lift-woman.webp', '/images/stock/barbell.webp'];

// First condition uses the region photo, the rest rotate through the pool (offset per region).
export const conditionStock = (regionSlug, i, regionIndex = 0) => {
  if (i === 0) return stockFor(REGION_STOCK, regionSlug, regionIndex);
  const region = REGION_STOCK[regionSlug];
  const pool = CONDITION_POOL.filter((p) => p !== region);
  return pool[(i - 1 + regionIndex * 3) % pool.length];
};

export const stockFor = (map, slug, i = 0) => map[slug] || POOL[i % POOL.length];
