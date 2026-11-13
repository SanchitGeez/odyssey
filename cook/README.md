# Odyssey UI implementation

The application runs at http://localhost:15173/ with the existing local API at
http://localhost:18000/. This directory contains the implementation brief,
original art, exact image prompts, and verification evidence.

## Run and check

```bash
docker compose up --build -d
npm --prefix client run build
npm --prefix client run lint
npm --prefix client test
docker compose exec -T server pytest -q
```

When dependencies change in an existing Docker client volume, run
`docker compose exec -T client npm ci` followed by `docker compose restart client`.
The PostgreSQL volume is retained. The pre-existing Compose port changes were
preserved.

## Implemented UI

- Dark olive/charcoal and gold, self-hosted Cinzel/Manrope/Literata, original
  temple, bronze, voyage, sunset, and full-height sidebar imagery.
- Compact desktop navigation, five mobile destinations, reachable account menu,
  visible focus and button alternatives, labeled controls and 16px mobile inputs.
- Image-free task cards with 24px separation from filters, actual schedule labels,
  history, and protected deletion.
- Six original vector dimension emblems shared by filters, tags, check-in,
  guide, onboarding, and accessible category dropdowns.
- Swipe check-ins with release threshold, short/cancel recovery, duplicate-submit
  protection, request failure/retry, and visible Done/Skip buttons. A measurement
  stays pending until Done or Skip, matching the API.
- Quest details open only after selecting a specific quest in a right-side panel.
  The entire card selects it; Edit and Delete remain separate controls.
- Shared olive/gold dropdowns replace native Type, Status, schedule, deadline,
  category and journal text-style selectors, with keyboard selection and focus
  restoration.
- Insights retains real activity metrics and a hexagonal current-library dimension
  chart; counts are active tasks plus active quests, not health scores.
- Rich-text scroll journal: headings, bold/italic, lists, checklists, quotes, safe
  links, undo/redo, autosave, focus mode, save feedback, and navigation protection.
  The scroll contains only date, title and prose. A fixed topbar keeps formatting
  collapsed until requested; dimensions, tags, word count and saved time live in
  Entry details. Writer and reader share the same paper width and typography.

## Journal compatibility and sessions

Rich text is encoded as `odyssey-richtext-v1\n` plus JSON in the existing content
string. Existing plain text stays literal; unsupported versions or malformed
content remain read-only. The app filters decoded content/title/tags locally.
The backend's raw text-search API remains unchanged.

Writes are serialized and failed saves retain the editor. Browser Back and app
navigation offer Save/Discard/Stay. No persistent browser draft is stored, so
crash recovery is not guaranteed.

A PostgreSQL aware/naive expiry comparison was fixed in the existing session
refresh handler. The frontend keeps API identity stable during token rotation and
retains an editor through temporary refresh failures. A real PostgreSQL refresh
regression verified newest writing, focus, caret, and persisted content survived.
No authentication schema or business-rule change was introduced.

## Evidence and limits

`stills/r02/` is the reviewed desktop/mobile set; initial captures are under r01.
The initial r01 Tasks captures accidentally contained login and are superseded by
strictly authenticated r02 captures. Later requested feature captures are recorded
in `ROUNDS.md`. The journal and quest examples are temporary review fixtures in the
smoke account and are removed before handoff.

`axe-*.json` contains the latest automated checks. Earlier findings are retained in
`earlier-checks/`. Zero automated findings does not certify full WCAG compliance;
manual representative text contrast checks were also performed. Actual iPhone
Safari focus zoom, real-device touch, and complete screen-reader coverage remain
unverified.

`lighthouse-login.json` is one local production-login mobile lab run: performance
89, accessibility 100, best practices 100, CLS 0, simulated LCP 3.6s. It is not a
field performance claim. `motion-review.webm` is a short browser interaction
recording, not an FPS benchmark.

Lint passes with two existing auth hook dependency warnings. Production dependency
audit reports no vulnerabilities; inherited development-only ESLint/minimatch
advisories were not force-upgraded.

## Art and licenses

`assets-manifest.json` lists every shipping WebP, SHA256, generation method, and
prompt sidecar. Exact prompts are in `prompts/`; originals are preserved here.
All new raster artwork used the built-in image-generation tool, including the
reference-guided tall sidebar extension. Optimized assets live in
`client/public/art/`; the WebP format keeps provenance in adjacent JSON sidecars.
No generated UI screenshot was sliced into the application.

Cinzel, Manrope and Literata are self-hosted through Fontsource (SIL Open Font
License; license files ship in the packages). Phosphor icons, Radix primitives,
Motion, and Tiptap use their upstream open-source licenses. The six dimension
emblems are original application vector marks in `dimension-mark.tsx`.
