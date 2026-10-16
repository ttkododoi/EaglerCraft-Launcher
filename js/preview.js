// Deliberately small, original 2D engine, NOT an Eaglercraft game binary.
export function startPreview(canvas, getSettings, onHud) {
  const ctx=canvas.getContext('2d');
  const keys=new Set();
  const player={x:5,y:5,z:0,vz:0};
  const players=[{x:12,y:6,name:'Alex'},{x:19,y:11,name:'Steve'},{x:8,y:16,name:'Explorer'}];
  let raf,last=performance.now(),frames=0,elapsed=0,fps=0,jumpPressed=false;
  const walls=(x,y)=> (x===10&&y>2&&y<14)||(y===14&&x>13&&x<24)||(x===3&&y>10&&y<18);
  const ore=(x,y)=> (x*17+y*31)%43===0;
  const down=e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'&&!e.repeat)jumpPressed=true;keys.add(e.code);};
  const up=e=>keys.delete(e.code);
  const blur=()=>{keys.clear();jumpPressed=false;};
  canvas.addEventListener('keydown',down);window.addEventListener('keyup',up);canvas.addEventListener('blur',blur);
  function draw(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    const s=getSettings(),m=s.modules,focused=document.activeElement===canvas;
    const width=canvas.clientWidth,height=canvas.clientHeight,scale=s.renderScale*Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(width*scale)||canvas.height!==Math.round(height*scale)){canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);}
    ctx.setTransform(scale,0,0,scale,0,0);
    const tile=Math.min(width/28,height/21)*(75/s.fov),ox=(width-28*tile)/2,oy=(height-21*tile)/2;
    let dx=0,dy=0;
    if(focused){dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));}
    const speed=3.5*s.sensitivity*((m.autoSprint&&dy<0)||m.toggleSprint?1.6:1),len=Math.hypot(dx,dy)||1;
    const nx=Math.max(.5,Math.min(27.5,player.x+dx/len*speed*dt)),ny=Math.max(.5,Math.min(20.5,player.y+dy/len*speed*dt));
    if(!walls(Math.floor(nx),Math.floor(player.y)))player.x=nx;
    if(!walls(Math.floor(player.x),Math.floor(ny)))player.y=ny;
    if(focused&&player.z===0&&(jumpPressed||(m.bhop&&keys.has('Space'))))player.vz=6;
    jumpPressed=false;player.vz-=18*dt;player.z=Math.max(0,player.z+player.vz*dt);if(player.z===0)player.vz=0;
    ctx.fillStyle='#161c25';ctx.fillRect(0,0,width,height);
    const px=x=>ox+x*tile,py=y=>oy+y*tile;
    for(let y=0;y<21;y++)for(let x=0;x<28;x++){
      const valuable=ore(x,y);ctx.fillStyle=walls(x,y)?'#546257':((x+y)%2?'#2e493b':'#304c3d');
      if(m.xray)ctx.fillStyle=valuable?'#468b9e':'#1b2630';
      ctx.fillRect(px(x),py(y),tile-1,tile-1);
      if(valuable){ctx.fillStyle='#84e3e7';ctx.fillRect(px(x)+tile*.3,py(y)+tile*.3,tile*.26,tile*.26);}
      if(walls(x,y)&&!m.xray){ctx.fillStyle='#71816a';ctx.fillRect(px(x),py(y),tile-1,4);}
    }
    // Ray sample against terrain to decide ordinary visibility.
    function visible(p){const steps=Math.ceil(Math.hypot(p.x-player.x,p.y-player.y)*5);for(let i=1;i<steps;i++){const t=i/steps;if(walls(Math.floor(player.x+(p.x-player.x)*t),Math.floor(player.y+(p.y-player.y)*t)))return false;}return true;}
    function person(p,color,lift=0){ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(px(p.x),py(p.y)+tile*.25,tile*.35,tile*.18,0,0,7);ctx.fill();ctx.fillStyle=color;ctx.fillRect(px(p.x)-tile*.22,py(p.y)-tile*.5-lift,tile*.44,tile*.7);ctx.fillStyle='#d5b89c';ctx.fillRect(px(p.x)-tile*.18,py(p.y)-tile*.8-lift,tile*.36,tile*.3);}
    for(const p of players)if(visible(p))person(p,'#97b4d9');
    person(player,'#b9a0ff',player.z*tile*.4);
    if(!m.fullbright){const g=ctx.createRadialGradient(px(player.x),py(player.y),tile,px(player.x),py(player.y),tile*13);g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000d0');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);}
    if(m.esp)for(const p of players){const x=px(p.x),y=py(p.y);ctx.strokeStyle='#d1a6ff';ctx.lineWidth=1.5;ctx.strokeRect(x-tile*.4,y-tile,tile*.8,tile*1.45);ctx.fillStyle='#e3ccff';ctx.font='11px monospace';ctx.textAlign='center';ctx.fillText(`${p.name} · ${Math.hypot(p.x-player.x,p.y-player.y).toFixed(1)}m`,x,y-tile-7);}
    frames++;elapsed+=dt;if(elapsed>=.5){fps=Math.round(frames/elapsed);frames=0;elapsed=0;}
    onHud([m.fps?`${fps} FPS`:'',m.coordinates?`XYZ ${player.x.toFixed(1)} / ${player.z.toFixed(1)} / ${player.y.toFixed(1)}`:'','FEATURE PREVIEW • 2D test world'].filter(Boolean).join('\n'));
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);canvas.focus();
  return ()=>{cancelAnimationFrame(raf);canvas.removeEventListener('keydown',down);window.removeEventListener('keyup',up);canvas.removeEventListener('blur',blur);};
}
