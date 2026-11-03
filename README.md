# BM3122 Medical Imaging — Interactive Exam Preparation Platform

## 1. Project Overview

A local study platform for students preparing for BM3122 Medical Imaging at the University of Moratuwa. Practise by topic, reveal proposed worked solutions, sit timed examinations and track your own revision. The app works offline after dependencies are installed and the local server is running; it is not a service worker app that runs without a server.

The application seed includes **4 independently authored model papers, 96 question parts and 400 marks**, with proposed solutions and rubrics. Original past-paper practice is implemented and becomes available when you import your authorized local question bank. No personal answers, notes, bookmarks or study database are distributed.

## 2. Features

| Feature | Implemented behaviour |
| --- | --- |
| Question bank | Search and filter by topic, type, difficulty, source and study status; original paper/question grouping |
| Practice | Topic, mixed, priority-family, weak-topic and flash revision; imported past-paper practice |
| Solutions | Step reveal, proposed marking rubrics, hints, reference diagrams and KaTeX mathematics |
| Answer workspace | Text, LaTeX preview, final numerical answer, units, pointer drawings and image upload |
| Feedback | Final-value numerical tolerance and unit conversion; self-assessed theory/working; imported keyed MCQs |
| Timed exams | Persistent deadline, saved answers, flags, resume, expiry submission and answer locking |
| Results | Reviewed marks, provisional status and unanswered/pending distinctions |
| Revision | Confidence, difficulty, due dates, repeat scheduling, notes and bookmarks |
| Analytics | Actual reviewed attempts, topic performance and revision priorities; no fabricated scores |
| Resources | Local PDF.js viewer with page links and HTTP byte ranges |
| Data | SQLite persistence; validated JSON bank import/export; complete ZIP backup and restore |
| Display | Responsive navigation, light/dark themes, local fonts/assets |

Numerical checks do not grade unseen working. Open-ended answers require self-assessment. No automatic theory or drawing grading, paid AI API or user account is required. No MCQs are included in the bundled model bank.

## 3. Technology Stack

- Next.js 16 App Router, React 19 and TypeScript; local Node server for API routes.
- Tailwind CSS 4, Radix Slot/CVA button components, Lucide icons and Recharts.
- KaTeX for mathematics; PDF.js for local documents; fflate for ZIP backups; Zod for bank validation.
- **Node.js 24 LTS** built-in `node:sqlite`, SQL migrations and a JSON content seed. There is no Prisma or external database.
- npm lockfile; Vitest unit tests, Playwright browser tests and ESLint correctness checks.

Exact versions are recorded in `package-lock.json`. Webpack is selected explicitly for development and production builds because the local Windows Turbopack build was unreliable.

## 4. Prerequisites

