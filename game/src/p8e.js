// ===================== v8 characters: illustrated vector actors, posed animation frames, cached per resolution =====================
var ACTC=new Map(),OUTL='rgba(30,24,38,.92)';
function key8(o){return [o.sk,o.hc,o.hs|0,o.br|0,o.bd==null?1:o.bd,o.ht||1,o.out||'kit',o.sh,o.c2,o.pat||'',o.pa,o.so||'',o.bt,o.cas?1:0,o.num||'',o.tier|0,o.wr||'',o.hd||'',o.gl||'',o.cap||'',o.wa||'',o.ch||'',o.arm?1:0,o.gk||'',o.acc||'',o.hat||'',o.age||'',o.crest||''].join('|')}
function pth(q,pts){q.beginPath();q.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)q.lineTo(pts[i],pts[i+1]);q.closePath()}
function fo(q,fill,lw){q.fillStyle=fill;q.fill();if(lw!==0){q.lineWidth=lw||.9;q.strokeStyle=OUTL;q.stroke()}}
function capsule(q,x0,y0,x1,y1,r,fill,lw){const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a)*r,ny=Math.cos(a)*r;q.beginPath();q.moveTo(x0+nx,y0+ny);q.lineTo(x1+nx,y1+ny);q.arc(x1,y1,r,a+Math.PI/2,a-Math.PI/2,true);q.lineTo(x0-nx,y0-ny);q.arc(x0,y0,r,a-Math.PI/2,a+Math.PI/2,true);q.closePath();fo(q,fill,lw)}
// pose table: returns limb parameters for a frame
// cycles are 8 frames (f&7); one stride = contact, recoil, passing, high point, for each leg
function cyc8(P,f,amp,knee,arm,bobA,lean,side){const t=(f&7)/8*Math.PI*2,s=Math.sin(t);P.lL=s*amp;P.rL=-s*amp;P.lA=-s*arm;P.rA=s*arm;
 P.lK=Math.max(0,-Math.sin(t+.9))*knee+knee*.12;P.rK=Math.max(0,Math.sin(t+.9))*knee+knee*.12;P.bob=-Math.abs(Math.cos(t))*bobA+bobA*.35;P.lean=side?lean:0}
function pose8(st,f,side){const P={bob:0,lean:0,jump:0,lA:0,rA:0,lL:0,rL:0,lK:0,rK:0,lUp:0,rUp:0,face:'n',arms:'side'};
 if(st==='walk')cyc8(P,f,21,14,19,.8,1.5,side);
 else if(st==='run'){cyc8(P,f,38,40,32,1.9,7,side);P.arms='bent'}
 else if(st==='sprint'){cyc8(P,f,47,52,40,2.4,12,side);P.arms='bent'}
 else if(st==='drib'){cyc8(P,f,28,30,22,1.4,9,side);P.arms='bent'}
 else if(st==='idle'){const k=f&3;P.bob=k===1?-.35:k===3?-.18:0;if(k===2)P.face='b';P.lA=k===3?3:0;P.rA=k===3?-3:0}
 else if(st==='kick'){if(f===0){P.rL=-42;P.rK=48;P.lA=24;P.rA=-26;P.lean=-3}else if(f===1){P.rL=62;P.rK=4;P.lA=-30;P.rA=30;P.lean=4}else{P.rL=84;P.rK=0;P.lA=-38;P.rA=38;P.lean=6;P.bob=-1}}
 else if(st==='pass'){if(f===0){P.rL=-26;P.rK=30;P.lA=14;P.rA=-16}else if(f===1){P.rL=34;P.rK=8;P.lA=-18;P.rA=18;P.lean=2}else{P.rL=22;P.rK=4;P.lA=-10;P.rA=10}}
 else if(st==='shoot'){if(f===0){P.rL=-52;P.rK=72;P.lA=30;P.rA=-34;P.lean=-6;P.arms='out'}else if(f===1){P.rL=8;P.rK=42;P.lA=10;P.rA=-10;P.lean=-2}else if(f===2){P.rL=74;P.rK=2;P.lA=-34;P.rA=34;P.lean=7}else{P.rL=96;P.rK=0;P.lL=-6;P.lA=-40;P.rA=40;P.lean=9;P.bob=-1.2;P.jump=1.5}}
 else if(st==='tackle'){P.lean=10;P.rL=56;P.rK=8;P.lL=-12;P.lK=24;P.arms='out';P.bob=1;P.face=f?'s':'n'}
 else if(st==='slide'){P.lean=-26;P.lL=74;P.lK=6;P.rL=58;P.rK=34;P.bob=6.5;P.arms='back';P.face='s'}
 else if(st==='head'){P.jump=f?3:5.5;P.lean=f?8:-5;P.arms='out';P.lL=-8;P.rL=10;P.lK=24;P.rK=24}
 else if(st==='cel'){P.arms='up';P.face='h';P.jump=f===1?6:0;P.lL=f===1?-12:0;P.rL=f===1?14:0;P.lK=f===1?20:0;P.rK=f===1?20:0}
 else if(st==='celw'){cyc8(P,f*2,30,32,0,1.4,9,side);P.arms='wing';P.face='h'} // aeroplane run
 else if(st==='celf'){P.arms='fist';P.face='h';P.jump=f?3.5:0;P.lK=f?16:0;P.rK=f?16:0}
 else if(st==='kneel'){P.kneel=1;P.arms='up';P.face='h';P.lean=-8;P.bob=4.4}
 else if(st==='award'){P.arms='trophy';P.face='h';P.bob=f?-.8:0;P.jump=f?1:0}
 else if(st==='int'){P.rA=-70;P.arms='reach'}
 else if(st==='react'){P.face='s';P.arms='head';P.bob=-.5} // hands on head: a missed chance
 else if(st==='sit'){P.sit=1}
 else if(st==='turn'){P.bob=-.4;P.face='n'}
 return P}
var ACT8N={walk:8,run:8,sprint:8,drib:8,celw:4,idle:4,kick:3,pass:3,shoot:4,tackle:2,slide:1,head:2,cel:2,celf:2,kneel:1,award:2,int:1,react:1,sit:1,turn:1}; // frames per state
function actorSpr8(o,dir,st,f,rf){const k=key8(o)+'|'+(o.lv|0)+'#'+dir+st+f+'@'+rf;let e=ACTC.get(k);if(e){e.u=tick;return e.cv}
 const cv=document.createElement('canvas');cv.width=48*rf;cv.height=58*rf;const q=cv.getContext('2d');q.scale(rf,rf);q.lineJoin='round';q.lineCap='round';drawActor8(q,o,dir,st,f);
 ACTC.set(k,{cv,u:tick});if(ACTC.size>520){const arr=[...ACTC.entries()].sort((a,b)=>a[1].u-b[1].u);for(let i=0;i<120;i++)ACTC.delete(arr[i][0])}return cv}
