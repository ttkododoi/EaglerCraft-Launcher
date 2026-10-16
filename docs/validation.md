# Validation record — 2026-10-16

- `npm test`: 16 tests pass, covering the catalog, all 14 exact destinations,
  WASM-only rules, invalid inputs, settings bounds, persistence and recovery.
- `node --check`: app, catalog, state, preview and optional bridge pass.
- Local Chromium/Playwright smoke run: no page errors; confirmed zero iframes;
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
