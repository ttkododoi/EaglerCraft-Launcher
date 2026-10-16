import {test} from 'node:test';
import assert from 'node:assert/strict';
import {versions,gameUrl,resolveRuntime} from '../js/catalog.js';
import {normalize} from '../js/state.js';
test('exactly eight versions and fourteen builds',()=>{assert.equal(versions.length,8);assert.equal(versions.flatMap(v=>v.runtimes).length,14);assert.equal(new Set(versions.map(v=>v.id)).size,8);});
for(const id of ['1.5.2','1.8.8','1.12.2','1.13.2','1.14.4','1.16.5']){
 test(`${id} has exact JS and WASM destinations`,()=>{assert.equal(gameUrl(id,'js'),`https://gx-launcher.github.io/game/${id}/index.html`);assert.equal(gameUrl(id,'wasm'),`https://gx-launcher.github.io/game/${id}-wasm/index.html`);});
}
for(const id of ['26.2','26.3'])test(`${id} is WASM only`,()=>{assert.equal(gameUrl(id,'wasm'),`https://gx-launcher.github.io/game/${id}-wasm/index.html`);assert.throws(()=>gameUrl(id,'js'));assert.equal(resolveRuntime(id,'js'),'wasm');assert.equal(normalize({profile:id,runtime:'js'}).runtime,'wasm');});
test('unknown versions and runtimes cannot create external URLs',()=>{for(const [v,r] of [['../../bad','js'],['1.8.8','evil'],['https://evil.test','wasm']])assert.throws(()=>gameUrl(v,r));});
test('persists a valid modern selection and runtime',()=>{const s=normalize({profile:'1.16.5',runtime:'wasm'});assert.equal(s.profile,'1.16.5');assert.equal(s.runtime,'wasm');});
