// ===================== v9 LIVE MATCH: stadium art, broadcast HUD, input, settings, wiring =====================
var LMPC=null,LMPR=0,LMPTR=null;
// ---------- the stadium: pitch, stands, boards (static, cached once per resolution) ----------
function lmPitchCanvas(){const PR=clamp(Math.round(SCv),1,2);if(LMPC&&LMPR===PR)return LMPC;LMPR=PR;
 const Lw=LMP.L,Wd=LMP.W,Mg=LMP.M,cv=document.createElement('canvas');cv.width=(Lw+Mg*2)*PR;cv.height=(Wd+Mg*2)*PR;const q=cv.getContext('2d');q.scale(PR,PR);q.translate(Mg,Mg);
 const hr=(x,y,i)=>H(Math.floor(x)+500,Math.floor(y)+500,i);
 q.fillStyle='#191c24';q.fillRect(-Mg,-Mg,Lw+Mg*2,Wd+Mg*2);
 // stands: stepped concrete tiers with a seated crowd in both clubs' colours
 const kU=LM?LM.tm[0].kit:{sh:'#c0392b',c2:'#fff'},kT=LM?LM.tm[1].kit:{sh:'#2e6fb8',c2:'#fff'},home=LM&&LM.tm[0].side>0;
 const crowdCol=(x,y)=>{const h=hr(x,y,7);if(h<34)return kU.sh;if(h<46)return kU.c2;if(h<62)return kT.sh;if(h<68)return kT.c2;return['#e8e2d4','#2c3e50','#7a7f8c','#c9a227','#3b3f48','#a0522d','#ecf0f1'][h%7]};
 const tier=(x0,y0,x1,y1,vert)=>{const n=vert?Math.floor((x1-x0)/6):Math.floor((y1-y0)/6);for(let r=0;r<n;r++){q.fillStyle=r%2?'#2a2e39':'#242833';if(vert)q.fillRect(x0+r*6,y0,6,y1-y0);else q.fillRect(x0,y0+r*6,x1-x0,6);q.fillStyle='rgba(0,0,0,.35)';if(vert)q.fillRect(x0+r*6+5,y0,1,y1-y0);else q.fillRect(x0,y0+r*6+5,x1-x0,1)}
  const step=4.4;for(let a=(vert?y0:x0)+2;a<(vert?y1:x1)-1;a+=step)for(let r=0;r<n;r++){const x=vert?x0+r*6+3:a+(r%2)*2.2,y=vert?a+(r%2)*2.2:y0+r*6+3;if(hr(x,y,3)<9)continue;const c=crowdCol(x,y);q.fillStyle=shd(solid(c),.82);q.fillRect(x-1.5,y-.6,3,2.6);q.fillStyle=['#f1c27d','#c68642','#8d5524','#e0ac69','#5c3a21'][hr(x,y,5)%5];q.beginPath();q.arc(x,y-1.4,1.15,0,7);q.fill()}};
 tier(-Mg+4,-Mg+4,Lw+Mg-4,-34,0);tier(-Mg+4,Wd+34,Lw+Mg-4,Wd+Mg-4,0);tier(-Mg+4,-30,-40,Wd+30,1);tier(Lw+40,-30,Lw+Mg-4,Wd+30,1);
 // stand roof edge + aisles
 q.fillStyle='rgba(0,0,0,.45)';q.fillRect(-Mg,-Mg,Lw+Mg*2,4);q.fillRect(-Mg,Wd+Mg-4,Lw+Mg*2,4);for(let x=60;x<Lw;x+=180){q.fillStyle='#30343f';q.fillRect(x,-Mg+4,5,Mg-38);q.fillRect(x,Wd+34,5,Mg-38)}
 // apron grass and running edge
 q.fillStyle='#2e7436';q.fillRect(-34,-30,Lw+68,Wd+60);for(let i=0;i<22;i++){q.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.035)';q.fillRect(-34+i*(Lw+68)/22,-30,(Lw+68)/22,Wd+60)}
 // advertising boards (fictional sponsors only)
 const ads=SP.map(s=>s[0].toUpperCase()).concat(['LEGACY FC']);const board=(x,y,w,h,vert)=>{const gr=q.createLinearGradient(x,y,vert?x+w:x,vert?y:y+h);gr.addColorStop(0,'#10131a');gr.addColorStop(1,'#1d2230');q.fillStyle=gr;q.fillRect(x,y,w,h);q.fillStyle='rgba(255,255,255,.08)';q.fillRect(x,y,vert?1:w,vert?h:1);
  q.save();q.beginPath();q.rect(x,y,w,h);q.clip();q.font='800 6.4px '+FONTS;q.textBaseline='middle';let i=0;if(vert){q.translate(x+w/2,y);q.rotate(Math.PI/2);for(let a=4;a<h;a+=62){q.fillStyle=i%2?'#ffd96a':'#e8ecf2';q.fillText(ads[(i+hr(x,a,1))%ads.length],a,0);i++}}else for(let a=x+6;a<x+w;a+=66){q.fillStyle=i%2?'#ffd96a':'#e8ecf2';q.fillText(ads[(i+hr(a,y,1))%ads.length],a,y+h/2);i++}q.restore()};
 board(-22,-27,Lw+44,9,0);board(-22,Wd+18,Lw+44,9,0);board(-33,-18,8,Wd/2-LMP.GW/2-8,1);board(-33,Wd/2+LMP.GW/2+26,8,Wd/2-LMP.GW/2-44,1);board(Lw+25,-18,8,Wd/2-LMP.GW/2-8,1);board(Lw+25,Wd/2+LMP.GW/2+26,8,Wd/2-LMP.GW/2-44,1);
 // dugouts on the near touchline
 for(const s of [-1,1]){const x0=Lw/2+s*70-(s<0?90:0);q.fillStyle='rgba(0,0,0,.35)';q.fillRect(x0+2,Wd+8,90,10);const gr=q.createLinearGradient(0,Wd+5,0,Wd+15);gr.addColorStop(0,'rgba(170,210,255,.55)');gr.addColorStop(1,'rgba(60,90,130,.6)');q.fillStyle=gr;q.beginPath();q.roundRect(x0,Wd+5,90,10,4);q.fill();q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=.8;q.stroke();for(let i=0;i<7;i++){q.fillStyle=s<0?kU.sh:kT.sh;q.beginPath();q.arc(x0+8+i*12,Wd+10,2.2,0,7);q.fill()}}
 q.fillStyle='rgba(255,255,255,.55)';q.fillRect(Lw/2-12,Wd+6,24,7);
 // floodlight pylons at the corners
 for(const [x,y] of [[-58,-58],[Lw+58,-58],[-58,Wd+58],[Lw+58,Wd+58]]){q.fillStyle='rgba(0,0,0,.45)';q.beginPath();q.ellipse(x+5,y+5,13,8,0,0,7);q.fill();q.fillStyle='#3a3f4c';q.beginPath();q.roundRect(x-11,y-7,22,14,3);q.fill();for(let i=0;i<4;i++){q.fillStyle='#fffbe0';q.fillRect(x-9+i*5,y-4,3.4,8)}}
 // the pitch: mown stripes, fine grain, wear in the goalmouths
 for(let i=0;i<18;i++){q.fillStyle=i%2?'#3d9b48':'#46a852';q.fillRect(i*Lw/18,0,Lw/18+.5,Wd)}
 for(let i=0;i<9;i++){q.fillStyle=i%2?'rgba(255,255,255,.022)':'rgba(0,0,0,.022)';q.fillRect(0,i*Wd/9,Lw,Wd/9)}
 for(let i=0;i<9000;i++){const x=hr(i,1,2)*10.5+hr(i,5,3)*.105,y=hr(i,2,4)*6.8+hr(i,7,9)*.068;q.fillStyle=hr(i,3,5)<50?'rgba(20,60,25,.10)':'rgba(190,240,170,.07)';q.fillRect(x,y,1.2,1.2)}
 for(const [x,y,r] of [[Lw/2,Wd/2,70],[60,Wd/2,62],[Lw-60,Wd/2,62],[12,Wd/2,30],[Lw-12,Wd/2,30]]){const gr=q.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,'rgba(140,120,70,.16)');gr.addColorStop(1,'rgba(140,120,70,0)');q.fillStyle=gr;q.fillRect(x-r,y-r,r*2,r*2)}
 // markings (FIFA proportions, 10 units per metre)
 q.strokeStyle='rgba(250,252,246,.9)';q.lineWidth=2;q.lineCap='round';const cy=Wd/2;
 q.strokeRect(0,0,Lw,Wd);q.beginPath();q.moveTo(Lw/2,0);q.lineTo(Lw/2,Wd);q.stroke();q.beginPath();q.arc(Lw/2,cy,91.5,0,7);q.stroke();
 for(const [gx,s] of [[0,1],[Lw,-1]]){q.strokeRect(Math.min(gx,gx+s*165),cy-201.5,165,403);q.strokeRect(Math.min(gx,gx+s*55),cy-91.5,55,183);q.beginPath();const ps=gx+s*110;q.fillStyle='rgba(250,252,246,.9)';q.arc(ps,cy,2.2,0,7);q.fill();
  const a=Math.acos(55/91.5);q.beginPath();if(s>0)q.arc(ps,cy,91.5,-a,a);else q.arc(ps,cy,91.5,Math.PI-a,Math.PI+a);q.stroke()}
 q.beginPath();q.fillStyle='rgba(250,252,246,.9)';q.arc(Lw/2,cy,2.4,0,7);q.fill();
 for(const [x,y,a0] of [[0,0,0],[Lw,0,Math.PI/2],[Lw,Wd,Math.PI],[0,Wd,Math.PI*1.5]]){q.beginPath();q.arc(x,y,10,a0,a0+Math.PI/2);q.stroke()}
 LMPC=cv;return cv}