function drawActor8(q,o,dir,st,f){const P=pose8(st,f,dir==='l'||dir==='r'),ht=o.ht||1,bd=o.bd==null?1:o.bd,kid=o.age==='kid',old=o.age==='old',hs=kid?1.12:1;
 const sk=o.sk||'#f1c27d',skS=shd(sk,.84),hc=o.hc||'#2b1a10',sh=o.sh||'#e9e9e9',c2=o.c2||'#ffffff',pa=o.pa||'#1b2240',so=o.so||'#f2f2f2',bt=o.bt||'#15161a',out=o.out||'kit',tier=o.tier|0;
 const longSleeve=out==='hoodie'||out==='suit'||out==='track'||out==='coach',longPants=o.cas||out==='suit'||out==='track'||out==='coach'||out==='casual'||out==='hoodie'||out==='work',skirt=out==='dress';
 const F=50,Y=v=>F-(F-v)*ht,J=P.jump;q.save();q.translate(0,-J+P.bob);
 const sw=6.6+bd*.7,ww=5+bd*.55,cx=24;
 // v9 proportions: about 2.9 heads tall (was 2.6), longer legs and torso, same feet line
 const yHip=Y(38.6),yWaist=Y(35.4),yShould=Y(27.6),yNeck=Y(25.6),yHead=Y(19),hr=6.15*hs,yKnee=Y(43.7),yAnk=Y(48),lv=o.lv|0,kitOn=out==='kit'||!out;
 const side=dir==='l'||dir==='r',sx=dir==='l'?-1:1,back=dir==='u';
 // ---------- legs ----------
 const leg=(hx,ang,knee,far,isLeft)=>{const a=ang*Math.PI/180,kb=knee*Math.PI/180,th=yKnee-yHip,shn=yAnk-yKnee;let kx,ky,ax,ay;
  if(side){kx=hx+Math.sin(a)*th*sx;ky=yHip+Math.cos(a)*th;const a2=a-kb;ax=kx+Math.sin(a2)*shn*sx;ay=ky+Math.cos(a2)*shn}
  else{const lift=Math.max(0,ang)/22*3.4+knee/34*3;kx=hx;ky=yKnee-lift*.6;ax=hx+(isLeft?-.2:.2);ay=yAnk-lift}
  const dk=far?.82:1,pc=longPants?shd(pa,dk):shd(sk,dk);
  if(skirt){capsule(q,kx,ky,ax,ay,1.45,shd(sk,dk))}else if(longPants){capsule(q,hx,yHip,kx,ky,2.05,pc);capsule(q,kx,ky,ax,ay-1,1.85,pc)}
  else{capsule(q,hx,yHip+1,kx,ky,1.85,shd(sk,dk));const sc=out==='kit'||!out?shd(so,dk):shd(sk,dk);capsule(q,kx,ky+.6,ax,ay-1.2,1.75,sc);if(out==='kit'||!out){q.fillStyle=shd(c2,dk);q.beginPath();q.ellipse((kx+ax)/2*.35+kx*.65,ky+1.6,1.7,.75,0,0,7);q.fill();if(tier>=1){q.fillStyle='rgba(255,255,255,.55)';q.fillRect(ax-1.5,ay-3.4,3,.8)}if(lv>=1){q.fillStyle='rgba(255,255,255,.72)';q.fillRect(kx+(ax-kx)*.42-1.6,ky+(ay-ky)*.42,3.2,.6)}}}
  // boot
  const bc=shd(bt,dk);q.beginPath();if(side){q.ellipse(ax+sx*1.3,ay+.4,3.2,1.75,0,0,7)}else{q.ellipse(ax,ay+.5,2.3,1.75,0,0,7)}fo(q,bc,.8);
  if(!far){q.fillStyle=shd(bt,1.55);q.fillRect(ax-(side?0:1.4)+(side?sx*.4:0),ay-.6,side?2.2:2.8,.6)}
  if(tier>=2&&(out==='kit'||!out)){q.fillStyle='#ffd24a';q.fillRect(ax-1.2,ay+.6,2.4,.5)}
  if(kitOn&&lv>=3&&!far){q.fillStyle=lv>=4?'#ffd24a':shd(c2,1.15);q.fillRect(side?ax-1+sx*.4:ax-1.6,ay-.45,side?2.6:3.2,.55)}};
 const hipL=side?cx-.8*sx:cx-2.5,hipR=side?cx+.8*sx:cx+2.5;
 if(P.sit){const yS=Y(41);capsule(q,cx-2.5,yS,cx-2.5,yS+2.5,1.9,longPants?pa:sk);capsule(q,cx+2.5,yS,cx+2.5,yS+2.5,1.9,longPants?pa:sk);capsule(q,cx-2.5,yS+3.2,cx-2.6,yS+6.6,1.7,longPants?pa:so);capsule(q,cx+2.5,yS+3.2,cx+2.6,yS+6.6,1.7,longPants?pa:so);for(const xx of [cx-2.6,cx+2.6]){q.beginPath();q.ellipse(xx,yS+7.4,2.2,1.6,0,0,7);fo(q,bt,.8)}q.translate(0,4.5)}
 else if(P.kneel){ // knee slide: thighs down to the turf, shins flat behind
  const gy=F-1.2-P.bob,pc=longPants?pa:sk;for(const [hx0,dk] of side?[[cx-.8*sx,.82],[cx+.8*sx,1]]:[[cx-2.6,1],[cx+2.6,1]]){const kx=side?hx0+sx*3.6:hx0+(hx0<cx?-.6:.6),ky=gy-.6;capsule(q,hx0,yHip+1,kx,ky,1.95,shd(pc,dk));
   const fx=side?kx-sx*6.4:kx+(hx0<cx?-1.4:1.4),fy=side?gy+.2:gy+.4;capsule(q,kx,ky,fx,fy,1.7,shd(kitOn?so:pc,dk));q.beginPath();q.ellipse(fx-(side?sx*1.2:0),fy+.3,side?2.8:2,1.4,0,0,7);fo(q,shd(bt,dk),.7)}}
 else if(side){leg(hipL,P.lL,P.lK,1,1);}
 else{leg(hipL,P.lL,P.lK,0,1);leg(hipR,P.rL,P.rK,0,0)}
 // ---------- far arm (side views) ----------
 const lean=P.lean*Math.PI/180,lx=v=>v+Math.sin(lean)*(yHip-v)*sx;
 const armDraw=(shx,shy,ang,bent,far,isLeftArm)=>{const dk=far?.8:1,a=ang*Math.PI/180;let ex,ey,hx,hy;const ua=5.6*ht,fa=5.3*ht;
  const Lf=shx<cx;
  if(P.arms==='up'){ex=shx+(Lf?-2.4:2.4);ey=shy-5;hx=shx+(Lf?-3.2:3.2);hy=shy-10}
  else if(P.arms==='head'){ex=shx+(Lf?-3.8:3.8)*(side?.5:1);ey=shy-3;hx=cx+(Lf?-hr*.78:hr*.78)*(side?.4:1);hy=yHead-1.4}
  else if(P.arms==='wing'){ex=shx+(Lf?-4.8:4.8)*(side?.35:1);ey=shy+.6;hx=shx+(Lf?-9.4:9.4)*(side?.35:1);hy=shy+1.6}
  else if(P.arms==='fist'){if(!Lf){ex=shx+2;ey=shy-5;hx=shx+2.6;hy=shy-10.4}else{ex=shx-1.4;ey=shy+4.4;hx=shx+1.8;hy=shy+2.2}}
  else if(P.arms==='stretch'){if(side){ex=shx+sx*2.8;ey=shy-4.4;hx=shx+sx*5.6;hy=shy-9.2}else{ex=shx+(Lf?-1.4:1.4);ey=shy-5.6;hx=shx+(Lf?-2:2);hy=shy-11.4}} // keeper dive, warm-up reach
  else if(P.arms==='hold'){if(side){ex=shx-sx*1.2;ey=shy-5;hx=shx-sx*4.2;hy=shy-12.6}else{ex=shx+(Lf?-3:3);ey=shy-4.4;hx=cx+(Lf?-2.4:2.4);hy=shy-10.2}} // ball over the head (throw-in)
  else if(P.arms==='chest'){ex=shx+(Lf?-3.2:3.2)*(side?.5:1);ey=shy+4.2;hx=cx+(Lf?-2.6:2.6)*(side?.4:1)+(side?sx*3.4:0);hy=shy+2.4} // keeper holding the ball
  else if(P.arms==='trophy'){ex=shx+(Lf?-2.8:2.8);ey=shy-5.2;hx=cx+(Lf?-2.8:2.8);hy=shy-11.2}
  else if(P.arms==='back'&&side){ex=shx-sx*3.4;ey=shy+3;hx=shx-sx*6.2;hy=shy+5.6}
  else if(P.arms==='out'||P.arms==='back'){ex=shx+(shx<cx?-3.2:3.2);ey=shy+3.5;hx=shx+(shx<cx?-5.2:5.2);hy=shy+5.5}
  else if(side){ex=shx+Math.sin(a)*ua*sx;ey=shy+Math.cos(a)*ua;const a2=a+(bent?1.2:.15);hx=ex+Math.sin(a2)*fa*sx;hy=ey+Math.cos(a2)*fa}
  else{const sw2=ang/34;ex=shx+(shx<cx?-1:1)*.6;ey=shy+ua-Math.abs(sw2)*.5;hx=ex+(shx<cx?-.2:.2)+(bent?(shx<cx?1.8:-1.8):0);hy=ey+fa*(bent?.62:1)-sw2*4;if(P.arms==='reach'&&shx>cx){hy=shy+2;hx=shx+3.5}}
  const slv=longSleeve?shd(sh,dk):shd(sh,dk);const skc=shd(sk,dk);
  if(longSleeve){capsule(q,shx,shy,ex,ey,1.75,slv);capsule(q,ex,ey,hx,hy,1.55,slv)}else{capsule(q,shx,shy,ex,ey,1.75,slv);capsule(q,(shx*.3+ex*.7),(shy*.3+ey*.7),hx,hy,1.45,skc)}
  q.beginPath();q.arc(hx,hy,1.65,0,7);fo(q,o.gk?shd(o.gk,dk):skc,.8);
  if(!longSleeve&&(out==='kit'||!out)){q.strokeStyle=lv>=4?shd('#ffd24a',dk):shd(c2,dk);q.lineWidth=.9;q.beginPath();const mx=shx*.35+ex*.65,my=shy*.35+ey*.65;q.moveTo(mx-1.5,my);q.lineTo(mx+1.5,my);q.stroke()}
  const wristX=hx*.75+ex*.25,wristY=hy*.75+ey*.25;if(o.wr&&out==='kit'){q.strokeStyle=o.wr;q.lineWidth=1.3;q.beginPath();q.moveTo(wristX-1.4,wristY);q.lineTo(wristX+1.4,wristY);q.stroke()}
  if(o.wa&&isLeftArm){q.fillStyle='#2b2b33';q.fillRect(wristX-1.5,wristY-.7,3,1.4);q.fillStyle=o.wa;q.beginPath();q.arc(wristX,wristY,1,0,7);q.fill()}
  if(o.arm&&isLeftArm&&!far){const ax2=shx*.55+ex*.45,ay2=shy*.55+ey*.45;q.fillStyle='#f5c400';q.fillRect(ax2-1.9,ay2-.9,3.8,1.8);q.fillStyle='#1b1e25';q.font='bold 1.6px Arial';q.textAlign='center';q.fillText('C',ax2,ay2+.6)}};
 const shY=yShould+.8;
 // side: far arm & far leg are drawn behind the body
 // which arm is the character's left?  facing right -> far arm = left; facing left -> near arm = left
 if(side){armDraw(lx(cx+.6*sx),shY,P.lA,P.arms==='bent',1,sx>0);if(!P.kneel&&!P.sit)leg(hipR,P.rL,P.rK,0,0)}
 // ---------- shorts / trousers / skirt ----------
 if(!P.sit||true){const sy0=yWaist-.4,sy1=yHip+2.2;if(skirt){pth(q,[cx-ww,sy0,cx+ww,sy0,cx+ww+2.8,Y(43.2),cx-ww-2.8,Y(43.2)]);fo(q,pa)}
  else if(side){pth(q,[cx-3.6,sy0,cx+3.6,sy0,cx+3.9,sy1,cx-3.9,sy1]);fo(q,pa)}else{pth(q,[cx-ww-.2,sy0,cx+ww+.2,sy0,cx+ww+.9,sy1,cx+.9,sy1,cx,sy1-1.6,cx-.9,sy1,cx-ww-.9,sy1]);fo(q,pa);
   if(out==='kit'||!out){q.fillStyle=c2;q.fillRect(cx-ww-.5,sy0+.8,.9,sy1-sy0-1);q.fillRect(cx+ww-.4,sy0+.8,.9,sy1-sy0-1)}if(out==='track'){q.fillStyle='#ffffff';q.fillRect(cx-ww-.4,sy0,.8,sy1-sy0)}}
  q.fillStyle='rgba(0,0,0,.14)';q.fillRect(side?cx+(sx>0?1.8:-3.6):cx+ww-1.6,sy0,1.8,sy1-sy0)}
 // ---------- torso ----------
 q.save();if(side&&P.lean){q.translate(cx,yHip);q.rotate(lean*sx);q.translate(-cx,-yHip)}
 const tw=side?3.9+bd*.45:sw,tww=side?3.6+bd*.4:ww;const hem=yWaist+(out==='suit'?2.4:out==='hoodie'?1.6:.9);
 pth(q,[cx-tw+.6,yShould-.6,cx-tw*.35,yNeck+.3,cx+tw*.35,yNeck+.3,cx+tw-.6,yShould-.6,cx+tw+.6,yShould+1.6,cx+tww+.3,hem,cx-tww-.3,hem,cx-tw-.6,yShould+1.6]);
 const tg=q.createLinearGradient(cx-tw,0,cx+tw,0);tg.addColorStop(0,shd(sh,1.12));tg.addColorStop(.55,sh);tg.addColorStop(1,shd(sh,.78));fo(q,tg);
 q.save();pth(q,[cx-tw+.6,yShould-.6,cx-tw*.35,yNeck+.3,cx+tw*.35,yNeck+.3,cx+tw-.6,yShould-.6,cx+tw+.6,yShould+1.6,cx+tww+.3,hem,cx-tww-.3,hem,cx-tw-.6,yShould+1.6]);q.clip();
 const pat=o.pat,h0=yNeck,h1=hem;
 if(out==='kit'||!out){if(pat==='stripes'){q.fillStyle=c2;for(let xx=cx-tw;xx<cx+tw;xx+=3.2)q.fillRect(xx+.8,h0,1.3,h1-h0)}else if(pat==='hoops'){q.fillStyle=c2;q.fillRect(cx-tw-1,yShould+2.2,tw*2+2,1.6);q.fillRect(cx-tw-1,yShould+5.4,tw*2+2,1.6)}
  else if(pat==='sash'){q.fillStyle=c2;q.beginPath();q.moveTo(cx-tw,h0+1);q.lineTo(cx-tw+2.4,h0);q.lineTo(cx+tw,h1-2);q.lineTo(cx+tw-2.4,h1);q.closePath();q.fill()}else if(pat==='split'){q.fillStyle=c2;q.fillRect(cx,h0,tw+1,h1-h0)}else if(pat==='zip'){q.fillStyle=c2;q.fillRect(cx-.4,h0,.8,h1-h0)}
  if(tier>=1&&!back&&!side){q.fillStyle='rgba(255,255,255,.18)';q.fillRect(cx-tw,yShould+4.4,tw*2,1.6)}
  if(tier>=2){q.fillStyle='#ffd24a';q.fillRect(cx-tw-1,hem-.9,tw*2+2,.7)}}
 if(out==='suit'){q.fillStyle='#f4f4f2';pth(q,[cx-1.6,yNeck,cx+1.6,yNeck,cx+.8,yShould+5,cx-.8,yShould+5]);q.fill();q.fillStyle=o.c2||'#a3162a';pth(q,[cx-.6,yNeck+.6,cx+.6,yNeck+.6,cx+.8,yShould+4.5,cx,yShould+5.4,cx-.8,yShould+4.5]);q.fill();q.strokeStyle='rgba(0,0,0,.35)';q.lineWidth=.6;q.beginPath();q.moveTo(cx-1.6,yNeck);q.lineTo(cx-.4,yShould+6);q.moveTo(cx+1.6,yNeck);q.lineTo(cx+.4,yShould+6);q.stroke()}
 if(out==='hoodie'&&!back){q.fillStyle='rgba(0,0,0,.15)';q.fillRect(cx-3,yWaist-3.2,6,2.4);q.strokeStyle=shd(sh,1.3);q.lineWidth=.6;q.beginPath();q.moveTo(cx-1,yNeck+1);q.lineTo(cx-1.2,yNeck+4);q.moveTo(cx+1,yNeck+1);q.lineTo(cx+1.2,yNeck+4);q.stroke()}
 if(out==='work'){q.fillStyle='#d8f53a';q.fillRect(cx-tw,yShould+.5,tw*2,hem-yShould-.5);q.fillStyle='#d9dde3';q.fillRect(cx-tw,yShould+5.2,tw*2,1)}
 if(out==='track'||out==='coach'){q.fillStyle=c2;q.fillRect(cx-.4,h0,.8,h1-h0);if(!side){q.fillRect(cx-tw,yShould+.4,1,6);q.fillRect(cx+tw-1,yShould+.4,1,6)}}
 if(out==='beach'){q.fillStyle=c2;for(let xx=cx-tw;xx<cx+tw;xx+=2.6){q.beginPath();q.arc(xx+1,yShould+3+((xx*7)|0)%5,.8,0,7);q.fill()}}
 // number on the back / crest on the front
 if(back&&o.num&&(out==='kit'||!out)){const pc=(lum(c2)>.5)===(lum(sh)>.5)?(lum(sh)>.5?'#1b2240':'#ffffff'):c2;q.fillStyle=lv>=5?'#ffd24a':pc;q.font=`900 ${6.4}px Rubik,Arial`;q.textAlign='center';q.fillText(String(o.num).slice(0,2),cx,yShould+7.6);if(tier>=1||lv>=3){q.font='800 2.2px Rubik,Arial';q.fillText('ELI',cx,yShould+2.6)}}
 // career progression on the kit: sponsor patch (Professional), crest always from Professional, gold star (Legend)
 if(!back&&!side&&kitOn&&lv>=2){const lt=lum(sh)>.55;q.fillStyle=lt?'rgba(20,26,40,.78)':'rgba(255,255,255,.86)';q.beginPath();q.roundRect(cx-3.2,yShould+4.9,6.4,1.9,.5);q.fill();q.fillStyle=lt?'rgba(255,255,255,.7)':'rgba(20,26,40,.7)';q.fillRect(cx-2.4,yShould+5.6,4.8,.45)}
 if(!back&&!side&&kitOn&&lv>=5){q.fillStyle='#ffd24a';q.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.62:1.45;q.lineTo(cx-3.1+Math.cos(a)*r,yShould+1.2+Math.sin(a)*r)}q.closePath();q.fill()}
 if(!back&&!side&&(out==='kit'||!out)){if(tier>=1||o.crest||lv>=1){q.fillStyle=o.crest||c2;q.beginPath();q.moveTo(cx+2.2,yShould+1.4);q.lineTo(cx+4.2,yShould+1.4);q.lineTo(cx+4.2,yShould+3.2);q.quadraticCurveTo(cx+3.2,yShould+4.4,cx+2.2,yShould+3.2);q.closePath();q.fill()}if(o.num&&lv<5){q.fillStyle=c2;q.font='800 2.6px Rubik,Arial';q.textAlign='center';q.fillText(String(o.num).slice(0,2),cx-3,yShould+3.6)}}
 q.restore();
 // collar
 if(!back){q.strokeStyle=out==='suit'?'#f4f4f2':out==='hoodie'?shd(sh,.7):c2;q.lineWidth=1.1;q.beginPath();if(side){q.moveTo(cx-1.6*sx,yNeck+.4);q.lineTo(cx+1.4*sx,yNeck+.6)}else if(out==='kit'&&tier>=1){q.moveTo(cx-2.4,yNeck+.2);q.lineTo(cx,yNeck+2.2);q.lineTo(cx+2.4,yNeck+.2)}else{q.moveTo(cx-2.6,yNeck+.2);q.quadraticCurveTo(cx,yNeck+2,cx+2.6,yNeck+.2)}q.stroke()}
 else if(out==='hoodie'){q.fillStyle=shd(sh,.85);q.beginPath();q.ellipse(cx,yNeck+1.4,3.6,2,0,0,7);q.fill()}
 if(!back&&!side&&kitOn&&lv>=3){q.strokeStyle='#ffd24a';q.lineWidth=.45;q.beginPath();q.moveTo(cx-2.6,yNeck+.6);q.quadraticCurveTo(cx,yNeck+2.6,cx+2.6,yNeck+.6);q.stroke()} // Star: gold collar trim
 // necklace
 if(o.ch&&!back){q.strokeStyle=o.ch;q.lineWidth=.7;q.beginPath();if(side)q.arc(cx+sx*.6,yNeck,2.2,.3,2.6);else q.arc(cx,yNeck-.4,3,.25,Math.PI-.25);q.stroke();if(!side){q.fillStyle=o.ch;q.beginPath();q.arc(cx,yNeck+2.6,.8,0,7);q.fill()}}
 // coach whistle / scarf
 if(out==='coach'&&!back){q.strokeStyle='#d9dde3';q.lineWidth=.5;q.beginPath();q.moveTo(cx-1.6,yNeck);q.lineTo(cx+.8,yShould+4);q.stroke();q.fillStyle='#b9c0ca';q.fillRect(cx+.4,yShould+3.6,1.6,1)}
 if(o.acc==='scarf'){q.fillStyle=o.c2||'#c0392b';q.fillRect(cx-3.6,yNeck-.6,7.2,2);if(!back){q.fillRect(cx+1.2,yNeck+1,1.8,5);q.fillStyle=sh;q.fillRect(cx+1.2,yNeck+2.6,1.8,.8)}}
 // ---------- near arms ----------
 if(side){armDraw(lx(cx-.4*sx),shY,P.rA,P.arms==='bent',0,sx<0)}
 else{const lft=back?cx-sw+.9:cx+sw-.9,rgt=back?cx+sw-.9:cx-sw+.9;armDraw(cx-sw+.9,shY,P.lA,P.arms==='bent',0,back);armDraw(cx+sw-.9,shY,P.rA,P.arms==='bent',0,!back)}
 // ---------- head ----------
 const hy=yHead+(old?.8:0),hx=cx+(side?sx*.4:0);
 capsule(q,hx-(side?sx*.6:0),yNeck+1.2,hx-(side?sx*.4:0),yNeck-1.5,1.9*hs,skS,0);
 // back hair layer (long styles)
 if(o.hs===1&&!back){q.beginPath();q.ellipse(hx-(side?sx*1.4:0),hy+3,hr+.9,hr+1.4,0,0,7);fo(q,shd(hc,.85),.8)}
 q.beginPath();q.ellipse(hx,hy,hr*(side?.95:1),hr*1.06,0,0,7);const hg=q.createLinearGradient(hx-hr,hy-hr,hx+hr,hy+hr);hg.addColorStop(0,shd(sk,1.06));hg.addColorStop(.6,sk);hg.addColorStop(1,shd(sk,.85));fo(q,hg);
 if(!back&&!side){q.beginPath();q.ellipse(hx-hr+.2,hy+.8,1.2,1.7,0,0,7);fo(q,skS,.7);q.beginPath();q.ellipse(hx+hr-.2,hy+.8,1.2,1.7,0,0,7);fo(q,skS,.7)}
 if(side){ // profile: small ear just behind the centre of the head, soft outline so it never reads as a hole
  const ex0=hx-sx*2.1,ey0=hy+1.5;q.beginPath();q.ellipse(ex0,ey0,1,1.35,0,0,7);q.fillStyle=shd(sk,.94);q.fill();q.lineWidth=.45;q.strokeStyle='rgba(70,40,32,.55)';q.stroke();q.beginPath();q.arc(ex0+sx*.15,ey0,.5,sx>0?Math.PI*.6:-Math.PI*.4,sx>0?Math.PI*1.4:Math.PI*.4);q.strokeStyle='rgba(120,60,45,.45)';q.lineWidth=.35;q.stroke();
  q.fillStyle=sk;q.beginPath();q.ellipse(hx+sx*(hr*.92),hy+1.6,1.1,1.2,0,0,7);q.fill()}
 // soft key light from the top-left: a thin rim on the head keeps the face readable at small sizes
 q.save();q.beginPath();q.ellipse(hx,hy,hr*(side?.95:1),hr*1.06,0,Math.PI*1.05,Math.PI*1.6);q.strokeStyle='rgba(255,246,228,.38)';q.lineWidth=.7;q.stroke();q.restore();
 // face
 if(!back){const ex=side?hx+sx*3.3:0,eyY=hy+.9;const eye=(x)=>{if(P.face==='b'||P.face==='h'){q.strokeStyle='#2a1d17';q.lineWidth=.8;q.beginPath();if(P.face==='h'){q.arc(x,eyY+.5,1.1,Math.PI*1.1,Math.PI*1.9)}else{q.moveTo(x-1.1,eyY+.3);q.lineTo(x+1.1,eyY+.3)}q.stroke();return}
   q.fillStyle='#ffffff';q.beginPath();q.ellipse(x,eyY,1.25,P.face==='s'?1.75:1.45,0,0,7);q.fill();q.fillStyle='#2a1d17';q.beginPath();q.arc(x+(side?sx*.35:0),eyY+.15,P.face==='s'?.75:.9,0,7);q.fill();q.fillStyle='#ffffff';q.fillRect(x+(side?sx*.2:-.1)-.3,eyY-.55,.55,.55)};
  if(side){eye(ex)}else{eye(hx-2.55);eye(hx+2.55)}
  q.strokeStyle=shd(hc,.75);q.lineWidth=.75;q.beginPath();const by=eyY-(P.face==='s'?2.6:2.05);if(side){q.moveTo(ex-sx*1.2,by+.2);q.lineTo(ex+sx*1.1,by)}else{q.moveTo(hx-3.6,by+.2);q.lineTo(hx-1.6,by);q.moveTo(hx+1.6,by);q.lineTo(hx+3.6,by+.2)}q.stroke();
  q.fillStyle=shd(sk,.78);if(side){q.beginPath();q.moveTo(hx+sx*hr*.95,hy+1.2);q.lineTo(hx+sx*(hr+1.1),hy+2.6);q.lineTo(hx+sx*hr*.92,hy+3.1);q.closePath();q.fill()}else q.fillRect(hx-.5,hy+2.4,1,.8);
  q.strokeStyle='#8d3d2b';q.lineWidth=.8;q.beginPath();if(P.face==='h'||P.face==='s'){q.fillStyle='#6b2418';if(side){q.ellipse(hx+sx*4.4,hy+4.3,.9,1.1,0,0,7)}else q.ellipse(hx,hy+4.4,1.5,P.face==='s'?1.4:1.1,0,0,7);q.fill()}else if(side){q.moveTo(hx+sx*3.6,hy+4.3);q.lineTo(hx+sx*5,hy+4.1);q.stroke()}else{q.moveTo(hx-1.4,hy+4.1);q.quadraticCurveTo(hx,hy+4.9,hx+1.4,hy+4.1);q.stroke()}
  if(kid){q.fillStyle='rgba(255,120,120,.25)';q.beginPath();q.arc(hx-3.4,hy+3,1.1,0,7);q.arc(hx+3.4,hy+3,1.1,0,7);q.fill()}
  const br=o.br|0;if(br===1){q.fillStyle=hc+'55';q.beginPath();if(side)q.ellipse(hx+sx*2.6,hy+4,3.6,2.4,0,0,7);else q.ellipse(hx,hy+4.4,4.6,2.6,0,0,Math.PI);q.fill()}
  if(br===2){q.fillStyle=hc;q.beginPath();if(side){q.moveTo(hx-sx*1,hy+1.6);q.quadraticCurveTo(hx+sx*1,hy+7.4,hx+sx*5.6,hy+4.8);q.lineTo(hx+sx*5.8,hy+3.6);q.lineTo(hx+sx*3,hy+4.3);q.lineTo(hx-sx*.4,hy+1.6)}else{q.moveTo(hx-5.4,hy+1.4);q.quadraticCurveTo(hx-4.8,hy+7.6,hx,hy+7.8);q.quadraticCurveTo(hx+4.8,hy+7.6,hx+5.4,hy+1.4);q.lineTo(hx+3.6,hy+3.6);q.lineTo(hx+1.6,hy+3.4);q.quadraticCurveTo(hx,hy+3.1,hx-1.6,hy+3.4);q.lineTo(hx-3.6,hy+3.6)}q.closePath();q.fill();q.fillStyle=sk;if(!side){q.beginPath();q.ellipse(hx,hy+4.6,1.6,.9,0,0,7);q.fill()}}}
 hair8(q,o,hx,hy,hr,side,sx,back,hc,sk);
 if(o.hd){q.fillStyle=o.hd;q.beginPath();q.ellipse(hx,hy-2.6,hr*1.0,1.2,0,Math.PI,0);q.lineTo(hx+hr,hy-1.4);q.lineTo(hx-hr,hy-1.4);q.closePath();q.fill()}
 if(o.gl&&!back){q.strokeStyle=o.gl;q.lineWidth=.7;q.fillStyle=o.gl==='#16181d'||o.gl==='#15161a'?'rgba(20,22,30,.85)':'rgba(40,40,60,.5)';const eyY=hy+.9;if(side){q.beginPath();q.ellipse(hx+sx*3.4,eyY,1.7,1.3,0,0,7);q.fill();q.stroke();q.beginPath();q.moveTo(hx+sx*1.7,eyY);q.lineTo(hx-sx*1,eyY-.4);q.stroke()}else{for(const ex2 of [hx-2.6,hx+2.6]){q.beginPath();q.ellipse(ex2,eyY,1.8,1.35,0,0,7);q.fill();q.stroke()}q.beginPath();q.moveTo(hx-.8,eyY-.2);q.lineTo(hx+.8,eyY-.2);q.stroke()}}
 if(o.cap||o.hat==='cap'){const cc=o.cap||o.c2||'#1b2a49';q.beginPath();q.ellipse(hx,hy-2.4,hr+.4,hr*.82,0,Math.PI,0);q.closePath();fo(q,cc,.8);q.fillStyle=shd(cc,.7);if(back){}else if(side){q.beginPath();q.ellipse(hx+sx*(hr+.6),hy-1.8,3.2,.9,0,0,7);q.fill()}else{q.beginPath();q.ellipse(hx,hy-1.3,hr*.92,1.6,0,0,Math.PI);q.fill()}q.fillStyle=shd(cc,1.3);q.fillRect(hx-.5,hy-hr*.82-2,1,1)}
 if(o.hat==='sun'){q.fillStyle='#e8d29a';q.beginPath();q.ellipse(hx,hy-2.4,hr+3.2,2.2,0,0,7);q.fill();q.strokeStyle=OUTL;q.lineWidth=.7;q.stroke();q.beginPath();q.ellipse(hx,hy-3.6,hr*.7,2.8,0,Math.PI,0);q.fill();q.fillStyle='#c0392b';q.fillRect(hx-hr*.7,hy-3.4,hr*1.4,.9)}
 q.restore();
 if(st==='award'){const ty=yShould+.8-11.6-P.jump+P.bob,gg=q.createLinearGradient(cx-4,0,cx+4,0);gg.addColorStop(0,'#fff1b8');gg.addColorStop(.5,'#f2c94c');gg.addColorStop(1,'#8a6a12');
  q.beginPath();q.moveTo(cx-3.6,ty-4.4);q.lineTo(cx+3.6,ty-4.4);q.quadraticCurveTo(cx+3.4,ty+.6,cx+.9,ty+1.2);q.lineTo(cx+.7,ty+2.6);q.lineTo(cx+2.2,ty+3.4);q.lineTo(cx-2.2,ty+3.4);q.lineTo(cx-.7,ty+2.6);q.lineTo(cx-.9,ty+1.2);q.quadraticCurveTo(cx-3.4,ty+.6,cx-3.6,ty-4.4);q.closePath();fo(q,gg,.7);
  q.strokeStyle='#d4a72c';q.lineWidth=.7;q.beginPath();q.arc(cx-3.8,ty-2.4,1.3,Math.PI*.5,Math.PI*1.5);q.stroke();q.beginPath();q.arc(cx+3.8,ty-2.4,1.3,-Math.PI*.5,Math.PI*.5);q.stroke();
  q.fillStyle='rgba(255,255,255,.7)';q.fillRect(cx-2.2,ty-3.8,.8,2.6)}
 // held accessories
 const hand=side?[cx+sx*3.2,Y(37)]:[cx+sw+.6,Y(37.5)];
 if(o.acc==='bag'){q.fillStyle=o.c2==='#ffffff'?'#c0392b':(o.c2||'#c0392b');pth(q,[hand[0]-2.2,hand[1]+1,hand[0]+2.2,hand[1]+1,hand[0]+2.8,hand[1]+6,hand[0]-2.8,hand[1]+6]);fo(q,q.fillStyle,.7)}
 if(o.acc==='backpack'&&(back||side)){q.beginPath();q.roundRect(back?cx-4:cx-sx*6.2-2.2,yShould+.6,back?8:4.4,7.5,1.6);fo(q,o.c2||'#2e6fb8',.8)}
 if(o.acc==='suitcase'){q.beginPath();q.roundRect(hand[0]-1,hand[1]+.5,5,6.5,1);fo(q,'#3d4a6b',.7);q.fillStyle='#9aa1ad';q.fillRect(hand[0]+.4,hand[1]-.6,2,1.2)}
 if(o.acc==='phone'&&!back){q.fillStyle='#1b1e25';q.fillRect(cx-1,Y(31),2.2,3.2);q.fillStyle='#3ac0ff';q.fillRect(cx-.6,Y(30.6),1.4,2.2)}
 if(o.acc==='cane'){q.strokeStyle='#5d3b1c';q.lineWidth=1;q.beginPath();q.moveTo(hand[0],hand[1]);q.lineTo(hand[0]+1.2,F);q.stroke()}
 if(o.acc==='ball'){q.fillStyle='#ffffff';q.beginPath();q.arc(hand[0]+.4,hand[1]+1.6,2.6,0,7);fo(q,'#ffffff',.7);q.fillStyle='#222';q.beginPath();q.arc(hand[0]+.4,hand[1]+1.6,.9,0,7);q.fill()}
 if(o.acc==='umbrella'){q.strokeStyle='#2a2f38';q.lineWidth=.7;q.beginPath();q.moveTo(cx+(side?sx*2:3),Y(36));q.lineTo(cx+(side?sx*2:3),Y(8));q.stroke();q.fillStyle=o.uc||'#2e6fb8';q.beginPath();q.ellipse(cx+(side?sx*2:3),Y(8),10,4.6,0,Math.PI,0);q.closePath();fo(q,q.fillStyle,.8);q.strokeStyle='rgba(255,255,255,.35)';q.beginPath();q.moveTo(cx+(side?sx*2:3),Y(8)-4.4);q.lineTo(cx+(side?sx*2:3),Y(8));q.stroke()}}
