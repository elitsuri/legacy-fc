// ===================== v8 architecture: parametric illustrated buildings (cached sprites, 2x) =====================
var BSPR=new Map(),BTOT=0;
const BT8={
 hq:{roof:'hip',rc:'#506079',wall:'#b4553c',tex:'brick',trim:'#f1e9d8',win:'arched',fr:'#f3ecdc',gf:'portico'},
 clubhouse:{roof:'flat',rc:'#c9d0d7',wall:'#f3f2ee',tex:'render',acc:'#2e8b57',win:'band',gf:'glass',solar:1},
 gym:{roof:'barrel',rc:'#c3c9d1',wall:'#5b6572',tex:'panel',acc:'#e67e22',win:'high',gf:'glass'},
 pavilion:{roof:'canopy',rc:'#f4f4f2',wall:'#fafafa',acc:'#c0392b',gf:'open'},
 office:{roof:'flat',rc:'#b5bbc4',wall:'#e7dcc6',tex:'wood',win:'big',gf:'glass',acc:'#2e8b57'},
 shop:{roof:'flat',rc:'#a6aeb8',wall:'#ece5d8',tex:'render',win:'std',gf:'store',awn:['#2e6fb8','#ffffff']},
 cafe:{roof:'gable',rc:'#a5543a',wall:'#ecd6b2',tex:'render',win:'shutter',gf:'store',awn:['#c0392b','#f7efe0'],sh:'#2f6b46'},
 clinic:{roof:'flat',rc:'#d3d9df',wall:'#f7f9fb',tex:'render',acc:'#3a7bd5',win:'band',gf:'glass'},
 glass:{roof:'flat',rc:'#59616e',wall:'#2b3d57',tex:'curtain',gf:'glass'},
 officeBlk:{roof:'flat',rc:'#9aa1aa',wall:'#cdc7bb',tex:'concrete',win:'grid',gf:'glass'},
 flats:{roof:'flat',rc:'#a0a7b0',wall:'#e9dcc5',tex:'render',win:'std',bal:1,gf:'std'},
 dorm:{roof:'gable',rc:'#5a4636',wall:'#b56b4a',tex:'brick',win:'std',gf:'std',trim:'#efe6d2'},
 school:{roof:'hip',rc:'#7a4c3a',wall:'#dcc59c',tex:'render',win:'grid',gf:'std',trim:'#ffffff'},
 smallshop:{roof:'gable',rc:'#7c4f3c',wall:'#e7c9a6',tex:'render',win:'std',gf:'store'},
 townhouse:{roof:'gable',rc:'#6c3d33',wall:'#e2b69a',tex:'render',win:'tall',gf:'std'},
 restaurant:{roof:'flat',rc:'#8f959e',wall:'#8e4a33',tex:'brick',win:'big',gf:'store',awn:['#1b2a49','#f5c400']},
 campus:{roof:'hip',rc:'#3f5f93',wall:'#a14d33',tex:'brick',trim:'#f4efe6',win:'arched',fr:'#f4efe6',gf:'std',clock:1},
 parkPav:{roof:'hip',rc:'#3f7d3a',wall:'#c89a62',tex:'wood',gf:'open'},
 cinema:{roof:'flat',rc:'#7d838c',wall:'#7a2232',tex:'render',win:'none',gf:'cinema'},
 hotel:{roof:'flat',rc:'#9da4ad',wall:'#e9dfcb',tex:'render',win:'std',bal:1,gf:'glass',canopy:'#8a1f2b'},
 mall:{roof:'flat',rc:'#b7bec7',wall:'#e6ebf1',tex:'panel',win:'none',gf:'mall'},
 boutique:{roof:'flat',rc:'#30333b',wall:'#1f2129',tex:'render',trim:'#d4a72c',win:'tall',gf:'display'},
 barber:{roof:'gable',rc:'#3b4f60',wall:'#e5f0f2',tex:'render',win:'std',gf:'store',awn:['#c0392b','#ffffff']},
 warehouse:{roof:'barrel',rc:'#a9b2ba',wall:'#8e9aa4',tex:'corr',win:'high',gf:'roller'},
 lounge:{roof:'flat',rc:'#24262d',wall:'#16171c',tex:'render',trim:'#d4a72c',win:'tall',gf:'lounge'},
 villa:{roof:'flat',rc:'#e9e6df',wall:'#f8f6f1',tex:'render',win:'big',gf:'glass',acc:'#b98a56'},
 penthouse:{roof:'flat',rc:'#3b3f48',wall:'#2a2c34',tex:'curtain',trim:'#d4a72c',gf:'glass'},
 showroom:{roof:'flat',rc:'#b4bac3',wall:'#e3e7ed',tex:'panel',win:'none',gf:'showroom',acc:'#c0392b'},
 kiosk:{roof:'flat',rc:'#7c8590',wall:'#e67e22',tex:'corr',win:'none',gf:'kiosk'},
 agency:{roof:'gable',rc:'#5b3b2c',wall:'#c8693f',tex:'brick',win:'std',gf:'store',trim:'#f3eadb'},
 house:{roof:'gable',rc:'#a3423a',wall:'#f0e2c8',tex:'render',win:'shutter',gf:'house'},
 station:{roof:'barrelGlass',rc:'#9fc7e0',wall:'#a35a3c',tex:'brick',trim:'#efe2c8',win:'arched',gf:'arch',clock:1},
 terminal:{roof:'flat',rc:'#c6ced8',wall:'#dfe6ee',tex:'curtainL',win:'none',gf:'glass',canopy:'#3d4a6b'},
 spa:{roof:'wave',rc:'#2e8b8b',wall:'#f4fbfb',tex:'render',win:'band',gf:'glass',acc:'#2e8b8b'},
 clocktower:{special:1},tower:{special:1},ctower:{special:1},lighthouse:{special:1},stadium:{special:1}};
const HOUSEV=[['#f0e2c8','#a3423a'],['#dfe9f1','#3e5f8a'],['#f3d9c4','#6b4a3a'],['#e3efd9','#46704a'],['#f7ecc8','#8c3a2e'],['#ece2f1','#5a4a7a'],['#e9d7b9','#7a5a3a']];
const SHOPV=[['#e7c9a6','#7c4f3c',['#c0392b','#fff'],'bakery'],['#dfe8f0','#3e5f8a',['#2e6fb8','#fff'],'books'],['#f3dce4','#8a3a5a',['#e85d8a','#fff'],'flowers'],['#e3e6ea','#4a5260',['#1f2a36','#3ac0ff'],'tech'],['#e8f4ea','#3e7a4a',['#1f9d55','#fff'],'pharmacy'],['#f4e3c1','#8a4a2a',['#d35400','#fff3d6'],'pizza'],['#e9f3f6','#3a7c8a',['#7fd3e0','#fff'],'icecream'],['#efe6da','#5a4636',['#2c3e50','#d4a72c'],'tailor'],['#f6efe1','#7a3b2e',['#16a085','#fff'],'deli'],['#fff3dc','#2f6b8a',['#f39c12','#fff'],'surf']];
function bCfg(b){const c=Object.assign({},BT8[b.type]||BT8.flats),v=b.v||0;
 if(b.type==='house'){const p=HOUSEV[v%HOUSEV.length];c.wall=p[0];c.rc=p[1];c.roof=v%3==1?'hip':'gable';c.tex=v%4==2?'wood':v%5==3?'brick':'render';if(c.tex==='brick')c.wall='#b7684a';c.sh=['#2f5d8a','#2f6b46','#7a2f2f','#5a4a3a'][v%4]}
 if(b.type==='smallshop'){const p=SHOPV[v%SHOPV.length];c.wall=p[0];c.rc=p[1];c.awn=p[2];c.goods=p[3];c.roof=v%2?'flat':'gable';if(c.roof==='flat')c.rc='#9aa1aa'}
 if(b.type==='townhouse'){const p=[['#e2b69a','#6c3d33'],['#c9dde6','#3c5568'],['#f0d9a8','#8a5a2a'],['#d8c7e6','#5a3e6c'],['#cfe3c9','#3e6a40'],['#f2c7c0','#7a3a33']][v%6];c.wall=p[0];c.rc=p[1]}
 if(b.type==='flats'){c.wall=['#e9dcc5','#d9e2ea','#efd2c2','#dfe6d3','#e8e1f0','#f1e3b9','#d2d8e3'][v%7];c.rc='#9aa1aa'}
 if(b.type==='officeBlk'){c.wall=['#cdc7bb','#bfc7cf','#d6cfc4','#c4c9c0'][v%4]}
 if(b.type==='hotel'){c.wall=['#e9dfcb','#dfe4ea','#efe0cf'][v%3]}
 if(b.type==='tower')c.wall=v%2?'#3a5878':'#2f4a63';
 return c}
