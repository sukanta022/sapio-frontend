
import { useEffect, useState } from 'react';
import { backend, popularMedia } from '../lib/api.js';

export default function PopularSummaries() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    backend.popular()
      .then(data => {
        if (alive) setItems(data.items || []);
      })
      .catch(e => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const matches = items.filter(x =>
    x.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section
      id="popular-library"
      className="mt-5"
    >
      <div className="flex flex-wrap justify-between gap-3 mb-8">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-500">
            Discover and listen
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Popular Audio Summaries
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Published audio books from Sapio AI.
          </p>
        </div>

        <label className="popular-search">
          <i className="fa-solid fa-magnifying-glass" />

          <input
            aria-label="Search summaries"
            placeholder="Search book titles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </label>
      </div>

      {loading && (
        <p className="text-slate-500">
          Loading popular summaries…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-red-700 bg-red-50 rounded-xl p-3"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {matches.map(item => (
          <article
            className="book-card bg-white rounded-2xl p-4 border border-slate-100 shadow-lg shadow-slate-200/40 flex flex-col"
            key={item.id}
          >
            <div className="h-48 rounded-xl bg-brand-50 flex items-center justify-center overflow-hidden">
              {item.has_thumbnail ? (
                <img
                  src={popularMedia.coverUrl(item.id)}
                  alt={`${item.title} book cover`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <i className="fa-solid fa-book-open text-5xl text-brand-500" />
              )}
            </div>

            <h2 className="font-extrabold mt-4">
              {item.title}
            </h2>

            <p className="text-sm text-slate-500 mt-2 flex-1">
              {item.description || 'Published popular summary'}
            </p>

            <p className="text-xs mt-3 text-brand-700">
              {item.duration_seconds != null
                ? `${Math.ceil(item.duration_seconds / 60)} min`
                : 'Duration not specified'}
            </p>

            {item.has_audio ? (
              <audio
                aria-label={`Listen to ${item.title}`}
                controls
                preload="none"
                src={popularMedia.streamUrl(item.id)}
                className="mt-3 w-full"
              />
            ) : (
              <span className="text-xs mt-3 text-slate-500">
                Audio not uploaded
              </span>
            )}
          </article>
        ))}
      </div>

      {!loading && !error && !matches.length && (
        <p className="text-sm text-slate-500 mt-5">
          No published summaries found.
        </p>
      )}
    </section>
  );
}
