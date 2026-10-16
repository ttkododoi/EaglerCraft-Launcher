# Obsidian / Eaglercraft launch hub

A dependency-free static launcher with a GX-informed layout, **8 versions / 14
builds**, embedded GX-hosted games, persistent settings, and an original local
2D module preview. No game binaries, backend, or remote fonts are bundled.

## Run

```sh
python3 -m http.server 3000 --bind 0.0.0.0
# or: npm start
```

Open `http://localhost:3000` locally, or the provided live-preview URL. No package
installation is needed. Python 3 serves the site; Node 18+ runs the tests.

## Launch a game

1. Select **Game** in the sidebar.
2. Choose a release from the bottom **Game version** dropdown.
3. Choose **JavaScript** or **WebAssembly**. JS is disabled for 26.2 and 26.3.
4. Click **Launch game** or **Play now**. Both open the selected build
   from `https://gx-launcher.github.io` in an iframe inside the launcher.
   Use the player toolbar to reload, enter fullscreen, close, or open a new tab.
5. Alternatively, search the **Versions** library and choose a runtime there.
   This selects the build and returns to Game for launch.

| Versions | JavaScript | WebAssembly |
| --- | --- | --- |
| 1.5.2, 1.8.8, 1.12.2, 1.13.2, 1.14.4, 1.16.5 | Yes | Yes |
| 26.2, 26.3 | No | Yes |

URLs follow `/game/VERSION/index.html` for JS and
`/game/VERSION-wasm/index.html` for WASM. The catalog is explicit and allowlisted;
unknown versions/runtimes cannot construct launch URLs. Selection and runtime
persist in localStorage, along with preview preferences. Invalid/old settings
are normalized; blocked storage falls back to session-only state.

These are third-party hosted games. Their availability, networking, storage,
and browser support are controlled by GX, not this launcher. Wasm support alone
is not sufficient for all builds; some require newer features or appropriate
host headers. Try JS where offered if WASM fails. The launcher does not make
unreliable cross-origin fetch probes or claim a game is online just because its
file exists in Git. The new-tab fallback links use `noopener noreferrer`. If framing is blocked by
the remote host or a WASM build needs a top-level context, use that fallback.
The iframe allows fullscreen, autoplay and gamepad; it is intentionally not
sandboxed to preserve game compatibility. Normal cross-origin DOM restrictions
still apply. Closing the player destroys the iframe and stops its game.

## Layout reference

The GX live domain is inaccessible from this coding environment. Its public
GitHub source was inspected instead: title bar, player sidebar, hero art panel,
version selector, launch strip, release folders, and URL conventions. All 14
entry points exist in its inspected Git tree. See
[docs/gx-reference.md](docs/gx-reference.md) for revision-pinned links and notes.

This implementation uses independently authored HTML/CSS/JS and original SVG
landscape art, with a charcoal/red palette, responsive sidebar, version library,
and accessible native version dropdown. GX code/art and game binaries are not
copied into this repository. This is not an official GX client.

## Preview modules

Choose **Preview modules → Open feature preview**. Click the world to focus it.

- WASD / arrows move, Space jumps, Right Shift opens/closes the module menu.
- ESP displays boxes, names, and distances, including occluded test players.
- X-Ray hides ordinary terrain and exposes cyan ore tiles.
- Bunnyhop repeats jumps while holding Space; otherwise each press jumps once.
- Fullbright removes the darkness overlay.
- Auto sprint accelerates forward movement; toggle sprint accelerates movement
  without a held sprint key. Both respect collision in the toy world.
- FPS and coordinates toggle independently. Graphics/controls settings apply
  only to this local preview. Escape or the close button closes it.

**This is an original 2D toy world, not Minecraft or an actual modded Eaglercraft
build.** Remote GX games are cross-origin: these toggles cannot access their
entities, renderers, input loops, or storage. No preferences are sent to GX and
there is no claim that modules are injected into the remote game.

Use enhancements only in single-player or on servers explicitly permitting them.

## Real modded-client integration

`js/client-bridge.js` remains an optional source-integration utility; it is not
used by the cross-origin iframe player. A future same-origin parent host can pair
it with a source-built client under your control. It cannot attach to GX frames or tabs.
The bridge validates same origin/source, sends `obsidian:v1` ready/menu messages,
accepts configure messages, and returns a cleanup function. Register once after
your actual engine hooks exist. It expects an adapter with `supportedModules`
and `applySettings(settings)`; there is no stock Eaglercraft API of that name.

To implement actual client features, patch and compile your specific client:

| Module | Required engine integration |
| --- | --- |
| ESP | Camera-relative entity render pass, position interpolation, boxes and billboard labels; restore all depth/render state afterward. |
| X-Ray | Chunk mesh visibility/ore allowlist and forced ore faces; invalidate/rebuild chunks both on enable and disable. |
| Bunnyhop | Local player tick: normal jump when Space is held and grounded, respecting water, ladders, flying and menus. |
| Fullbright | Lightmap/gamma override with original settings restored on disable/unload; do not edit world lighting. |
| Sprint modes | Normal movement eligibility logic; combine requests as logical OR without bypassing server validation. |
| FPS / coordinates | Real game renderer frame timing and local player position in the actual HUD. |

Real Java patches require the exact target source and toolchain. Do not depend
on fragile minified symbols. Do not advertise unsupported modules or attempt to
bypass anti-cheat, server-side anti-X-Ray, or browser origin restrictions.

## File structure

```text
index.html                 Launcher shell, game/library/settings/help, preview dialog
assets/style.css           Responsive charcoal/red UI
assets/world.svg           Original block landscape artwork
js/app.js                  Navigation, catalog selection, embedded launch, preview
js/catalog.js              Eight allowlisted versions and 14 HTTPS launch URLs
js/game-player.js          Iframe lifecycle, loading hint, reload and fullscreen
js/state.js                Validated preferences and module definitions
js/preview.js              Original 2D demo engine and eight module implementations
js/client-bridge.js        Optional client-source integration utility (not active)
docs/gx-reference.md       Source inspection and confirmed entry-point notes
tests/state.test.js        Settings validation/persistence tests
tests/game-player.test.js  Iframe lifecycle and URL validation tests
tests/catalog.test.js      Version/runtime/URL regression tests
clients/README.md          Legacy local-build note (unused by this launcher)
package.json               Dependency-free start/test commands
```

## Test & deploy

```sh
npm test
node --check js/app.js
node --check js/catalog.js
node --check js/preview.js
```

Test coverage includes all 14 exact URLs, WASM-only releases, invalid input,
settings migration, bounds, corrupt/blocked storage and independent defaults.
Browser UI tests, when available, cover selection, runtime switching, library
search, persistence, iframe lifecycle, responsive overflow, and preview interactions.
Remote games require real-browser testing on the user's network and are not
validated by local unit tests.

Deploy this directory to any static HTTP(S) host, including GitHub Pages.
Application assets are relative and work at project subpaths. External game URLs
are absolute HTTPS. No service worker or build step is needed. No game downloads
need to be checked into Git. The optional legacy `clients/` locations stay ignored.
Not affiliated with GX Launcher, Mojang, or Microsoft.
