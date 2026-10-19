import Link from 'next/link';

// Placeholder: the public website (Part 2) will replace this page.
export default function Home() {
  return (
    <main className="min-h-screen bg-navy text-white flex items-center">
      <div className="mx-auto w-full max-w-5xl px-8 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-100/80">Part 1 · Admin & API</p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white max-w-3xl leading-tight">
          Prevent &amp; Restore Physical Therapy
        </h1>
        <p className="mt-6 max-w-xl text-base text-slate-300">
          The public website will be connected to the content API in Part 2. Content is managed in the admin CMS.
        </p>
        <Link href="/admin" data-testid="go-to-admin-link" className="btn-primary mt-10 px-6 py-3">
          Open admin CMS
        </Link>
      </div>
    </main>
  );
}
