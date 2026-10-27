
import { useEffect, useRef, useState } from 'react';
import {
  backend,
  privateAudio,
  downloadAudio
} from '../lib/api.js';

const clock = s =>
  `${Math.floor((s || 0) / 60)}:${String(
    Math.floor((s || 0) % 60)
  ).padStart(2, '0')}`;

export default function RealPlayer({
  projectId,
  user,
  onRequireLogin
}) {
  const ref = useRef(null),
    urlRef = useRef(null),
    lastSaved = useRef(-10),
    [url, setUrl] = useState(null),
    [duration, setDuration] = useState(0),
    [position, setPosition] = useState(0),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    setUrl(null);
    setPosition(0);
    setDuration(0);

    if (!projectId || !user) return;

    setLoading(true);

    Promise.all([
      privateAudio(projectId),
      backend.playback(projectId)
    ])
      .then(([blob, p]) => {
        if (!alive) return;

        const next = URL.createObjectURL(blob);

        urlRef.current = next;

        setUrl(next);
        setPosition(p.position_seconds);
        setDuration(p.total_duration_seconds);

        lastSaved.current = p.position_seconds;
      })
      .catch(e => alive && setError(e.message))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [projectId, user]);

  useEffect(() => {
    if (ref.current && url) {
      ref.current.currentTime = position;
    }
  }, [url]);

  async function persist(second) {
    if (!projectId || !user) return;

    try {
      await backend.savePlayback(
        projectId,
        Math.min(
          Math.max(0, Math.floor(second)),
          Math.floor(duration || second)
        )
      );

      lastSaved.current = second;
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">
          <i className="fa-solid fa-headphones text-brand-500 mr-2" />
          Audio Summary Player
        </h2>

        <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
          {url ? 'Ready' : 'Select a completed project'}
        </span>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand-50 to-slate-50 p-6 mt-5 text-center">
        <i className="fa-solid fa-book-open-reader text-brand-500 text-4xl mb-3" />

        <h3 className="font-extrabold text-xl">
          {projectId
            ? `Project #${projectId}`
            : 'Your next audio summary'}
        </h3>

        <p className="text-sm text-slate-500 mt-2">
          Generate a summary or open a completed project from My Projects.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-brand-600 mt-4">
          Loading authenticated audio…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-red-700 bg-red-50 p-3 rounded-xl mt-4"
        >
          {error}
        </p>
      )}

      {url ? (
        <>
          <audio
            ref={ref}
            src={url}
            controls
            preload="metadata"
            className="w-full mt-6"
            onTimeUpdate={e => {
              const t = e.currentTarget.currentTime;

              setPosition(t);

              if (t - lastSaved.current >= 10) {
                persist(t);
              }
            }}
            onPause={e =>
              persist(e.currentTarget.currentTime)
            }
            onSeeked={e =>
              persist(e.currentTarget.currentTime)
            }
            onEnded={async () => {
              try {
                await backend.complete(projectId);
              } catch (e) {
                setError(e.message);
              }
            }}
          />

          <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
            <span>
              {clock(position)} / {clock(duration)}
            </span>

            <button
              className="font-bold text-brand-700"
              onClick={() =>
                downloadAudio(projectId).catch(
                  e => setError(e.message)
                )
              }
            >
              Download audio
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-slate-500 mt-6">
          {user
            ? 'No audio loaded yet.'
            : 'Log in to stream your private audio.'}

          <br />

          {!user && (
            <button
              className="text-brand-500 font-bold mt-2"
              onClick={onRequireLogin}
            >
              Log in
            </button>
          )}
        </div>
      )}

    </section>
  );
}
