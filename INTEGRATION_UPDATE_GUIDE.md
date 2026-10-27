# Sapio AI - Frontend Router & Popular Media Update

## Approved baseline
Preserves the existing Sapio AI colors/cards/logo, the working PDF -> Gemini -> Piper workflow, JWT auth, and listening history. Only the frontend is updated.

## Windows PowerShell
1. Back up your existing frontend folder.
2. Extract this ZIP and open the `Frontend` directory in VS Code.
3. Run `npm install`, then `npm run build`, then `npm run dev`.
4. Start your existing backend API with `python -m uvicorn app.main:app --reload`. Start its job worker in a separate terminal.
5. Open the local URL printed by Vite (normally http://localhost:5173).

## Routes
- `/` Explore Engine, document upload, generation & player
- `/popular-summaries` public published catalog with cover images and audio playback
- `/projects` user's projects and history
- `/history` listening-history view
- `/admin` authenticated admin only; otherwise redirects home

## Test checklist
1. Non-logged-in: no Admin nav link; `/admin` redirects home.
2. Standard user login: no Admin nav; `/admin` redirects home.
3. Admin login: Admin link appears and dashboard loads.
4. Admin > Popular summaries > Add Popular Summary: enter title, description, type/language/narrator/format/duration, add cover/audio (optional PDF/EPUB), choose Publish, save.
5. Open `/popular-summaries` and verify new cover/audio appear; play and seek audio.
6. Admin unpublish: check item disappears from public page after refresh.
7. Repeat existing PDF upload -> extraction -> generation -> player -> history workflow.

## Notes
- The upload backend is the already-migrated c43a1d56f902 code. Frontend does not modify backend.
- Backend's admin access checks remain authoritative; route hiding is only UI.
- Upload flow is create draft -> media upload -> optional publish. If a later step fails, the draft may remain in the database for manual recovery.
- Browser history deep links require a deployment rewrite to index.html (Vite dev server handles this automatically).
- `/api/v1` Vite proxy targets the backend port 8000.
