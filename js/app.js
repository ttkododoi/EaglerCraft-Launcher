import {modules,load,normalize} from './state.js';
import {versions,getVersion,resolveRuntime,gameUrl} from './catalog.js';
import {startPreview} from './preview.js';
const $=s=>document.querySelector(s);
let settings;try{settings=load(localStorage);}catch{settings=normalize(null);}
// Migrate the old demo-only selection to a real launch profile.
if(settings.profile==='demo')settings.profile='1.8.8';
let stopPreview=null,toastTimer;
const dialog=$('#game-dialog'),canvas=$('#preview');
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),6000);}
function save(){try{localStorage.setItem('obsidian.settings',JSON.stringify(settings));}catch{toast('Storage unavailable. Preferences will last for this session only.');}}
function renderModules(){for(const target of ['#modules','#game-modules']){
 const container=$(target);container.replaceChildren();
 for(const mod of modules){const card=document.createElement('div');card.className='module-card';const body=document.createElement('div');const title=document.createElement('h3');title.textContent=mod.name;const p=document.createElement('p');p.textContent=mod.description;body.append(title,p);const toggle=document.createElement('button');toggle.className='toggle';toggle.setAttribute('role','switch');toggle.setAttribute('aria-label',mod.name);toggle.setAttribute('aria-checked',String(settings.modules[mod.id]));toggle.onclick=()=>{settings.modules[mod.id]=!settings.modules[mod.id];save();renderModules();$(target).querySelector(`[aria-label="${mod.name}"]`)?.focus();};card.append(body,toggle);container.append(card);}
}}
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==`page-${page}`);document.querySelectorAll('.nav').forEach(n=>{const active=n.dataset.page===page;n.classList.toggle('active',active);if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});$('#page-name').textContent=({play:'GAME',library:'VERSIONS',modules:'PREVIEW MODULES',settings:'SETTINGS',guide:'ABOUT & HELP'})[page];}
function renderLibrary(){const query=$('#version-search').value.trim().toLowerCase();const filtered=versions.filter(v=>`${v.id} ${v.tag} ${v.runtimes.join(' ')}`.toLowerCase().includes(query));$('#version-library').replaceChildren();$('#result-count').textContent=`${filtered.length} / ${versions.length} VERSIONS`;$('#no-results').hidden=filtered.length>0;
 for(const v of filtered){const card=document.createElement('article');card.className=`version-card${settings.profile===v.id?' selected':''}`;
 const art=document.createElement('div');art.className='card-art';art.setAttribute('aria-hidden','true');const body=document.createElement('div');body.className='card-body';const tag=document.createElement('span');tag.className='version-tag';tag.textContent=v.tag;const title=document.createElement('h3');title.textContent=v.label;const desc=document.createElement('p');desc.textContent=v.description;const actions=document.createElement('div');actions.className='card-actions';for(const runtime of v.runtimes){const button=document.createElement('button');button.className='build-button';button.textContent=`${runtime==='js'?'JAVASCRIPT':'WASM'} →`;button.setAttribute('aria-label',`Select ${v.id} ${runtime==='js'?'JavaScript':'WebAssembly'}`);button.onclick=()=>{select(v.id,runtime);navigate('play');$('#launch').focus();};actions.append(button);}body.append(tag,title,desc,actions);card.append(art,body);if(v.id===settings.profile){const badge=document.createElement('span');badge.className='selected-label';badge.textContent='SELECTED';card.append(badge);}$('#version-library').append(card);}
}
function syncLaunch(){const version=getVersion(settings.profile);const runtime=resolveRuntime(version.id,settings.runtime);settings.runtime=runtime;$('#version-select').value=version.id;document.querySelectorAll('[data-runtime]').forEach(button=>{button.disabled=!version.runtimes.includes(button.dataset.runtime);button.setAttribute('aria-pressed',String(runtime===button.dataset.runtime));button.title=button.disabled?'This version is available in WebAssembly only':'';});
const url=gameUrl(version.id,runtime);for(const selector of ['#launch','#hero-launch']){$(selector).href=url;$(selector).setAttribute('aria-label',`Launch Eaglercraft ${version.id} ${runtime==='js'?'JavaScript':'WebAssembly'} on GX Launcher (opens a new tab)`);}
$('#selected-name').textContent=`${version.id} / ${runtime.toUpperCase()}`;$('#selected-description').textContent='GX-HOSTED BUILD';$('#runtime-note').textContent=runtime==='wasm'?`${version.runtimes.length===1?'WASM-only release. ':''}Requires a compatible browser; newer Wasm features may be needed.`:'JavaScript build selected. No local game files required.';
}
function select(id,runtime=settings.runtime){if(!getVersion(id))return;settings.profile=id;settings.runtime=resolveRuntime(id,runtime);save();syncLaunch();renderLibrary();}
function sync(){renderModules();syncLaunch();renderLibrary();for(const key of ['renderScale','fov','sensitivity']){$(`#${key}`).value=settings[key];if($(`#${key}-value`))$(`#${key}-value`).textContent=settings[key];}}
for(const version of versions){const option=document.createElement('option');option.value=version.id;option.textContent=`${version.label}${version.runtimes.length===1?' · WASM only':''}`;$('#version-select').append(option);}
$('#version-select').onchange=e=>select(e.target.value);
document.querySelectorAll('[data-runtime]').forEach(button=>button.onclick=()=>select(settings.profile,button.dataset.runtime));
document.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>navigate(button.dataset.page));$('#browse-versions').onclick=()=>navigate('library');$('#version-search').addEventListener('input',renderLibrary);
for(const key of ['renderScale','fov','sensitivity'])$(`#${key}`).addEventListener('input',e=>{settings[key]=Number(e.target.value);save();if($(`#${key}-value`))$(`#${key}-value`).textContent=settings[key];});
$('#reset').onclick=()=>{settings=normalize(null);save();sync();toast('Preferences reset.');};
function toggleMenu(){const menu=$('#game-menu');menu.hidden=!menu.hidden;if(!menu.hidden){document.exitPointerLock?.();menu.querySelector('button')?.focus();}else canvas.focus();}
document.addEventListener('keydown',e=>{if(dialog.open&&e.code==='ShiftRight'&&!e.repeat){e.preventDefault();toggleMenu();}});
function cleanup(){stopPreview?.();stopPreview=null;$('#hud').textContent='';$('#game-menu').hidden=true;if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});}
dialog.addEventListener('close',cleanup);$('#close-game').onclick=()=>dialog.close();$('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>toast('Unable to leave fullscreen.'));else dialog.requestFullscreen?.().catch(()=>toast('Fullscreen is not available in this browser.'));};
$('#open-preview').onclick=()=>{if(dialog.open)return;dialog.showModal();stopPreview=startPreview(canvas,()=>settings,text=>$('#hud').textContent=text);};
sync();navigate('play');
