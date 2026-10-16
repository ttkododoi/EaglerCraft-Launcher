# GX source inspection

Inspected 2026-10-16 through GitHub's API because direct access to
`https://gx-launcher.github.io/` is blocked in the development environment.
This is a source inspection, not a live browser scrape or a runtime availability test.

Repository: https://github.com/gx-launcher/gx-launcher.github.io

Inspected revision: `d5c0a22e63ffbe83afbab73a7a2e1b9b263852b2`

- [index.html](https://github.com/gx-launcher/gx-launcher.github.io/blob/d5c0a22e63ffbe83afbab73a7a2e1b9b263852b2/index.html):
  title bar, Player profile sidebar, navigation, top breadcrumb bar, large hero
  image, bottom version dropdown and launch controls. The dropdown lists all
  requested releases and distinguishes WASM via the `-wasm` folder suffix.
- [styles.css](https://github.com/gx-launcher/gx-launcher.github.io/blob/d5c0a22e63ffbe83afbab73a7a2e1b9b263852b2/styles.css):
  charcoal surfaces, red accent, compact technical typography; 36px title bar,
  185px sidebar, flex main panel, bottom-anchored launch strip.
- [script.js](https://github.com/gx-launcher/gx-launcher.github.io/blob/d5c0a22e63ffbe83afbab73a7a2e1b9b263852b2/script.js):
  inspected for game URL construction. This project deliberately uses the
  requested GX domain directly, not its fallback mirror behavior.
- The recursive Git tree confirms `index.html` entries in all 14 paths below.
  Existence in Git does **not** prove that a hosted game loads successfully.

## Verified repository entry points

All URLs use HTTPS, under `https://gx-launcher.github.io/game/`:

| Version | JavaScript folder | WASM folder |
| --- | --- | --- |
| 1.5.2 | `1.5.2/index.html` | `1.5.2-wasm/index.html` |
| 1.8.8 | `1.8.8/index.html` | `1.8.8-wasm/index.html` |
| 1.12.2 | `1.12.2/index.html` | `1.12.2-wasm/index.html` |
| 1.13.2 | `1.13.2/index.html` | `1.13.2-wasm/index.html` |
| 1.14.4 | `1.14.4/index.html` | `1.14.4-wasm/index.html` |
| 1.16.5 | `1.16.5/index.html` | `1.16.5-wasm/index.html` |
| 26.2 | Not offered | `26.2-wasm/index.html` |
| 26.3 | Not offered | `26.3-wasm/index.html` |

## Implementation boundaries

The new layout is independently written, informed by that structure; no GX
stylesheet, JavaScript, logos, game files, or background art are redistributed.
`assets/world.svg` is original procedural vector artwork authored for this repo.
Remote game pages are now embedded in a cross-origin iframe at the user's
request. No game HTML is downloaded for redistribution, rehosted, or injected.
An ordinary `target="_blank" rel="noopener noreferrer"` link is also available
as a fallback. Closing the embedded player destroys its browsing context.
Remote uptime, game correctness, and browser compatibility are not guaranteed.
