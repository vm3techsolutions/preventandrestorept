import { mediaUrl } from '@/lib/api';

// Renders structured content blocks. Shared by admin preview now and the public site in Part 2.
export default function BlockRenderer({ blocks = [] }) {
  return (
    <div className="space-y-5 text-[17px] leading-[1.75] text-slate-700" data-testid="block-renderer">
      {blocks.map((b, i) => {
        const key = `${b.type}-${i}`;
        const d = b.data || {};
        switch (b.type) {
          case 'heading':
            return d.level === 2
              ? <h2 key={key} className="pt-4 font-heading text-2xl font-semibold text-navy">{d.text}</h2>
              : <h3 key={key} className="pt-2 font-heading text-xl font-semibold text-navy">{d.text}</h3>;
          case 'paragraph':
            return <p key={key} className="rich" dangerouslySetInnerHTML={{ __html: d.html }} />;
          case 'list': {
            const Tag = d.style === 'ordered' ? 'ol' : 'ul';
            return (
              <Tag key={key} className={`rich space-y-1.5 pl-6 ${d.style === 'ordered' ? 'list-decimal' : 'list-disc'} marker:text-teal`}>
                {d.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}
              </Tag>
            );
          }
          case 'image':
            return d.url ? (
              <figure key={key}>
                <img src={mediaUrl(d.url)} alt={d.alt} className="w-full rounded-xl object-cover" />
                {d.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{d.caption}</figcaption>}
              </figure>
            ) : null;
          case 'quote':
            return (
              <blockquote key={key} className="border-l-4 border-teal bg-teal-50/60 py-3 pl-5 pr-4 italic text-navy">
                <p>{d.text}</p>
                {d.cite && <cite className="mt-2 block text-sm not-italic text-slate-500">— {d.cite}</cite>}
              </blockquote>
            );
          case 'cta':
            return (
              <div key={key} className="rounded-2xl bg-navy p-7 text-white">
                {d.heading && <p className="font-heading text-xl font-semibold text-white">{d.heading}</p>}
                {d.text && <p className="mt-2 text-slate-300">{d.text}</p>}
                <a href={d.buttonUrl} className="btn-primary mt-4">{d.buttonLabel}</a>
              </div>
            );
          case 'disclaimer':
            return <aside key={key} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{d.text}</aside>;
          default:
            return null;
        }
      })}
    </div>
  );
}
