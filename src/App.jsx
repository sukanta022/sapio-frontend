
import { useEffect, useState } from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import Header from './components/Header.jsx';
import HeroTagline from './components/HeroTagline.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import RealPlayer from './components/RealPlayer.jsx';
import PopularSummaries from './components/PopularSummaries.jsx';
import AuthModal from './components/AuthModal.jsx';
import Footer from './components/Footer.jsx';
import StudioPanel from './components/StudioPanel.jsx';
import LibraryWorkspace from './components/LibraryWorkspace.jsx';
import AdminPreview from './components/AdminPreview.jsx';

import {
  backend,
  clearToken,
  getToken,
} from './lib/api.js';

function Shell() {
  // ----------------------------------------
  // Theme management
  // ----------------------------------------

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sapio_theme') || 'light';
  });

  useEffect(() => {
    // Explicitly use the browser document object
    window.document.documentElement.classList.toggle(
      'dark',
      theme === 'dark'
    );

    localStorage.setItem('sapio_theme', theme);
  }, [theme]);

  // ----------------------------------------
  // React Router
  // ----------------------------------------

  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------
  // Authentication state
  // ----------------------------------------

  const [user, setUser] = useState(null);

  const [checking, setChecking] = useState(
    Boolean(getToken())
  );

  const [authMode, setAuthMode] = useState(null);

  // FIX: Do not use "document" as a state variable
  const [uploadedDocument, setUploadedDocument] =
    useState(null);

  const [projectId, setProjectId] = useState(null);

  const [notice, setNotice] = useState('');

  // ----------------------------------------
  // Check existing login session
  // ----------------------------------------

  useEffect(() => {
    let alive = true;

    if (!getToken()) {
      setChecking(false);
      return;
    }

    backend
      .me()
      .then((u) => {
        if (alive) {
          setUser(u);
        }
      })
      .catch(() => {
        clearToken();

        if (alive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (alive) {
          setChecking(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  // ----------------------------------------
  // Scroll to top on route changes
  // ----------------------------------------

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ----------------------------------------
  // Audio playback navigation
  // ----------------------------------------

  function play(id) {
    setProjectId(id);
    navigate('/');
  }

  // ----------------------------------------
  // Logout
  // ----------------------------------------

  function handleLogout() {
    clearToken();

    setUser(null);
    setUploadedDocument(null);
    setProjectId(null);
    setNotice('');

    navigate('/');
  }

  // ----------------------------------------
  // Theme toggle
  // ----------------------------------------

  function handleToggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark'
    );
  }

  // ----------------------------------------
  // Successful authentication
  // ----------------------------------------

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setAuthMode(null);

    setNotice(
      `Welcome, ${authenticatedUser.name}`
    );
  }

  // ----------------------------------------
  // Project ready callback
  // ----------------------------------------

  function handleProjectReady(id) {
    setNotice(
      'Audio generated successfully. Playback is ready.'
    );

    play(id);
  }

  // ----------------------------------------
  // Role and current path
  // ----------------------------------------

  const admin = user?.role === 'admin';
  const path = location.pathname;

  // ----------------------------------------
  // Main application layout
  // ----------------------------------------

  return (
    <div className="min-h-screen flex flex-col justify-between">

      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        user={user}
        onOpenSearch={() =>
          navigate('/popular-summaries')
        }
        onOpenAuth={setAuthMode}
        onLogout={handleLogout}
        activePage={path}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">

        {/* Notification */}
        {notice && (
          <p
            role="status"
            className="bg-brand-50 text-brand-800 p-3 rounded-xl mb-4"
          >
            {notice}
          </p>
        )}

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={
              <>
                <HeroTagline />

                <div
                  id="hero-section"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  <UploadPanel
                    user={user}
                    onRequireLogin={() =>
                      setAuthMode('login')
                    }
                    onPrepared={setUploadedDocument}
                  />

                  <RealPlayer
                    user={user}
                    projectId={projectId}
                    onRequireLogin={() =>
                      setAuthMode('login')
                    }
                  />
                </div>

                <StudioPanel
                  user={user}
                  document={uploadedDocument}
                  onRequireLogin={() =>
                    setAuthMode('login')
                  }
                  onProjectReady={handleProjectReady}
                />
              </>
            }
          />

          {/* Popular Summaries */}
          <Route
            path="/popular-summaries"
            element={<PopularSummaries />}
          />

          {/* User Projects */}
          <Route
            path="/projects"
            element={
              <LibraryWorkspace
                user={user}
                onOpenStudio={() => navigate('/')}
                onPlay={play}
                onRequireLogin={() =>
                  setAuthMode('login')
                }
              />
            }
          />

          {/* User History */}
          <Route
            path="/history"
            element={
              <LibraryWorkspace
                user={user}
                initialTab="history"
                onOpenStudio={() => navigate('/')}
                onPlay={play}
                onRequireLogin={() =>
                  setAuthMode('login')
                }
              />
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              checking ? (
                <p className="text-slate-600">
                  Checking admin access…
                </p>
              ) : admin ? (
                <AdminPreview user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Unknown routes */}
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />

        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onAuthenticated={handleAuthenticated}
        />
      )}

    </div>
  );
}

// ----------------------------------------
// Root App Component
// ----------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
