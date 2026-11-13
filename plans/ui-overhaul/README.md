# Odyssey UI overhaul review package

Status: proposed direction, awaiting review. Application source is unchanged.

Open the self-contained review at **http://localhost:15174/**. It includes the
four generated concepts, expandable baseline captures, the full plan, and a
browser-local preference form. Saving the form does not authorize implementation
or send messages. Download choices or discuss them with the agent when ready.

## Files

- `plan.mdx`: canonical detailed plan, file map, criteria and review questions.
- `canvas.mdx`: structured before/proposed artboard review for Agent-Native Plans.
- `index.html`: static local review export, including all plan prose and questions.
- `assets/`: optimized WebP previews with prompt provenance sidecars.
- `originals/`: full-resolution built-in imagegen PNGs with embedded prompts.
- `prompts/`: exact generation prompts and the mobile correction prompt.
- `assets-manifest.json`: artifact paths, generation mode and original hashes.
- `audit/`: current app captures, made at desktop 1440x1000 and phone 390x844.
- `review-data.json`: structured file map, acceptance checks and questions used
  in the static export. The canonical plan remains `plan.mdx`.
- `notes/design-exploration.md`: unapproved direction exploration and rationale.

## Restart the local review

From the repository root:

```bash
python -m http.server 15174 --bind 127.0.0.1 --directory plans/ui-overhaul
```

The separate application is still at `http://localhost:15173`.

## Structured Plan viewer

```bash
npx --yes @agent-native/core@latest plan local check --dir plans/ui-overhaul
npx --yes @agent-native/core@latest plan local serve --dir plans/ui-overhaul --kind plan --port 15175 --open
```

The command prints the viewer URL and writes `.plan-url`, which is intentionally
ignored. This viewer uses a local bridge; Chrome/Edge may request Local Network
permission. Plan content is not published to a hosted database. The static review
works without this viewer and without a network connection once served locally.

`plan local verify` checked the bridge/preflight and offline lint. Its remote
renderer validation was intentionally skipped by the CLI to keep source local.
The hosted viewer reached its connection screen, but automation was blocked by
the browser's Local Network permission. The standalone static review was inspected
at desktop and mobile sizes and its preference-save/restore behavior was checked.
No claim of a full structured-renderer schema validation is made.

## Image provenance and limits

All concepts used the built-in imagegen tool, not the CLI/API fallback. Original
generation prompts are saved alongside the artifacts. `checkin-mobile-concept`
also used an edit to correct swipe arrows, simplify the date and improve Done
button contrast; its original reference image is preserved.

WebP previews were converted with ffmpeg at quality 86. These are planning images,
not production assets or accessible controls. Exact product names, dates and
control semantics follow the plan. Known generated-text discrepancies are listed
in the plan. A new laurel logo has not been approved.

No images were uploaded to a third-party host or placed in application routes.

## Review sequence

1. Compare the dark Tasks proposal with the lighter Aegean alternative.
2. Inspect the phone check-in and scroll editor at full size.
3. Read the storage, swipe and accessibility sections.
4. Answer Batch 2 (world/imagery/build workflow), then Batch 3 (swipe/device/storage).
5. Approve or revise the overall proposal before application implementation.
