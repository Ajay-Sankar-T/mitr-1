# Improvements & Known Issues

Things worth doing next, found while working on this codebase. None of these block current functionality — they're flagged here rather than fixed silently, since several touch decisions (deletions, renames, content) that are the project owner's call.

## Deployment / build

- **`dist/` is stale and not actually used to deploy.** `vercel.json` sets `buildCommand: ""` and `outputDirectory: "."`, so Vercel serves the repository root directly — `npm run build` and the `dist/` folder are not part of the live deploy path today. `dist/` currently lacks `site-chrome.js`, `coffee.js`, `departments.js`, `feedback.js`, `team.json`, and `quotes.json` entirely, and its HTML is hundreds of lines behind the root pages. Either delete `dist/` to stop it being a confusing, misleading second copy of the site, or — if it's there on purpose (e.g. a GitHub Pages mirror, a manual staging copy) — say so in a comment, and decide whether to keep hand-syncing it or wire `npm run build` into whatever process actually consumes it.
- **`vite.config.js`'s build input list is missing the faculty page.** `rollupOptions.input` lists `main`, `emergency`, `directory`, `yearbook` — but not `Faculty co  ord/directory.html`. If `npm run build` is ever wired into the real deploy later, that page would silently disappear from the build output.
- **`yearbook.pdf` (49MB) is committed directly to git.** Every clone of this repo downloads 49MB regardless of whether the clone needs it. Consider Git LFS, or hosting it externally (S3/Cloudinary/etc.) and fetching it by URL instead of a relative path.
- **Two large office files sit at the repo root**: `CORE_PHOTOS_2026.pdf` (~4MB) and `Mitr Website Suggestions.docx` (~1.7MB). Neither looks like a deployed site asset — worth confirming whether they belong in version control at all, or should move to a shared drive.

## Dead code

- **`nav.js`, `footer.js`, and `yearbook-responsive-patch.css` are no longer referenced by any HTML page.** They're leftovers from an earlier iteration of the shared-header/footer work, superseded by `site-chrome.js`. Safe to delete — confirmed via a repo-wide search that nothing `<script src>`s or `<link>`s them anymore. (`dist/nav.js` and `dist/footer.js` are separately dead for the same reason, inside the also-dead `dist/` folder above.)

## Content still pending real data

- **Three "Achievements & Media" ceremony links in `yearbook.html`** (Press Information Bureau article, Times of India article, MITR Impact Report) still point to `href="#"` with a `<!-- TODO -->` comment above each, waiting on the real URLs.
- **`dist/yearbook.html`'s Flagship Events section** still shows the old icon-only placeholders rather than the real photos that were added to the source `yearbook.html` — another symptom of `dist/` being stale (see above).

## Mobile layout

