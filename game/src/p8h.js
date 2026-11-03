// ===================== v8 start-up: world build, save migration =====================
function initWorldLife(){}
function paintWorld(){buildWorld8();buildPitchList8();paintMap8();migrate8()}
function migrate8(){
 if((S.v||0)<6){Store.write('fl_pre_v8',S);
  if(S.arch){let best=null,bd=1e9;(OLDFAC||[]).forEach(o=>{const d=Math.hypot(o[0]-S.x,o[1]-S.y);if(d<bd){bd=d;best=o}});
   let f=best&&FAC.find(f=>f[4]===best[2]&&f[2]===best[3]);if(!f&&best)f=FAC.find(f=>f[4]===best[2]);if(!f)f=FAC.find(f=>f[4]==='hq');S.x=f[0]+1;S.y=f[1]+3}
  else{S.x=def.x;S.y=def.y}
  S.dest=null;S.v=6;const dd=distOf(S.x,S.y);if(dd&&S.disc&&!S.disc[dd.k])S.disc[dd.k]=S.day}
 def.v=6;if(!S.col8)S.col8={};if(!S.fvis)S.fvis={};
 if(!inb(S.x,S.y)||!isWalkT(M[S.y][S.x],S.x,S.y)){S.x=def.x;S.y=def.y}}
function paintMap8(){MAPC=document.createElement('canvas');MAPC.width=MW*6;MAPC.height=MH*6;const q=MAPC.getContext('2d');
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x];let c;
  switch(t){case 0:c='#5d6472';break;case 34:c='#c9c3b6';break;case 30:c='#d8cdb5';break;case 31:c='#cdb98d';break;case 32:c=ZV[y*MW+x]==2?'#3d7fb3':'#4fa84a';break;case 33:c='#c4583f';break;case 35:c='#ead39a';break;case 36:c='#b08452';break;case 7:c=x>=118?'#2f8fc4':'#3e9fcc';break;case 2:c='#3f8a35';break;case 43:c='#5a5f6a';break;case 44:c='#666c79';break;case 45:c='#2f6b2a';break;case 37:case 46:c='#8d96a8';break;case 38:c='#2f6b2a';break;case 42:c='#7d7468';break;case 40:c='#cfd5dc';break;case 3:case 4:c='#9aa1ad';break;default:c=grassCol(x,y)}
  q.fillStyle=c;q.fillRect(x*6,y*6,6,6)}
 BLD.forEach(b=>{if(b.type==='stadium'){const e=b.el;q.fillStyle='#e9edf2';q.beginPath();q.ellipse(e.cx*6,e.cy*6,e.rx*6,e.ry*6,0,0,7);q.fill();q.fillStyle='#3a9a45';q.fillRect(e.cx*6-28,e.cy*6-14,56,28);return}
  const c=bCfg(b),col=b.kind!=='deco'?b.col:(c.rc||'#8a8f9a');q.fillStyle='#1b1e25';q.fillRect(b.x*6-.5,b.y*6-.5,b.w*6+1,b.h*6+1);q.fillStyle=col;q.fillRect(b.x*6+.5,b.y*6+.5,b.w*6-1,b.h*6-1);q.fillStyle='rgba(255,255,255,.22)';q.fillRect(b.x*6+.5,b.y*6+.5,b.w*6-1,2)});
 OBJ.forEach(o=>{if(o.k==='tree'){q.fillStyle=o.kind==='cherry'?'#e89ab8':o.kind==='autumn'?'#d9822b':o.kind==='palm'?'#3f9a4a':'#2f7d33';q.beginPath();q.arc(o.x/T8*6,o.y/T8*6-4,o.edge?3:2.6,0,7);q.fill()}});
 const mq=MMC.getContext('2d');mq.clearRect(0,0,MMC.width,MMC.height);mq.imageSmoothingEnabled=true;mq.drawImage(MAPC,0,0,MMC.width,MMC.height)}
