
import { useState } from 'react';
import { backend, storeToken } from '../lib/api.js';

export default function AuthModal({
  initialMode,
  onClose,
  onAuthenticated
}) {
  const [mode, setMode] = useState(initialMode),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');

  const signup = mode === 'signup';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (signup)
        await backend.register({ name, email, password });

      const data = await backend.login(email, password);

      storeToken(data.access_token);

      const user = await backend.me();

      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <section className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">

        <button
          className="absolute top-4 right-4 text-slate-500"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-extrabold mb-5">
          {signup ? 'Create your account' : 'Welcome back'}
        </h2>

        <form
          className="space-y-4"
          onSubmit={submit}
        >
          {signup && (
            <label className="block text-sm font-semibold">
              Name

              <input
                required
                minLength={2}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-xl border mt-1"
              />
            </label>
          )}

          <label className="block text-sm font-semibold">
            Email

            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border mt-1"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password

            <input
              type="password"
              required
              minLength={signup ? 12 : 1}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border mt-1"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="bg-red-50 text-red-700 p-3 rounded-xl text-sm"
            >
              {error}
            </p>
          )}

          <button
            disabled={busy}
            className="w-full bg-brand-500 text-white font-bold p-3 rounded-xl disabled:opacity-50"
          >
            {busy
              ? 'Please wait…'
              : signup
                ? 'Sign up'
                : 'Log in'}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-brand-500"
          onClick={() => {
            setMode(signup ? 'login' : 'signup');
            setError('');
          }}
        >
          {signup
            ? 'Already registered? Log in'
            : 'Need an account? Sign up'}
        </button>

      </section>
    </div>
  );
}