- **A ~6px horizontal overflow exists on narrow phones (< 400px wide)**, caused by decorative `-inset-4` + `rotate-3`/`-rotate-3` background panels (e.g. behind the Director's photo on `index.html`). It's currently masked by `overflow-x-hidden` on `<body>`, so it doesn't produce a visible scrollbar or layout break — but it means `document.documentElement.scrollWidth` doesn't cleanly match the viewport, which can trip up automated overflow checks. Tightening the inset/rotation values on those decorative panels would close the gap cleanly.
- **The yearbook flipbook's `RENDER_SCALE` (1.5) is fixed for every device**, and every page of the 49MB `yearbook.pdf` renders synchronously, in order, before the book opens — on a slow connection or phone, that's a long wait staring at a loading spinner. A batch/progressive-loading version of this was tried and reverted (it introduced a visible "flashing" effect as the book rebuilt itself on every batch); see [Future Improvements](#future-improvements--upgradations) for a better-scoped way to revisit this.

## Architecture

- **Tailwind config is duplicated per page, with inconsistent token names.** Each of the five pages declares its own inline `tailwind.config` with the same color palette, but the custom spacing/font token *names* differ (e.g. `margin-page` vs. `page` vs. `margin-mobile`). `site-chrome.js` works around this by only using stock utilities plus the identically-defined color tokens, but it's a landmine for anyone adding new shared markup without knowing that constraint. Extracting one shared config object (even just copy-pasted from a single source file with a "keep these in sync" comment) would reduce the chance of a token silently resolving to nothing on one page.
- **No automated test suite is checked into the repo.** All verification during recent work (mobile responsiveness, the shared-chrome refactor, the yearbook batch-loading fix) was done with one-off Playwright scripts in a scratch directory outside the repo, so none of those checks run again automatically and future regressions (several were found and fixed *within this same working session*) won't be caught until someone notices by eye. A small `tests/` folder with a handful of Playwright checks (header/footer injection, no horizontal overflow at a few widths, the modals opening) committed to the repo — even without CI wired up yet — would let the next session build on prior verification instead of re-deriving it.
- **The `Faculty co  ord` folder name has a literal double space.** It works today (the code already handles it via careful quoting/`encodeURIComponent`), but it's fragile for anyone editing by hand or adding new tooling. Renaming it (e.g. to `faculty-coordinators`) would remove a recurring footgun — but is a breaking change to every relative path that references it, so it needs a deliberate pass, not a quick fix.

## Future Improvements & Upgradations

Forward-looking ideas, as opposed to the fixes above — none of this is broken today, it's about what the site could become. Roughly ordered by how much value it'd add relative to effort.

### Yearbook / PDF viewer

- **Revisit progressive loading, but scoped correctly.** A batch-loading version (open the book after the first 6 pages, keep rendering the rest in the background) was built and then reverted because rebuilding the flipbook on every batch caused a visible flash. A better-behaved version would render a low-res thumbnail strip instantly (cheap, fast, gives the reader something immediately) while the full-resolution pages render once in the background — with only *one* swap from thumbnail to full book, not a rebuild every few pages.
- **Server-side (or build-time) PDF-to-image pre-rendering.** Right now every visitor's browser re-renders all 50 pages of a 49MB PDF from scratch, every single visit. Pre-rendering each page to a static WebP/AVIF once (at build or upload time) and serving those images instead would cut load time dramatically and remove the client-side rendering cost entirely — pdf.js would no longer be needed at all.
- **Swipe gestures for mobile.** `page-flip` supports touch, but a dedicated left/right swipe affordance (with a small hint animation on first load) would make the flipbook feel native on phones rather than desktop-first.
- **Deep-linking to a page.** `yearbook.html?page=12` (or a `#page=12` hash) so a specific page can be shared/bookmarked directly, instead of every link landing on page 1.

### Content & data

- **A lightweight admin flow for the JSON data files.** `events.json`, `team.json`, `quotes.json`, and `Faculty co  ord/faculty.json` all now drive their pages — a real improvement over hardcoded HTML — but they're still hand-edited JSON in a code editor. A small static form (even client-side only, generating the JSON to copy-paste, or backed by a free headless CMS like Decap/Netlify CMS) would let a non-technical team member update the roster or events without touching code.
- **A real events calendar**, not just a static grid — filterable by upcoming/past, with dates, so "Workshops & Events" can show what's actually happening this month rather than a fixed list of 20.
- **Multi-language content.** The team directory already tracks each coordinator's spoken languages; the site itself is English-only. Even a partial Tamil/Hindi translation of the emergency contacts page (the highest-stakes page on the site) would meaningfully widen who can use it in a crisis.

### Accessibility & UX

- **A real accessibility pass** (axe-core or similar automated scan, plus manual screen-reader + keyboard-only testing) — the site hasn't had one yet. Likely quick wins: focus-visible states on custom buttons, `aria-live` regions for the yearbook's status text and form success/error messages, and confirming color contrast on the glassmorphism panels against varying background photos.
- **Dark mode.** `darkMode: "class"` is already configured in every page's Tailwind config but nothing ever toggles the class — the config exists but the feature doesn't.
- **Replace the mailto-compose flow with a real form submission** for booking/coffee/feedback, for visitors without a configured Gmail account (or on desktop without a mail client). A free form backend (Formspree, a Vercel serverless function, Google Forms behind the same UI) would remove the "hope they have Gmail open" dependency while keeping the "no backend to maintain" spirit — most of these are still no-database, no-server-code options.

### Infrastructure

- **CI checks on every PR**: even just "does the build not crash" plus a couple of the Playwright checks already written ad hoc during this project's recent work (see the "No automated test suite" item above) would catch the kind of regression this session found and fixed (header overlap, hero clipping, missing script tags) before it reaches production instead of after.
- **Image optimization pass.** Some directories (`core/`) already moved to `.webp`; `Achievements/`, `Alumni/`, and `Faculty co  ord/` are still full-size `.jpg`/`.png` straight from phone cameras. Running them through a `webp`/`avif` conversion + resize pass would shrink page weight noticeably, especially on the photo-heavy `yearbook.html`.
- **Basic analytics**, if the team ever wants to know which pages/features get used — privacy-respecting only (e.g. Plausible or Vercel Analytics, no cookies), and the footer's "this site doesn't collect any of your data" line would need to be updated to stay accurate if this is ever added.
