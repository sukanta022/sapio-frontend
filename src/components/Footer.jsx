export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-brand-500">
            <img src="/images/my_logo.png" alt="Sapio AI logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Sapio AI © 2026</span>
          <span className="text-xs text-slate-400">• Read Less, Learn More, Listen Anywhere.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-500 transition-colors">API &amp; Developers</a>
          <a href="#" className="hover:text-brand-500 transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
