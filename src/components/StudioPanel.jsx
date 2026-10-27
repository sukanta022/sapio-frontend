
import { useEffect, useState } from 'react';
import { backend, awaitJob } from '../lib/api.js';

const EMPTY = {
  summary_types: [],
  narrators: [],
  languages: [],
  audio_formats: []
};

export default function StudioPanel({
  document,
  user,
  onRequireLogin,
  onProjectReady
}) {
  const [options, setOptions] = useState(EMPTY),
    [choice, setChoice] = useState({}),
    [chapters, setChapters] = useState([]),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [error, setError] = useState(''),
    [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    let mounted = true;

    if (!user) return;

    backend.options()
      .then(o => {
        if (mounted) {
          setOptions(o);

          setChoice({
            summary_type_id: o.summary_types[0]?.id,
            narrator_id: o.narrators[0]?.id,
            language_id: o.languages[0]?.id,
            audio_format_id: o.audio_formats[0]?.id
          });
        }
      })
      .catch(e => mounted && setError(e.message));

    return () => {
      mounted = false;
    };
  }, [user]);

  const type = options.summary_types.find(
    x => x.id === Number(choice.summary_type_id)
  );

  const selectedLang = options.languages.find(
    x => x.id === Number(choice.language_id)
  );

  useEffect(() => {
    let alive = true;

    setChapters([]);

    if (document && type?.name === 'Chapter Breakdown') {
      backend.detect(document.id)
        .then(res => {
          if (alive) {
            setChapters(res.chapters || []);
          }
        })
        .catch(e => {
          if (alive) {
            setError(
              e.status === 409
                ? 'Chapters were already detected. Please use the existing detected chapters.'
                : e.message
            );
          }

          if (e.status === 409) {
            backend.chapters(document.id)
              .then(c => alive && setChapters(c))
              .catch(() => {});
          }
        });
    }

    return () => {
      alive = false;
    };
  }, [document, type?.name]);

  async function generate() {
    if (!user) {
      onRequireLogin();
      return;
    }

    if (!document) {
      setError('Upload and extract a PDF or EPUB first.');
      return;
    }

    if (Object.values(choice).some(v => !v)) {
      setError('Project options are not loaded.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const project = await backend.createProject({
        document_id: document.id,
        ...Object.fromEntries(
          Object.entries(choice).map(
            ([k, v]) => [k, Number(v)]
          )
        )
      });

      setStatus('Summary job queued…');

      const s = await backend.job(project.id, 'summary');

      setActiveJob(s);

      const finalSummary = await awaitJob(s.id, {
        onUpdate: j => {
          setActiveJob(j);
          setStatus(
            `Gemini summary: ${j.status} (${j.progress}%)`
          );
        }
      });

      if (finalSummary.status !== 'completed') {
        throw new Error(
          finalSummary.error_message ||
          `Summary ${finalSummary.status}`
        );
      }

      setStatus('Audio job queued…');

      const a = await backend.job(project.id, 'audio');

      setActiveJob(a);

      const finalAudio = await awaitJob(a.id, {
        onUpdate: j => {
          setActiveJob(j);
          setStatus(
            `Piper audio: ${j.status} (${j.progress}%)`
          );
        }
      });

      if (finalAudio.status !== 'completed') {
        throw new Error(
          finalAudio.error_message ||
          `Audio ${finalAudio.status}`
        );
      }

      setStatus('Audio summary is ready!');

      onProjectReady(project.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setActiveJob(null);
    }
  }

  const dropdown = (label, key, values) => (
    <label className="text-xs font-bold text-slate-600">
      {label}

      <select
        value={choice[key] ?? ''}
        onChange={e =>
          setChoice(old => ({
            ...old,
            [key]: Number(e.target.value)
          }))
        }
        className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-sm"
      >
        <option value="" disabled>
          Select {label}
        </option>

        {values.map(o => (
          <option
            key={o.id}
            value={o.id}
          >
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section
      id="studio"
      className="mt-12 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
    >
      <div className="mb-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
          Personalized learning
        </span>

        <h2 className="text-2xl font-extrabold mt-1">
          Audio Summary Studio
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Options are loaded directly from Sapio AI backend.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          {dropdown(
            'Summary type',
            'summary_type_id',
            options.summary_types
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {dropdown(
              'Output language',
              'language_id',
              options.languages
            )}

            {dropdown(
              'Audio format',
              'audio_format_id',
              options.audio_formats
            )}
          </div>

          {dropdown(
            'Narrator',
            'narrator_id',
            options.narrators
          )}

          <p className="text-xs text-slate-500">
            Selected language: {selectedLang?.name || '—'}. Backend validates whether narrator and voice model are supported.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
            <h3 className="font-extrabold">
              Document & chapters
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              {document?.file_name || 'Upload a document first'}
            </p>

            {type?.name === 'Chapter Breakdown' ? (
              <div className="mt-3 text-xs text-slate-600">
                {chapters.length
                  ? chapters.map(c => (
                      <p
                        key={c.id}
                        className="py-1"
                      >
                        • {c.title || `Chapter ${c.chapter_number}`}
                      </p>
                    ))
                  : 'Detecting chapters…'}

                <p className="mt-2 text-amber-700">
                  The existing backend uses all detected chapters; individual chapter selection is not supported.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Full-document summary.
              </p>
            )}
          </div>

          <button
            disabled={busy || !document}
            onClick={generate}
            className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 disabled:bg-slate-300"
          >
            {busy
              ? 'Generating…'
              : 'Generate summary & audio'}
          </button>

          {status && (
            <p
              role="status"
              className="bg-brand-50 rounded-xl p-3 text-sm text-brand-700"
            >
              {status}
            </p>
          )}

          {activeJob?.status === 'queued' && (
            <button
              onClick={async () => {
                try {
                  await backend.cancel(activeJob.id);
                  setStatus('Queued job cancelled.');
                } catch (e) {
                  setError(e.message);
                }
              }}
              className="text-xs text-red-700"
            >
              Cancel queued job
            </button>
          )}

          {error && (
            <p
              role="alert"
              className="bg-red-50 text-red-700 rounded-xl p-3 text-sm"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
