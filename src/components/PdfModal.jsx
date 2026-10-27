export default function PdfModal({ title, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[80vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <i className="fa-solid fa-file-pdf text-base"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{title} - Summary Preview</h3>
              <p className="text-xs text-slate-500">Sapio AI Formatted Reader • Chapter Breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-white text-slate-800 space-y-6">
  <div className="border-b border-slate-100 pb-4">
    <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
      SUMMARY PREVIEW
    </span>
    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
      {title}
    </h2>
    <p className="text-xs text-slate-500 mt-1">
      Reader layout preview
    </p>
  </div>

  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
    <h3 className="font-bold text-slate-900 mb-2">
      Summary content will appear here
    </h3>
    <p className="text-sm text-slate-600 leading-relaxed">
      This frontend preview shows where the generated summary will appear
      after the backend is connected.
    </p>
  </div>
</div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Frontend preview • Summary not generated</span>
          <button onClick={onClose} className="px-5 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