// ---------- goals (drawn live so the net can ripple) ----------
function lmGoalPieces(gx){const s=gx===0?-1:1,cy=LMP.W/2,yF=cy-LMP.GW/2,yN=cy+LMP.GW/2,h=LMP.GH*LMP.ZP,dp=22,bx=gx+s*dp,hb=h*.62,rip=LM.goal&&LM.stT<70&&lmGoalX(LM.goal.team)===gx&&!S.rm?Math.sin(LM.stT*.5)*2.2*(1-LM.stT/70):0;
 const net=(pts)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath()};
 const back=()=>{g.save();g.fillStyle='rgba(0,0,0,.22)';g.fillRect(Math.min(gx,bx),yF,dp,yN-yF);
  g.fillStyle='rgba(236,240,246,.16)';net([gx,yF-h,gx,yN-h,bx+rip,yN-hb,bx+rip,yF-hb]);g.fill();net([bx+rip,yF-hb,bx+rip,yN-hb,bx+rip,yN,bx+rip,yF]);g.fill();net([gx,yF,gx,yF-h,bx,yF-hb,bx,yF]);g.fill();
  g.strokeStyle='rgba(236,240,246,.32)';g.lineWidth=.5;for(let y=yF;y<=yN;y+=4){g.beginPath();g.moveTo(gx,y-h);g.lineTo(bx+rip,y-hb);g.lineTo(bx+rip,y);g.stroke()}for(let k=1;k<5;k++){const t=k/5;g.beginPath();g.moveTo(gx+(bx-gx)*t,yF-h+(h-hb)*t);g.lineTo(gx+(bx+rip-gx)*t,yN-h+(h-hb)*t);g.stroke()}
  g.strokeStyle='#f4f6f8';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(gx,yF);g.lineTo(gx,yF-h);g.lineTo(gx,yN-h);g.stroke();g.lineWidth=1.2;g.strokeStyle='rgba(220,226,234,.8)';g.beginPath();g.moveTo(gx,yF-h);g.lineTo(bx,yF-hb);g.lineTo(bx,yN-hb);g.moveTo(bx,yF-hb);g.lineTo(bx,yF);g.stroke();g.restore()};
 const front=()=>{g.save();g.fillStyle='rgba(236,240,246,.14)';net([gx,yN,gx,yN-h,bx+rip,yN-hb,bx+rip,yN]);g.fill();g.strokeStyle='rgba(236,240,246,.3)';g.lineWidth=.5;for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(gx+(bx-gx)*t,yN-h+(h-hb)*t);g.lineTo(gx+(bx-gx)*t,yN);g.stroke()}
  g.strokeStyle='#f4f6f8';g.lineWidth=2.6;g.lineCap='round';g.beginPath();g.moveTo(gx,yN);g.lineTo(gx,yN-h);g.stroke();g.lineWidth=1.2;g.strokeStyle='rgba(220,226,234,.85)';g.beginPath();g.moveTo(gx,yN-h);g.lineTo(bx,yN-hb);g.lineTo(bx,yN);g.stroke();
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(gx,yN+1,3,1.2,0,0,7);g.fill();g.restore()};
 return{back,front,y:yN}}