// ---------- primitives ----------
function bQ(q,x,y,w,h,c){q.fillStyle=c;q.fillRect(x,y,w,h)}
function lin8(q,x0,y0,x1,y1,stops){const g2=q.createLinearGradient(x0,y0,x1,y1);stops.forEach((c,i)=>g2.addColorStop(i/(stops.length-1),c));return g2}
function winGlass8(q,x,y,w,h,fr,b,lit){bQ(q,x-1.2,y-1.2,w+2.4,h+2.4,fr||'#3a3f4a');q.fillStyle=lin8(q,0,y,0,y+h,['#cfeeff','#8ec3e8','#5486b6']);q.fillRect(x,y,w,h);
 q.fillStyle='rgba(255,255,255,.38)';q.beginPath();q.moveTo(x+w*.18,y);q.lineTo(x+w*.42,y);q.lineTo(x+w*.12,y+h);q.lineTo(x,y+h);q.lineTo(x,y+h*.7);q.closePath();q.fill();
 if(b&&b.wins)b.wins.push([x,y,w,h,lit==null?.5:lit])}
function winStd8(q,x,y,w,h,c,b,opt){opt=opt||{};const fr=opt.fr||'#f3efe6';winGlass8(q,x,y,w,h,fr,b,opt.lit);bQ(q,x+w/2-.6,y,1.2,h,fr);if(h>9)bQ(q,x,y+h*.45,w,1.2,fr);
 bQ(q,x-2,y+h+1,w+4,2,shd(c,1.25));bQ(q,x-2,y+h+3,w+4,1,'rgba(0,0,0,.18)');
 if(opt.shut){bQ(q,x-5,y-1,4,h+2,opt.shut);bQ(q,x+w+1,y-1,4,h+2,opt.shut);q.fillStyle='rgba(0,0,0,.2)';for(let i=1;i<h;i+=2.5){q.fillRect(x-5,y+i,4,.6);q.fillRect(x+w+1,y+i,4,.6)}}
 if(opt.box){bQ(q,x-1,y+h+2,w+2,3.5,'#7a4a2a');for(let i=0;i<4;i++){q.fillStyle=['#e74c3c','#f5c400','#ff8fb4','#fff'][(i+(x|0))%4];q.beginPath();q.arc(x+1+i*(w/3.4),y+h+1.5,1.7,0,7);q.fill()}q.fillStyle='#2f7a36';q.fillRect(x,y+h+1.2,w,1)}}
function winArch8(q,x,y,w,h,c,b,fr){bQ(q,x-1.5,y+w/2-1.5,w+3,h-w/2+3,fr);q.fillStyle=fr;q.beginPath();q.arc(x+w/2,y+w/2,w/2+1.5,Math.PI,0);q.fill();
 q.save();q.beginPath();q.arc(x+w/2,y+w/2,w/2,Math.PI,0);q.rect(x,y+w/2,w,h-w/2);q.clip();q.fillStyle=lin8(q,0,y,0,y+h,['#d6f1ff','#8ec3e8','#4e7fb0']);q.fillRect(x,y,w,h);q.fillStyle='rgba(255,255,255,.35)';q.fillRect(x+w*.15,y,w*.18,h);q.restore();
 bQ(q,x+w/2-.6,y,1.2,h,fr);bQ(q,x,y+h*.55,w,1.2,fr);bQ(q,x-2.5,y+h+1,w+5,2.5,shd(c,1.3));if(b&&b.wins)b.wins.push([x,y,w,h,.55])}
function brick8(q,x,y,w,h,c){q.fillStyle=c;q.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=3.5){q.fillStyle=shd(c,1.16);q.fillRect(x,yy,w,.7);const off=Math.round((yy-y)/3.5)%2?4:0;for(let xx=x+off;xx<x+w;xx+=8){q.fillStyle=shd(c,1.12);q.fillRect(xx,yy,.7,3.5);if(H(xx|0,yy|0,3)<16){q.fillStyle=H(xx|0,yy|0,5)%2?shd(c,.9):shd(c,1.07);q.fillRect(xx+.7,yy+.7,7.3,2.8)}}}}
function texWall8(q,c,x,y,w,h){const t=c.tex,base=c.wall;
 if(t==='brick')brick8(q,x,y,w,h,base);
 else if(t==='wood'){q.fillStyle=base;q.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=4){q.fillStyle=shd(base,.82);q.fillRect(x,yy+3.2,w,.8);if(H(x|0,yy|0,2)<40){q.fillStyle=shd(base,1.08);q.fillRect(x+H(yy|0,x|0,3)%(w-12|1),yy+.6,12,1.4)}}}
 else if(t==='panel'||t==='corr'){q.fillStyle=base;q.fillRect(x,y,w,h);const st=t==='corr'?3:12;for(let xx=x;xx<x+w;xx+=st){q.fillStyle=shd(base,1.14);q.fillRect(xx,y,t==='corr'?1:.8,h);q.fillStyle=shd(base,.85);q.fillRect(xx+(t==='corr'?1.6:11),y,t==='corr'?.8:.8,h)}}
 else if(t==='concrete'){q.fillStyle=base;q.fillRect(x,y,w,h);for(let i=0;i<30;i++){q.fillStyle=i%2?shd(base,.94):shd(base,1.05);q.fillRect(x+H(i,w|0,3)%(w|1),y+H(i,h|0,5)%(h|1),2,1)}}
 else if(t==='curtain'||t==='curtainL'){const light=t==='curtainL';q.fillStyle=light?'#9fb8cf':base;q.fillRect(x,y,w,h);q.fillStyle=lin8(q,x,y,x+w,y+h,light?['#e4f3ff','#a9cbe6','#7aa4c8']:['#6f9cc9','#3a5f8a','#22354f']);q.fillRect(x,y,w,h);
  q.fillStyle='rgba(255,255,255,.22)';q.beginPath();q.moveTo(x+w*.1,y);q.lineTo(x+w*.32,y);q.lineTo(x+w*.08,y+h);q.lineTo(x-w*.14,y+h);q.closePath();q.fill();
  q.fillStyle=light?'rgba(80,95,115,.55)':'rgba(10,20,35,.55)';for(let xx=x;xx<=x+w;xx+=8)q.fillRect(xx-.4,y,.8,h);for(let yy=y;yy<=y+h;yy+=10)q.fillRect(x,yy-.4,w,.8)}
 else{q.fillStyle=base;q.fillRect(x,y,w,h);for(let i=0;i<40;i++){q.fillStyle=i%2?shd(base,.95):shd(base,1.04);q.fillRect(x+H(i,(w|0)+1,3)%(w|1),y+H(i,(h|0)+2,7)%(h|1),1.2,1.2)}}
 q.fillStyle=lin8(q,x,y,x+w,y,['rgba(255,255,255,.14)','rgba(255,255,255,0)','rgba(0,0,0,.10)']);q.fillRect(x,y,w,h)}
