// Brand marks (Lucide ships no brand icons, so these are inline SVGs). 24x24, currentColor.
const P = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true };

const ICONS = {
  instagram: (
    <svg {...P} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
  ),
  linkedin: (
    <svg {...P} fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
  ),
  facebook: (
    <svg {...P} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  ),
  google: (
    <svg {...P} fill="currentColor"><path d="M12.24 10.29v3.6h5.04c-.21 1.32-1.55 3.87-5.04 3.87-3.03 0-5.5-2.51-5.5-5.6s2.47-5.6 5.5-5.6c1.73 0 2.88.73 3.54 1.37l2.42-2.33C16.65 4.15 14.65 3.2 12.24 3.2 7.33 3.2 3.36 7.17 3.36 12.08s3.97 8.88 8.88 8.88c5.13 0 8.53-3.6 8.53-8.68 0-.58-.06-1.03-.14-1.47h-8.39z" /></svg>
  ),
  youtube: (
    <svg {...P} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
  ),
  yelp: (
    <svg {...P} fill="currentColor">
      <path d="M11.2 2.1c.6-.2 1.3.2 1.3.9l.3 8.2c0 .8-.9 1.2-1.5.7L6.5 6.4c-.5-.5-.4-1.3.2-1.6a12 12 0 0 1 4.5-2.7z" />
      <path d="M14.7 13.6l4.4 1.4c.6.2.9.9.6 1.5a8 8 0 0 1-2.3 2.8c-.5.4-1.3.2-1.6-.4l-2.3-4c-.4-.7.3-1.6 1.2-1.3z" />
      <path d="M14.5 10.4l4-2.4c.6-.3 1.3-.1 1.6.5a8 8 0 0 1 .8 3.5c0 .7-.6 1.2-1.3 1.1l-4.6-.9c-.9-.2-1.2-1.4-.5-1.8z" />
      <path d="M10.4 14.3l-.2 4.6c0 .7-.6 1.2-1.3 1a8 8 0 0 1-3.2-1.7c-.5-.5-.5-1.2 0-1.7l3.3-3.3c.6-.6 1.5-.1 1.4.7z" />
      <path d="M9.4 11.7l-4.5 1.2c-.7.2-1.3-.3-1.4-1a8 8 0 0 1 .3-3.6c.2-.6 1-.9 1.5-.5l4.2 2.3c.8.4.7 1.4-.1 1.6z" />
    </svg>
  ),
};

export default function SocialLinks({ items, className = '' }) {
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`} data-testid="social-links">
      {items.map((s) => (
        <li key={s.key}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`} data-testid={`social-${s.key}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-teal-hover hover:bg-teal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-hover">
            {ICONS[s.key]}
          </a>
        </li>
      ))}
    </ul>
  );
}
