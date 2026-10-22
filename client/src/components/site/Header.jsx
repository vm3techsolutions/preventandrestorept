'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Phone, X } from 'lucide-react';
import { NAV, SITE } from '@/lib/site';
import { toggleMobileNav, closeMobileNav } from '@/store/slices/siteSlice';

const isActive = (pathname, href) => (href === '/' ? pathname === '/' : pathname.startsWith(href.replace(/\/$/, '')));

function NavLinks({ pathname, mobile }) {
  return NAV.map((n) => {
    const active = isActive(pathname, n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? 'page' : undefined}
        data-testid={`${mobile ? 'mobile-' : ''}nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
        className={mobile
          ? `block rounded-lg px-4 py-3 text-lg font-medium ${active ? 'bg-teal-50 text-teal' : 'text-navy hover:bg-slate-50'}`
          : `nav-link ${active ? 'text-teal after:scale-x-100' : 'text-navy'}`}
      >
        {n.label}
      </Link>
    );
  });
}

export default function Header() {
  const pathname = usePathname();
  const open = useSelector((s) => s.site.mobileNavOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(closeMobileNav());
  }, [pathname, dispatch]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg" data-testid="site-header">
      <div className="container-site flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${SITE.name} home`} data-testid="header-logo-link">
          <Image src="/images/logo-horizontal.png" alt={SITE.name} width={1174} height={272} priority className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex"><NavLinks pathname={pathname} /></nav>
        <div className="hidden items-center gap-4 lg:flex">
          <a href={SITE.phoneHref} className="flex items-center gap-2 text-sm font-medium text-navy hover:text-teal" data-testid="header-phone-link">
            <Phone className="h-4 w-4" aria-hidden /> {SITE.phone}
          </a>
          <Link href={SITE.appointmentHref} className="btn-site" data-testid="header-appointment-btn">Request Appointment</Link>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-navy hover:bg-slate-100 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => dispatch(toggleMobileNav())}
          data-testid="mobile-nav-toggle"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-10 pt-4 lg:hidden" data-testid="mobile-nav">
          <nav aria-label="Mobile" className="space-y-1"><NavLinks pathname={pathname} mobile /></nav>
          <div className="mt-6 grid gap-3">
            <Link href={SITE.appointmentHref} className="btn-site justify-center py-3.5" data-testid="mobile-appointment-btn">Request Appointment</Link>
            <a href={SITE.phoneHref} className="btn-site-outline justify-center py-3.5" data-testid="mobile-phone-link"><Phone className="h-4 w-4" /> {SITE.phone}</a>
          </div>
        </div>
      )}
    </header>
  );
}
