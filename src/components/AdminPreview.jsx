import { useEffect, useState } from 'react';
import { backend } from '../lib/api.js';
import PopularUploadModal from './PopularUploadModal.jsx';

const card = 'bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-5';

export default function AdminPreview({ user }) {
  const [tab, setTab] = useState('overview'),
    [stats, setStats] = useState(null),
    [users, setUsers] = useState([]),
    [projects, setProjects] = useState([]),
    [popular, setPopular] = useState([]),
    [modal, setModal] = useState(false),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const [s, u, p, b] = await Promise.all([
        backend.analytics(),
        backend.users(),
        backend.adminProjects(),
        backend.popularAdmin()
      ]);

      setStats(s);
      setUsers(u.items || []);
      setProjects(p.items || []);
      setPopular(b.items || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const tabs = [
    ['overview', 'Overview'],
    ['users', 'Users'],
    ['content', 'Popular summaries'],
    ['projects', 'Projects & jobs']
  ];

  return (
    <section className="space-y-7">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-500">
            Administration
          </span>

          <h1 className="text-3xl font-extrabold mt-1">
            Admin Dashboard
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Admin-only tools and live backend data.
          </p>
        </div>

        <div
          className="admin-role-badge"
          aria-label="Administrator role"
        >
          <span className="admin-role-icon">
            <i className="fa-solid fa-shield-halved" />
          </span>

          <span>
            <strong>Administrator</strong>
            <small>Verified admin access</small>
          </span>

          <span className="admin-role-dot" />
        </div>
      </div>

      {loading && (
        <p className="text-slate-500 text-sm">
          Loading dashboard…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-red-700 bg-red-50 p-3 rounded-xl"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          [stats?.total_users, 'Total users', 'users'],
          [stats?.total_projects, 'Projects created', 'folder-open'],
          [stats?.completed_projects, 'Completed audio', 'headphones'],
          [stats?.published_summaries, 'Published summaries', 'book-open']
        ].map(([n, label, icon]) => (
          <div key={label} className={card}>
            <i
              className={`fa-solid fa-${icon} text-brand-500 text-xl mb-4 block`}
            />

            <div className="text-3xl font-extrabold">
              {n ?? '—'}
            </div>

            <div className="text-xs text-slate-500 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap border-b pb-3">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm ${
              tab === id
                ? 'bg-brand-500 text-white'
                : 'bg-white border text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={card}>
          <h3 className="font-extrabold mb-3">
            Generation status overview
          </h3>

          {stats?.background_job_statuses?.length ? (
            stats.background_job_statuses.map(x => (
              <div
                key={x.status}
                className="flex justify-between text-sm border-b py-2"
              >
                <span>{x.status}</span>
                <strong>{x.count}</strong>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No recent processing jobs.
            </p>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className={card}>
          <h3 className="font-extrabold mb-3">
            User management
          </h3>

          {users.map(u => (
            <div
              key={u.id}
              className="flex justify-between gap-3 items-center py-3 border-b"
            >
              <div className="text-sm">
                <strong>{u.name}</strong>

                <p className="text-xs text-slate-500">
                  {u.email} · {u.role}
                </p>
              </div>

              <button
                disabled={u.id === user.id}
                className="border text-xs rounded-lg p-2 disabled:opacity-40"
                onClick={async () => {
                  try {
                    await backend.updateUser(u.id, !u.is_active);
                    refresh();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                {u.is_active ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'content' && (
        <div className={card}>
          <div className="flex flex-wrap justify-between gap-3 items-center mb-4">
            <div>
              <h3 className="font-extrabold">
                Popular summary management
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Upload a book and generate its summary audio automatically.
              </p>
            </div>

            <button
              onClick={() => setModal(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-3 text-sm font-bold"
            >
              + Add Popular Summary
            </button>
          </div>

          {popular.map(t => (
            <div
              key={t.id}
              className="flex justify-between items-center border-b py-3 gap-2"
            >
              <div>
                <span className="text-sm font-bold">
                  {t.title}
                </span>

                <p className="text-xs text-slate-500">
                  {t.has_audio ? 'Audio ready' : 'Audio pending'} ·{' '}
                  {t.is_published ? 'Published' : 'Draft'}
                </p>
              </div>

              <button
                className="border rounded-lg p-2 text-xs text-brand-700"
                onClick={async () => {
                  try {
                    await backend.publish(t.id, !t.is_published);
                    refresh();
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                {t.is_published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          ))}

          {popular.length === 0 && (
            <p className="text-sm text-slate-500">
              No popular summaries yet. Add your first book.
            </p>
          )}
        </div>
      )}

      {tab === 'projects' && (
        <div className={card}>
          <h3 className="font-extrabold mb-3">
            Project monitoring
          </h3>

          {projects.map(p => (
            <div
              className="flex justify-between border-b py-3 text-sm"
              key={p.id}
            >
              <strong>Project #{p.id}</strong>
              <span>{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PopularUploadModal
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            refresh();
          }}
        />
      )}
    </section>
  );
}
