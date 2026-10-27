
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  backend,
  popularMedia,
  generatedAudioFile,
  awaitJob
} from '../lib/api.js';

const inputClass = 'sapio-field w-full mt-2 rounded-xl border border-slate-200 p-3 text-sm bg-white focus:ring-2 focus:ring-brand-300 focus:border-brand-400 outline-none transition';

const MAX_UPLOAD_MIB = Math.min(
  20,
  Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB || 20)
);

const MAX_UPLOAD_BYTES = MAX_UPLOAD_MIB * 1024 * 1024;

export default function PopularUploadModal({ onClose, onSaved }) {
  const [options, setOptions] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    language_id: '',
    narrator_id: '',
    summary_type_id: '',
    audio_format_id: '',
    publish: true
  });

  const [files, setFiles] = useState({
    document: null,
    cover: null
  });

  const [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [error, setError] = useState('');

  useEffect(() => {
    let live = true;

    backend.options()
      .then(o => {
        if (!live) return;

        setOptions(o);

        setForm(f => ({
          ...f,
          language_id: String(o.languages?.[0]?.id || ''),
          narrator_id: String(o.narrators?.[0]?.id || ''),
          summary_type_id: String(o.summary_types?.[0]?.id || ''),
          audio_format_id: String(o.audio_formats?.[0]?.id || '')
        }));
      })
      .catch(e => {
        if (live) setError(e.message);
      });

    return () => {
      live = false;
    };
  }, []);

  const update = (key, value) =>
    setForm(old => ({
      ...old,
      [key]: value
    }));

  const darkPopup = () =>
    document.documentElement.classList.contains('dark')
      ? 'sapio-swal-dark'
      : '';

  async function chooseDocument(file) {
    if (!file) return;

    if (!/\.(pdf|epub)$/i.test(file.name)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Unsupported file',
        text: 'Choose PDF or EPUB.',
        customClass: {
          popup: darkPopup()
        }
      });

      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      await Swal.fire({
        icon: 'warning',
        title: 'File too large',
        text: `Your file is ${(file.size / 1048576).toFixed(1)} MiB. The configured frontend limit is ${MAX_UPLOAD_MIB} MiB.`,
        customClass: {
          popup: darkPopup()
        }
      });

      return;
    }

    setFiles(v => ({
      ...v,
      document: file
    }));
  }

  const dropdown = (label, key, values) => (
    <label className='block text-xs font-bold text-slate-700'>
      {label} *

      <select
        className={inputClass}
        required
        value={form[key]}
        onChange={e => update(key, e.target.value)}
      >
        <option value=''>
          Select {label}
        </option>

        {values?.map(x => (
          <option
            value={x.id}
            key={x.id}
          >
            {x.name}
          </option>
        ))}
      </select>
    </label>
  );

  async function submit(e) {
    e.preventDefault();
    setError('');

    const doc = files.document;

    if (!doc) {
      await Swal.fire({
        icon: 'warning',
        title: 'Book PDF required',
        text: 'Upload a PDF or EPUB to generate audio automatically.',
        customClass: {
          popup: darkPopup()
        }
      });

      return;
    }

    if (doc.size > MAX_UPLOAD_BYTES) {
      await chooseDocument(doc);
      return;
    }

    if (files.cover && files.cover.size > 5 * 1024 * 1024) {
      setError('Cover exceeds the 5 MB limit.');
      return;
    }

    if (!form.title.trim()) {
      setError('Book title required.');
      return;
    }

    setBusy(true);

    let projectId = null,
      summaryId = null;

    try {
      setStatus('1/7 Uploading book…');

      const document = await backend.upload(doc);

      setStatus('2/7 Extracting text…');

      await backend.extract(document.id);

      const type = options.summary_types.find(
        x => x.id === Number(form.summary_type_id)
      );

      if (type?.name === 'Chapter Breakdown') {
        setStatus('Detecting chapters…');

        try {
          await backend.detect(document.id);
        } catch (err) {
          if (err.status !== 409) throw err;
        }
      }

      setStatus('3/7 Creating summary project…');

      const project = await backend.createProject({
        document_id: document.id,
        summary_type_id: Number(form.summary_type_id),
        narrator_id: Number(form.narrator_id),
        language_id: Number(form.language_id),
        audio_format_id: Number(form.audio_format_id)
      });

      projectId = project.id;

      setStatus('4/7 Gemini is generating the summary…');

      const summaryJob = await backend.job(project.id, 'summary');

      const summaryResult = await awaitJob(summaryJob.id, {
        onUpdate: j =>
          setStatus(
            `Gemini summary: ${j.status} (${j.progress ?? 0}%)`
          )
      });

      if (summaryResult.status !== 'completed') {
        throw new Error(
          summaryResult.error_message || 'Summary generation failed'
        );
      }

      setStatus('5/7 Piper is generating the audio…');

      const audioJob = await backend.job(project.id, 'audio');

      const audioResult = await awaitJob(audioJob.id, {
        onUpdate: j =>
          setStatus(
            `Piper audio: ${j.status} (${j.progress ?? 0}%)`
          )
      });

      if (audioResult.status !== 'completed') {
        throw new Error(
          audioResult.error_message || 'Audio generation failed'
        );
      }

      setStatus('6/7 Retrieving generated audio…');

      const format = options.audio_formats.find(
        x => x.id === Number(form.audio_format_id)
      );

      const audio = await generatedAudioFile(
        project.id,
        format?.name || 'mp3'
      );

      const audioInfo = await backend.audio(project.id)
        .catch(() => null);

      const seconds =
        audioInfo?.total_duration ??
        audioInfo?.duration_seconds ??
        null;

      setStatus('7/7 Saving to Popular Summaries…');

      const saved = await popularMedia.create({
        title: form.title.trim(),
        description: form.description || null,
        language_id: Number(form.language_id),
        narrator_id: Number(form.narrator_id),
        summary_type_id: Number(form.summary_type_id),
        audio_format_id: Number(form.audio_format_id),
        duration_seconds:
          typeof seconds === 'number'
            ? Math.floor(seconds)
            : null
      });

      summaryId = saved.id;

      await popularMedia.upload(saved.id, {
        audio,
        cover: files.cover,
        document: doc
      });

      if (form.publish) {
        await backend.publish(saved.id, true);
      }

      onSaved();

      await Swal.fire({
        icon: 'success',
        title: form.publish
          ? 'Published successfully!'
          : 'Draft saved!',
        text: `${form.title.trim()} — ${
          form.publish
            ? 'now available in Popular Summaries.'
            : 'saved as a draft.'
        }`,
        confirmButtonColor: '#0c5bdc',
        customClass: {
          popup: darkPopup()
        }
      });
    } catch (err) {
      setError(
        `${err.message}${
          projectId
            ? ` • Generated project #${projectId} may be available in My Projects.`
            : ''
        }${
          summaryId
            ? ` • Popular summary draft #${summaryId} may exist.`
            : ''
        }`
      );

      await Swal.fire({
        icon: 'error',
        title: 'Could not finish publishing',
        text: err.message,
        customClass: {
          popup: darkPopup()
        }
      });
    } finally {
      setBusy(false);
      setStatus('');
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4'
      role='dialog'
      aria-modal='true'
      aria-label='Add Popular Summary'
    >
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8'>

        <div className='flex justify-between items-start gap-3 mb-5'>
          <div>
            <p className='text-xs font-extrabold tracking-wider uppercase text-brand-500'>
              Admin content management
            </p>

            <h2 className='text-2xl font-extrabold mt-1'>
              Generate Popular Summary
            </h2>

            <p className='text-sm text-slate-500 mt-2'>
              Upload a book. Gemini and Piper will generate audio automatically before publishing.
            </p>
          </div>

          <button
            aria-label='Close dialog'
            disabled={busy}
            onClick={onClose}
            className='rounded-xl border px-3 py-2 hover:bg-slate-100'
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={submit}
          className='space-y-4'
        >
          <label className='block text-xs font-bold text-slate-700'>
            Book title *

            <input
              required
              maxLength={255}
              className={inputClass}
              value={form.title}
              onChange={e => update('title', e.target.value)}
            />
          </label>

          <label className='block text-xs font-bold text-slate-700'>
            Description

            <textarea
              rows='3'
              className={inputClass}
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
          </label>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {dropdown(
              'Language',
              'language_id',
              options?.languages
            )}

            {dropdown(
              'Narrator',
              'narrator_id',
              options?.narrators
            )}

            {dropdown(
              'Summary type',
              'summary_type_id',
              options?.summary_types
            )}

            {dropdown(
              'Audio format',
              'audio_format_id',
              options?.audio_formats
            )}
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <label className='block text-xs font-bold text-slate-700'>
              Book cover (JPG, PNG, WebP)

              <input
                type='file'
                accept='.jpg,.jpeg,.png,.webp'
                className={inputClass}
                disabled={busy}
                onChange={e =>
                  setFiles(f => ({
                    ...f,
                    cover: e.target.files?.[0] || null
                  }))
                }
              />
            </label>

            <label className='block text-xs font-bold text-slate-700'>
              Book PDF / EPUB *

              <input
                required
                type='file'
                accept='.pdf,.epub'
                className={inputClass}
                disabled={busy}
                onChange={e =>
                  chooseDocument(e.target.files?.[0])
                }
              />
            </label>
          </div>

          <label className='flex gap-2 items-center text-sm font-semibold'>
            <input
              type='checkbox'
              checked={form.publish}
              disabled={busy}
              onChange={e =>
                update('publish', e.target.checked)
              }
            />

            Publish automatically after generation
          </label>

          <p className='text-xs text-slate-500'>
            Book upload limit: {MAX_UPLOAD_MIB} MiB 
          </p>

          {status && (
            <div
              role='status'
              className='rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700'
            >
              <i className='fa-solid fa-spinner fa-spin mr-2' />

              {status}

              <p className='mt-1 text-xs font-normal'>
                Keep this dialog open until the job finishes.
              </p>
            </div>
          )}

          {error && (
            <p
              role='alert'
              className='bg-red-50 text-red-700 p-3 rounded-xl text-sm'
            >
              {error}
            </p>
          )}

          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              disabled={busy}
              onClick={onClose}
              className='border rounded-xl px-5 py-3 font-semibold'
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={busy || !options}
              className='bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-5 py-3 font-bold disabled:opacity-60'
            >
              {busy
                ? 'Generating…'
                : form.publish
                  ? 'Generate & publish'
                  : 'Generate draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