// ---------- roofs (seen at 3/4 from the south, light from the top-left) ----------
function roof8(q,c,b,A,rt,W,D,rb){const R=c.roof,rc=c.rc;
 if(R==='flat'||R==='canopy'){const pal=['#8e959e','#a59f96','#6f7783','#b6afa3','#7f8c86','#9c8f86'],mc=(c.rc&&b.type!=='flats'&&b.type!=='officeBlk'&&b.type!=='smallshop'&&b.type!=='hotel'&&b.type!=='warehouse')?rc:pal[(b.v+b.x)%pal.length];
  bQ(q,A-1.5,rt-1.5,W+3,D+3,shd(mc,.5));bQ(q,A,rt,W,D,shd(mc,1.22));bQ(q,A+3.5,rt+3.5,W-7,D-6,mc);
  for(let xx=A+3.5+32;xx<A+W-4;xx+=32)bQ(q,xx,rt+3.5,.7,D-6,'rgba(0,0,0,.10)');for(let yy=rt+3.5+24;yy<rt+D-3;yy+=24)bQ(q,A+3.5,yy,W-7,.7,'rgba(0,0,0,.08)');
  for(let i=0;i<Math.floor(W*D/90);i++){q.fillStyle=i%2?shd(mc,.88):shd(mc,1.1);q.fillRect(A+4+H(i,b.i,3)%(W-8|1),rt+4+H(i,b.i,5)%(D-8|1),1.2,1.2)}
  bQ(q,A+3.5,rt+3.5,W-7,2.2,'rgba(0,0,0,.22)');bQ(q,A+3.5,rt+3.5,2.2,D-6,'rgba(0,0,0,.14)');bQ(q,A,rt,W,1.2,shd(mc,1.45));bQ(q,A,rt,1.2,D,shd(mc,1.3));bQ(q,A+W-1.2,rt,1.2,D,shd(mc,.7));
  if(R==='canopy'){for(let i=0;i<W/16;i++)bQ(q,A+i*16,rb-5,8,5,c.acc||'#c0392b')}}
 else if(R==='gable'||R==='hip'){const ov=5,ry=rt+D*.36,front=lin8(q,0,ry,0,rb+3,[shd(rc,1.06),rc,shd(rc,.8)]);
  if(R==='gable'){q.fillStyle=shd(rc,1.3);q.fillRect(A-ov,rt,W+ov*2,ry-rt);q.fillStyle=front;q.fillRect(A-ov,ry,W+ov*2,rb-ry+4)}
  else{const ins=Math.min(D*.32,W*.25);q.fillStyle=shd(rc,1.3);q.beginPath();q.moveTo(A-ov,rt+2);q.lineTo(A+W+ov,rt+2);q.lineTo(A+W-ins,ry);q.lineTo(A+ins,ry);q.closePath();q.fill();
   q.fillStyle=front;q.beginPath();q.moveTo(A+ins,ry);q.lineTo(A+W-ins,ry);q.lineTo(A+W+ov,rb+4);q.lineTo(A-ov,rb+4);q.closePath();q.fill();
   q.fillStyle=shd(rc,1.12);q.beginPath();q.moveTo(A-ov,rt+2);q.lineTo(A+ins,ry);q.lineTo(A-ov,rb+4);q.closePath();q.fill();q.fillStyle=shd(rc,.72);q.beginPath();q.moveTo(A+W+ov,rt+2);q.lineTo(A+W-ins,ry);q.lineTo(A+W+ov,rb+4);q.closePath();q.fill()}
  // tile rows
  q.save();q.beginPath();q.rect(A-ov,rt,W+ov*2,rb-rt+4);q.clip();for(let yy=ry+3;yy<rb+4;yy+=4.2){q.fillStyle='rgba(0,0,0,.16)';q.fillRect(A-ov,yy,W+ov*2,.9);const off=Math.round((yy-ry)/4.2)%2?3:0;for(let xx=A-ov+off;xx<A+W+ov;xx+=6){q.fillStyle='rgba(0,0,0,.10)';q.fillRect(xx,yy-3.3,.7,3.3)}}
  for(let yy=rt+3;yy<ry;yy+=4.2){q.fillStyle='rgba(0,0,0,.08)';q.fillRect(A-ov,yy,W+ov*2,.8)}q.restore();
  bQ(q,A-ov+(R==='hip'?Math.min(D*.32,W*.25)+ov:0),ry-1.2,W+ov*2-(R==='hip'?2*(Math.min(D*.32,W*.25)+ov):0),2.4,shd(rc,.62));
  bQ(q,A-ov,rb+3,W+ov*2,1.6,shd(rc,.45));
  if(c.chim!==0&&(b.type==='house'||b.type==='townhouse'||b.type==='dorm')){const cx=A+W*.72;bQ(q,cx,ry-14,8,14,'#8c5a44');bQ(q,cx-1,ry-16,10,3,'#5d3b2c');bQ(q,cx+1,ry-13,2,12,'rgba(255,255,255,.18)')}}
 else if(R==='barrel'||R==='barrelGlass'){const gl=R==='barrelGlass';q.fillStyle=gl?lin8(q,0,rt,0,rb,['#e1f2fb','#a8d0e8','#6aa0c4']):lin8(q,0,rt,0,rb,[shd(rc,1.32),rc,shd(rc,.7)]);q.beginPath();q.moveTo(A-2,rb);q.lineTo(A-2,rt+D*.3);q.quadraticCurveTo(A+W/2,rt-D*.18,A+W+2,rt+D*.3);q.lineTo(A+W+2,rb);q.closePath();q.fill();
  q.strokeStyle=gl?'rgba(60,80,100,.55)':'rgba(0,0,0,.18)';q.lineWidth=gl?1.2:.8;for(let xx=A+(gl?10:5);xx<A+W;xx+=gl?14:5){q.beginPath();q.moveTo(xx,rb);q.lineTo(xx,rt+D*.18+Math.abs(xx-A-W/2)/(W/2)*D*.12);q.stroke()}
  if(gl){q.strokeStyle='rgba(60,80,100,.5)';for(let yy=rt+D*.3;yy<rb;yy+=12){q.beginPath();q.moveTo(A,yy);q.lineTo(A+W,yy);q.stroke()}}
  bQ(q,A-3,rb-3,W+6,4,shd(c.wall,.7))}
 else if(R==='wave'){q.fillStyle=lin8(q,0,rt,0,rb,['#e9f7f6','#c7e6e4']);q.fillRect(A,rt+4,W,D-4);q.fillStyle=rc;q.beginPath();q.moveTo(A-4,rb);for(let xx=0;xx<=W+8;xx+=4)q.lineTo(A-4+xx,rb-6-Math.sin(xx/W*Math.PI*2)*5);q.lineTo(A+W+4,rb+2);q.lineTo(A-4,rb+2);q.closePath();q.fill();bQ(q,A,rt+4,W,1.5,'#ffffff')}
 // rooftop kit on flat roofs
 if(R==='flat'){const s=H(b.x,b.y,5),bx=(x,y,w,h,col)=>{q.fillStyle='rgba(15,20,28,.28)';q.fillRect(x+2,y+2,w,h);bQ(q,x-.6,y-.6,w+1.2,h+1.2,shd(col,.45));bQ(q,x,y,w,h,col);bQ(q,x,y,w,1.6,shd(col,1.25));bQ(q,x+w-1.4,y,1.4,h,shd(col,.75))};
  const ac=(x,y)=>{bx(x,y,14,10,'#b9c0ca');q.fillStyle='#3a3f4a';q.beginPath();q.arc(x+7,y+5,3.4,0,7);q.fill();q.strokeStyle='#8d96a8';q.lineWidth=.7;q.beginPath();q.moveTo(x+3.6,y+5);q.lineTo(x+10.4,y+5);q.moveTo(x+7,y+1.6);q.lineTo(x+7,y+8.4);q.stroke()};
  if(c.solar){for(let i=0;i<Math.floor((W-20)/20);i++){bx(A+10+i*20,rt+8,16,Math.min(24,D-18),'#2b3d63');for(let r=0;r<4;r++)bQ(q,A+10+i*20,rt+8+r*6,16,.8,'#6f8fc4')}}
  else if(b.type==='tower'||b.type==='penthouse'||b.type==='glass'){if(W>=120&&D>=60){q.fillStyle='#3b414d';q.beginPath();q.arc(A+W/2,rt+D/2,Math.min(W,D)*.3,0,7);q.fill();q.strokeStyle='#e9e4d8';q.lineWidth=2;q.beginPath();q.arc(A+W/2,rt+D/2,Math.min(W,D)*.24,0,7);q.stroke();q.fillStyle='#f5c400';q.font='800 18px Rubik,Arial';q.textAlign='center';q.fillText('H',A+W/2,rt+D/2+6)}else{bx(A+W*.15,rt+D*.25,W*.3,D*.45,'#5d6470');ac(A+W*.6,rt+D*.3)}
   if(b.type==='penthouse'){bQ(q,A+8,rt+8,W*.45,D*.5,'#3fb2d8');bQ(q,A+8,rt+8,W*.45,2,'#bfeaff');for(let i=0;i<3;i++){bQ(q,A+W*.6+i*9,rt+12,6,10,'#f4f1ea')}}}
  else{const nAC=1+(s%3);for(let i=0;i<nAC;i++)ac(A+W-24-i*18,rt+7+(i%2)*4);
   if(W>90&&s%2==0){bx(A+10,rt+6,22,16,'#cfc8bb');bQ(q,A+18,rt+14,6,8,'#5d4630')}
   if(s%4==1||b.type==='flats'||b.type==='hotel'){const tx=A+W*.42,ty=rt+D*.36;q.fillStyle='rgba(15,20,28,.28)';q.beginPath();q.ellipse(tx+3,ty+11,9,5,0,0,7);q.fill();bQ(q,tx-8,ty,16,10,'#6d7684');q.fillStyle='#8d96a8';q.beginPath();q.ellipse(tx,ty,8,4,0,0,7);q.fill();q.strokeStyle='#5d636e';q.lineWidth=.8;q.stroke();for(const lx of [-6,5])bQ(q,tx+lx,ty+10,1.2,5,'#4a515e')}
   if(s%3==2){for(let i=0;i<3;i++){q.fillStyle='#55606f';q.beginPath();q.arc(A+12+i*7,rt+D-12,2.2,0,7);q.fill();q.fillStyle='#3a3f4a';q.beginPath();q.arc(A+12+i*7,rt+D-12,1.1,0,7);q.fill()}}
   if(b.type==='mall'){for(let i=0;i<3;i++){const sx2=A+30+i*(W-60)/2-14;bQ(q,sx2-1,rt+11,30,D-28,'#5d6470');q.fillStyle=lin8(q,0,rt+12,0,rt+D-18,['#d7efff','#8fc3e6']);q.fillRect(sx2,rt+12,28,D-30);for(let k=sx2;k<sx2+28;k+=7)bQ(q,k,rt+12,.8,D-30,'#5d6470')}}
   if(b.type==='villa'||b.type==='hotel'){const gx=A+W*.52,gw=W*.42;bQ(q,gx,rt+6,gw,D*.6,'#b98a56');for(let k=gx;k<gx+gw;k+=4)bQ(q,k,rt+6,.6,D*.6,'rgba(60,35,15,.35)');for(let i=0;i<4;i++){q.fillStyle=['#2f7a36','#64b25d'][i%2];q.beginPath();q.arc(gx+5+i*(gw-10)/3,rt+10,3.6,0,7);q.fill()}q.fillStyle='#e74c3c';q.beginPath();q.arc(gx+gw*.5,rt+6+D*.32,7,0,7);q.fill();q.fillStyle='#fff';q.beginPath();q.arc(gx+gw*.5,rt+6+D*.32,2,0,7);q.fill()}
   if(b.type==='warehouse'){for(let i=0;i<3;i++)bx(A+20+i*36,rt+8,22,10,'#9fd0ee')}
   if(b.type==='officeBlk'||b.type==='flats'){bQ(q,A+W-14,rt-18,1.4,22,'#55606f');q.fillStyle='#d23';q.beginPath();q.arc(A+W-13.3,rt-18,1.6,0,7);q.fill()}}}}
