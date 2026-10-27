export default function HeroTagline() {
  return (
    <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
          <i className="fa-solid fa-bolt text-brand-gold"></i> Books &amp; Documents, Simplified
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          No time to read? <br className="hidden sm:inline" />
          <span className="text-brand-500">Press play instead.</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl">
          Get clear, concise audio summaries of your favorite books or upload your own documents (.PDF / .EPUB) to listen to key insights anywhere.
        </p>
      </div>
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 font-semibold uppercase tracking-wider border-l-2 border-brand-100 pl-6">
        <div><span className="block text-xl font-bold text-slate-900">10x</span> Faster Learning</div>
        <div><span className="block text-xl font-bold text-slate-900">AI</span> Key Concepts</div>
        <div><span className="block text-xl font-bold text-brand-500">EN/BN</span> Languages</div>
      </div>
    </div>
  );
}
