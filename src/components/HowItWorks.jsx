import { pipelineSteps } from '../data/content.js';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-20 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mb-12">
        <span className="text-xs font-extrabold text-brand-gold uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Simple 4-Step Pipeline
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-3">How Sapio AI Works</h2>
        <p className="text-slate-400 text-sm mt-2">Transforming complex books and documents into engaging audio stories in seconds.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {pipelineSteps.map((s) => (
          <div key={s.n} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center mb-4 text-base shadow-md">
                {s.n}
              </div>
              <h3 className="font-bold text-white text-base">{s.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.text}</p>
            </div>
            <span className="text-[10px] text-brand-gold font-mono mt-4">{s.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