// ---------- facades ----------
function facade8(q,c,b,A,rb,W,fh,yb){const nm8=b.name,isF=b.kind!=='deco',dx=b.door.x*T8+16;
 texWall8(q,c,A,rb,W,fh);
 // cornice + plinth
 bQ(q,A-1,rb,W+2,3,c.trim||shd(c.wall,.78));bQ(q,A-1,rb+3,W+2,1.5,'rgba(0,0,0,.22)');bQ(q,A,yb-3,W,3,shd(c.wall,.62));
 const gh=Math.min(30,Math.max(24,fh*.45)),upper=fh-gh-4,nf=Math.max(0,Math.floor(upper/20));
 // upper floors
 const win=c.win,fr=c.fr||(c.tex==='brick'?'#f3efe6':'#3d434e');
 for(let f=0;f<nf;f++){const wy=rb+6+f*(upper/Math.max(1,nf))+2,wh=Math.min(13,upper/nf-7);
  if(win==='none'||c.tex==='curtain'||c.tex==='curtainL')break;
  if(win==='band'){bQ(q,A+6,wy,W-12,wh,'#2a3a50');q.fillStyle=lin8(q,0,wy,0,wy+wh,['#cfeeff','#7fb3dc']);q.fillRect(A+7,wy+1,W-14,wh-2);for(let xx=A+7;xx<A+W-7;xx+=10)bQ(q,xx,wy+1,1,wh-2,'#2a3a50');if(b.wins)b.wins.push([A+7,wy+1,W-14,wh-2,.5]);if(c.acc)bQ(q,A,wy+wh+2,W,3,c.acc);continue}
  if(win==='high'){for(let xx=A+8;xx<A+W-14;xx+=16)winGlass8(q,xx,wy,12,6,'#2a3540',b,.4);continue}
  const bw=win==='grid'?14:win==='big'?26:20,n=Math.max(1,Math.floor((W-8)/bw)),gap=(W-n*bw)/2;
  for(let i=0;i<n;i++){const wx=A+gap+i*bw+(bw-(win==='big'?20:win==='tall'?9:10))/2,ww=win==='big'?20:win==='tall'?9:win==='grid'?9:10,whh=win==='tall'?wh+3:wh;
   if(win==='arched')winArch8(q,wx,wy-2,ww,whh+2,c.wall,b,fr);else winStd8(q,wx,wy,ww,whh,c.wall,b,{fr,shut:win==='shutter'?(c.sh||'#2f5d8a'):null,box:win==='shutter'&&(i%2==0)});
   if(c.bal&&(i%2==0)){bQ(q,wx-4,wy+whh+1,ww+8,2,'#c9c3b6');q.fillStyle='rgba(40,45,55,.75)';for(let k=0;k<=ww+8;k+=2.5)q.fillRect(wx-4+k,wy+whh-4,.7,5);bQ(q,wx-4,wy+whh-4.5,ww+8,1,'#3a3f4a')}}}
 if(c.tex==='curtain'||c.tex==='curtainL'){for(let yy=rb+6;yy<yb-gh-4;yy+=10)for(let xx=A+1;xx<A+W-1;xx+=8)if(H(xx|0,yy|0,3)<22&&b.wins)b.wins.push([xx+1,yy+1,6,8,.9])}
 // ground floor
 const gy=yb-gh;bQ(q,A,gy-2,W,2,shd(c.wall,.7));
 const gf=c.gf;
 if(gf==='glass'||gf==='mall'||gf==='showroom'||gf==='lounge'){const gc=gf==='lounge'?['#3a3020','#1b1710']:['#d9f0ff','#5f93c0'];q.fillStyle=lin8(q,0,gy,0,yb,gc);q.fillRect(A+4,gy+2,W-8,gh-5);bQ(q,A+4,gy+2,W-8,1.4,gf==='lounge'?'#d4a72c':'#eef6fc');
  for(let xx=A+4;xx<A+W-4;xx+=gf==='mall'?20:14)bQ(q,xx,gy+2,1.4,gh-5,gf==='lounge'?'#d4a72c':'#c9d3de');if(b.wins)b.wins.push([A+4,gy+2,W-8,gh-5,.85]);
  if(gf==='showroom'){for(let i=0;i<Math.floor((W-20)/52);i++){const cx2=A+16+i*52;carSide8(q,cx2,yb-9,['#c0392b','#16181d','#f5b700','#2e6fb8'][(i+b.v)%4])}}
  if(gf==='mall'){bQ(q,A+W/2-40,gy-14,80,12,'#1b2a49');bQ(q,A+W/2-40,gy-14,80,1.4,'#d4a72c')}
  if(gf==='lounge'){bQ(q,dx-14,yb-1,28,4,'#a3162a');for(const sx of [dx-20,dx+20]){bQ(q,sx-1,yb-12,2,12,'#d4a72c');q.fillStyle='#d4a72c';q.beginPath();q.arc(sx,yb-13,2,0,7);q.fill()}q.strokeStyle='#a3162a';q.lineWidth=2;q.beginPath();q.moveTo(dx-20,yb-10);q.quadraticCurveTo(dx-15,yb-5,dx-11,yb-9);q.moveTo(dx+20,yb-10);q.quadraticCurveTo(dx+15,yb-5,dx+11,yb-9);q.stroke()}}
 else if(gf==='store'||gf==='display'||gf==='cinema'||gf==='kiosk'){const n=Math.max(1,Math.floor((W-30)/40));for(const side of [-1,1]){const ww=Math.min(36,(W/2-22)),wx=side<0?A+6:A+W-6-ww;if(ww<10)continue;bQ(q,wx-1.5,gy+3,ww+3,gh-7,gf==='display'?'#d4a72c':'#2a2f38');q.fillStyle=gf==='display'?lin8(q,0,gy,0,yb,['#3b3f4a','#16171c']):lin8(q,0,gy,0,yb,['#e3f4ff','#79a8d0']);q.fillRect(wx,gy+4,ww,gh-9);if(b.wins)b.wins.push([wx,gy+4,ww,gh-9,.9]);q.fillStyle='rgba(255,255,255,.35)';q.fillRect(wx+2,gy+5,3,gh-11);
   if(gf==='store'&&c.goods!==undefined||b.type==='shop'||b.type==='cafe'||b.type==='restaurant'||b.type==='agency'||b.type==='barber')goods8(q,wx,gy+4,ww,gh-9,c.goods||b.type,b);
   if(gf==='display')(b.disp=b.disp||[]).push([wx,gy+4,ww,gh-9])}
  if(c.awn){const ay=gy-6,aw=W-6;for(let i=0;i<Math.ceil(aw/8);i++){q.fillStyle=i%2?c.awn[1]:c.awn[0];q.fillRect(A+3+i*8,ay,Math.min(8,A+3+aw-(A+3+i*8)),7);q.beginPath();q.arc(A+7+i*8,ay+7,4,0,Math.PI);q.fill()}bQ(q,A+3,ay-1,aw,1.4,shd(c.awn[0],.6));q.fillStyle='rgba(0,0,0,.18)';q.fillRect(A+3,ay+11,aw,2)}
  if(gf==='cinema'){bQ(q,A+10,gy-20,W-20,16,'#f7e8b6');bQ(q,A+10,gy-20,W-20,2,'#d4a72c');(b.bulbs=[]);for(let xx=A+12;xx<A+W-10;xx+=5){b.bulbs.push([xx,gy-21.5]);b.bulbs.push([xx,gy-3.5])}q.fillStyle='#7a2232';q.font='800 9px Rubik,Arial';q.textAlign='center';q.fillText('CINEMA · GOAL!',A+W/2,gy-9);for(const px2 of [A+12,A+W-34])bQ(q,px2,gy+4,22,gh-10,'#1b1e25')}
  if(gf==='kiosk'){for(let i=0;i<6;i++){q.fillStyle=['#ffd24a','#39ff88','#ff6b9a','#3ac0ff','#fff','#c77dff'][i];q.beginPath();q.ellipse(A+8+H(i,b.i,3)%(W-16),rb+8+H(i,b.i,7)%(fh-16),6+i%3*3,3,i,0,7);q.fill()}bQ(q,A+6,gy+4,W-12,gh-12,'#2a2f38');for(let i=0;i<5;i++)bQ(q,A+6,gy+5+i*3.6,W-12,1,'#5b6470')}}
 else if(gf==='portico'){bQ(q,dx-34,gy-10,68,4,c.trim);q.fillStyle=c.trim;q.beginPath();q.moveTo(dx-38,gy-10);q.lineTo(dx,gy-28);q.lineTo(dx+38,gy-10);q.closePath();q.fill();q.fillStyle=shd(c.trim,.85);q.beginPath();q.moveTo(dx-30,gy-11);q.lineTo(dx,gy-24);q.lineTo(dx+30,gy-11);q.closePath();q.fill();
  const cc=clubCols();q.fillStyle=cc[0];q.beginPath();q.arc(dx,gy-16,5,0,7);q.fill();bQ(q,dx-1,gy-20,2,8,cc[1]);
  for(const ox of [-28,-15,15,28]){bQ(q,dx+ox-3,gy-6,6,gh+4,'#f6f0e2');bQ(q,dx+ox+1.5,gy-6,1.5,gh+4,'rgba(0,0,0,.12)');bQ(q,dx+ox-4,gy-7,8,2,'#e2d9c5');bQ(q,dx+ox-4,yb-4,8,3,'#e2d9c5')}
  bQ(q,dx-36,yb-3,72,3,'#d9d0bd');for(const sx of [A+10,A+W-36])winArch8(q,sx,gy+2,22,gh-8,c.wall,b,c.fr)}
 else if(gf==='open'){bQ(q,A+4,gy+2,W-8,gh-4,'rgba(40,30,20,.55)');for(let i=0;i<=W/22;i++)bQ(q,A+4+i*((W-12)/Math.max(1,Math.floor(W/22))),gy-4,4,gh+2,c.wall==='#fafafa'?'#e9e9e9':shd(c.wall,.8));
  if(b.type==='pavilion'){for(let r=0;r<3;r++)bQ(q,A+8,gy+6+r*6,W-16,3,['#c0392b','#e9e9e9','#c0392b'][r])}else{for(let i=0;i<2;i++){bQ(q,A+12+i*(W-40),yb-12,16,4,'#8b5a2b');bQ(q,A+14+i*(W-40),yb-8,2,6,'#5d3b1c')}}}
 else if(gf==='roller'){for(let i=0;i<Math.floor((W-10)/34);i++){const rx=A+8+i*34;bQ(q,rx,gy+3,28,gh-3,'#7a858f');for(let k=0;k<gh-3;k+=3)bQ(q,rx,gy+3+k,28,1,'#66717b')}}
 else if(gf==='arch'){q.fillStyle='#efe2c8';q.beginPath();q.arc(dx,gy+10,22,Math.PI,0);q.fill();q.fillStyle=lin8(q,0,gy,0,yb,['#d9f0ff','#5f93c0']);q.beginPath();q.arc(dx,gy+10,19,Math.PI,0);q.rect(dx-19,gy+10,38,gh-10);q.fill();for(const ox of [-40,40])winArch8(q,dx+ox-9,gy+2,18,gh-6,c.wall,b,c.trim)}
 else if(gf==='house'){const sx=dx<A+W/2?A+W-26:A+8;winStd8(q,sx,gy+5,16,12,c.wall,b,{fr:'#ffffff',shut:c.sh,box:1,lit:.6});bQ(q,dx-11,yb-3,22,3,'#bdb5a6');bQ(q,dx-9,gy-1,18,2,'#ffffff')}
 else{const n=Math.max(1,Math.floor(W/30));for(let i=0;i<n;i++){const wx=A+(W/n)*(i+.5)-8;if(Math.abs(wx+8-dx)<20)continue;winStd8(q,wx,gy+5,16,12,c.wall,b,{fr})}}
 // the doorway (doors themselves are animated live)
 const isDeco=b.kind==='deco';
 bQ(q,dx-12,yb-29,24,29,shd(c.wall,.55));bQ(q,dx-10,yb-27,20,27,isDeco?'#4a3020':'#141820');
 if(isDeco){if(b.type==='house'||b.type==='townhouse'||b.type==='school'||b.type==='dorm'){bQ(q,dx-10,yb-27,20,27,['#7a2f2f','#2f5d8a','#2f6b46','#5d3b1c'][b.v%4]);for(const oy of [4,15])bQ(q,dx-7,yb-27+oy,14,8,'rgba(0,0,0,.15)');q.fillStyle='#ffd24a';q.beginPath();q.arc(dx+6,yb-13,1.2,0,7);q.fill()}else{q.fillStyle=lin8(q,0,yb-27,0,yb,['#bfe3ff','#3f6f9e']);q.fillRect(dx-10,yb-27,20,27);bQ(q,dx-.5,yb-27,1,27,'#d7dde5')}}
 bQ(q,dx-14,yb-31,28,2.5,shd(c.wall,.5));bQ(q,dx-12,yb-2,24,2,'#d9d4c9');
 // facility sign
 if(isF&&nm8){const label=tr(nm8),fs=8.5;q.font=`800 ${fs}px Rubik,"Segoe UI",Arial`;const tw0=Math.min(W-14,q.measureText(label).width+18),sy=gy-(c.awn?20:12),sx=dx-tw0/2,cc=b.col;
  q.fillStyle='rgba(0,0,0,.3)';q.fillRect(sx+1,sy+1.5,tw0,12);q.fillStyle='#16181e';q.fillRect(sx,sy,tw0,12);bQ(q,sx,sy,tw0,1.4,shd(cc,1.3));bQ(q,sx,sy,3,12,cc);bQ(q,sx+tw0-3,sy,3,12,cc);
  q.fillStyle='#fff6dc';q.textAlign='center';q.direction=HE.test(label)?'rtl':'ltr';q.fillText(label,dx,sy+9.2);b.sign=[sx,sy,tw0,12]}}