// ---------- per-frame draw ----------
function lmView(){const c=LM.cam;let sx=0,sy=0;if(LM.shake&&!S.rm){sx=(lmRand()-.5)*LM.shake*.5;sy=(lmRand()-.5)*LM.shake*.5}return{ox:clamp(Math.round((c.x-240+sx)*4)/4,-LMP.M,LMP.L+LMP.M-480),oy:clamp(Math.round((c.y-160+sy)*4)/4,-LMP.M,LMP.W+LMP.M-320)}}
function lmDraw(){if(!LM){return}const v=lmView(),PC=lmPitchCanvas(),PR=LMPR,Mg=LMP.M;smooth(1);g.imageSmoothingQuality='high';
 g.drawImage(PC,(v.ox+Mg)*PR,(v.oy+Mg)*PR,480*PR,320*PR,0,0,480,320);
 // crowd movement: only the visible stand area, only around goals and big moments
 if(!S.rm){const hype=(B.fx>0?1:0)+(LM.state==='play'&&LM.ball.shot?0.4:0);if(hype>0){g.save();for(let i=0;i<70*hype;i++){const x=(H(i,LM.f>>2,3)*4.8),y=H(i,9,4)*3.2;const wy=y+v.oy;if(wy>-36&&wy<LMP.W+36&&x+v.ox>-38&&x+v.ox<LMP.L+38)continue;g.fillStyle=i%3?'rgba(255,255,255,.55)':LM.tm[0].kit.sh;g.fillRect(x,y-Math.abs(Math.sin((LM.f+i*7)/5))*2,1.6,1.6)}g.restore()}}
 g.save();g.translate(-v.ox,-v.oy);
 const goals=[lmGoalPieces(0),lmGoalPieces(LMP.L)];goals.forEach(q=>q.back());
 const ents=[];for(const p of LM.P){if(!p.off)ents.push({y:p.y,d:()=>lmDrawPlayer(p)})}goals.forEach(q=>ents.push({y:q.y,d:q.front}));ents.push({y:LM.ball.y+.5,d:lmDrawBall});ents.sort((a,b)=>a.y-b.y);
 lmDrawRings();for(const e of ents)e.d();lmDrawMarkers();g.restore();
 lmAtmos(v);
 for(const c of LM.conf){g.fillStyle=c.c;g.fillRect(c.x,c.y,2,3)}
 lmHUD(v)}
function lmDrawPlayer(p){const sc=LMP.SC;
 if(p.dive){const ang=(p.dive.s>0?1:-1)*(p.dir==='l'?-1.25:1.25);actorShadow8(p.x,p.y,sc*1.2);g.save();g.translate(p.x,p.y-6);g.rotate(ang);drawActor(0,0,p.look,sc,'d','cel',0,1);g.restore();return}
 if(p.sl>0){drawActor(p.x,p.y,p.look,sc,p.vx>=0?'r':'l','slide',0);return}
 const al=p.stun>0&&!p.act?.92:null;drawActor(p.x,p.y,p.look,sc,p.dir,p.st,p.f,0,al)}
function lmDrawBall(){const b=LM.ball,s=.68,fr=Math.floor(b.rot/5)&3;g.save();g.fillStyle=`rgba(10,16,12,${clamp(.38-b.z*.008,.12,.38)})`;g.beginPath();g.ellipse(b.x+b.z*.25,b.y+1.5,3.6*(1+b.z*.01),1.5*(1+b.z*.01),0,0,7);g.fill();smooth(1);g.drawImage(ballSpr(ballCol(),fr),b.x-6*s,b.y-b.z*LMP.ZP-6*s-2,12*s,12*s);g.restore()}
function lmDrawRings(){const b=LM.ball;g.save();g.lineWidth=1.2;
 if(b.own&&!b.own.me){g.strokeStyle=b.own.team===0?'rgba(255,255,255,.75)':'rgba(255,140,120,.8)';g.beginPath();g.ellipse(b.own.x,b.own.y+1,8,3.4,0,0,7);g.stroke()}
 const e=LM.eli;if(e&&!e.off){const pulse=S.rm?0:Math.sin(LM.f/9)*.6;g.strokeStyle='#ffd24a';g.lineWidth=1.8;g.beginPath();g.ellipse(e.x,e.y+1,9+pulse,3.8+pulse*.3,0,0,7);g.stroke();
  if(b.own===e||LM.charge>=0){const f=e.face||[LM.tm[e.team].side,0];g.fillStyle='rgba(255,210,74,.85)';g.beginPath();g.moveTo(e.x+f[0]*16,e.y+1+f[1]*7);g.lineTo(e.x+f[0]*11-f[1]*4,e.y+1+f[1]*5+f[0]*1.6);g.lineTo(e.x+f[0]*11+f[1]*4,e.y+1+f[1]*5-f[0]*1.6);g.closePath();g.fill()}}
 if(b.tgt&&!b.own&&b.pass&&LM.state==='play'){g.strokeStyle='rgba(159,232,255,.45)';g.setLineDash([2,3]);g.beginPath();g.ellipse(b.tgt.x,b.tgt.y+1,7,3,0,0,7);g.stroke();g.setLineDash([])}g.restore()}
