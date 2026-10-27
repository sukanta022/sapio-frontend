import { useState } from 'react';
import { books } from '../data/content.js';

export default function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
  ? books.filter((book) =>
      [book.title, book.author, book.tag, book.category]
        .some((value) => value.toLowerCase().includes(q)),
    )
  : [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-4 border border-slate-200">
        <div className="relative flex items-center">
          <i className="fa-solid fa-magnifying-glass text-slate-400 absolute left-4"></i>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors, or topics..."
            className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button onClick={onClose} className="absolute right-3 text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="mt-3 max-h-60 overflow-y-auto custom-scrollbar text-sm text-slate-600">
          {!q && <p className="text-xs text-slate-400 p-2">Type above to search across 10,000+ AI audio summaries...</p>}
          {q && filtered.length === 0 && <p className="text-xs text-slate-400 p-2">No matching audio summaries found.</p>}
          {filtered.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelect(book)}
              className="p-2.5 hover:bg-brand-50 rounded-lg cursor-pointer flex items-center justify-between font-medium text-slate-800"
            >
              <span>
  <i className="fa-solid fa-book-open text-brand-500 mr-2"></i>
  {book.title}
  <span className="block ml-6 text-xs text-slate-500">{book.author}</span>
</span>
               </div>
          ))}
        </div>
      </div>
    </div>
  );
}