function hair8(q,o,hx,hy,hr,side,sx,back,hc,sk){const s=o.hs|0,hcH=shd(hc,1.45),hcS=shd(hc,.75),top=hy-hr*1.06;q.save();
 const fillO=(c)=>{fo(q,c,.8)};
 if(back){if(s===2){q.beginPath();q.ellipse(hx,hy,hr*.98,hr*1.04,0,0,7);q.fillStyle=mixC(sk,hc,.25);q.fill();q.beginPath();q.roundRect(hx-1.6,top-2.2,3.2,hr*2,1.2);fillO(hc)}
  else if(s===3){q.beginPath();q.ellipse(hx,hy-.4,hr,hr*1.02,0,Math.PI*1.02,Math.PI*1.98+.4);q.fillStyle=mixC(sk,hc,.6);q.fill()}
  else{q.beginPath();q.ellipse(hx,hy-.6,hr+.5,hr*1.02+.4,0,Math.PI*.98,Math.PI*2.02);q.lineTo(hx+hr+.3,hy+(s===1?6:3.2));q.quadraticCurveTo(hx,hy+(s===1?8:5.4),hx-hr-.3,hy+(s===1?6:3.2));q.closePath();fillO(hc);
   if(s===4)for(let i=0;i<7;i++){q.beginPath();q.arc(hx-hr+1+i*(hr*2-2)/6,top+1.6+(i%2)*1.6,1.8,0,7);q.fillStyle=i%2?hc:hcS;q.fill()}
   if(s===5)for(let i=0;i<4;i++){q.fillStyle=hc;pth(q,[hx-hr+1.6+i*3.2,top+2,hx-hr+3+i*3.2,top-2.4,hx-hr+4.4+i*3.2,top+2]);q.fill()}
   q.strokeStyle=hcH;q.lineWidth=.6;q.beginPath();q.moveTo(hx-2,top+2);q.quadraticCurveTo(hx,top+3.4,hx+2.4,top+2);q.stroke()}
  q.restore();return}
 if(side){q.translate(hx,0);q.scale(sx,1);q.translate(-hx,0)}
 if(s===0){q.beginPath();q.moveTo(hx-hr-.4,hy-.4);q.quadraticCurveTo(hx-hr-.6,top-1.2,hx,top-1.2);q.quadraticCurveTo(hx+hr+.8,top-1,hx+hr+.4,hy-.6);if(side){q.lineTo(hx+hr*.55,hy-2.2);q.quadraticCurveTo(hx,hy-3.2,hx-hr*.4,hy-1.4);q.lineTo(hx-hr*.6,hy+2.8);q.lineTo(hx-hr-.4,hy+2.2)}else{q.lineTo(hx+hr-.4,hy-1.6);q.quadraticCurveTo(hx+1.2,hy-3.6,hx-1.6,hy-2.4);q.quadraticCurveTo(hx-3.6,hy-3,hx-hr+.2,hy-1.2)}q.closePath();fillO(hc);q.strokeStyle=hcH;q.lineWidth=.7;q.beginPath();q.moveTo(hx-2.6,top+.6);q.quadraticCurveTo(hx,top-.2,hx+2,top+1.2);q.stroke()}
 else if(s===1){q.beginPath();q.moveTo(hx-hr-.8,hy+5.4);q.quadraticCurveTo(hx-hr-1.4,top-1.6,hx,top-1.4);q.quadraticCurveTo(hx+hr+1.4,top-1.6,hx+hr+.8,hy+5.4);q.lineTo(hx+hr-.6,hy+5.4);q.lineTo(hx+hr-1,hy-1.2);q.quadraticCurveTo(hx,hy-3.4,hx-hr+1,hy-1.2);q.lineTo(hx-hr+.6,hy+5.4);q.closePath();if(side){}fillO(hc);q.strokeStyle=hcH;q.lineWidth=.6;q.beginPath();q.moveTo(hx-3,top+.8);q.quadraticCurveTo(hx-4.6,hy,hx-4.8,hy+4);q.stroke()}
 else if(s===2){q.beginPath();q.ellipse(hx,hy-.6,hr,hr*1.02,0,Math.PI,0);q.fillStyle=mixC(sk,hc,.32);q.fill();q.beginPath();q.moveTo(hx-1.8,hy-2.2);q.quadraticCurveTo(hx-2.4,top-3.8,hx-.2,top-4.6);q.quadraticCurveTo(hx+2.4,top-3.6,hx+1.8,hy-2.4);q.closePath();fillO(hc);q.strokeStyle=hcH;q.lineWidth=.6;q.beginPath();q.moveTo(hx-.4,top-3.4);q.lineTo(hx-.2,hy-3);q.stroke()}
 else if(s===3){q.beginPath();q.ellipse(hx,hy-.8,hr+.1,hr*1.02,0,Math.PI*1.05,Math.PI*1.95);q.lineTo(hx+hr-.6,hy-2.4);q.quadraticCurveTo(hx,hy-3.6,hx-hr+.6,hy-2.4);q.closePath();q.fillStyle=mixC(sk,hc,.72);q.fill()}
 else if(s===4){q.beginPath();q.ellipse(hx,hy-1.4,hr+.8,hr*.86,0,Math.PI*1.0,Math.PI*2);q.lineTo(hx+hr+.6,hy);q.lineTo(hx-hr-.6,hy);q.closePath();fillO(hc);for(let i=0;i<8;i++){const a=Math.PI*(1.02+i*.13),r2=hr+.7;q.beginPath();q.arc(hx+Math.cos(a)*r2,hy-1.4+Math.sin(a)*r2*.92,1.8,0,7);q.fillStyle=i%2?hc:hcS;q.fill();q.strokeStyle=OUTL;q.lineWidth=.5;q.stroke()}q.fillStyle=hcH;q.beginPath();q.arc(hx-1.6,top+.8,.8,0,7);q.arc(hx+2,top+1.2,.7,0,7);q.fill()}
 else{q.beginPath();q.moveTo(hx-hr-.4,hy-.2);q.lineTo(hx-hr+.4,top+1);for(let i=0;i<5;i++){const x0=hx-hr+.4+i*(hr*2-.8)/5;q.lineTo(x0+1.2,top-3.4+(i%2)*1.2);q.lineTo(x0+(hr*2-.8)/5,top+.8)}q.lineTo(hx+hr+.4,hy-.4);q.lineTo(hx+hr-.4,hy-1.8);q.quadraticCurveTo(hx,hy-3.6,hx-hr+.4,hy-1.6);q.closePath();fillO(hc);q.strokeStyle=hcH;q.lineWidth=.6;q.beginPath();q.moveTo(hx-2,top);q.lineTo(hx-1,top-2);q.stroke()}
 q.restore()}
