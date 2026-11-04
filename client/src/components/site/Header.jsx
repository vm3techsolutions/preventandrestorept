'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Menu, X } from 'lucide-react';
import { NAV, SITE } from '@/lib/site';
import { toggleMobileNav, closeMobileNav } from '@/store/slices/siteSlice';
import NavDropdown from './NavDropdown';
import MobileNav from './MobileNav';

const MENUS = {
  '/services/': { key: 'services', allLabel: 'View All Services' },
  '/what-we-treat/': { key: 'conditions', allLabel: 'View All Conditions' },
};

export default function Header({ services = [], conditions = [] }) {
  const pathname = usePathname();
  const open = useSelector((s) => s.site.mobileNavOpen);
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);
  const lists = { services, conditions };
  const links = NAV.map((n) => (MENUS[n.href] && lists[MENUS[n.href].key].length ? { ...n, items: lists[MENUS[n.href].key], allLabel: MENUS[n.href].allLabel } : n));
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

  useEffect(() => {
    dispatch(closeMobileNav());
  }, [pathname, dispatch]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300 ${scrolled || open ? 'border-slate-200/80 bg-white/95 shadow-md shadow-navy/5 backdrop-blur-lg' : 'border-transparent bg-white'}`} data-testid="site-header">
      <div className="container-site relative flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${SITE.name} home`} data-testid="header-logo-link">
          <Image src="/images/logo-horizontal.png" alt={SITE.name} width={1174} height={272} priority className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-6 whitespace-nowrap xl:flex 2xl:gap-8">
          {links.map((n) => {
            const testId = `nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`;
            if (n.items) return <NavDropdown key={n.href} variant={MENUS[n.href].key} label={n.label} href={n.href} items={n.items} allLabel={n.allLabel} active={isActive(n.href)} testId={testId} />;
            return <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? 'page' : undefined} className={`nav-link ${isActive(n.href) ? 'text-teal after:scale-x-100' : 'text-navy'}`} data-testid={testId}>{n.label}</Link>;
          })}
        </nav>
        <div className="hidden shrink-0 xl:flex">
        <Link
  href={SITE.appointmentHref}
  className="btn-site"
  data-testid="header-appointment-btn"
>Book an Appointment <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <button type="button" className="rounded-lg p-2 text-navy hover:bg-slate-100 xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => dispatch(toggleMobileNav())} data-testid="mobile-nav-toggle">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <MobileNav links={links} isActive={isActive} />}
    </header>
  );
}
