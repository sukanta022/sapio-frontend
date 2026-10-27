# Sapio AI frontend correction package

Features: upgraded admin badge and search styling; theme toggle with persisted light/dark choice (#172030 dark base); SweetAlert2 for PDF oversize and publishing success/failure; admin book upload now uses the existing PDF → extraction → project → summary job → audio job → download → popular media upload → publish endpoints. No backend code changes.

Backend default upload limit 20 MiB, may be overridden by `MAX_UPLOAD_SIZE_MB` in backend `.env`. Set `VITE_MAX_UPLOAD_SIZE_MB` in frontend `.env` to the **same number** for normal user uploads. Admin popular-book uploads remain capped at 20 MiB because that separate media endpoint has its own 20 MB limit. Popular media upload accepts cover up to 5 MB, audio up to 100 MB, document up to 20 MB in the previously supplied backend patch. Thus if backend normal limit is raised above 20 MiB, admin publication of the original document could still fail above the popular media 20 MB limit.

Admin must remain logged in and keep the dialog open for generation; backend worker and Gemini/Piper services must be running. Browser closing before publishing may leave a generated private project but no catalog entry. Generated audio more than 100 MB cannot be published via current media backend. For larger books generation might fail due to the backend extraction/LLM constraints even if the PDF file is under 20 MiB.

Verification: `npm install`, `npm run build`, `npm run dev`; API + background worker both running. Check admin PDF → publish flow with a small file; refresh /popular-summaries for cover/audio. Check oversize SweetAlert and persisted theme after refresh.