// the equipped celebration item decides Eli's goal celebration pose
function celSt8(){const c=typeof itm==='function'&&S.ap?itm(S.ap,'cel'):null,k=c&&c.data&&c.data.k;return k==='jump'?'cel':k==='spin'?'celw':k?'kneel':'celf'}
// ---------- public drawing API ----------
function rfFor(sc){return clamp(Math.ceil(sc*SCv*1.02),2,5)}
function actorShadow8(x,y,sc){g.save();g.imageSmoothingEnabled=true;g.fillStyle='rgba(12,18,26,.30)';g.beginPath();g.ellipse(x+1.2*sc,y+.6*sc,7.6*sc,2.6*sc,0,0,7);g.fill();g.fillStyle='rgba(12,18,26,.22)';g.beginPath();g.ellipse(x+.6*sc,y+.4*sc,4.4*sc,1.6*sc,0,0,7);g.fill();g.restore()}
function drawActor(x,y,o,sc,dir,st,f,noShadow,alpha){const rf=rfFor(sc),cv=actorSpr8(o,dir||'d',st||'idle',f|0,rf);if(!noShadow){actorShadow8(x,y,sc);
  if((o.lv|0)>=4){g.save();g.strokeStyle=o.lv>=5?'rgba(255,214,90,.55)':'rgba(255,214,90,.3)';g.lineWidth=.9*sc;g.beginPath();g.ellipse(x+.6*sc,y+.4*sc,9.5*sc,3.3*sc,0,0,7);g.stroke();g.restore()}} /* Superstar / Legend: a gold ring at the feet */const pa=g.globalAlpha;if(alpha!=null)g.globalAlpha=alpha;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';g.drawImage(cv,x-24*sc,y-50*sc,48*sc,58*sc);g.globalAlpha=pa}
// legacy entry point used by menus, portraits and match scenes: same anchor as the old sprites (feet at x+16sc, y+31sc)
function drawChar(x,y,o,sc=1,noShadow){o.sk=solid(o.sk||'#f1c27d');o.sh=solid(o.sh||'#e9e9e9');o.pa=solid(o.pa||'#223');o.bt=solid(o.bt||'#15161a');o.hc=solid(o.hc||'#2b1a10');o.c2=solid(o.c2||'#ffffff');if(o.so)o.so=solid(o.so);
 const fr=o.fr|0;let st='idle',f=0;if(o.up){st='cel';f=0}else if(o.kick!=null){st='kick';f=o.kick}else if(fr===1){st='walk';f=2}else if(fr===3){st='walk';f=6}else if(fr===2){st='walk';f=0}else if(fr===4){f=1}else if(fr===5){f=2}
 if(o.tier==null&&o.k)o.tier=o.k>=3?2:o.k>=2?1:0;drawActor(x+16*sc,y+31*sc,o,sc,o.dir||'d',st,f,noShadow)}
function charKey(o){return key8(o)+(o.dir||'')+(o.fr|0)}
// ---------- pedestrians: varied silhouettes and outfits ----------
var NPCSK=['#ffdbac','#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a21'],NPCHC=['#1d1a17','#2b1a10','#5a3a1c','#8a5a2b','#c9a227','#e8d5a0','#a0522d','#3b3b3b','#b8b8b8'];
function npcLook8(seed,role){const h=hashS(String(seed)),r=i=>((h>>>(i*3))&255)/255,pick=(a,i)=>a[Math.floor(r(i)*a.length)%a.length];
 const o={sk:pick(NPCSK,1),hc:pick(NPCHC,2),hs:Math.floor(r(3)*6),br:r(4)<.18?2:r(4)<.32?1:0,bd:Math.floor(r(5)*3),ht:.94+r(6)*.12,bt:pick(['#15161a','#f4f4f4','#5d3b1c','#2e6fb8','#c0392b'],7)};
 const tops=['#c0392b','#2e6fb8','#1f9d55','#f5b700','#7a4fb8','#e67e22','#ecf0f1','#2c3e50','#16a085','#d35400','#8e44ad','#f39c12','#e84393','#00a8a8'];
 role=role||pick(['casual','casual','hoodie','casual','suit','dress','track','casual','beach'],8);o.out=role;o.sh=pick(tops,9);o.c2=pick(['#ffffff','#1b2240','#ffd24a','#c0392b'],10);o.pa=pick(['#2c4a7a','#1b2240','#3b3f48','#5d6b7a','#7a5a3a','#1d1f26'],11);
 if(role==='suit'){o.sh=pick(['#2c3e50','#1d1f26','#3b3f48','#4a3b2a'],12);o.pa=o.sh;o.c2=pick(['#a3162a','#2e6fb8','#d4a72c'],13);o.bt='#16181d';o.hs=r(14)<.5?0:3}
 if(role==='dress'){o.pa=o.sh;o.hs=r(15)<.6?1:4}
 if(role==='beach'){o.pa=pick(['#f5b700','#2e6fb8','#e84393','#16a085'],16);o.cas=0;o.out='beach';o.gl=r(17)<.5?'#16181d':null;o.bt='#e8c07a';o.hat=r(18)<.3?'sun':''}
 if(role==='kid'){o.age='kid';o.ht=.76;o.out='casual';o.hs=Math.floor(r(19)*6)}
 if(role==='old'){o.age='old';o.hc=pick(['#d9d9d9','#b8b8b8','#eeeeee'],20);o.acc=r(21)<.6?'cane':'';o.out=r(22)<.5?'casual':'suit';o.ht=.95}
 if(role==='fan'){o.out='casual';o.acc='scarf';const cc=clubCols();o.sh=cc[0];o.c2=cc[1];o.pa=pick(['#2c4a7a','#1b2240','#3b3f48'],23)}
 if(role==='player'){o.out='kit';o.sh=pick(['#f4f4f4','#2e8b57','#c0392b','#2e6fb8'],24);o.pa=pick(['#1b2240','#ffffff','#2c3e50'],25);o.so=o.sh;o.num=String(2+Math.floor(r(26)*20))}
 if(role==='coach'){o.out='coach';o.sh='#1b2a49';o.c2='#ffd24a';o.pa='#1b2a49';o.hat='cap';o.cap='#1b2a49'}
 if(role==='work'){o.out='work';o.sh='#3d4a6b';o.pa='#3b3f48';o.hat=r(27)<.5?'cap':''}
 if(role==='traveler'){o.out=r(28)<.5?'casual':'suit';o.acc='suitcase'}
 if(!o.acc&&role!=='player'&&role!=='coach'){const ac=r(29);o.acc=ac<.14?'bag':ac<.26?'backpack':ac<.34?'phone':''}
 if(['casual','hoodie','track','work'].includes(o.out))o.cas=1;
 if(o.age==='old'&&o.out==='suit')o.cas=1;return o}
