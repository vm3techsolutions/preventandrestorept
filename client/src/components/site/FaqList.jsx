import { ChevronDown } from 'lucide-react';
import { jsonLd } from '@/lib/seo';

export default function FaqList({ faqs }) {
  if (!faqs?.length) return null;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };
  return (
    <section className="mt-16" aria-labelledby="faq-heading" data-testid="faq-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(ld)} />
      <h2 id="faq-heading" className="display text-2xl text-navy sm:text-3xl">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((f, i) => (
          <details key={i} className="group px-6 py-5" data-testid={`faq-item-${i}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-semibold text-navy">
              {f.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-teal transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
