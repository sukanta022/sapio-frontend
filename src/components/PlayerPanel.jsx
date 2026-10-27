import { useEffect, useRef } from 'react';
import { transcriptLines, chapters } from '../data/content.js';
import { formatTime, activeLineFor } from '../hooks/useAudioPlayer.js';

const BAR_STYLES = [
  'bg-brand-500 h-2',
  'bg-brand-500 h-4',
  'bg-brand-gold h-6',
  'bg-brand-500 h-3',
  'bg-brand-500 h-5',
  'bg-brand-gold h-2',
  'bg-brand-500 h-4',
  'bg-brand-500 h-6',
  'bg-brand-gold h-3',
  'bg-brand-500 h-2',
];

export default function PlayerPanel({ book, player, onOpenPdf }) {
  const {
    isPlaying, speed, progress, autoScroll, barHeights,
    togglePlay, toggleSpeed, toggleAutoScroll, seek, skipTime, changeChapter,
  } = player;

  const lineRefs = useRef([]);
  const firstRun = useRef(true);
  const activeLine = activeLineFor(progress);

  const displayedTranscript =
  book.title === 'Atomic Habits'
    ? transcriptLines
    : [
        `No synchronized transcript is connected for ${book.title}. Book-specific audio content will appear here when available.`,
      ];
  
  const displayedChapters =
  book.title === 'Atomic Habits'
    ? chapters
    : chapters.map((chapter) => ({
        ...chapter,
        label: `Section ${chapter.id}`,
      }));

  // Auto-scroll the transcript when the highlighted line changes.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (autoScroll) {
      lineRefs.current[activeLine]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLine, autoScroll]);

  return (
    <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between min-h-[520px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-brand-500 tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full">
            <i className="fa-solid fa-headphones mr-1"></i> Live Player Engine
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPdf()}
              className="text-xs text-slate-600 hover:text-brand-500 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-file-pdf text-red-500"></i> View Source Book
            </button>
          </div>
        </div>

        {/* Book Metadata Header */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
          <img src={book.img} alt="Book Cover" className="w-20 h-24 object-cover rounded-xl shadow-md flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand-gold/20 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">Featured Masterclass</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500 truncate">{book.author}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 truncate">{book.title}</h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">Sample audio-player preview for {book.title}.</p>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-end gap-1 h-6 mt-3">
              {BAR_STYLES.map((cls, i) => (
                <div
                  key={i}
                  className={`waveform-bar w-1 rounded-full ${cls}`}
                  style={barHeights ? { height: `${barHeights[i]}px` } : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Demo Transcript Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Transcript Preview</span>
            <span className="text-[11px] text-brand-500 font-semibold cursor-pointer" onClick={toggleAutoScroll}>
              Auto-Scroll: <span>{autoScroll ? 'ON' : 'OFF'}</span>
            </span>
          </div>
          <div className="h-32 overflow-y-auto custom-scrollbar p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-600">
            {displayedTranscript.map((line, i) => (
              <p
                key={i}
                ref={(el) => { lineRefs.current[i] = el; }}
                className={
                  i === activeLine
                    ? 'bg-brand-100 text-brand-700 font-semibold p-1.5 rounded-lg border-l-4 border-brand-500 my-1'
                    : 'transition-colors duration-200 p-1.5 rounded-lg text-slate-600'
                }
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-mono text-slate-300 w-10 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="any"
            value={progress}
            onChange={(e) => seek(e.target.value)}
            className="w-full accent-brand-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 w-10">{book.duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={toggleSpeed}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-brand-gold px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            {speed.toFixed(1)}x
          </button>

          <div className="flex items-center gap-4">
            <button onClick={() => skipTime(-10)} className="text-slate-400 hover:text-white transition-colors" title="Back 10s">
              <i className="fa-solid fa-rotate-left text-lg"></i>
            </button>
            <button
              onClick={togglePlay}
              className={`w-12 h-12 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center text-white text-xl shadow-md shadow-brand-500/40 hover:scale-105 transition-all ${isPlaying ? 'bg-brand-600 ring-4 ring-brand-500/30' : ''}`}
            >
              <i className={isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play ml-1'}></i>
            </button>
            <button onClick={() => skipTime(10)} className="text-slate-400 hover:text-white transition-colors" title="Forward 10s">
              <i className="fa-solid fa-rotate-right text-lg"></i>
            </button>
          </div>

          <select
            defaultValue="1"
            onChange={(e) => changeChapter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none"
          >
            {displayedChapters.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
