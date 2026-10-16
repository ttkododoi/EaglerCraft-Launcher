import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGamePlayer} from '../js/game-player.js';
import {versions,gameUrl} from '../js/catalog.js';

function fixture() {
  const nodes = new Map();
  class Element extends EventTarget {
    open = false;
    children = [];
    textContent = '';
    showModal() { this.open = true; }
    close() { this.open = false; this.dispatchEvent(new Event('close')); }
    append(child) { this.children.push(child); child.parent = this; }
    remove() { this.parent.children = this.parent.children.filter(c => c !== this); }
    click() { this.dispatchEvent(new Event('click')); }
  }
  const doc = new EventTarget();
  doc.querySelector = id => {
    if (!nodes.has(id)) nodes.set(id, new Element());
    return nodes.get(id);
  };
  doc.createElement = () => new Element();
  return {doc, player:createGamePlayer(doc), get:id=>doc.querySelector(id)};
}

test('all 14 builds embed the exact catalog destination and have matching fallback', () => {
  const {player,get} = fixture();
  for (const version of versions) for (const runtime of version.runtimes) {
    player.open(version.id,runtime);
    assert.equal(get('#remote-dialog').open,true);
    const [frame] = get('#remote-stage').children;
    assert.equal(frame.src,gameUrl(version.id,runtime));
    assert.equal(frame.allowFullscreen,true);
    assert.equal(get('#remote-external').href,frame.src);
    frame.onload(); // Clear the pending loading hint as a browser load would.
    assert.match(get('#remote-status').textContent,/Hosted page loaded/);
    get('#remote-close').click();
    assert.equal(get('#remote-stage').children.length,0);
  }
});
test('reload replaces the frame; closing clears callbacks and permits reopening', () => {
  const {player,get} = fixture();
  player.open('1.8.8','js');
  const old = get('#remote-stage').children[0];
  get('#remote-reload').click();
  assert.equal(get('#remote-stage').children.length,1);
  assert.notEqual(get('#remote-stage').children[0],old);
  assert.equal(old.onload,null);
  get('#remote-close').click();
  assert.equal(get('#remote-dialog').open,false);
  assert.equal(get('#remote-stage').children.length,0);
  player.open('26.3','wasm');
  assert.equal(get('#remote-stage').children.length,1);
  get('#remote-close').click();
});
test('invalid version/runtime cannot open a frame', () => {
  const {player,get} = fixture();
  assert.throws(()=>player.open('26.3','js'));
  assert.throws(()=>player.open('../../bad','wasm'));
  assert.equal(get('#remote-stage').children.length,0);
  assert.equal(get('#remote-dialog').open,false);
});
