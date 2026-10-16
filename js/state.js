import {getVersion,resolveRuntime} from './catalog.js';
export const modules = [
  {id:'esp',name:'Player ESP',description:'Player boxes, names and distances, even behind walls.'},
  {id:'xray',name:'X-Ray',description:'Hide common terrain and reveal valuable ore blocks.'},
  {id:'bhop',name:'Bunnyhop',description:'Repeat jumps while Space is held and you are grounded.'},
  {id:'fullbright',name:'Fullbright',description:'Remove darkness without changing world lighting.'},
  {id:'autoSprint',name:'Auto sprint',description:'Sprint automatically while moving forward.'},
  {id:'toggleSprint',name:'Toggle sprint',description:'Persistent sprint mode, without holding a key.'},
  {id:'fps',name:'FPS counter',description:'Display the current rendering frame rate.'},
  {id:'coordinates',name:'Coordinates',description:'Keep your world position visible on the HUD.'}
];
export const defaults = {version:2,profile:'1.8.8',runtime:'js',renderScale:1,fov:75,sensitivity:1,modules:{esp:false,xray:false,bhop:false,fullbright:false,autoSprint:false,toggleSprint:false,fps:true,coordinates:true}};
export function normalize(value) {
  const result=structuredClone(defaults);
  if (!value || typeof value!=='object') return result;
  if (value.profile==='demo' || getVersion(value.profile)) result.profile=value.profile;
  result.runtime=resolveRuntime(result.profile==='demo'?'1.8.8':result.profile,value.runtime)||'js';
  for (const [key,min,max] of [['renderScale',.5,1],['fov',50,110],['sensitivity',.5,2]]) {
    if (typeof value[key]==='number' && Number.isFinite(value[key])) result[key]=Math.max(min,Math.min(max,value[key]));
  }
  for (const {id} of modules) if(typeof value.modules?.[id]==='boolean') result.modules[id]=value.modules[id];
  return result;
}
export function load(storage) {try{return normalize(JSON.parse(storage.getItem('obsidian.settings')));}catch{return normalize(null);}}
