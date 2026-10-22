import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { NAV, SITE, fullAddress } from '@/lib/site';
import { withSlash } from '@/lib/seo';

function Column({ title, children }) {
  return (
    <div>
      <p className="eyebrow text-teal-100/70">{title}</p>
      <ul className="mt-5 space-y-3 text-[15px]">{children}</ul>
    </div>
  );
}

export default function Footer({ services = [], conditions = [] }) {
  return (
    <footer className="relative overflow-hidden bg-navy text-slate-300" data-testid="site-footer">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_1.3fr]">
        <div>
          <Image src="/images/logo-horizontal-white.png" alt={SITE.name} width={1174} height={272} className="h-10 w-auto" />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Educate and empower our community to prevent injuries while quickly restoring injured clients from pain so they can continue doing activities they love the most.
          </p>
          <Link href={SITE.appointmentHref} className="btn-site mt-7" data-testid="footer-appointment-btn">Request Appointment</Link>
        </div>
        <Column title="Explore">
          {NAV.map((n) => <li key={n.href}><Link className="footer-link" href={n.href}>{n.label}</Link></li>)}
        </Column>
        <Column title="Services">
          {services.slice(0, 6).map((s) => <li key={s.slug}><Link className="footer-link" href={withSlash(s.path)}>{s.title}</Link></li>)}
        </Column>
        <Column title="What we treat">
          {conditions.slice(0, 6).map((c) => <li key={c.slug}><Link className="footer-link" href={withSlash(c.path)}>{c.title}</Link></li>)}
        </Column>
        <Column title="Visit or call">
          <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" data-testid="footer-address">{fullAddress()}</a></li>
          <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link" href={SITE.phoneHref} data-testid="footer-phone">{SITE.phone}</a></li>
          <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-hover" aria-hidden /><a className="footer-link break-all" href={`mailto:${SITE.email}`} data-testid="footer-email">{SITE.email}</a></li>
        </Column>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="max-w-xl md:text-right">Content on this website is for general education and is not a substitute for an evaluation by a licensed healthcare provider.</p>
        </div>
      </div>
    </footer>
  );
}
