import {gameUrl} from './catalog.js';

/** Owns the cross-origin frame lifecycle; never reads the remote DOM. */
export function createGamePlayer(doc, notify = () => {}) {
  const dialog = doc.querySelector('#remote-dialog');
  const stage = doc.querySelector('#remote-stage');
  const status = doc.querySelector('#remote-status');
  const fullscreen = doc.querySelector('#remote-fullscreen');
  let active = null;
  let frame = null;
  let timer;

  function clearFrame() {
    clearTimeout(timer);
    if (frame) {
      frame.onload = null;
      frame.remove(); // Destroy the browsing context and stop the running game.
      frame = null;
    }
  }

  function load() {
    clearFrame();
    status.textContent = 'Loading hosted page…';
    frame = doc.createElement('iframe');
    frame.title = `Eaglercraft ${active.version} ${active.runtime.toUpperCase()}`;
    frame.allow = 'fullscreen; autoplay; gamepad';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'no-referrer';
    // No sandbox: game runtimes need normal browser APIs. The different origin
    // still isolates their DOM from the launcher; install no injection scripts.
    frame.src = active.url;
    frame.onload = () => {
      // A cross-origin load event is NOT proof of a successful game boot.
      clearTimeout(timer);
      status.textContent = 'Hosted page loaded · game starts inside the player';
    };
    timer = setTimeout(() => {
      status.textContent = 'Still loading? Try opening the game in a new tab.';
    }, 20000);
    stage.append(frame);
  }

  function open(version, runtime) {
    const url = gameUrl(version, runtime); // Validate against the explicit catalog.
    active = {version, runtime, url};
    doc.querySelector('#remote-title').textContent = `Eaglercraft ${version} / ${runtime.toUpperCase()}`;
    doc.querySelector('#remote-external').href = url;
    if (!dialog.open) dialog.showModal();
    load();
  }

  doc.querySelector('#remote-reload').addEventListener('click', () => {
    if (active) load();
  });
  doc.querySelector('#remote-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    clearFrame();
    active = null;
    if (doc.fullscreenElement === dialog) doc.exitFullscreen?.().catch(() => {});
  });
  fullscreen.addEventListener('click', async () => {
    try {
      if (doc.fullscreenElement) await doc.exitFullscreen();
      else if (dialog.requestFullscreen) await dialog.requestFullscreen();
      else notify('Fullscreen is not supported in this browser.');
    } catch {
      notify('Fullscreen was blocked. You can also open the game in a new tab.');
    }
  });
  doc.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = doc.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  });
  return {open};
}
