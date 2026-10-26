import { PageHero } from './ui';

export default function LegalPage({ title, intro, path, updated, draft, children }) {
  return (
    <>
      <PageHero title={title} intro={intro} crumbs={[{ label: 'Home', href: '/' }, { label: title, href: path }]} />
      <section className="container-site py-14 lg:py-20">
        <div className="mx-auto max-w-3xl">
          {draft && (
            <div role="note" className="mb-10 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900" data-testid="legal-draft-notice">
              <p className="font-semibold">Draft for review</p>
              <p className="mt-1 text-sm">This page is a placeholder structure awaiting the clinic&apos;s approved legal text. It is not final policy and is hidden from search engines.</p>
            </div>
          )}
          {updated && <p className="text-sm text-slate-500" data-testid="legal-updated">Last updated: {updated}</p>}
          <div className="legal" data-testid="legal-content">{children}</div>
        </div>
      </section>
    </>
  );
}
