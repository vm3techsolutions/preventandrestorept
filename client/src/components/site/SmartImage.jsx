import Image from 'next/image';
import { mediaUrl } from '@/lib/api';

const ALLOWED = (process.env.NEXT_IMAGE_HOSTS || '').split(',').filter(Boolean);

// Optimizes /public and allowed remote hosts; relative API uploads (same-origin proxy) are served as-is.
function canOptimize(url) {
  if (url.startsWith('/images/')) return true;
  if (url.startsWith('/')) return false;
  try {
    const u = new URL(url);
    return ALLOWED.includes(u.host) || ALLOWED.includes(u.hostname);
  } catch {
    return false;
  }
}

export default function SmartImage({ src, alt = '', className = '', sizes = '100vw', priority = false, width, height, testId }) {
  const url = mediaUrl(src);
  if (!url) return null;
  const dims = width && height ? { width, height } : { fill: true };
  return (
    <Image
      src={url}
      alt={alt}
      sizes={sizes}
      priority={priority}
      unoptimized={!canOptimize(url)}
      className={className}
      data-testid={testId}
      {...dims}
    />
  );
}
