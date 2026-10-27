
import Swal from 'sweetalert2';
import { useRef, useState } from 'react';
import { backend } from '../lib/api.js';

const LIMIT_MIB = Number(
  import.meta.env.VITE_MAX_UPLOAD_SIZE_MB || 20
);

export default function UploadPanel({
  user,
  onRequireLogin,
  onPrepared
}) {
  const ref = useRef(),
    [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');

  async function select(f) {
    setError('');
    setMessage('');

    if (!f) return;

    if (
      !/\.(pdf|epub)$/i.test(f.name) ||
      f.size > LIMIT_MIB * 1024 * 1024
    ) {
      setFile(null);

      const msg = `PDF/EPUB upload limit is ${LIMIT_MIB} MiB (backend default 20 MiB). Choose a smaller file.`;

      setError(msg);

      await Swal.fire({
        icon: 'warning',
        title: 'Book is too large or unsupported',
        text: msg,
        confirmButtonColor: '#0c5bdc',
        customClass: {
          popup: document.documentElement.classList.contains('dark')
            ? 'sapio-swal-dark'
            : ''
        }
      });

      return;
    }

    setFile(f);
  }

  async function prepare() {
    if (!user) {
      onRequireLogin();
      return;
    }

    if (!file) return;

    setBusy(true);
    setError('');
    setMessage('Uploading…');

    try {
      const doc = await backend.upload(file);

      setMessage('Extracting document text…');

      await backend.extract(doc.id);

      setMessage('Document extracted successfully.');

      onPrepared(doc);
    } catch (err) {
      setError(err.message);
      setMessage('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-5">

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">
          <i className="fa-solid fa-cloud-arrow-up text-brand-500 mr-2" />
          Upload PDF / EPUB
        </h2>

        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
          PDF & EPUB
        </span>
      </div>

      <label
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          select(e.dataTransfer.files?.[0]);
        }}
        className="border-2 border-dashed rounded-2xl p-6 text-center border-brand-200 bg-brand-50/40 cursor-pointer min-h-[160px] flex flex-col justify-center items-center"
      >
        <input
          ref={ref}
          type="file"
          accept=".pdf,.epub"
          className="sr-only"
          onChange={e => select(e.target.files?.[0])}
        />

        <i className="fa-solid fa-file-pdf text-3xl text-brand-500 mb-3" />

        <strong className="text-sm">
          {file?.name || 'Choose or drop a PDF / EPUB'}
        </strong>

        <span className="text-xs text-slate-500">
          Maximum {LIMIT_MIB} MiB
        </span>
      </label>

      {file && (
        <button
          onClick={() => {
            setFile(null);
            setMessage('');
            ref.current.value = '';
          }}
          className="text-left text-xs text-slate-500"
        >
          Remove file
        </button>
      )}

      <button
        disabled={!file || busy}
        onClick={prepare}
        className="w-full py-3.5 rounded-xl bg-brand-500 text-white font-bold disabled:bg-slate-300"
      >
        {busy
          ? 'Processing…'
          : 'Upload & extract document'}
      </button>

      {message && (
        <p
          role="status"
          className="text-sm text-brand-700 bg-brand-50 p-3 rounded-xl"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 p-3 rounded-xl"
        >
          {error}
        </p>
      )}

    </section>
  );
}
