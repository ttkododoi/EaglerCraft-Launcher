import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,load,modules} from '../js/state.js';
test('defaults have all eight module flags',()=>{const s=normalize(null);assert.equal(modules.length,8);for(const m of modules)assert.equal(typeof s.modules[m.id],'boolean');});
test('rejects unknown profile, invalid types and clamps numeric settings',()=>{const s=normalize({profile:'../../bad',fov:500,sensitivity:NaN,renderScale:-1,modules:{esp:'yes',xray:true}});assert.equal(s.profile,'1.8.8');assert.equal(s.fov,110);assert.equal(s.renderScale,.5);assert.equal(s.sensitivity,1);assert.equal(s.modules.esp,false);assert.equal(s.modules.xray,true);});
test('corrupt or unavailable storage recovers',()=>{assert.equal(load({getItem:()=>'{broken'}).profile,'1.8.8');assert.equal(load({getItem:()=>{throw Error();}}).profile,'1.8.8');});
test('defaults are independent',()=>{const a=normalize(null);a.modules.fps=false;assert.equal(normalize(null).modules.fps,true);});
test('valid persisted settings round-trip',()=>{const s=normalize({profile:'1.8.8',fov:90,modules:{esp:true}});assert.deepEqual(load({getItem:()=>JSON.stringify(s)}),s);});
