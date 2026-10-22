/** @type {import('next').NextConfig} */
// Remote image hosts allowed for optimization: the API origin (local uploads) and any S3/CDN hosts.
const hosts = [];
const add = (u) => {
  try {
    const x = new URL(u.trim());
    hosts.push({ protocol: x.protocol.replace(':', ''), hostname: x.hostname, port: x.port });
  } catch {
    // relative or empty value: nothing to allow
  }
};
add(process.env.NEXT_PUBLIC_API_BASE_URL || '');
(process.env.NEXT_PUBLIC_MEDIA_HOSTS || '').split(',').filter(Boolean).forEach(add);

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  images: { remotePatterns: hosts, formats: ['image/avif', 'image/webp'] },
  env: { NEXT_IMAGE_HOSTS: hosts.map((h) => `${h.hostname}${h.port ? `:${h.port}` : ''}`).join(',') },
};
