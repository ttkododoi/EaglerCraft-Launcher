/** Import this inside a same-origin, trusted client page, AFTER implementing engine hooks. */
export function registerClient(adapter) {
  if (window.parent === window) throw new Error('Client must run inside launcher');
  if (!adapter || typeof adapter.applySettings !== 'function') throw new TypeError('applySettings is required');
  const supported = Array.isArray(adapter.supportedModules) ? [...adapter.supportedModules] : [];
  const origin = location.origin;
  const receive = event => {
    if(event.origin !== origin || event.source !== parent || event.data?.channel !== 'obsidian:v1') return;
    if(event.data.type==='configure') {
      try {
        adapter.applySettings(event.data.settings);
        parent.postMessage({channel:'obsidian:v1',type:'configured'},origin);
      } catch(error) {
        parent.postMessage({channel:'obsidian:v1',type:'error',message:String(error.message || error).slice(0,200)},origin);
      }
    }
  };
  const keydown=event=>{
    if(event.code==='ShiftRight' && !event.repeat){event.preventDefault();parent.postMessage({channel:'obsidian:v1',type:'menu'},origin);}
  };
  window.addEventListener('message',receive);
  window.addEventListener('keydown',keydown);
  parent.postMessage({channel:'obsidian:v1',type:'ready',supportedModules:supported},origin);
  return ()=>{window.removeEventListener('message',receive);window.removeEventListener('keydown',keydown);};
}