function goods8(q,x,y,w,h,kind,b){const n=Math.max(1,Math.floor(w/9));for(let i=0;i<n;i++){const gx=x+3+i*((w-6)/n),gy=y+h-6;
 if(kind==='shop'){if(i%2){q.fillStyle='#fff';q.beginPath();q.arc(gx+3,gy,3,0,7);q.fill();q.fillStyle='#222';q.beginPath();q.arc(gx+3,gy,1.1,0,7);q.fill()}else{shirt8(q,gx+3,gy-10,['#c0392b','#2e6fb8','#f5b700','#1f9d55'][i%4],'#fff',.9)}}
 else if(kind==='bakery'||kind==='pizza'||kind==='deli'){q.fillStyle=['#d9a05b','#c47f3c','#f0c27b'][i%3];q.beginPath();q.ellipse(gx+3,gy+1,3.5,2.2,0,0,7);q.fill()}
 else if(kind==='books'){for(let k=0;k<3;k++)bQ(q,gx+k*2,gy-6,1.6,7,['#c0392b','#2e6fb8','#f5c400','#1f9d55'][(i+k)%4])}
 else if(kind==='flowers'){q.fillStyle='#2f7a36';q.fillRect(gx+2,gy-3,1,5);q.fillStyle=['#ff6b9a','#ffd24a','#fff','#c77dff'][i%4];q.beginPath();q.arc(gx+2.5,gy-4,2.4,0,7);q.fill()}
 else if(kind==='tech'){bQ(q,gx,gy-6,6,8,'#1b1e25');bQ(q,gx+.8,gy-5,4.4,5.6,['#3ac0ff','#39ff88','#ff6b9a'][i%3])}
 else if(kind==='cafe'||kind==='restaurant'){bQ(q,gx+1,gy-2,5,4,'#f7efe0');q.fillStyle='#6b4423';q.fillRect(gx+2,gy-1.5,3,1.5)}
 else if(kind==='agency'){q.fillStyle='#f7efe0';q.fillRect(gx,gy-6,7,6);q.fillStyle='#c0392b';q.beginPath();q.moveTo(gx-1,gy-6);q.lineTo(gx+3.5,gy-9);q.lineTo(gx+8,gy-6);q.fill()}
 else if(kind==='barber'){q.fillStyle='#e9ecf0';q.beginPath();q.ellipse(gx+3,gy-4,3,4,0,0,7);q.fill();q.fillStyle='#5a3a1c';q.beginPath();q.ellipse(gx+3,gy-6.5,3,1.8,0,0,7);q.fill()}
 else if(kind==='icecream'){q.fillStyle='#e8c07a';q.beginPath();q.moveTo(gx+1,gy-3);q.lineTo(gx+5,gy-3);q.lineTo(gx+3,gy+2);q.fill();q.fillStyle=['#ff9fc0','#fff','#9fe2b8'][i%3];q.beginPath();q.arc(gx+3,gy-4,2.4,0,7);q.fill()}
 else{bQ(q,gx,gy-5,6,6,['#c0392b','#2e6fb8','#f5c400','#7a4fb8'][i%4])}}}