function lmDrawMarkers(){const e=LM.eli;if(!e||e.off)return;const hy=e.y-36,bob=S.rm?0:Math.sin(LM.f/10)*1.2;g.save();g.fillStyle='#ffd24a';g.strokeStyle='#2a1d00';g.lineWidth=1;g.beginPath();g.moveTo(e.x-4,hy-6+bob);g.lineTo(e.x+4,hy-6+bob);g.lineTo(e.x,hy+bob);g.closePath();g.fill();g.stroke();g.restore();
 if(LM.charge>=0){const w=26,c=Math.min(1,LM.charge),over=LM.charge>.95;g.save();g.fillStyle='rgba(0,0,0,.6)';g.fillRect(e.x-w/2-1,hy-15,w+2,5);const gr=g.createLinearGradient(e.x-w/2,0,e.x+w/2,0);gr.addColorStop(0,'#7dff9a');gr.addColorStop(.7,'#ffd24a');gr.addColorStop(1,'#ff5a4a');g.fillStyle=gr;g.fillRect(e.x-w/2,hy-14,w*c,3);if(over){g.fillStyle='rgba(255,90,74,.9)';g.fillRect(e.x+w/2-2,hy-15,2,5)}g.restore()}
 // team-mate with the ball while Eli calls for it
 if(LM.call>0&&LM.ball.own&&LM.ball.own.team===e.team&&!LM.ball.own.me){const c=LM.ball.own;txt('!',c.x,c.y-38,10,'#9fe8ff','#000c','center')}}
function lmAtmos(v){const night=S.t>=2,wx=B.wx;
 if(night||wx=='Rain'||wx=='Cloudy'){g.save();g.globalCompositeOperation='multiply';g.fillStyle=S.t==3?'rgb(118,128,170)':S.t==2?'rgb(250,210,178)':'rgb(208,214,228)';g.fillRect(0,0,480,320);g.restore()}
 if(night){g.save();g.globalCompositeOperation='lighter';for(const [x,y] of [[-58,-58],[LMP.L+58,-58],[-58,LMP.W+58],[LMP.L+58,LMP.W+58]]){const sx=x-v.ox,sy=y-v.oy;if(sx<-420||sx>900||sy<-420||sy>740)continue;const gr=g.createRadialGradient(sx,sy,4,sx,sy,430);gr.addColorStop(0,'rgba(255,250,225,.30)');gr.addColorStop(1,'rgba(255,250,225,0)');g.fillStyle=gr;g.fillRect(0,0,480,320)}g.restore()}
 if(wx=='Rain'){g.save();g.fillStyle='rgba(180,200,230,.06)';g.fillRect(0,0,480,320);if(!S.rm){g.strokeStyle='rgba(210,225,245,.45)';g.lineWidth=1;g.beginPath();for(let i=0;i<80;i++){const x=(H(i,1,3)*5+LM.f*2)%500-10,y=(H(i,2,4)*3.4+LM.f*9)%340-10;g.moveTo(x,y);g.lineTo(x+2,y-9)}g.stroke()}g.restore()}
 if(wx=='Windy'&&!S.rm){g.save();g.strokeStyle='rgba(255,255,255,.14)';for(let i=0;i<5;i++){const y=(H(i,3,5)*3+LM.f*.3)%300,x=(LM.f*3+i*90)%600-60;g.beginPath();g.moveTo(x,y);g.lineTo(x+40,y-2);g.stroke()}g.restore()}
 const vg=g.createRadialGradient(240,160,150,240,160,320);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=vg;g.fillRect(0,0,480,320)}
