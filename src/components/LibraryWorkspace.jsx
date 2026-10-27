
import { useEffect, useState } from 'react';
import { backend } from '../lib/api.js';

export default function LibraryWorkspace({
  user,
  onOpenStudio,
  onPlay,
  onRequireLogin,
  initialTab = "projects"
}) {
  const [projects, setProjects] = useState([]),
    [history, setHistory] = useState([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setHistory([]);
      return;
    }

    let alive = true;
    setLoading(true);

    Promise.all([
      backend.projects(),
      backend.history()
    ])
      .then(([p, h]) => {
        if (alive) {
          setProjects(p);
          setHistory(h.items || []);
        }
      })
      .catch(e => alive && setError(e.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-500">
            Your workspace
          </span>

          <h2 className="text-2xl font-extrabold mt-1">
            {initialTab === "history"
              ? "Listening History"
              : "My Library & Projects"}
          </h2>
        </div>

        <button
          onClick={onOpenStudio}
          className="rounded-xl bg-brand-500 text-white px-5 py-3 font-bold text-sm"
        >
          Create project
        </button>
      </div>

      {!user ? (
        <button
          className="mt-6 text-brand-600"
          onClick={onRequireLogin}
        >
          Log in to view your projects
        </button>
      ) : (
        <>
          {loading && (
            <p className="mt-4 text-sm">
              Loading…
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 text-red-700"
            >
              {error}
            </p>
          )}

          <div
            className={`grid ${
              initialTab === "history"
                ? "grid-cols-1"
                : "lg:grid-cols-2"
            } gap-6 mt-7`}
          >

            {initialTab !== "history" && (
              <div className="rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold mb-4">
                  My projects
                </h3>

                {projects.length ? (
                  projects.map(p => (
                    <article
                      key={p.id}
                      className="border-b border-slate-100 py-3"
                    >
                      <p className="text-sm font-semibold">
                        Project #{p.id}
                      </p>

                      <p className="text-xs text-slate-500">
                        {p.status}
                      </p>

                      {p.status === 'completed' && (
                        <button
                          className="mt-2 text-sm text-brand-600 font-bold"
                          onClick={() => onPlay(p.id)}
                        >
                          ▶ Listen
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No projects yet.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold mb-4">
                Listening history
              </h3>

              {history.length ? (
                history.map(item => (
                  <article
                    className="border-b py-3"
                    key={item.project_id}
                  >
                    <p className="font-semibold text-sm">
                      {item.document_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.position_seconds}s / {item.total_duration_seconds}s ·{' '}
                      {item.is_completed
                        ? 'Completed'
                        : 'In progress'}
                    </p>

                    <button
                      className="mt-2 text-brand-600 text-xs font-bold"
                      onClick={() => onPlay(item.project_id)}
                    >
                      Resume
                    </button>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No listening history yet.
                </p>
              )}
            </div>

          </div>
        </>
      )}
    </section>
  );
}