function shirt8(q,x,y,c1,c2,s){s=s||1;q.save();q.translate(x,y);q.scale(s,s);q.fillStyle=c1;q.beginPath();q.moveTo(-4,0);q.lineTo(-1.5,-1);q.quadraticCurveTo(0,.6,1.5,-1);q.lineTo(4,0);q.lineTo(5.5,3);q.lineTo(3.5,3.8);q.lineTo(3.5,9);q.lineTo(-3.5,9);q.lineTo(-3.5,3.8);q.lineTo(-5.5,3);q.closePath();q.fill();q.strokeStyle='rgba(0,0,0,.45)';q.lineWidth=.6;q.stroke();q.fillStyle=c2;q.fillRect(-.6,0,1.2,9);q.restore()}
function carSide8(q,x,y,c){q.fillStyle='rgba(0,0,0,.25)';q.beginPath();q.ellipse(x+20,y+2,22,3,0,0,7);q.fill();q.fillStyle=c;q.beginPath();q.moveTo(x,y);q.lineTo(x,y-6);q.quadraticCurveTo(x+8,y-8,x+12,y-12);q.lineTo(x+28,y-12);q.quadraticCurveTo(x+34,y-8,x+40,y-6);q.lineTo(x+40,y);q.closePath();q.fill();q.fillStyle='#bfe3ff';q.fillRect(x+14,y-11,6,5);q.fillRect(x+22,y-11,6,5);q.fillStyle='#16181d';q.beginPath();q.arc(x+9,y,3.5,0,7);q.arc(x+31,y,3.5,0,7);q.fill();q.fillStyle='#9aa1ad';q.beginPath();q.arc(x+9,y,1.5,0,7);q.arc(x+31,y,1.5,0,7);q.fill()}
// ---------- special landmarks ----------
function spTower8(q,b,A,W,yb,rt,D,c){const fh=b.hp,rb=yb-fh;roof8(q,Object.assign({},c,{roof:'flat',rc:'#4b525e'}),b,A,rt,W,D,rb);texWall8(q,{tex:'curtain',wall:c.wall},A,rb,W,fh);bQ(q,A,rb,3,fh,'rgba(255,255,255,.25)');bQ(q,A+W-4,rb,4,fh,'rgba(0,0,0,.25)');
 for(let yy=rb+6;yy<yb-30;yy+=10)for(let xx=A+1;xx<A+W-1;xx+=8)if(H(xx|0,yy|0,3)<26)b.wins.push([xx+1,yy+1,6,8,.9]);
 for(let yy=rb+40;yy<yb-30;yy+=40)bQ(q,A,yy,W,2,'#9fb3c8');const gy=yb-26;bQ(q,A,gy-2,W,28,'#1d2533');q.fillStyle=lin8(q,0,gy,0,yb,['#bfe3ff','#4f7fae']);q.fillRect(A+4,gy+2,W-8,22);bQ(q,b.door.x*T8+4,yb-26,24,26,'#141820');bQ(q,b.door.x*T8+4,yb-26,24,2,'#d4a72c');
 q.fillStyle='#e74c3c';q.beginPath();q.arc(A+W-8,rt-6,2.2,0,7);q.fill();bQ(q,A+W-9,rt-6,2,10,'#55606f');b.beacon=[A+W-8,rt-6]}
function spClock8(q,b,A,W,yb){const fh=b.hp,top=yb-fh,cx=A+W/2;q.fillStyle=lin8(q,A,0,A+W,0,['#e2d3b4','#cbb994','#a99872']);q.fillRect(A+6,top,W-12,fh);for(let yy=top+8;yy<yb;yy+=7)bQ(q,A+6,yy,W-12,.8,'rgba(0,0,0,.12)');
 q.fillStyle='#5b6b80';q.beginPath();q.moveTo(A+2,top+2);q.lineTo(cx,top-46);q.lineTo(A+W-2,top+2);q.closePath();q.fill();q.fillStyle='#76879d';q.beginPath();q.moveTo(A+2,top+2);q.lineTo(cx,top-46);q.lineTo(cx,top+2);q.closePath();q.fill();bQ(q,cx-.8,top-58,1.6,14,'#d4a72c');
 bQ(q,A+2,top,W-4,6,'#efe6d2');q.fillStyle='#f7f3ea';q.beginPath();q.arc(cx,top+22,13,0,7);q.fill();q.strokeStyle='#3b3f48';q.lineWidth=1.5;q.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;bQ(q,cx+Math.cos(a)*10.5-.6,top+22+Math.sin(a)*10.5-.6,1.2,1.2,'#3b3f48')}b.clock=[cx,top+22];
 for(let k=0;k<3;k++)winArch8(q,cx-4,top+44+k*26,8,14,'#cbb994',b,'#efe6d2');bQ(q,cx-8,yb-24,16,24,'#3a2a1a');bQ(q,A+4,yb-3,W-8,3,'#8f8270')}
