import Link from 'next/link';
import { Activity, ArrowUpRight, Bone, Crosshair, Dumbbell, Footprints, Hand, HeartPulse, Move, Presentation, ScanLine, ShieldCheck, Target, Waves, Zap } from 'lucide-react';
import SmartImage from './SmartImage';
import { withSlash } from '@/lib/seo';
import { formatDate } from '@/lib/siteData';

const ICONS = { Hand, Activity, Dumbbell, Presentation, Target, HeartPulse, Footprints, Bone, Move, ShieldCheck, Zap, Waves, Crosshair, ScanLine };
const FALLBACK = [Hand, Crosshair, Activity, Waves, ScanLine, Dumbbell, Presentation, Move, ShieldCheck];

export function ItemIcon({ name, index = 0, className = 'h-6 w-6' }) {
  const Icon = ICONS[name] || FALLBACK[index % FALLBACK.length];
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

// Service / condition card. Image when the CMS has one, icon otherwise.
export function ContentCard({ item, index = 0, testPrefix }) {
  return (
    <Link href={withSlash(item.path)} className="card-site group flex flex-col overflow-hidden" data-testid={`${testPrefix}-card-${item.slug}`}>
      {item.featuredImage ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <SmartImage src={item.featuredImage.url} alt={item.featuredImage.alt || item.title} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : (
        <div className="px-7 pt-7">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
            <ItemIcon name={item.iconName} index={index} />
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-heading text-xl font-semibold text-navy">{item.title}</h3>
        {item.shortDescription && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{item.shortDescription}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-teal group-hover:text-teal-hover">
          Learn more <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function BlogCard({ post, priority = false }) {
  return (
    <article className="card-site group relative flex flex-col overflow-hidden" data-testid={`blog-card-${post.slug}`}>
      <Link href={withSlash(post.path)} className="relative block aspect-[16/9] overflow-hidden bg-navy" tabIndex={-1} aria-hidden>
        {post.featuredImage
          ? <SmartImage src={post.featuredImage.url} alt="" priority={priority} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          : <BlogPlaceholder />}
      </Link>
      <div className="flex flex-1 flex-col p-7">
        {post.categories?.[0] && <p className="eyebrow text-teal">{post.categories[0].name}</p>}
        <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-navy">
          <Link href={withSlash(post.path)} className="after:absolute after:inset-0 after:content-[''] group-hover:text-teal">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{post.excerpt}</p>}
        <p className="mt-auto pt-6 text-sm text-slate-500">
          {post.author?.name && <span className="font-medium text-navy">{post.author.name}</span>}
          {post.author?.name && post.publishedAt && ' · '}
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </p>
      </div>
    </article>
  );
}

function BlogPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#0A3A66,#001D39_70%)]">
      <img src="/images/logo-mark.png" alt="" className="h-20 w-auto opacity-90 transition-transform duration-500 group-hover:scale-110" />
    </div>
  );
}