// ---------- broadcast HUD ----------
function lmOppName(){return B&&B.oc?nm(B.oc.n):(B?B.e.n:"")}
function lmAbbr(n){const w=String(n).trim().split(/\s+/)[0]||'';return w.slice(0,3).toUpperCase()}
function lmClockTxt(){const m=Math.floor(LM.min),s=Math.floor((LM.min-m)*60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function lmHUD(v){const he=S.lang=="he",T0=Object.assign({},LM.tm[0],{name:nm(mine().n)}),T1=Object.assign({},LM.tm[1],{name:B.oc?nm(B.oc.n):lmOppName()});
 // scoreboard
 const x=8,y=6,w=190;g.save();smooth(1);g.fillStyle='rgba(8,10,14,.86)';rr(x,y,w,22,6);g.fill();g.strokeStyle='rgba(212,167,44,.55)';g.lineWidth=1;g.stroke();
 const L1=he?T1:T0,R1=he?T0:T1,gL=he?B.ga:B.gf,gR=he?B.gf:B.ga;g.fillStyle=L1.kit.sh;g.fillRect(x+3,y+3,3,16);g.fillStyle=R1.kit.sh;g.fillRect(x+w-6,y+3,3,16);g.restore();
 crest(x+16,y+11,7,L1.name);crest(x+w-17,y+11,7,R1.name);txt(lmAbbr(L1.name),x+44,y+15.5,9,UIC.txt,'#0000','center');txt(lmAbbr(R1.name),x+w-45,y+15.5,9,UIC.txt,'#0000','center');
 pill(x+w/2-24,y+3,48,16,'#14161b','rgba(212,167,44,.5)');txt(`${gL} - ${gR}`,x+w/2,y+15,11,'#ffd96a','#0000','center');
 g.save();smooth(1);g.fillStyle=LM.half>2?'#7a1d1d':'rgba(8,10,14,.86)';rr(x+w+4,y,54,22,6);g.fill();g.restore();txtR(lmClockTxt(),x+w+31,y+15,10,'#ffffff','center');if(LM.state==='play'&&LM.f%60<40){g.fillStyle='#e53935';g.beginPath();g.arc(x+w+9,y+11,2,0,7);g.fill()}
 txt(LM.half==1?L('1ST HALF','מחצית 1'):LM.half==2?L('2ND HALF','מחצית 2'):L('EXTRA TIME','הארכה'),x+w+31,y+31,6,UIC.mut,'#000a','center');
 HIT.push({x,y,w:w+58,h:24,fn:()=>{if(LM&&!menu&&!dlg)lmPause()}});
 // Eli card: rating, stamina, real possession share
 const e=LM.eli;if(e){const cx=372,cw=100;panel(cx,6,cw,34,.92,0);txt(L('Eli','אלי')+' · '+ovr(),he?cx+cw-6:cx+6,18,8,'#ffd96a','#000a',he?'right':'left');if(e.off)txt(L('SENT OFF','הורחק'),he?cx+6:cx+cw-6,18,7,'#ff6b6b','#000a',he?'left':'right');else txt(L('STAMINA','כושר'),he?cx+6:cx+cw-6,18,6,UIC.mut,'#000a',he?'left':'right');
  barX(cx+6,23,cw-12,4,e.stam,e.stam>.5?'#4caf50':e.stam>.25?'#ffc93c':'#ef5350');const ps=LM.stats.pos,tot=ps[0]+ps[1];if(tot>120){const pc=Math.round(ps[0]/tot*100);txt(L(`Possession ${pc}%`,`החזקה ${pc}%`),cx+cw/2,36,6,UIC.txt,'#000a','center')}}
 // Eli off camera: an arrow on the screen edge points to him
 if(e&&!e.off){const sx=e.x-v.ox,sy=e.y-20-v.oy;if(sx<0||sx>480||sy<0||sy>320){const cx=clamp(sx,14,466),cy=clamp(sy,48,226),an=Math.atan2(sy-cy,sx-cx);g.save();smooth(1);g.translate(cx,cy);g.rotate(an);g.fillStyle='#ffd24a';g.strokeStyle='#2a1d00';g.lineWidth=1;g.beginPath();g.moveTo(9,0);g.lineTo(-5,-6);g.lineTo(-2,0);g.lineTo(-5,6);g.closePath();g.fill();g.stroke();g.restore();txt(L('Eli','אלי'),cx-Math.cos(an)*14,cy-Math.sin(an)*14+3,7,'#ffd96a','#000c','center')}}
 // radar: real positions of all 22 players and the ball
 const rw=96,rh=62,rx=he?8:480-rw-8,ry=320-rh-8,under=[LM.ball,e].some(o=>o&&o.x-v.ox>rx-6&&o.x-v.ox<rx+rw+6&&o.y-v.oy>ry-24&&o.y-v.oy<ry+rh+8);g.save();smooth(1);g.globalAlpha=under?.32:.88;g.fillStyle='rgba(14,40,22,.78)';rr(rx,ry,rw,rh,5);g.fill();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.7;g.strokeRect(rx+3,ry+3,rw-6,rh-6);g.beginPath();g.moveTo(rx+rw/2,ry+3);g.lineTo(rx+rw/2,ry+rh-3);g.stroke();g.beginPath();g.arc(rx+rw/2,ry+rh/2,7,0,7);g.stroke();
 const mx=wx=>rx+3+wx/LMP.L*(rw-6),my=wy=>ry+3+wy/LMP.W*(rh-6),box=(x0,x1,y0,y1)=>{const a=mx(x0),c=mx(x1);g.strokeRect(Math.min(a,c),my(y0),Math.abs(c-a),my(y1)-my(y0))};
 box(0,165,LMP.W/2-201.5,LMP.W/2+201.5);box(LMP.L-165,LMP.L,LMP.W/2-201.5,LMP.W/2+201.5);g.strokeStyle='rgba(255,255,255,.5)';box(v.ox,v.ox+480,v.oy,v.oy+320);
 for(const p of LM.P){if(p.off)continue;g.fillStyle=p.me?'#ffd24a':p.team===0?T0.kit.sh:T1.kit.sh;g.beginPath();g.arc(mx(p.x),my(p.y),p.me?2.4:1.8,0,7);g.fill();if(!p.me){g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=.5;g.stroke()}}
 g.fillStyle='#ffffff';g.beginPath();g.arc(mx(LM.ball.x),my(LM.ball.y),1.6,0,7);g.fill();g.restore();
 // commentary line
 if(LM.msg){const m=LM.msg,a=Math.min(1,m.t/15,(m.t0-m.t+1)/8);g.save();g.globalAlpha=a;const tw0=Math.min(166,tw(m.s,8)+20),bx=he?480-8-tw0:8;panel(bx,292,tw0,20,.92,0);txt(ell(m.s,tw0-12,8),bx+tw0/2,305,8,m.c,'#000a','center');g.restore()}
 // context prompts
 const bind=lmBindNames();if(LM.state==='play'&&LM.f<900&&!S.rm||LM.hint>0){if(LM.hint>0)LM.hint--;txt(L(`${bind.pass} pass · ${bind.shoot} shoot (hold) · ${bind.through} through ball · ${bind.sprint} sprint · Esc pause`,`${bind.pass} מסירה · ${bind.shoot} בעיטה (החזק) · ${bind.through} מסירת עומק · ${bind.sprint} ספרינט · Esc השהיה`),240,231,7,'rgba(230,236,245,.85)','#000c','center')}
 if(LM.state==='kick'){txt(L('KICK-OFF','שריקת פתיחה'),240,64,12,'#ffd96a','#000c','center');if(LM.kicker&&LM.kicker.me)txt(L(`Press ${bind.pass} to kick off`,`לחץ ${bind.pass} לפתיחה`),240,78,8,'#ffffff','#000c','center')}
 if(LM.state==='restart'&&LM.rs&&LM.rs.taker&&LM.rs.taker.me&&LM.rs.t>30){const k={corner:L('corner','קרן'),throw:L('throw-in','זריקת חוץ'),fk:L('free kick','בעיטה חופשית'),gk:L('goal kick','בעיטת שער')}[LM.rs.kind];txt(L(`Your ${k}: ${bind.pass} pass${LM.rs.kind=='fk'?' · '+bind.shoot+' shoot':''}`,`${k} שלך: ${bind.pass} מסירה${LM.rs.kind=='fk'?' · '+bind.shoot+' בעיטה':''}`),240,64,9,'#ffd96a','#000c','center')}
 if(LM.state==='goal'&&LM.goal)lmGoalOverlay();
 if(LM.state==='intro')lmIntro();
 if(LM.state==='ht'||LM.state==='ft'||LM.state==='et')lmStatsOverlay()}
function lmBindNames(){const kb=S.mkeys||{},f=k=>k===' '?'Space':k==='shift'?'Shift':String(k).toUpperCase();return{pass:f(kb.pass||'j'),shoot:f(kb.shoot||'k'),through:f(kb.through||'l'),sprint:f(kb.sprint||'shift')}}
function lmGoalOverlay(){const g0=LM.goal,us=g0.team===0,t=LM.stT,a=Math.min(1,t/10)*Math.min(1,(200-t)/20);g.save();g.globalAlpha=Math.max(0,a);
 if(!us){g.fillStyle='rgba(160,20,20,.18)';g.fillRect(0,0,480,320)}
 const sc=S.rm?1:1+Math.max(0,(14-t)/14)*.5;g.translate(240,110);g.scale(sc,sc);g.font=`800 38px ${FONTS}`;g.textAlign='center';g.lineWidth=6;g.strokeStyle='#120c00';g.direction=S.lang=='he'?'rtl':'ltr';const word=L('GOAL!','גול!');g.strokeText(word,0,0);g.fillStyle=us?goldG(-30,4):'#ffd0d0';g.fillText(word,0,0);g.restore();
 g.save();g.globalAlpha=Math.max(0,a);txt(g0.who+(g0.ast?' · '+L('assist ','בישול ')+g0.ast:''),240,132,11,'#ffffff','#000c','center');txt(`${nm(mine().n)} ${B.gf} - ${B.ga} ${lmOppName()}`,240,148,9,'#ffd96a','#000c','center');if(g0.me)txt(L('YOUR GOAL!','השער שלך!'),240,164,9,'#7dff9a','#000c','center');g.restore()}
function lmIntro(){const he=S.lang=='he',b=lmBindNames();g.save();g.fillStyle='rgba(4,6,10,.72)';g.fillRect(0,0,480,320);g.restore();panel(70,34,340,238,.97);txt(L('LIVE MATCH · CONTROLS','משחק חי · שליטה'),240,58,13,'#ffd96a','#000a','center');
 const rows=[[L('Move','תנועה'),L('WASD / Arrows','WASD / חצים')],[L('Sprint','ספרינט'),b.sprint+L(' (uses stamina)',' (צורך כושר)')],[L('Pass  ·  without ball: tackle / call','מסירה · בלי כדור: תיקול / בקשה'),b.pass+L(' (also Space, Enter)',' (גם Space, Enter)')],[L('Shoot (hold = power)  ·  slide tackle','בעיטה (החזק = עוצמה) · תיקול גלישה'),b.shoot+L(' (also X)',' (גם X)')],[L('Through ball','מסירת עומק'),b.through+L(' (also C)',' (גם C)')],[L('Aim a shot','כיוון בעיטה'),L('hold Up / Down','החזק למעלה / למטה')],[L('Pass to a spot','מסירה לנקודה'),L('click the pitch','לחיצה על המגרש')],[L('Pause · tactics · simulate','השהיה · טקטיקה · דימוי'),'Esc / P']];
 rows.forEach((r,i)=>{const y=86+i*20;if(i%2==0){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(82,y-12,316,18)}txt(r[0],he?392:88,y,8,UIC.txt,'#000a',he?'right':'left');txt(r[1],he?88:392,y,8,'#ffd96a','#000a',he?'left':'right')});
 txt(L('Touch: A = pass, B = shoot, RUN = sprint. Keys can be changed in Settings.','מגע: A = מסירה, B = בעיטה, RUN = ספרינט. אפשר לשנות מקשים בהגדרות.'),240,250,7,UIC.mut,'#000a','center');txt(L(`Press ${b.pass} / A to kick off`,`לחץ ${b.pass} / A לשריקת פתיחה`),240,265,9,LM.f%60<44?'#ffffff':'#ffd96a','#000a','center');HIT.push({x:0,y:0,w:480,h:320,fn:()=>lmDown('pass')})}
function lmStatRows(s){const pt=s.pos[0]+s.pos[1]||1,pc=[Math.round(s.pos[0]/pt*100),100-Math.round(s.pos[0]/pt*100)];
 return[[L('Possession','החזקת כדור'),pc[0]+'%',pc[1]+'%'],[L('Shots','בעיטות'),s.sh[0],s.sh[1]],[L('On target','למסגרת'),s.on[0],s.on[1]],[L('Passes completed','מסירות מוצלחות'),`${s.pc[0]}/${s.pa[0]}`,`${s.pc[1]}/${s.pa[1]}`],[L('Tackles attempted','ניסיונות תיקול'),s.tk[0],s.tk[1]],[L('Interceptions','יירוטים'),s.it[0],s.it[1]],[L('Saves','הצלות'),s.sv[0],s.sv[1]],[L('Corners','קרנות'),s.co[0],s.co[1]],[L('Fouls','עבירות'),s.fo[0],s.fo[1]],[L('Offsides','נבדלים'),(s.of||[0,0])[0],(s.of||[0,0])[1]],[L('Yellow cards','צהובים'),s.yc[0],s.yc[1]]]}
function lmStatsTable(s,x,y,w,tmU,tmT){const he=S.lang=='he',rows=lmStatRows(s);crest(he?x+w-14:x+14,y+2,7,tmU);crest(he?x+14:x+w-14,y+2,7,tmT);
 rows.forEach((r,i)=>{const yy=y+22+i*15;if(i%2==0){g.fillStyle='rgba(255,255,255,.04)';g.fillRect(x+4,yy-10,w-8,14)}txt(r[0],x+w/2,yy,7,UIC.txt,'#000a','center');txt(String(r[1]),he?x+w-12:x+12,yy,8,'#ffd96a','#000a',he?'right':'left');txt(String(r[2]),he?x+12:x+w-12,yy,8,'#ffffff','#000a',he?'left':'right')})}
function lmStatsOverlay(){g.save();g.fillStyle='rgba(4,6,10,.62)';g.fillRect(0,0,480,320);g.restore();const st=LM.state,tt=st==='ht'?L('HALF TIME','מחצית'):st==='et'?L('90 MINUTES · EXTRA TIME NEXT','90 דקות · הארכה'):L('FULL TIME','סיום');
 panel(100,16,280,262,.97);txt(tt,240,34,12,'#ffd96a','#000a','center');txt(`${nm(mine().n)}  ${B.gf} - ${B.ga}  ${lmOppName()}`,240,50,10,UIC.txt,'#000a','center');lmStatsTable(LM.stats,108,62,264,nm(mine().n),lmOppName());
 txt(LM.simmed?L('Score after the simulated minutes; stats cover the minutes you played.','התוצאה כוללת דקות מדומות; הסטטיסטיקה רק מהדקות ששוחקו.'):L('All numbers are counted from this match.','כל המספרים נספרו מהמשחק הזה.'),240,253,6,UIC.mut,'#000a','center');
 if(LM.stT>40)txt(L('A: continue','A: המשך'),240,270,9,LM.f%60<44?'#ffffff':'#ffd96a','#000a','center');HIT.push({x:0,y:0,w:480,h:320,fn:()=>lmDown('pass')})}
// ---------- full-time report: second page with the team statistics of a live match ----------
var fullTime20=fullTime2;fullTime2=function(d){if(!d||!d.s||!d.s.st||!d.s.st.team){fullTime20(d);return}let pg=0;
 scr={t:'',l:[],o:0,draw:()=>{if(pg){lmDrawTeamPage(d)}else drawFT(d);const he=S.lang=='he';txt(pg?L('◀ report','◀ דוח'):L('match stats ▶','סטטיסטיקה ▶'),he?20:460,312,8,'#9fe8ff','#000a',he?'left':'right')},
  key:k=>{if(k=='arrowleft'||k=='arrowright'||k=='a'||k=='d'){pg^=1;sfx('menu');return}if(['enter','z','x','escape',' '].includes(k)){scr=null;sfx('back')}},click:(x,y)=>{if(y>296&&(S.lang=='he'?x<140:x>340)){pg^=1;sfx('menu')}else scr=null}};sfx(d.r>0?'troph':d.r<0?'groan':'ok')};
function lmDrawTeamPage(d){const s=d.s,bg=MBG[S.t]||buildMBG(S.t);smooth(1);g.drawImage(bg,0,0,480,320);g.fillStyle='rgba(4,6,10,.78)';g.fillRect(0,0,480,320);
 txt(L('MATCH STATISTICS','סטטיסטיקת משחק'),240,22,11,'#ffd96a','#000a','center');panel(90,30,300,250,.96);txt(`${nm(mine().n)}  ${s.gf} - ${s.ga}  ${s.n}`,240,48,10,UIC.txt,'#000a','center');lmStatsTable(s.st.team,98,62,284,nm(mine().n),s.n);
 txt(s.st.team.simmed?L('Part of this match was simulated: stats cover the minutes played live.','חלק מהמשחק דומה: הסטטיסטיקה רק מהדקות ששוחקו.'):L('Counted from every kick, reception, tackle and save in the match.','נספר מכל בעיטה, קבלה, תיקול והצלה במשחק.'),240,272,6,UIC.mut,'#000a','center')}
// ---------- input ----------
function lmActOf(k){if(!k)return null;const kb=S.mkeys||{},map={pass:[kb.pass||'j',' ','enter','z'],shoot:[kb.shoot||'k','x'],through:[kb.through||'l','c'],sprint:[kb.sprint||'shift'],pause:['escape','p']};for(const a in map)if(map[a].includes(k))return a;return null}
function lmLive(){return !!(LM&&B&&B.live&&!menu&&!dlg&&!Tr&&!scr)}
function lmControlsDlg(){const b=lmBindNames();say([L(`Move: WASD / arrows. Sprint: ${b.sprint}.`,`תנועה: WASD / חצים. ספרינט: ${b.sprint}.`),L(`With the ball: ${b.pass} pass, ${b.through} through ball, hold ${b.shoot} to shoot (Up/Down aims). Click the pitch to pass to that spot.`,`עם הכדור: ${b.pass} מסירה, ${b.through} מסירת עומק, החזק ${b.shoot} לבעיטה (למעלה/למטה מכוון). לחיצה על המגרש מוסרת לנקודה.`),L(`Without the ball: ${b.pass} tackles (or calls for the ball when a team-mate has it), ${b.shoot} slide tackle.`,`בלי הכדור: ${b.pass} תיקול (או בקשת כדור כשלחבר יש אותו), ${b.shoot} תיקול גלישה.`)])}
(function(){
 addEventListener('keydown',e=>{const k=KN(e).toLowerCase();
  if(LMRB){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;const a=LMRB.a;if(k==='escape'){LMRB=null;dlg=null;lmKeysMenu();return}
   const reserved=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','m','e','escape','p',' ','enter','z','x','c','tab'],kb=S.mkeys||{},others=['pass','shoot','through','sprint'].filter(x=>x!==a).map(x=>kb[x]||{pass:'j',shoot:'k',through:'l',sprint:'shift'}[x]);
   const ok=(k.length===1||k==='shift'||k==='control'||k==='alt')&&!reserved.includes(k)&&!others.includes(k);LMRB=null;dlg=null;if(ok){S.mkeys=Object.assign({},S.mkeys||{},{[a]:k});save();sfx('ok')}else sfx('err');lmKeysMenu();return}
  if(!lmLive())return;const a=lmActOf(k);if(!a)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;LMK[a]=1;try{initA()}catch(err){}lmDown(a)},true);
 addEventListener('keyup',e=>{const a=lmActOf(KN(e).toLowerCase());if(!a)return;const was=LMK[a];LMK[a]=0;if(was&&LM){e.stopImmediatePropagation();lmUp(a)}},true);
 addEventListener('blur',()=>{for(const k in LMK)LMK[k]=0;if(LM)LM.charge=-1});
 // touch buttons: A passes, B shoots (hold for power)
 document.querySelectorAll('[data-k]').forEach(btn=>{const k=String(btn.dataset.k).toLowerCase(),a=k==='enter'?'pass':k==='x'?'shoot':null;if(!a)return;
  btn.addEventListener('pointerdown',()=>{if(lmLive()){LMK[a]=1;lmDown(a)}});['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>{if(LMK[a]){LMK[a]=0;if(LM)lmUp(a)}}))});
 // mouse: click on the pitch while Eli has the ball = pass to that spot (to the team-mate nearest to it)
 C.addEventListener('pointerdown',ev=>{if(!lmLive()||LM.state!=='play')return;const [x,y]=canvasXY(ev);if(y<36||y>230&&x>170&&x<310)return;const p=LM.eli;if(!p||LM.ball.own!==p)return;const v=lmView(),wx=x+v.ox,wy=y+v.oy;
  let best=null,bd=60;for(const q of LM.P){if(q.team!==p.team||q===p||q.off)continue;const d=Math.hypot(q.x-wx,q.y-wy);if(d<bd){bd=d;best=q}}lmKick(p,wx,wy,Math.hypot(wx-p.x,wy-p.y)>330?'loft':'ground',best);B.st.tr[2]++;B.used[2]=1;p.act={st:'kick',t:16,t0:16,n:3,fd:6}})})();
// ---------- wiring: official matches go live; duels and the classic mode keep the turn-based engine ----------
var battle0=battle,matchStep0=matchStep,drawBattle0=drawBattle;
battle=function(e,txt0,done){if(e&&(e.lg||e.cup)&&S.lmode!=='classic'){LMPC=null;lmStart(e,txt0,done);return}return battle0(e,txt0,done)};
matchStep=function(){if(B&&B.live){if(PEN)penStep();if(B&&B.live)lmStep();return}matchStep0()};
drawBattle=function(){if(B&&B.live&&LM){lmDraw();return}if(B&&B.live){const bg=MBG[S.t]||buildMBG(S.t);smooth(1);g.drawImage(bg,0,0,480,320);return}drawBattle0()};
function lmSprint(){return !!(LMK.sprint||SHIFT8||RUNLOCK8)}
// ---------- settings: match mode, match length, key bindings ----------
function lmKeysMenu(){const b=lmBindNames();mk([L('Pass / tackle: ','מסירה / תיקול: ')+b.pass,L('Shoot / slide: ','בעיטה / גלישה: ')+b.shoot,L('Through ball: ','מסירת עומק: ')+b.through,L('Sprint: ','ספרינט: ')+b.sprint,L('Reset to J / K / L / Shift','איפוס ל- J / K / L / Shift'),L('Back','חזרה')],i=>{
  if(i<4){LMRB={a:['pass','shoot','through','sprint'][i]};say(L('Press the new key (Esc cancels).','לחץ על המקש החדש (Esc לביטול).'),()=>{LMRB=null;lmKeysMenu()});return}if(i==4){S.mkeys={};save();sfx('ok');lmKeysMenu();return}settings()},L('MATCH CONTROLS','שליטה במשחק'))}
function settings(){mk([L('Language: English / עברית','שפה: עברית / English'),L('Sound & music','צליל ומוזיקה'),L('Graphics: ','גרפיקה: ')+(S.gfx==='low'?L('Performance','ביצועים'):L('High quality','איכות גבוהה')),L('Reduced motion: ','הפחתת תנועה: ')+(S.rm?L('ON','פעיל'):L('OFF','כבוי')),L('Display size: ','גודל תצוגה: ')+Math.round(S.ui*100)+'%',L('High contrast: ','ניגודיות גבוהה: ')+(S.hc?L('ON','פעיל'):L('OFF','כבוי')),L('Season length','אורך עונה'),
  L('Matches: ','משחקים: ')+(S.lmode==='classic'?L('Classic (tactical)','קלאסי (טקטי)'):L('Live (real-time)','חי (בזמן אמת)')),L('Live match length: ','אורך משחק חי: ')+(S.mlen||6)+L(' min',' דק׳'),L('Match controls','שליטה במשחק'),L('Payments: ','תשלומים: ')+(S.test?'TEST MODE':L('not connected','לא מחוברים')),L('Back','חזרה')],i=>{
 if(i==0){setLang(S.lang=='he'?'en':'he');settings()}if(i==1)volMenu();if(i==2){S.gfx=S.gfx==='low'?'high':'low';applyGfx9();save();settings()}if(i==3){S.rm=S.rm?0:1;save();settings()}if(i==4){S.ui=S.ui>=1.25?.75:S.ui+.25;applyUI();save();settings()}if(i==5){S.hc=S.hc?0:1;save();settings()}if(i==6)F.hq();
 if(i==7){S.lmode=S.lmode==='classic'?'live':'classic';save();settings()}if(i==8){const o=[4,6,8,12],j=o.indexOf(S.mlen||6);S.mlen=o[(j+1)%o.length];save();settings()}if(i==9)lmKeysMenu();
 if(i==10)say(S.test?L('Turn TEST MODE off? Test items will stop counting as owned.','לכבות TEST MODE? פריטי בדיקה יפסיקו להיחשב כבעלות.'):L('TEST MODE gives free test purchases, clearly labelled TEST. It never charges real money and is not real ownership. Turn it on?','TEST MODE נותן רכישות בדיקה חינם, מסומנות TEST. הוא אף פעם לא מחייב כסף אמיתי ואינו בעלות אמיתית. להפעיל?'),()=>mk([L('Yes','כן'),L('No','לא')],j=>{if(j==0){S.test=S.test?0:1;save();say(S.test?L('TEST MODE is ON.','TEST MODE פעיל.'):L('TEST MODE is OFF.','TEST MODE כבוי.'))}}))},L('SETTINGS','הגדרות'))}
// debug / QA hook (read-only snapshot, used by the e2e tests)
window.LFC_LM=()=>LM?{state:LM.state,min:+LM.min.toFixed(2),half:LM.half,score:[B.gf,B.ga],ball:{x:+LM.ball.x.toFixed(1),y:+LM.ball.y.toFixed(1),z:+LM.ball.z.toFixed(1),own:LM.ball.own?LM.ball.own.n:null},eli:LM.eli?{x:+LM.eli.x.toFixed(1),y:+LM.eli.y.toFixed(1)}:null,stats:LM.stats}:null;

// build stamp for the online shell and the title screen
LFC_VERSION='9.0.0';if(window.LFC)window.LFC.version=LFC_VERSION;
