// Entry points confirmed against GX's public repository; see docs/gx-reference.md.
export const versions = [
  {id:'26.3',label:'26.3',runtimes:['wasm'],tag:'LATEST RELEASE',description:'The newest GX-listed release. WebAssembly only.'},
  {id:'26.2',label:'26.2',runtimes:['wasm'],tag:'MODERN',description:'A modern release, available in WebAssembly.'},
  {id:'1.16.5',label:'1.16.5',runtimes:['js','wasm'],tag:'NETHER UPDATE',description:'Explore a different side of the Nether.'},
  {id:'1.14.4',label:'1.14.4',runtimes:['js','wasm'],tag:'VILLAGE & PILLAGE',description:'New villages. New adventures.'},
  {id:'1.13.2',label:'1.13.2',runtimes:['js','wasm'],tag:'UPDATE AQUATIC',description:'Take your next adventure underwater.'},
  {id:'1.12.2',label:'1.12.2',runtimes:['js','wasm'],tag:'WORLD OF COLOR',description:'A colorful classic, ready for the browser.'},
  {id:'1.8.8',label:'1.8.8',runtimes:['js','wasm'],tag:'COMMUNITY CLASSIC',description:'The familiar classic. Your next world starts here.'},
  {id:'1.5.2',label:'1.5.2',runtimes:['js','wasm'],tag:'RETRO',description:'Back to basics. Rediscover the early days.'}
];
export function getVersion(id){return versions.find(v=>v.id===id);}
export function resolveRuntime(id,runtime){const version=getVersion(id);return version?.runtimes.includes(runtime)?runtime:version?.runtimes[0];}
export function gameUrl(id,runtime){const version=getVersion(id);if(!version||!version.runtimes.includes(runtime))throw new Error('Unsupported version/runtime');return `https://gx-launcher.github.io/game/${id}${runtime==='wasm'?'-wasm':''}/index.html`;}