Install [Node.js 24 LTS with npm](https://nodejs.org/en/download) and [Git](https://git-scm.com/downloads), plus a current browser. Reopen your terminal after installing. Check:

```powershell
node --version
npm --version
git --version
```

Node must report `v24.x`. Other major versions are outside this project's supported range. Internet access is needed for cloning and installing npm dependencies; normal study use then works offline. Python, Docker, PostgreSQL and Prisma are not required.

## 5. Installation on a New Device

Open Windows PowerShell in the folder where you want the project:

```powershell
git clone https://github.com/Abdul-Rahman-bme/BM3122-Medical-Imaging.git
cd BM3122-Medical-Imaging
npm ci
npm run db:init
npm run dev
```

Open **http://localhost:3000**. Leave the terminal running; press Ctrl+C to stop. If PowerShell blocks `npm.ps1`, use `npm.cmd` in each command instead. `npm ci` uses the committed lockfile and automatically prepares the local PDF.js worker, character maps and fonts.

Alternatively, after cloning, use the startup helper:

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

It checks Node 24, installs with `npm ci` if dependencies are absent, prepares assets, initializes the database safely and starts the app. `-Install` reinstalls dependencies; `-Port 3001` changes the port. The process-scoped execution policy does not permanently change your computer policy.

No environment file is needed. `.env.example` lists optional settings; copy it to `.env.local` if required. The Next wrapper reads this file. For CLI/database scripts, set optional environment variables in the terminal so they use the same values.

## 6. Running on macOS or Linux

Install Node 24 and Git using their official installers or your package manager, then:

```sh
git clone https://github.com/Abdul-Rahman-bme/BM3122-Medical-Imaging.git
cd BM3122-Medical-Imaging
npm ci
npm run db:init
npm run dev
```

Or run `sh ./start.sh`; use `sh ./start.sh --production` for a production build and server. No executable permission change is required when invoking `sh`. Always install dependencies on the target operating system; do not copy `node_modules` from Windows. Native platform packages are selected by npm. Automated browser tests use Edge by default on Windows and Playwright Chromium elsewhere; see validation below. macOS/Linux execution is documented but must be verified on those systems separately.

## 7. Running in Production Mode Locally

From the project root, after installation:

```powershell
npm run db:init
npm run build
npm run start
```

Open http://localhost:3000. Build once after each source update; `start` serves the compiled app. The Windows helper also supports `powershell -ExecutionPolicy Bypass -File .\start.ps1 -Production`. For a busy port use `npm run start -- --port 3001` or `npm run dev -- --port 3001`. Production here means a local optimized server, not a public hosted deployment.

## 8. Database Setup

The first `npm run db:init` applies `lib/db/migrations/001_initial.sql` and creates `data/study.db`. SQLite WAL/SHM sidecars can appear alongside it. An empty database is automatically seeded from `data/content.json`: 96 model parts across 4 papers. Repeating initialization preserves notes, progress and sessions.

To explicitly re-import the reviewed public seed, run `npm run db:init -- --seed`. This upserts stable question IDs and preserves progress/session snapshots, but replaces edited content for those IDs. Back up first if you have edited questions. Future schema migrations must be added to the application's migration runner before use; there is no Prisma command.

**Backup:** Settings → download complete backup ZIP. It contains the content bank, preferences, progress, attempts, examination sessions and local assets/drawings. Keep it private and outside this checkout. JSON export contains content only, not your progress.

**Restore:** Settings → restore backup ZIP on the target installation. This replaces that installation's stored content and study state. Back up the destination first; the UI asks for confirmation. Imports and restore validate input, but use only trusted backups.

**Safe fresh start:** download a backup, stop the server, and rename the entire `data` folder to a private location outside the checkout. Restore `data/content.json` and the bundled `data/assets` from Git (or another clean clone), then run `npm run db:init`. Never delete an active SQLite database or only one WAL sidecar. This creates a fresh profile; the old folder remains recoverable. Browser drafts also use local storage; use a fresh browser profile if you need a fully fresh workspace.

Optional `BM3122_DATA_DIR` selects a writable runtime folder for the database/assets/uploads. Set it in the terminal for **both** initialization and server commands. Copy the bundled `data/assets` to that folder's `assets` subfolder; seed JSON still comes from the repository. Default `data` is simplest.

## 9. Using the Website on Another Device

### Scenario A — Install on a second computer

Follow section 5 or 6. Each computer gets a separate SQLite database and a fresh model bank. To transfer your study history, export a complete backup on the first computer and restore it on the second. Separate installations **do not synchronize automatically**; a restore replaces, rather than merges, progress.

### Scenario B — Access the host computer over the same Wi-Fi

The default server binds to `127.0.0.1`. To share on a **trusted private network**, opt in on the host in PowerShell:

```powershell
$env:BM3122_HOST = '0.0.0.0'
$env:BM3122_ALLOW_LAN = 'true'
npm run build
npm run start
```

Or use `.\start.ps1 -Production -Lan` via the PowerShell invocation in section 5. On macOS/Linux:

```sh
BM3122_HOST=0.0.0.0 BM3122_ALLOW_LAN=true npm run start
```

Run `ipconfig` on Windows (or inspect network settings elsewhere) and find the host's private IPv4 address. On your phone or other computer, open, for example, **http://192.168.1.100:3000**. Your actual address will differ. Keep the host awake and server running. Supported mutation origins are the exact host private IPv4 address and port (10.x, 192.168.x or 172.16–31.x), with explicit LAN opt-in. Loopback aliases remain supported.

If Windows Firewall prompts, allow Node.js only on **Private networks**. If blocked, allow inbound TCP on the selected port for the private network only using Windows Firewall settings; do not disable the firewall. Guest Wi-Fi client isolation can prevent access. Prefer production mode for LAN; the same binding variables also work with `npm run dev` for local development.

There is no authentication or separate profile per visitor: everyone with access can read and change the **same host study data**, including imports/restores. Use only devices and people you trust. Do not forward the router port or expose this server to the internet. Stop the server and remove the environment variables to return to local-only access:

```powershell
Remove-Item Env:BM3122_HOST, Env:BM3122_ALLOW_LAN -ErrorAction SilentlyContinue
npm run start
```

Also remove LAN values from `.env.local` if you put them there.

## 10. Available Website Pages

| Route | Purpose |
| --- | --- |
| `/` | Dashboard, preparation overview and recent activity |
| `/questions` | Filterable question bank |
| `/questions/[id]` | Individual answer workspace, references and solution |
| `/practice` | Practice studio and flash revision |
| `/practice/session/[id]` | Saved practice session |
| `/papers` | Model and locally imported original papers |
| `/exam/[id]` | Paper instructions |
| `/exam/session/[id]` | Timed examination |
| `/results/[id]` | Submitted answers and self-assessment |
| `/analytics` | Reviewed performance and topic coverage |
| `/revision` | Due reviews and weak-topic revision |
| `/bookmarks` | Saved questions |
| `/resources` | Available local PDFs and missing-resource instructions |
| `/settings` | Preferences, bank import/export, backup and restore |

## 11. Question Bank and Source Materials

The application seed ships four independently authored educational model papers (24, 26, 22 and 24 parts), each 100 marks. It includes ten numerical final-value checks, fourteen authored diagram PNGs and seven model/solution/revision PDF assets. Generated practice is labelled `generated-practice`; original examinations must use `past-paper` provenance. Proposed solutions and priorities are study aids, not official answer keys or probabilities.

The repository already contained course files under `Lecture Slides/`, `Past papers/`, `Assignments/` and `Outputs/`, plus the root syllabus PDF. They are preserved unchanged from existing repository history. **Their presence does not establish redistribution permission.** This website publication does not add copies of lecture/original examination PDFs, cropped original figures or the private past-paper question dataset to its app seed. The app does not automatically read those legacy folders.

To enable lecture links, supply your authorized PDF locally in `data/assets` using the exact filename shown by the resource card. Typical IDs are `s1`, `s2`, `s3`, `s4`, `s05`, `s06`, `syllabus`, `a1` and `a2`; filenames are recorded in `data/content.json`. Reload the page after copying. Missing files produce a local-supply message. Do not commit restricted files.

To add questions, export the current bank from Settings as a template. Edit a private copy outside the checkout and import the JSON in Settings. `lib/content/schema.ts` defines the format: `version: 1`, `questions`, `papers`, `documents`; unique stable IDs, valid topics/types, safe relative document filenames, existing paper/document references, marks totaling each paper and rubrics totaling each question's marks. Store LaTeX as JSON-escaped strings, for example `\\gamma`. Use `solution: null` and a review note when no verified past-paper answer is available; do not invent one. New document metadata requires a local PDF in the runtime `assets` folder. Reference pages are one-based.

For a complete locally prepared bank plus its assets, stop the server and run:

```powershell
npx tsx scripts/import-local.ts "../private-study/bank.json" "../private-study/assets"
```

This validates the bank, copies referenced safe asset filenames and upserts content without clearing progress. Existing question IDs are updated; use distinct IDs for new questions. The asset argument is optional. To transfer the previous full private study installation, its **Settings backup ZIP** is the preferred method, preserving all historical content and progress. Imports do not extract questions from PDF automatically. The optional `scripts/preprocess_pdf.py` review helper requires a separate Python installation with `pypdf` and optionally `pypdfium2`; it is not needed to run the website and does not import questions.

Keep private banks and backups outside Git. `.gitignore` excludes personal databases, uploads, runtime folders and unapproved app PDF assets; always inspect `git status` before committing new materials.

## 12. Troubleshooting

| Problem | Resolution |
| --- | --- |
| `node`/`npm` not found | Install Node 24 LTS with npm, then reopen the terminal. |
| Wrong Node version / SQLite unavailable | Use Node 24.x; verify `node --version`. Built-in SQLite may print an experimental warning on this runtime. |
| PowerShell blocks npm script | Use `npm.cmd ci` / `npm.cmd run dev`. |
| npm installation or native dependency failure | Check internet/proxy/disk space, use Node 24 and rerun `npm ci` on this computer. Do not copy another OS's dependencies or delete the lockfile to work around an error. |
| Missing packages/PDF worker | Run `npm ci`, then `npm run assets`. |
| Port 3000 busy | Stop the other server or pass `-- --port 3001`; open the matching URL. |
| SQLite locked/read-only | Stop duplicate servers, ensure the data folder is writable and outside cloud-sync conflicts. Back up before repairing; preserve the DB and its sidecars together. |
| Missing environment variables | None are required. Remove accidental overrides and use default settings. Custom data folders need their own assets. |
| No questions | Run `npm run db:init`; check the server's validation error. A fresh install should have 96 parts. Past papers require an authorized local import. |
| Build error | Confirm Node 24, run `npm ci`, `npm run typecheck` and `npm run build`. After stopping all servers, stale `.next` can be removed and rebuilt; never remove `data` as a build fix. |
| Missing PDF | Supply the filename shown on the resource card in `data/assets`; rerun `npm run assets` for PDF.js worker/font problems. Check page number and browser console. |
| LAN cannot save | Set both LAN variables, restart, use the host private IPv4 and matching port; see section 9. |
| Git authentication | Sign in through your Git credential manager or GitHub CLI if installed; use an account with repository write access. Never place tokens in source or a remote URL. |

Validation commands:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run db:init
npm run test:e2e
```

Browser tests run against an isolated temporary SQLite folder, not your study database. Windows uses installed Microsoft Edge by default. To use Playwright Chromium on Windows: `npx playwright install chromium`, then `$env:PLAYWRIGHT_CHANNEL='chromium'` before the test command. On macOS/Linux run `npx playwright install chromium` (Linux CI may need `npx playwright install --with-deps chromium`). Browser tests rebuild production first. See `TEST_REPORT.md` for actually executed checks and platform limits.

## 13. Project Structure

```text
BM3122-Medical-Imaging/
├── app/                         # App Router pages, layout, styles and local API
├── components/                  # Dashboard, study workflows, PDF/math/UI components
├── lib/
│   ├── content/schema.ts        # Validated import format and shared types
│   ├── db/migrations/001_initial.sql
│   ├── db/index.ts              # SQLite persistence and safe initial seed
│   ├── exams/                   # Saved sessions, deadlines and result logic
│   └── grading/                 # Units and numerical feedback
├── data/
│   ├── content.json             # Public model bank (no personal study state)
│   └── assets/                  # Authored model PDFs and diagrams
├── public/                      # PDF.js assets generated by postinstall (ignored)
├── scripts/                     # Init, local import, PDF assets, Next/test launchers
├── tests/                       # Vitest unit tests and Playwright workflows
├── Assignments/                 # Existing repository course materials, unchanged
├── Lecture Slides/              # Existing repository course materials, unchanged
├── Past papers/                 # Existing repository course materials, unchanged
├── Outputs/                     # Existing repository study outputs, unchanged
├── .env.example                 # Optional safe environment defaults
├── .gitignore
├── package.json / package-lock.json
├── start.ps1 / start.sh
├── TEST_REPORT.md
└── README.md
```

`data/study.db`, WAL files, drawings, `.next`, dependencies and test reports are local ignored artifacts. There is no Prisma directory or hosted backend.

## 14. Updating the Website

Export a complete backup first, then stop the running server. Preserve your local resources and keep any code edits on your own branch. From the repository root:

```powershell
git pull --ff-only
npm ci
npm run db:init
npm run build
npm run start
```

Initialization applies the current schema safely but does not overwrite an already populated question bank. To adopt changes to existing seeded question IDs, back up edited content then run `npm run db:init -- --seed`. Never reset/delete your database merely to obtain a source update. If Git reports local changes, review and commit/stash them deliberately; do not force-reset them.

## 15. License and Attribution

This is an independent BM3122 study project in the Abdul-Rahman-bme repository. Course names and institutional references identify the studied curriculum; they do not imply endorsement. Model questions, proposed solutions and supporting diagrams were independently prepared with AI assistance and require academic review.

No software redistribution license has been declared here; do not infer an MIT or other open-source grant. Existing lecture slides, examinations, assignments and other third-party resources remain subject to their respective owners' rights and permissions. Obtain permission before redistributing them. npm dependencies retain their own licenses and attribution requirements, recorded in their packages.

## 16. Disclaimer

The model papers are educational practice resources, **not official examination predictions, future examination papers, University of Moratuwa publications or official marking schemes**. Historical patterns do not guarantee future topics. Check assumptions, calculations and proposed solutions against authorized course materials. Progress statistics reflect your own recorded and self-assessed work.