function spCtower8(q,b,A,W,yb){const top=yb-b.hp,cx=A+W/2;q.fillStyle=lin8(q,cx-12,0,cx+12,0,['#eef2f6','#cfd7e0','#aab4c0']);q.fillRect(cx-11,top+24,22,b.hp-24);for(let yy=top+30;yy<yb;yy+=12)bQ(q,cx-11,yy,22,1,'rgba(0,0,0,.08)');
 q.fillStyle='#3d4a6b';q.beginPath();q.moveTo(cx-22,top+24);q.lineTo(cx+22,top+24);q.lineTo(cx+17,top+4);q.lineTo(cx-17,top+4);q.closePath();q.fill();q.fillStyle=lin8(q,0,top+6,0,top+22,['#bfe8ff','#5d9ac4']);q.fillRect(cx-16,top+8,32,13);for(let xx=cx-16;xx<cx+16;xx+=8)bQ(q,xx,top+8,1,13,'#3d4a6b');bQ(q,cx-19,top,38,5,'#2b3550');bQ(q,cx-.7,top-14,1.4,14,'#9aa1ad');b.beacon=[cx,top-15];b.wins.push([cx-16,top+8,32,13,1])}
function spLight8(q,b,A,W,yb){const top=yb-b.hp,cx=A+W/2;for(let i=0;i<6;i++){q.fillStyle=i%2?'#d63a2f':'#f7f4ee';const y0=top+26+i*((b.hp-30)/6),y1=y0+(b.hp-30)/6,w0=9+i*.9,w1=9+(i+1)*.9;q.beginPath();q.moveTo(cx-w0,y0);q.lineTo(cx+w0,y0);q.lineTo(cx+w1,y1);q.lineTo(cx-w1,y1);q.closePath();q.fill()}
 q.fillStyle='rgba(0,0,0,.18)';q.fillRect(cx+3,top+26,7,b.hp-30);bQ(q,cx-12,top+20,24,6,'#2a2f38');q.fillStyle='#fff6c8';q.fillRect(cx-8,top+8,16,12);bQ(q,cx-8,top+8,16,12,'rgba(255,240,180,.8)');q.fillStyle='#2a2f38';q.beginPath();q.moveTo(cx-10,top+8);q.lineTo(cx,top-4);q.lineTo(cx+10,top+8);q.closePath();q.fill();b.beacon=[cx,top+14];
 q.fillStyle='#6f6a62';q.beginPath();q.ellipse(cx,yb-2,30,10,0,0,7);q.fill();q.fillStyle='#8a847a';q.beginPath();q.ellipse(cx-4,yb-5,24,7,0,0,7);q.fill()}
function spStadium8(q,b){const e=b.el,cx=e.cx*T8,cy=e.cy*T8,rx=e.rx*T8,ry=e.ry*T8,hh=46,cc=clubCols();
 // outer wall (front half visible)
 q.fillStyle=shd(cc[0],.62);q.beginPath();q.ellipse(cx,cy,rx,ry,0,0,Math.PI);q.lineTo(cx-rx,cy-hh);q.ellipse(cx,cy-hh,rx,ry,0,Math.PI,0,true);q.closePath();q.fill();
 q.save();q.beginPath();q.ellipse(cx,cy,rx,ry,0,0,Math.PI);q.lineTo(cx-rx,cy-hh);q.ellipse(cx,cy-hh,rx,ry,0,Math.PI,0,true);q.closePath();q.clip();
 for(let a=0;a<=Math.PI;a+=Math.PI/40){const x=cx+Math.cos(a)*rx;q.fillStyle=Math.round(a*40/Math.PI)%2?shd(cc[0],.55):shd(cc[0],.75);q.fillRect(x-4,cy-hh-ry,8,ry*2+hh)}
 q.fillStyle='rgba(255,255,255,.85)';for(let a=.08;a<Math.PI;a+=Math.PI/22){const x=cx+Math.cos(a)*rx*.995,y=cy+Math.sin(a)*ry;q.fillRect(x-1.5,y-hh+6,3,hh-12)}
 q.fillStyle='#14161b';q.beginPath();q.ellipse(cx,cy-hh*.62,rx+2,ry+2,0,.05,Math.PI-.05);q.ellipse(cx,cy-hh*.48,rx+2,ry+2,0,Math.PI-.05,.05,true);q.closePath();q.fill();b.led=[cx,cy+ry-hh*.55,rx*1.1];
 q.fillStyle='rgba(0,0,0,.22)';q.fillRect(cx-rx,cy-hh,rx*2,10);q.restore();
 // rim + roof canopy ring
 q.fillStyle='#d9dee5';q.beginPath();q.ellipse(cx,cy-hh,rx,ry,0,0,7);q.fill();q.fillStyle='#f4f6f8';q.beginPath();q.ellipse(cx,cy-hh,rx-3,ry-3,0,0,7);q.fill();
 // stands: tiers + crowd
 const tiers=7;for(let t=0;t<tiers;t++){const k=1-t*.055;q.fillStyle=t%2?shd(cc[0],.8):shd(cc[0],.95);q.beginPath();q.ellipse(cx,cy-hh+t*3.2,rx*k*.97,ry*k*.94,0,0,7);q.fill()}
 const pal=[cc[0],cc[1],'#ffffff',shd(cc[0],1.3),'#ffd24a','#e8e8e8','#2b2f39'];for(let t=0;t<tiers*3;t++){const k=.97-t*.0185,yy=cy-hh+t*1.07;for(let a=0;a<Math.PI*2;a+=.028+t*.0007){const px=cx+Math.cos(a)*rx*k*.97,py=yy+Math.sin(a)*ry*k*.94;q.fillStyle=pal[H(px|0,py|0,4)%pal.length];q.fillRect(px-1,py-1,2,1.6)}}
 // pitch
 const pw=rx*1.08,ph=ry*.86,px0=cx-pw/2,py0=cy-hh*.45-ph/2;q.fillStyle='#2f7d38';q.beginPath();q.ellipse(cx,cy-hh*.45,rx*.62,ry*.56,0,0,7);q.fill();q.fillStyle='#3a8f3f';q.fillRect(cx-rx*.58,cy-hh*.45-ry*.47,rx*1.16,ry*.94);
 q.fillStyle='#3d9a45';q.fillRect(px0,py0,pw,ph);for(let i=0;i<10;i++)if(i%2)bQ(q,px0+i*pw/10,py0,pw/10,ph,'#46a64f');
 q.strokeStyle='rgba(255,255,255,.9)';q.lineWidth=1.6;q.strokeRect(px0+4,py0+4,pw-8,ph-8);q.beginPath();q.moveTo(cx,py0+4);q.lineTo(cx,py0+ph-4);q.stroke();q.beginPath();q.arc(cx,py0+ph/2,ph*.16,0,7);q.stroke();q.strokeRect(px0+4,py0+ph*.25,pw*.12,ph*.5);q.strokeRect(px0+pw-4-pw*.12,py0+ph*.25,pw*.12,ph*.5);
 bQ(q,px0+1,py0+ph/2-9,3,18,'#fff');bQ(q,px0+pw-4,py0+ph/2-9,3,18,'#fff');b.pitch=[px0,py0,pw,ph];const adc=[cc[0],'#ffd24a','#2e6fb8','#c0392b','#ffffff',cc[1]];for(let i=0;i<18;i++){bQ(q,px0-6+i*(pw+12)/18,py0-8,(pw+12)/18-1,4,adc[i%adc.length]);bQ(q,px0-6+i*(pw+12)/18,py0+ph+4,(pw+12)/18-1,4,adc[(i+3)%adc.length])}
 // translucent roof membrane on the far side
 q.fillStyle='rgba(240,244,248,.82)';q.beginPath();q.ellipse(cx,cy-hh-2,rx-2,ry-2,0,Math.PI*1.02,Math.PI*1.98);q.ellipse(cx,cy-hh+22,rx*.84,ry*.7,0,Math.PI*1.98,Math.PI*1.02,true);q.closePath();q.fill();
 q.strokeStyle='rgba(150,160,175,.6)';q.lineWidth=1;for(let a=Math.PI*1.06;a<Math.PI*1.95;a+=.12){q.beginPath();q.moveTo(cx+Math.cos(a)*(rx-3),cy-hh+Math.sin(a)*(ry-3));q.lineTo(cx+Math.cos(a)*rx*.84,cy-hh+22+Math.sin(a)*ry*.7);q.stroke()}
 // floodlight towers
 b.floods=[];for(const a of [Math.PI*1.18,Math.PI*1.82,Math.PI*.22,Math.PI*.78]){const fx=cx+Math.cos(a)*(rx+6),fy=cy+Math.sin(a)*(ry+4),front=Math.sin(a)>0,h2=front?96:120;bQ(q,fx-2,fy-h2,4,h2-(front?0:hh),'#5d636e');for(let yy=fy-h2;yy<fy-(front?0:hh);yy+=6){q.strokeStyle='#4a505b';q.lineWidth=.8;q.beginPath();q.moveTo(fx-2,yy);q.lineTo(fx+2,yy+6);q.stroke()}
  bQ(q,fx-13,fy-h2-11,26,12,'#2a2f38');for(let i=0;i<5;i++)for(let j=0;j<2;j++)bQ(q,fx-11+i*5,fy-h2-9+j*5,4,4,'#fff6d0');b.floods.push([fx,fy-h2-5])}
 // main gate
 const gx=b.door.x*T8+16,gy=(b.door.y+1)*T8;q.fillStyle='#14161b';q.beginPath();q.moveTo(gx-30,gy);q.lineTo(gx-30,gy-34);q.quadraticCurveTo(gx,gy-58,gx+30,gy-34);q.lineTo(gx+30,gy);q.closePath();q.fill();q.strokeStyle='#d4a72c';q.lineWidth=3;q.beginPath();q.moveTo(gx-30,gy);q.lineTo(gx-30,gy-34);q.quadraticCurveTo(gx,gy-58,gx+30,gy-34);q.lineTo(gx+30,gy);q.stroke();
 bQ(q,gx-14,gy-32,28,32,'#141820');const label=(tr('STADIUM')+' · '+nm(mine().n)).toUpperCase();q.font='800 10px Rubik,Arial';const tw0=q.measureText(label).width+24;bQ(q,gx-tw0/2,gy-74,tw0,15,'#16181e');bQ(q,gx-tw0/2,gy-74,tw0,2,'#d4a72c');q.fillStyle='#fff6dc';q.textAlign='center';q.direction=HE.test(label)?'rtl':'ltr';q.fillText(label,gx,gy-63);
 b.wins=[]}
