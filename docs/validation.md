# Validation record — 2026-10-16

- `npm test`: 16 tests pass, covering the catalog, all 14 exact destinations,
  WASM-only rules, invalid inputs, settings bounds, persistence and recovery.
- `node --check`: app, catalog, state, preview and optional bridge pass.
- Local Chromium/Playwright smoke run: no page errors; original direct-link implementation had zero iframes;
  JS/WASM launch URL switching; disabled JS for 26.3; selection survives reload;
  library has eight entries; search narrows to one; choosing its JS build updates
  the launch URL; preview opens, Right Shift menu toggles and ESP state changes.
- No horizontal overflow at viewport widths 1440, 1024, 768, 390 or 320 pixels.
- Desktop (1440px) and mobile (390px) screenshots visually reviewed.
- Remote GX games were not loaded: live GX domain access is unavailable in this
  development environment. Entry-point existence was checked through GitHub's
  recursive tree at the revision recorded in gx-reference.md. This is not a
  promise of remote uptime or game compatibility.

Browser tooling was installed in a separate scratch directory, not added as a
runtime dependency or committed artifact. The static application has no external
runtime dependencies. Screenshots and downloaded reference source are not shipped.

## Embedded-player follow-up

- `npm test`: all 19 tests pass, including new iframe lifecycle tests.

- Local Chromium with mocked GX responses: all 14 selected destinations load
  into the iframe; external fallback matches the iframe URL; reload retains
  exactly one frame; close and Escape remove the browsing context; hero launch
  works; fullscreen permission is present; no player overflow at 320px; local
  preview and Right Shift menu still work. No JavaScript page errors.
- Remote responses were deliberately mocked: this validates launcher behavior,
  not live GX gameplay, framing headers, or WASM compatibility.
- Cross-origin load events are treated only as page-load notifications, never
  as proof that the game booted successfully. A 20-second hint offers a new-tab
  fallback when loading takes longer. The fallback remains visible throughout.
