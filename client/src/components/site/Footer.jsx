import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from './SocialLinks';
import { LEGAL, SITE, SOCIALS, fullAddress } from '@/lib/site';
import { withSlash } from '@/lib/seo';

const EXPLORE = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Blogs', href: '/blogs/' },
  { label: 'Contact', href: '/contact/' },
];

function Column({ title, children, testId }) {
  return (
    <nav aria-label={title} data-testid={testId}>
      <p className="eyebrow text-teal-100/70">{title}</p>
      <ul className="mt-5 space-y-3 text-[15px]">{children}</ul>
    </nav>
  );
}

const Item = ({ href, children }) => <li><Link className="footer-link" href={href}>{children}</Link></li>;

export default function Footer({ services = [], conditions = [] }) {
  return (
    <footer className="bg-navy text-slate-300" data-testid="site-footer">
      <div className="container-site grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.1fr_1.1fr_1.4fr] lg:gap-10">
        <div>
          <Image src="/images/logo-horizontal-white.png" alt={SITE.name} width={1174} height={272} className="h-10 w-auto" />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Educate and empower our community to prevent injuries while quickly restoring injured clients from pain so they can continue doing activities they love the most.
          </p>
          <SocialLinks items={SOCIALS} className="mt-7" />
        </div>
        <Column title="Explore" testId="footer-explore">
          {EXPLORE.map((n) => <Item key={n.href} href={n.href}>{n.label}</Item>)}
        </Column>
        <Column title="Services" testId="footer-services">
          {services.map((s) => <Item key={s.slug} href={withSlash(s.path)}>{s.title}</Item>)}
        </Column>
        <Column title="What we treat" testId="footer-conditions">
          {conditions.map((c) => <Item key={c.slug} href={withSlash(c.path)}>{c.title}</Item>)}
        </Column>
        <div>
          <p className="eyebrow text-teal-100/70">Visit or call</p>
          <ul className="mt-5 space-y-4 text-[15px]">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" data-testid="footer-address">{fullAddress()}</a></li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link" href={SITE.phoneHref} data-testid="footer-phone">{SITE.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link break-all" href={`mailto:${SITE.email}`} data-testid="footer-email">{SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p data-testid="footer-copyright">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL.map((l) => <li key={l.href}><Link href={l.href} className="footer-link" data-testid={`footer-${l.href.replace(/\//g, '')}`}>{l.label}</Link></li>)}
            <li><Link href="/admin/login" target="_blank" rel="noopener noreferrer" className="footer-link inline-flex items-center gap-1.5" data-testid="footer-cms-login"><LogIn className="h-3.5 w-3.5" aria-hidden /> CMS Login<span className="sr-only"> (opens in a new tab)</span></Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
