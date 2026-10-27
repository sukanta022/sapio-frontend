# Sapio AI frontend — original-design SPA preview

This version preserves the original homepage design, React/Vite/Tailwind, header, two-column upload/player cards, popular catalog, and footer.

## Run on Windows

```powershell
cd PATH\TO\Frontend
npm install
npm run dev
```

## Navigation

- Explore Engine: original homepage and new Audio Summary Studio
- Popular Summaries: original book-card section
- How It Works: original pipeline section
- My Projects: locally saved UI drafts and listening activity
- Admin Preview: design preview visible without authentication; Overview, Users, Popular summaries, Projects & jobs

## Source changes

Replaced `src/App.jsx`, `src/components/Header.jsx`, `src/components/UploadPanel.jsx`, `src/components/PlayerPanel.jsx`, `src/components/HeroTagline.jsx`.
Added `src/components/StudioPanel.jsx`, `src/components/LibraryWorkspace.jsx`, `src/components/AdminPreview.jsx`.
Preserved original design assets and most original components.

## Integration boundaries

This is a frontend-only UI preview. Selecting PDF/EPUB DOES NOT upload or extract files. Saving a project draft uses browser localStorage only. Popular cards/analytics/users are sample data, and player/transcript visuals are demo state, NOT fetched audio. Sign-up/login remains mock state; admin preview has no security and MUST NOT be exposed as a production admin service. No real background job is queued and no cloud backend is contacted.

Next phase: map actual FastAPI endpoint schemas (upload, extraction, options, projects, jobs, audio, auth, popular catalog, admin) to UI state and replace demo data. Public popular-summary audio access is not yet implemented by the backend, so do not assume playable public audio.
