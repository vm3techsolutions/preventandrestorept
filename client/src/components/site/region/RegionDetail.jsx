import Link from 'next/link';
import SmartImage from '../SmartImage';
import BlockRenderer from '@/components/content/BlockRenderer';
import FaqList from '../FaqList';
import { CtaBand, PageHero } from '../ui';
import ConditionSelector from './ConditionSelector';
import PdfDownload from './PdfDownload';
import { withSlash } from '@/lib/seo';
import { REGION_STOCK, conditionStock, stockFor } from '@/lib/stockImages';

// Description paragraphs starting with "Causes:" or "Daily life:" become their own subsections.
function splitDescription(text = '') {
  const out = { overview: [], causes: [], daily: [] };
  String(text || '').split(/\n\s*\n/).filter(Boolean).forEach((p) => {
    const m = p.match(/^(causes|daily life)\s*:\s*/i);
    if (!m) out.overview.push(p);
    else out[m[1].toLowerCase() === 'causes' ? 'causes' : 'daily'].push(p.slice(m[0].length));
  });
  return out;
}
const bullets = (text = '') => String(text || '').split(/\n|(?<=\.)\s+(?=[A-Z])/).map((x) => x.replace(/^[-•]\s*/, '').trim()).filter(Boolean);

function Sub({ title, children }) {
  return <div className="mt-6"><h3 className="font-heading text-lg font-semibold text-navy">{title}</h3><div className="mt-2 space-y-3 leading-relaxed text-slate-700">{children}</div></div>;
}

export function ConditionSection({ s, i, image }) {
  const d = splitDescription(s.description);
  const list = bullets(s.symptoms);
  const src = s.image?.url || image;
  return (
    <section id={s.anchor} aria-labelledby={`${s.anchor}-h`} className={`scroll-mt-40 py-14 lg:py-20 ${i % 2 ? 'bg-slate-50' : 'bg-white'}`} data-testid={`region-section-${s.anchor}`}>
      <div className={`container-site grid gap-10 ${src ? 'lg:grid-cols-2 lg:items-center lg:gap-16' : ''}`}>
        {src && (
          <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 ${i % 2 ? 'lg:order-2' : ''}`} data-testid={`region-section-image-${s.anchor}`}>
            <SmartImage src={src} alt={s.image?.alt || ''} sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
        <div className={src ? '' : 'max-w-3xl'}>
          <p className="eyebrow text-teal">Condition {String(i + 1).padStart(2, '0')}</p>
          <h2 id={`${s.anchor}-h`} className="display mt-2 text-2xl text-navy sm:text-3xl">{s.heading}</h2>
          {d.overview.length > 0 && <Sub title="Overview">{d.overview.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</Sub>}
          {list.length > 0 && <Sub title="Common signs and symptoms"><ul className="list-disc space-y-1.5 pl-5">{list.map((x) => <li key={x}>{x}</li>)}</ul></Sub>}
          {d.causes.length > 0 && <Sub title="Possible causes and contributing factors">{d.causes.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</Sub>}
          {d.daily.length > 0 && <Sub title="How it can affect daily life">{d.daily.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</Sub>}
          {s.howPtHelps && <Sub title="How physical therapy may help"><p>{s.howPtHelps}</p></Sub>}
          {s.relatedServices?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {s.relatedServices.map((r) => <Link key={r.slug} href={withSlash(r.path)} className="rounded-full border border-teal/30 bg-white px-3 py-1 text-sm font-medium text-teal hover:bg-teal-50">{r.title}</Link>)}
            </div>
          )}
          {s.cta && <Link href={withSlash(s.cta.url)} className="btn-site mt-6">{s.cta.label}</Link>}
        </div>
      </div>
    </section>
  );
}

export default function RegionDetail({ item, index = 0 }) {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'What We Treat', href: '/what-we-treat/' }, { label: item.title, href: withSlash(item.path) }];
  const sections = item.sections || [];
  const faqs = [...(item.faqs || []), ...sections.flatMap((s) => s.faqs || [])];
  const img = item.featuredImage?.url || stockFor(REGION_STOCK, item.slug, index);
  return (
    <article data-testid="condition-detail">
      <PageHero eyebrow="What we treat" title={item.title} intro={item.shortDescription} crumbs={crumbs} image={img} imageAlt="">
        <Link href="/contact/#request-appointment" className="btn-site mt-8" data-testid="region-hero-cta">Request Appointment</Link>
      </PageHero>
      <section className={`container-site py-16 lg:py-20 ${item.pdf ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-16' : ''}`} data-testid="condition-intro">
        <div className="max-w-3xl">
          <p className="eyebrow text-teal">Understanding the condition</p>
          <h2 className="display mt-2 text-2xl text-navy sm:text-3xl">Understanding {item.title.toLowerCase()}</h2>
          <p className="mt-5 text-base leading-relaxed text-slate-700 md:text-lg">{item.shortDescription}</p>
          {item.content?.length > 0 && <div className="mt-6"><BlockRenderer blocks={item.content} /></div>}
          {sections.length > 0 && <p className="mt-5 text-slate-600">This page covers: {sections.map((s) => s.heading).join(', ')}.</p>}
        </div>
        {item.pdf && <PdfDownload slug={item.slug} treatmentName={item.title} pdf={item.pdf} />}
      </section>
      {sections.length > 0 && <ConditionSelector sections={sections} />}
      {sections.map((s, i) => <ConditionSection key={s.anchor} s={s} i={i} image={conditionStock(item.slug, i, index)} />)}
      {faqs.length > 0 && <div className="container-site pb-6"><div className="max-w-3xl"><FaqList faqs={faqs} /></div></div>}
      <CtaBand heading="Ready to feel better?" text={`Let’s take the next step toward better movement and less ${item.title.toLowerCase()}.`} />
    </article>
  );
}
