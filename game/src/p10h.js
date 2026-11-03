// ===================== v9 PRESENTATION: stadium detail, night lighting, rain, readable city bubbles =====================
// Pure presentation layer: nothing here changes match results, the economy or saves.
function lmTeamNm9(t){return t===0?nm(mine().n):lmOppName()}
// ---------- the pitch: finer grass, depth, worn areas and crisp line shadows (baked once into the cached stadium) ----------
var lmPitchCanvas9=lmPitchCanvas;lmPitchCanvas=function(){const fresh=!LMPC||LMPR!==clamp(Math.round(SCv),1,2),cv=lmPitchCanvas9();if(!fresh||cv.pz9)return cv;cv.pz9=1;
 const PR=LMPR,Lw=LMP.L,Wd=LMP.W,Mg=LMP.M,q=cv.getContext('2d');q.save();q.setTransform(PR,0,0,PR,Mg*PR,Mg*PR);const hr=(x,y,i)=>H(Math.floor(x)+700,Math.floor(y)+700,i);
 // stands: back rows in shadow under the roof, a club-coloured parapet in front of each stand
 const kU=LM?LM.tm[0].kit:{sh:'#c0392b',c2:'#fff'},sh=(x0,y0,x1,y1,dir)=>{const gr=dir==='v'?q.createLinearGradient(0,y0,0,y1):q.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(.55,'rgba(0,0,0,.08)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(x0,y0,x1-x0,y1-y0)};
 sh(-Mg,-Mg,Lw+Mg,-34,'v');{const gr=q.createLinearGradient(0,Wd+Mg,0,Wd+34);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(.55,'rgba(0,0,0,.08)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(-Mg,Wd+34,Lw+Mg*2,Mg-34)}
 sh(-Mg,-30,-40,Wd+30,'h');{const gr=q.createLinearGradient(Lw+Mg,0,Lw+40,0);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(.55,'rgba(0,0,0,.08)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(Lw+40,-30,Mg-40,Wd+60)}
 const par=(x,y,w,h)=>{const hz=w>h;q.fillStyle='#14171e';q.fillRect(x,y,w,h);q.fillStyle=solid(kU.sh);if(hz)q.fillRect(x,y+h-1.2,w,1.2);else q.fillRect(x+w-1.2,y,1.2,h);q.fillStyle='rgba(255,255,255,.10)';if(hz)q.fillRect(x,y,w,.8);else q.fillRect(x,y,.8,h)};
 par(-Mg+4,-36,Lw+Mg*2-8,3);par(-Mg+4,Wd+33,Lw+Mg*2-8,3);par(-42,-30,3,Wd+60);par(Lw+39,-30,3,Wd+60);
 // grass: blade grain in two tones, so the stripes read as cut turf rather than flat colour
 for(let i=0;i<26000;i++){const x=hr(i,11,2)*10.5+hr(i,13,3)*.105,y=hr(i,12,4)*6.8+hr(i,17,9)*.068,k=hr(i,19,5);q.fillStyle=k<40?'rgba(18,58,24,.16)':k<70?'rgba(120,190,90,.10)':'rgba(214,246,180,.08)';q.fillRect(x,y,.7,1.6)}
 // depth: far touchline slightly darker, near side catches the light
 {const gr=q.createLinearGradient(0,0,0,Wd);gr.addColorStop(0,'rgba(0,20,10,.10)');gr.addColorStop(.5,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(255,255,230,.05)');q.fillStyle=gr;q.fillRect(0,0,Lw,Wd)}
 // wear: the assistant referees' runs along the touchlines, the penalty spots and the keepers' six-yard boxes
 for(let i=0;i<900;i++){const t=hr(i,21,6)/100,side=i%2,x=Lw*(side?.5+t*.5:t*.5),y=side?Wd-6+hr(i,22,7)%5:2+hr(i,23,8)%5;q.fillStyle='rgba(150,128,80,.10)';q.fillRect(x,y,1.6,1.2)}
 for(const [x,y,r] of [[110,Wd/2,14],[Lw-110,Wd/2,14],[24,Wd/2,40],[Lw-24,Wd/2,40]]){for(let i=0;i<160;i++){const a=hr(i,x,3)/100*6.283,d=Math.sqrt(hr(i,y,4)/100)*r;q.fillStyle='rgba(140,116,72,.12)';q.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*.8,1.4,1.4)}}
 // markings again on top, with a soft shadow so they sit on the grass
 const cy=Wd/2,lines=(off,col,lw)=>{q.save();q.translate(off,off);q.strokeStyle=col;q.fillStyle=col;q.lineWidth=lw;q.lineCap='round';
  q.strokeRect(0,0,Lw,Wd);q.beginPath();q.moveTo(Lw/2,0);q.lineTo(Lw/2,Wd);q.stroke();q.beginPath();q.arc(Lw/2,cy,91.5,0,7);q.stroke();
  for(const [gx,s] of [[0,1],[Lw,-1]]){q.strokeRect(Math.min(gx,gx+s*165),cy-201.5,165,403);q.strokeRect(Math.min(gx,gx+s*55),cy-91.5,55,183);const ps=gx+s*110;q.beginPath();q.arc(ps,cy,2.2,0,7);q.fill();const a=Math.acos(55/91.5);q.beginPath();if(s>0)q.arc(ps,cy,91.5,-a,a);else q.arc(ps,cy,91.5,Math.PI-a,Math.PI+a);q.stroke()}
  q.beginPath();q.arc(Lw/2,cy,2.4,0,7);q.fill();for(const [x,y,a0] of [[0,0,0],[Lw,0,Math.PI/2],[Lw,Wd,Math.PI],[0,Wd,Math.PI*1.5]]){q.beginPath();q.arc(x,y,10,a0,a0+Math.PI/2);q.stroke()}q.restore()};
 lines(.9,'rgba(10,40,16,.22)',2.2);lines(0,'rgba(252,253,248,.94)',2);
 q.restore();return cv};
// ---------- live world-space detail: corner flags, waving crowd flags, rain splashes, floodlight shadows ----------
var lmDrawRings9=lmDrawRings;lmDrawRings=function(){if(LM&&!LM.noFx9)try{lmWorldFx9()}catch(e){LM.noFx9=1}lmDrawRings9()};
function lmWorldFx9(){const Lw=LMP.L,Wd=LMP.W,f=S.rm?0:LM.f,v=lmView(),vis=(x,y,m)=>x>v.ox-m&&x<v.ox+480+m&&y>v.oy-m&&y<v.oy+320+m;
 // corner flags
 for(const [x,y] of [[0,0],[Lw,0],[0,Wd],[Lw,Wd]]){if(!vis(x,y,30))continue;const w=Math.sin(f/9+x)*1.4;g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+3,y+.5,4,1.2,0,0,7);g.fill();g.strokeStyle='#e8ecf2';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-17);g.stroke();
  g.fillStyle=LM.tm[0].kit.sh;g.beginPath();g.moveTo(x,y-17);g.lineTo(x+7,y-15.5+w);g.lineTo(x,y-12.5);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x,y-17);g.lineTo(x+7,y-15.5+w);g.lineTo(x,y-15.8);g.closePath();g.fill();g.restore()}
 // supporters' flags in the stands: home colours mostly, a pocket of away fans; they wave harder after goals
 const hype=B&&B.fx>0?2.2:1,kits=[LM.tm[0].kit,LM.tm[1].kit],spots=lmFlagSpots9();
 for(const s of spots){if(!vis(s.x,s.y,30))continue;const k=kits[s.t],ph=f/(7-s.r%3)+s.r,wv=Math.sin(ph)*2.2*hype,lean=Math.sin(ph*.5)*1.5*hype;g.save();g.strokeStyle='#9aa1ad';g.lineWidth=.8;g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x+lean,s.y-15);g.stroke();
  const fx=s.x+lean,fy=s.y-15;g.fillStyle=solid(k.sh);g.beginPath();g.moveTo(fx,fy);g.quadraticCurveTo(fx+6,fy-1+wv,fx+12,fy+wv*.6);g.lineTo(fx+12,fy+7+wv*.6);g.quadraticCurveTo(fx+6,fy+6+wv,fx,fy+7);g.closePath();g.fill();
  g.fillStyle=solid(k.c2);g.fillRect(fx+.5,fy+2.6,11,1.6);g.restore()}
 // rain: splashes where drops hit the turf, and a faint wet shine around the ball
 if(B.wx==='Rain'&&!S.rm){g.save();g.strokeStyle='rgba(220,235,255,.45)';g.lineWidth=.6;for(let i=0;i<26;i++){const life=(f+i*7)%26,x=v.ox+H(i,Math.floor((f+i*7)/26),3)*4.8,y=v.oy+H(i,Math.floor((f+i*7)/26),5)*3.2,r=1+life*.22;g.globalAlpha=.6*(1-life/26);g.beginPath();g.ellipse(x,y,r,r*.4,0,0,7);g.stroke()}g.restore();
  const b=LM.ball;g.save();g.globalAlpha=.18;g.fillStyle='#dfe9ff';g.beginPath();g.ellipse(b.x,b.y+2.2,5,1.4,0,0,7);g.fill();g.restore()}
 // under the floodlights every player throws four faint shadows, one away from each pylon
 if(S.t>=2){g.save();g.fillStyle='rgba(8,12,20,.10)';for(const p of LM.P){if(p.off||!vis(p.x,p.y,20))continue;for(const [lx,ly] of [[-58,-58],[Lw+58,-58],[-58,Wd+58],[Lw+58,Wd+58]]){const a=Math.atan2(p.y-ly,p.x-lx);g.save();g.translate(p.x+Math.cos(a)*6,p.y+Math.sin(a)*2.4);g.rotate(Math.atan2(Math.sin(a)*.42,Math.cos(a)));g.beginPath();g.ellipse(0,0,7,1.7,0,0,7);g.fill();g.restore()}}g.restore()}}
function lmFlagSpots9(){if(LM.flags9)return LM.flags9;const out=[],Lw=LMP.L,Wd=LMP.W,Mg=LMP.M,away=LM.tm[1].side>0?1:0;
 for(let x=-40;x<Lw+40;x+=58){const r=H(x+3,1,7);if(r<35)continue;out.push({x:x+H(x,2,3)%20,y:-44-H(x,4,5)%Math.max(1,Mg-60),t:r%9===0?1:0,r});const r2=H(x+5,9,7);if(r2>40)out.push({x:x+H(x,6,3)%20,y:Wd+52+H(x,8,5)%Math.max(1,Mg-64),t:0,r:r2})}
 // the away end: one side stand behind a goal, packed with the visitors' colours
 for(let y=10;y<Wd-10;y+=46){const r=H(y,11,7);if(r<30)continue;const ax=away?Lw+48+H(y,12,3)%26:-70+H(y,12,3)%26;out.push({x:ax,y:y+12,t:1,r});const hx=away?-70+H(y,13,3)%26:Lw+48+H(y,13,3)%26;if(r>55)out.push({x:hx,y:y+30,t:0,r:r+1})}
 return LM.flags9=out}
// ---------- screen-space atmosphere: floodlight glare and camera flashes at night ----------
var lmAtmos9=lmAtmos;lmAtmos=function(v){lmAtmos9(v);if(!LM||S.rm)return;const Lw=LMP.L,Wd=LMP.W;
 if(S.t>=2){g.save();g.globalCompositeOperation='lighter';for(const [x,y] of [[-58,-58],[Lw+58,-58],[-58,Wd+58],[Lw+58,Wd+58]]){const sx=x-v.ox,sy=y-v.oy;if(sx<-60||sx>540||sy<-60||sy>380)continue;const gr=g.createRadialGradient(sx,sy,1,sx,sy,34);gr.addColorStop(0,'rgba(255,252,230,.85)');gr.addColorStop(.25,'rgba(255,248,210,.25)');gr.addColorStop(1,'rgba(255,248,210,0)');g.fillStyle=gr;g.fillRect(sx-34,sy-34,68,68)}
  // camera flashes in the stands around big moments
  const n=B&&B.fx>0?10:LM.ball.shot?3:0;for(let i=0;i<n;i++){if(H(i,LM.f>>1,9)>22)continue;const wx=H(i,LM.f>>3,3)*12-60,wy=H(i,LM.f>>3,4)%2?-40-H(i,5,5)*.4:Wd+40+H(i,6,5)*.4,sx=wx-v.ox,sy=wy-v.oy;if(sx<0||sx>480||sy<0||sy>320)continue;const gr=g.createRadialGradient(sx,sy,0,sx,sy,6);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(sx-6,sy-6,12,12)}g.restore()}};
// ---------- city speech bubbles: drawn above the world AND moved clear of the HUD panels so they are never hidden ----------
var BUB9=[],HUDR9=[];var panel9=panel;panel=function(x,y,w,h){if(HUDR9.length<24)HUDR9.push([x,y,w,h]);return panel9.apply(this,arguments)};
pedDraw9=function(p,x,y,moving){const st=p.sit?'sit':p.act?p.act:moving?(p.role==='track'?'run':'walk'):'idle',f=p.act==='celf'?(tick>>3)&1:moving?Math.floor(p.ph*2)&7:((tick+p.x)>>5)&1;
 drawActor(x,y,p.look,1.08,p.sit?'d':p.dir,st,f,0,p.fade<1?Math.max(0,p.fade):null);
 if(p.rec&&p.rec.line&&p.fade>=1&&BUB9.length<12)BUB9.push({x,y,line:p.rec.line,a:Math.min(1,p.rec.t/20)})};
function bubbles9(){if(!BUB9.length){HUDR9.length=0;return}const rs=HUDR9.slice(),done=[];
 const hit=(x,y,w,h)=>rs.some(r=>x<r[0]+r[2]&&x+w>r[0]&&y<r[1]+r[3]&&y+h>r[1])||done.some(r=>x<r[0]+r[2]+2&&x+w+2>r[0]&&y<r[1]+r[3]+2&&y+h+2>r[1]);
 for(const b of BUB9){const fs=8,w=Math.min(170,tw(b.line,fs)+16),h=17;let bx=clamp(b.x-w/2,4,476-w),by=b.y-60,up=true;
  if(hit(bx,by,w,h)){by=b.y+6;up=false}if(hit(bx,by,w,h)||by<2||by+h>318)continue;done.push([bx,by,w,h]);
  g.save();g.globalAlpha=b.a;smooth(1);g.fillStyle='rgba(0,0,0,.22)';rr(bx+1,by+2,w,h,7);g.fill();g.fillStyle='rgba(255,255,255,.97)';rr(bx,by,w,h,7);g.fill();g.strokeStyle='rgba(30,24,38,.55)';g.lineWidth=.8;g.stroke();
  const tx=clamp(b.x,bx+8,bx+w-8);g.beginPath();if(up){g.moveTo(tx-3,by+h);g.lineTo(tx+1,by+h+5);g.lineTo(tx+4,by+h)}else{g.moveTo(tx-3,by);g.lineTo(tx+1,by-5);g.lineTo(tx+4,by)}g.closePath();g.fillStyle='rgba(255,255,255,.97)';g.fill();
  txt(b.line,bx+w/2,by+12,fs,'#1b2240','#0000','center');g.restore()}
 BUB9.length=0;HUDR9.length=0}
var drawUIh9=drawUI;drawUI=function(){bubbles9();return drawUIh9()};
