export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="absolute -left-24 top-1/3 h-[480px] w-[480px] rounded-full border border-teal/30" />
        <div className="absolute -left-10 top-1/3 h-[480px] w-[480px] rounded-full border border-teal/20" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-100/80">Content Management</p>
          <div>
            <h2 className="font-heading text-5xl font-bold leading-[1.1] text-white">Prevent<br />&amp; Restore</h2>
            <p className="mt-4 max-w-sm text-slate-300">Physical Therapy · East Cobb, GA</p>
          </div>
          <p className="text-xs text-slate-400">Authorized administrators only.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm animate-rise">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