// ---------- sprite orchestration ----------
function bGeo8(b){const c=bCfg(b),A=b.x*T8,W=b.w*T8,yb=(b.y+b.h)*T8,D=b.h*T8,fh=b.hp,k={flat:.56,canopy:.5,gable:.72,hip:.68,barrel:.62,barrelGlass:.62,wave:.56}[c.roof]||.6,rd=Math.round(D*k),rb=yb-fh,rt=rb-rd;return{c,A,W,yb,D,fh,rd,rb,rt}}
function bBox8(b){if(b.type==='stadium'){const e=b.el;return[(e.cx-e.rx)*T8-30,(e.cy-e.ry)*T8-200,e.rx*2*T8+60,e.ry*2*T8+210]}const G=bGeo8(b),top=Math.min(G.rt,b.y*T8-b.hp)-(b.type==='clocktower'?70:b.type==='lighthouse'||b.type==='ctower'?30:46);return[b.x*T8-28,top,b.w*T8+56,(b.y+b.h)*T8+6-top]}
function paintBld8(b){const [sx,sy,sw,sh]=bBox8(b),cv=document.createElement('canvas');cv.width=Math.ceil(sw*RS8);cv.height=Math.ceil(sh*RS8);const q=cv.getContext('2d');q.setTransform(RS8,0,0,RS8,-sx*RS8,-sy*RS8);b.wins=[];b.disp=[];
 const G=bGeo8(b),c=G.c,A=G.A,W=G.W,yb=G.yb,rb=G.rb,rt=G.rt,D=G.rd;
 if(b.type==='stadium')spStadium8(q,b);else if(b.type==='tower'||b.type==='penthouse'&&0)spTower8(q,b,A,W,yb,rt,D,c);else if(b.type==='clocktower')spClock8(q,b,A,W,yb);else if(b.type==='ctower')spCtower8(q,b,A,W,yb);else if(b.type==='lighthouse')spLight8(q,b,A,W,yb);
 else{roof8(q,c,b,A,rt,W,D,rb);facade8(q,c,b,A,rb,W,b.hp,yb);
  if(c.clock){const cx=A+W/2,cy2=rt+D*.2;q.fillStyle=c.trim||'#efe6d2';q.beginPath();q.moveTo(cx-16,rb+2);q.lineTo(cx,rt-14);q.lineTo(cx+16,rb+2);q.closePath();q.fill();q.fillStyle='#f7f3ea';q.beginPath();q.arc(cx,rb-14,7,0,7);q.fill();q.strokeStyle='#3b3f48';q.lineWidth=1;q.stroke();b.clock=[cx,rb-14]}
  if(b.type==='penthouse'){bQ(q,A,rb,2,b.hp,'#d4a72c');bQ(q,A+W-2,rb,2,b.hp,'#d4a72c');for(let yy=rb+20;yy<yb-30;yy+=20)bQ(q,A,yy,W,1.5,'#d4a72c')}
  if(b.type==='hq'){b.flags=[[A+8,rt-4],[A+W-8,rt-4]];bQ(q,A+7,rt-34,1.6,32,'#d9dde3');bQ(q,A+W-9,rt-34,1.6,32,'#d9dde3')}
  if(b.type==='gym'||b.type==='clubhouse'){const cx=A+W/2,cy2=rb+12;if(b.type==='gym'){bQ(q,cx-13,cy2-2,26,4,'#2a2f38');bQ(q,cx-16,cy2-6,5,12,'#2a2f38');bQ(q,cx+11,cy2-6,5,12,'#2a2f38')}else{const cc=clubCols();q.fillStyle=cc[0];q.beginPath();q.arc(cx,rb+14,8,0,7);q.fill();bQ(q,cx-1.4,rb+7,2.8,14,cc[1])}}
  if(b.type==='clinic'||b.type==='spa'){const cx=A+W/2;bQ(q,cx-8,rb+5,16,16,'#ffffff');bQ(q,cx-2.5,rb+7,5,12,b.type==='spa'?'#2e8b8b':'#e53935');bQ(q,cx-6,rb+10.5,12,5,b.type==='spa'?'#2e8b8b':'#e53935')}
  if(b.type==='barber')b.pole=[A+W-8,yb-30];
  if(b.type==='terminal'||b.type==='hotel'){const cc=c.canopy||'#3d4a6b',dx=b.door.x*T8+16;bQ(q,dx-28,yb-36,56,6,cc);bQ(q,dx-28,yb-36,56,1.5,shd(cc,1.4));bQ(q,dx-26,yb-30,2,30,'#9aa1ad');bQ(q,dx+24,yb-30,2,30,'#9aa1ad');if(b.type==='terminal'&&W>200){b.flags=[[A+20,rt+8],[A+W-20,rt+8]];bQ(q,A+19,rt-22,1.6,30,'#d9dde3');bQ(q,A+W-21,rt-22,1.6,30,'#d9dde3')}}
  if(b.type==='campus')b.flags=[[A+12,rt-2]];}
 return{cv,sx,sy,sw,sh}}
function bSprite8(b){const k=b.i+'|'+S.lang+'|'+(b.type==='stadium'||b.type==='hq'||b.type==='clubhouse'?nm(mine().n):'');let e=BSPR.get(b.i);if(e&&e.k===k){e.u=tick;return e}e=Object.assign(paintBld8(b),{k,u:tick});BSPR.set(b.i,e);if(BSPR.size>34){let ok=null,ou=1e12;for(const [kk,v] of BSPR)if(v.u<ou&&kk!==b.i){ou=v.u;ok=kk}if(ok!=null)BSPR.delete(ok)}return e}
