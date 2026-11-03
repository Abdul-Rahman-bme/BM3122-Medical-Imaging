# Verification record

Executed on Windows, 4 November 2026 (Asia/Colombo), using Node.js 24.13.1, npm 11.8.0 and Microsoft Edge. Checks ran in the new publishing checkout, with isolated temporary databases for automated tests. The original private study installation was preserved separately.

| Check | Actual result |
| --- | --- |
| `npm ci --no-audit --no-fund --maxsockets=4` | Passed; lockfile installation and PDF.js postinstall assets |
| `npm run typecheck` | Passed; strict TypeScript |
| `npm run lint` | Passed; ESLint parser/correctness rules |
| `npm test` | Passed; 5 files, 20 tests |
| `npm run db:init` | Passed; fresh SQLite with 4 papers and 96 parts |
| `npm run db:init -- --seed` | Passed; 0 inserted, 96 updated; progress retained |
| `npm run test:e2e` | Passed; production Webpack build followed by 7 browser tests |
| `npm run start -- --port 3101` | Passed; HTTP 200 dashboard and API state with 4 papers / 96 parts |
| Windows startup helper syntax | Passed; PowerShell parser, no syntax errors |
| Git publication review | Existing tracked course files unchanged; new source/assets reviewed; ignored DB/env/upload/cache paths checked |

## Unit coverage

- Model-bank schema, stable IDs, source provenance, reconciled paper/rubric marks and safe document paths.
- Numerical parsing, supported unit conversion, tolerance and explicit absence of method grading.
- Spaced repetition intervals.
- Idempotent imports retaining progress and persistent session snapshots.
- Hidden exam feedback, saved answers, expiry submission using the original deadline, idempotent submit and locked mutation.
- Invalidating self-assessment after a practice answer changes.
- Loopback origin aliases, remote-origin rejection and explicit exact-private-IPv4 LAN opt-in.
- PDF byte ranges and ZIP backup restoration of content, notes, preferences and assets.

## Browser coverage

All 7 workflows passed against a fresh temporary study folder:

1. Import counts, topic/search filters, original question grouping and desktop/mobile dashboard layout.
2. Text drafts, KaTeX preview, rubric self-assessment, notes, bookmarks, due dates and reload persistence.
3. Equivalent activity units, numerical feedback and step-by-step solution reveal without automatic working marks.
4. Pointer strokes persisted as a local PNG asset.
5. Timed examination feedback suppression, saved answer/flag resume, confirmed submission, provisional result and locked mutation.
6. Missing lecture PDF instructions, bundled PDF.js rendering, ranged assets, invalid-import rejection, JSON export and full ZIP restore.
7. All main navigation pages, dark theme and core assets with external network requests blocked.

The first browser runs exposed ambiguous save-message locators, an incorrect bookmark-title assumption and a backup test dependent on another test. Tests now wait for the session's actual saved status, identify bookmarks by question link and prepare their own backup state. The final complete build-and-browser command exited successfully with 7 passed.

## Scope and limitations

- The public application seed has 96 independently authored model parts across four 100-mark papers. It does not include the private historical question bank or private study progress. Authorized banks/resources can be imported locally; all historical-practice features remain implemented.
- Generated proposed solutions and model priorities still need academic review; software checks do not establish medical or educational correctness.
- Browser screenshots and traces are local ignored test artifacts, not committed personal data.
- macOS/Linux runtime execution, a physical Wi-Fi client and public hosting were not tested. LAN mutation policy has unit coverage. Unix setup is documented separately.
- Runtime output includes Node's experimental SQLite notice and non-failing Vite/color warnings. The locked ESLint 9 development tool also emits an upstream deprecation notice during installation; lint succeeds. No dependency security audit was claimed.
- No GitHub Actions workflow is included; local tests are the verification evidence, not a claimed CI pass.
