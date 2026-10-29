import Link from 'next/link';
import SmartImage from './SmartImage';
import { withSlash } from '@/lib/seo';

const Paras = ({ text, className = '' }) => (text ? String(text).split(/\n\s*\n/).map((p, i) => <p key={i} className={className}>{p}</p>) : null);

// Body-region condition sections (shared by the public page and the admin preview).
export function RegionAnchors({ sections }) {
  if (sections.length < 2) return null;
  return (
    <nav aria-label="Conditions on this page" className="rounded-2xl border border-slate-200 bg-slate-50 p-6" data-testid="region-anchors">
      <p className="eyebrow text-teal">Conditions on this page</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {sections.map((s) => <li key={s.anchor}><a href={`#${s.anchor}`} className="block rounded-full bg-white px-4 py-2 text-sm font-medium text-navy ring-1 ring-slate-200 hover:text-teal hover:ring-teal">{s.heading}</a></li>)}
      </ul>
    </nav>
  );
}

function Section({ s }) {
  return (
    <section id={s.anchor} aria-labelledby={`${s.anchor}-h`} className="scroll-mt-28 border-t border-slate-200 pt-10" data-testid={`region-section-${s.anchor}`}>
      <h2 id={`${s.anchor}-h`} className="font-heading text-2xl font-semibold text-navy sm:text-3xl">{s.heading}</h2>
      {s.image && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
          <SmartImage src={s.image.url} alt={s.image.alt || s.heading} sizes="(min-width:768px) 760px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700 md:text-lg"><Paras text={s.description} /></div>
      {(s.symptoms || s.howPtHelps) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {s.symptoms && <div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-heading text-lg font-semibold text-navy">Common symptoms</h3><div className="mt-2 space-y-2 text-[15px] leading-relaxed text-slate-600"><Paras text={s.symptoms} /></div></div>}
          {s.howPtHelps && <div className="rounded-2xl bg-teal-50 p-5"><h3 className="font-heading text-lg font-semibold text-navy">How physical therapy may help</h3><div className="mt-2 space-y-2 text-[15px] leading-relaxed text-slate-700"><Paras text={s.howPtHelps} /></div></div>}
        </div>
      )}
      {s.faqs?.length > 0 && (
        <div className="mt-6 space-y-3">
          {s.faqs.map((f, i) => <details key={i} className="rounded-xl border border-slate-200 px-5 py-4"><summary className="cursor-pointer font-semibold text-navy">{f.question}</summary><p className="mt-2 text-slate-600">{f.answer}</p></details>)}
        </div>
      )}
      {(s.relatedServices?.length > 0 || s.cta) && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {s.relatedServices?.length > 0 && <span className="text-sm text-slate-500">Related services:</span>}
          {s.relatedServices?.map((r) => <Link key={r.slug} href={withSlash(r.path)} className="rounded-full border border-teal/30 px-3 py-1 text-sm font-medium text-teal hover:bg-teal-50">{r.title}</Link>)}
          {s.cta && <Link href={withSlash(s.cta.url)} className="btn-site ml-auto">{s.cta.label}</Link>}
        </div>
      )}
    </section>
  );
}

export default function RegionSections({ sections = [] }) {
  if (!sections.length) return null;
  return <div className="mt-12 space-y-12" data-testid="region-sections">{sections.map((s) => <Section key={s.anchor} s={s} />)}</div>;
}

export { Paras };
