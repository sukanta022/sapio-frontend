import { NavLink, useNavigate } from 'react-router-dom';

export default function Header({
  user,
  onOpenSearch,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme
}) {
  const navigate = useNavigate(),
    admin = user?.role === 'admin';

  const links = [
    ['/', 'Explore Engine'],
    ['/popular-summaries', 'Popular Summaries'],
    ['/projects', 'My Projects'],
    ['/history', 'History'],
    ...(admin ? [['/admin', 'Admin Dashboard']] : [])
  ];

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive
        ? 'text-brand-500'
        : 'text-slate-600 hover:text-brand-500'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-20 flex flex-wrap items-center justify-between gap-3 py-2">

        <NavLink
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-brand-500 group-hover:scale-105 transition-transform">
            <img
              src="/images/my_logo.png"
              alt="Sapio AI logo"
              className="w-full h-full object-cover"
            />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Sapio
            <span className="text-brand-500 font-extrabold">
              AI
            </span>
          </span>
        </NavLink>

        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-5"
        >
          {links.map(([to, label]) => (
            <NavLink
              end={to === '/'}
              key={to}
              to={to}
              className={navClass}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">

          <button
            aria-label={
              theme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              theme === 'dark'
                ? 'Light mode'
                : 'Dark mode'
            }
            onClick={onToggleTheme}
            className="theme-toggle"
          >
            <i
              className={`fa-solid ${
                theme === 'dark' ? 'fa-sun' : 'fa-moon'
              }`}
            />

            <span className="hidden xl:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          <select
            aria-label="Navigate pages"
            className="lg:hidden border rounded-lg text-xs p-2 max-w-36"
            value={
              links.find(
                ([to]) => to === window.location.pathname
              )?.[0] || '/'
            }
            onChange={e => navigate(e.target.value)}
          >
            {links.map(([to, label]) => (
              <option key={to} value={to}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-500 hover:text-brand-500 rounded-lg"
            title="Search books"
          >
            <i className="fa-solid fa-magnifying-glass text-lg" />
          </button>

          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-semibold text-slate-700">
                Hi, {user.name}
              </span>

              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 border rounded-xl"
              >
                Log in
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md"
              >
                Sign up free
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
