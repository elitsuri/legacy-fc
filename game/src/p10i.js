// ===================== v9 ILLUSTRATED INTERIORS: detailed furniture, wall decor, ceiling lights =====================
// Drawing only. Every hotspot, action, cost and reward stays exactly as in p10d; the painters below replace the flat
// boxes of the weakest pieces with shaded, detailed furniture. Pieces without a new painter keep the p10d drawing.
const F10={};
// ---------- small drawing kit ----------
function cs10(x,y,w,h,a){const gr=g.createRadialGradient(x+w/2,y,1,x+w/2,y,Math.max(w,h)*.62);gr.addColorStop(0,`rgba(10,8,14,${a||.32})`);gr.addColorStop(1,'rgba(10,8,14,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x+w/2+2,y,w*.62,h*.5+3,0,0,7);g.fill()}
function lg10(x0,y0,x1,y1,a,b){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr}
function rb10(x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=.8;g.stroke()}}
function metal10(x,y,w,h,r){rb10(x,y,w,h,r||1,lg10(x,y,x+w,y,'#8d96a8','#4a505c'));g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+w*.25,y+.5,Math.max(.6,w*.18),h-1)}
function wood10(x,y,w,h,base,r){rb10(x,y,w,h,r||1.5,lg10(0,y,0,y+h,shd(base,1.08),shd(base,.9)));g.strokeStyle='rgba(60,35,15,.16)';g.lineWidth=.5;for(let i=1;i<Math.floor(h/3);i++){const yy=y+i*3+Math.sin(i*1.7)*.6;g.beginPath();g.moveTo(x+2,yy);g.bezierCurveTo(x+w*.3,yy+.8,x+w*.6,yy-.8,x+w-2,yy);g.stroke()}}
function screen10(x,y,w,h,col){rb10(x-1.2,y-1.2,w+2.4,h+2.4,1.5,'#14161b');rb10(x,y,w,h,.8,lg10(x,y,x+w,y+h,col||'#2f6fb0','#0f2742'));g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.45,y);g.lineTo(x+w*.25,y+h);g.lineTo(x,y+h);g.closePath();g.fill()}
function plate10(x,y,r,food){g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(x+.6,y+.8,r,r*.62,0,0,7);g.fill();g.fillStyle='#ffffff';g.beginPath();g.ellipse(x,y,r,r*.62,0,0,7);g.fill();g.strokeStyle='rgba(160,170,185,.6)';g.lineWidth=.5;g.beginPath();g.ellipse(x,y,r*.68,r*.42,0,0,7);g.stroke();
 if(food!=null){const c=[['#e8a33d','#6aa84f'],['#c0392b','#f4d03f'],['#8d5524','#6aa84f'],['#f4f1ea','#e67e22']][food%4];g.fillStyle=c[0];g.beginPath();g.ellipse(x-1,y,r*.42,r*.26,0,0,7);g.fill();g.fillStyle=c[1];g.beginPath();g.arc(x+r*.32,y-.4,r*.2,0,7);g.fill()}}
function chair10(x,y,col,back){if(back==='up'){rb10(x,y-9,12,4,1.5,shd(col,.8));metal10(x+1,y-6,1.4,6);metal10(x+9.6,y-6,1.4,6)}rb10(x,y-2,12,7,2,lg10(0,y-2,0,y+5,shd(col,1.1),shd(col,.85)));g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+1,y+5,1.4,3);g.fillRect(x+9.6,y+5,1.4,3);if(back==='down'){rb10(x,y+5,12,4,1.5,shd(col,.75))}}
function dumb10(x,y,s,col){g.fillStyle='#5a6270';g.fillRect(x-s*1.6,y-.8,s*3.2,1.6);for(const d of [-1,1]){rb10(x+d*s*1.6-s*.55,y-s*.9,s*1.1,s*1.8,.8,lg10(0,y-s,0,y+s,shd(col,1.2),shd(col,.7)))}}
function kb10(x,y,col){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+1,y+4.5,5,1.6,0,0,7);g.fill();g.fillStyle=lg10(x-4,y-4,x+4,y+4,shd(col,1.25),shd(col,.7));g.beginPath();g.arc(x,y,4.4,0,7);g.fill();g.strokeStyle=shd(col,.6);g.lineWidth=1.3;g.beginPath();g.arc(x,y-5,2.6,Math.PI,0);g.stroke()}
// ---------- gym ----------
F10.treadmill=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.34);
 rb10(x,y+4,w,h-4,4,lg10(x,0,x+w,0,'#3d424d','#262a32'),'rgba(20,20,26,.6)');rb10(x+5,y+9,w-10,h-14,2,'#121418');
 if(!S.rm){g.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<7;i++){const yy=y+9+((i*7+tick*.7)%(h-15));g.fillRect(x+6,yy,w-12,.8)}}
 for(const sx of [x+1.5,x+w-4.5])metal10(sx,y+6,3,h-12,1.5);
 metal10(x+3,y-26,3,32);metal10(x+w-6,y-26,3,32);
 g.save();g.translate(x+w/2,y-28);rb10(-w/2+2,-6,w-4,13,3,lg10(0,-6,0,7,'#4a505c','#2a2d35'),'rgba(0,0,0,.5)');rb10(-9,-3.5,18,7,1,'#0d2a1a');
 txt(((tick>>6)%3+7)+'.'+((tick>>4)%10),0,2,5,'#5dff8a','#0000','center');g.fillStyle=(tick>>4)%2?'#ff4d4d':'#7a2020';g.beginPath();g.arc(-w/2+6,0,1.3,0,7);g.fill();g.fillStyle='#ffd24a';g.beginPath();g.arc(w/2-6,0,1.3,0,7);g.fill();g.restore();
 metal10(x+1,y-14,w-2,2.2)};
F10.bench=it=>{const {x,y,w,h}=it,cx=x+w/2;cs10(x+8,y+h,w-16,9,.34);
 for(const ux of [x+4,x+w-9]){metal10(ux,y-26,5,30,1.5);g.fillStyle='#2a2d35';g.fillRect(ux-1,y+2,7,3)}
 for(const lx of [x+18,x+w-22])metal10(lx,y+4,4,h-8);
 rb10(x+14,y+2,w-28,h-10,4,lg10(0,y+2,0,y+h-8,'#d14a3a','#8f2a20'),'rgba(60,10,10,.6)');g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=.6;g.beginPath();g.moveTo(x+18,y+4);g.lineTo(x+w-18,y+4);g.stroke();g.fillStyle='rgba(0,0,0,.18)';g.fillRect(cx-.4,y+3,.8,h-12);
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-2,y-20,w+4,1);metal10(x-6,y-22.5,w+12,2.4);
 for(const s of [-1,1]){const px=s<0?x-5:x+w+1;for(let k=0;k<3;k++){const pw=3,ph=14-k*3,ox=px+s*k*3.4-(s<0?0:0);rb10(ox,y-21.5-ph/2,pw,ph,1,k===0?'#1d1f26':k===1?'#2a2d35':'#c0392b','rgba(0,0,0,.6)')}}};
F10.rack=it=>{const {x,y,w}=it;cs10(x,y+16,w,6,.3);
 for(const lx of [x+2,x+w-6])metal10(lx,y-40,4,46);
 for(const [yy,n,s0] of [[y-30,7,3.2],[y-8,6,3.8]]){g.fillStyle='#22252c';g.beginPath();g.moveTo(x+2,yy);g.lineTo(x+w-2,yy);g.lineTo(x+w-4,yy+4);g.lineTo(x+4,yy+4);g.closePath();g.fill();metal10(x+2,yy-.6,w-4,1.4);
  const cols=['#2a2d35','#c0392b','#2e6fb8','#2a2d35','#f5b700','#1f9d55','#2a2d35'];for(let i=0;i<n;i++){const s=s0-i*.25;dumb10(x+12+i*(w-22)/(n-1),yy-s*.9,s,cols[i%cols.length])}}};
F10.mat=it=>{const {x,y,w,h}=it,t=26;g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.roundRect(x+2,y+3,w,h,3);g.fill();
 for(let i=0;i*t<w;i++)for(let j=0;j*t<h;j++){const tx=x+i*t,ty=y+j*t,tw2=Math.min(t,w-i*t),th=Math.min(t,h-j*t);g.fillStyle=(i+j)%2?'#2c3442':'#323b4b';g.fillRect(tx,ty,tw2,th);g.fillStyle='rgba(255,255,255,.05)';g.fillRect(tx,ty,tw2,.8)}
 g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.8;g.strokeRect(x+.5,y+.5,w-1,h-1);
 rb10(x+8,y+6,52,14,3,lg10(0,y+6,0,y+20,'#4aa3ff','#1f6fb8'));g.strokeStyle='rgba(255,255,255,.35)';g.strokeRect(x+10.5,y+8.5,47,9);
 rb10(x+w-30,y+h-14,20,8,4,lg10(0,y+h-14,0,y+h-6,'#8e5bd1','#5a2f99'));g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+w-28,y+h-13,16,1.4);
 kb10(x+w-40,y+12,'#2a2d35');kb10(x+w-24,y+14,'#c0392b')};
F10.balls=it=>{const {x,y}=it;metal10(x-2,y+6,72,2.4);for(const lx of [x,x+66])metal10(lx,y+6,2.4,12);
 const cols=['#c0392b','#2e6fb8','#1f9d55','#f5b700','#7a4fb8'];for(let i=0;i<5;i++){const bx=x+8+i*13,by=y+(i%2?-2:2),r=6.6;g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(bx+1.5,by+r-.5,r*.9,2,0,0,7);g.fill();
  g.fillStyle=lg10(bx-r,by-r,bx+r,by+r,shd(cols[i],1.35),shd(cols[i],.6));g.beginPath();g.arc(bx,by,r,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=.6;g.beginPath();g.arc(bx,by,r,-.3,Math.PI+.3);g.stroke();g.beginPath();g.moveTo(bx-r*.9,by);g.quadraticCurveTo(bx,by+2.5,bx+r*.9,by);g.stroke();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(bx-2,by-2.6,2,1.2,-.5,0,7);g.fill()}};
F10.bag=it=>{const {x,y,w}=it,sw=S.rm?0:Math.sin(tick/40)*1.5,cx=x+w/2;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(cx+2,y+8,12,3.4,0,0,7);g.fill();
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x-8,y+8,8,2.4,0,0,7);g.fill();metal10(x-10,y-66,3.4,74);rb10(x-15,y+4,13,4,1.5,'#2a2d35');metal10(x-10,y-66,cx-x+10,2.6);g.fillStyle='#2a2d35';g.fillRect(cx-2,y-66,4,4);
 g.strokeStyle='#8d96a8';g.lineWidth=1;g.setLineDash([1.5,1]);g.beginPath();g.moveTo(cx,y-62);g.lineTo(cx+sw,y-46);g.stroke();g.setLineDash([]);
 g.save();g.translate(cx+sw,y-46);rb10(-w/2,0,w,48,9,lg10(-w/2,0,w/2,0,'#e04a3a','#7d1f17'),'rgba(40,8,8,.7)');g.fillStyle='#1d1f26';g.fillRect(-w/2,6,w,4);g.fillRect(-w/2,38,w,4);g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.roundRect(-w/2+3,4,3,38,2);g.fill();
 g.fillStyle='rgba(255,255,255,.85)';g.font='800 5px '+FONTS;g.textAlign='center';g.fillText('LFC',0,26);g.restore()};
F10.cooler=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,6,.3);
 rb10(x+1,y-30,w-2,h+30,2.5,lg10(x,0,x+w,0,'#f4f6f8','#bfc6d1'),'rgba(40,40,50,.45)');rb10(x+3,y-24,w-6,8,1,'#d9dde3');g.fillStyle='#d04a4a';g.fillRect(x+5,y-21,3,4);g.fillStyle='#2e6fb8';g.fillRect(x+w-8,y-21,3,4);
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+4,y-8,w-8,1);
 const bx=x+3,by=y-50,bw=w-6;rb10(bx,by,bw,20,5,'rgba(120,190,255,.55)','rgba(60,120,190,.6)');g.fillStyle='rgba(60,140,230,.55)';g.beginPath();g.roundRect(bx+1,by+7,bw-2,12,4);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.fillRect(bx+2.5,by+3,1.6,14);rb10(x+w/2-3,by+19,6,3,1,'#2e6fb8');
 g.fillStyle='#ffffff';for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+w+1,y-20+i*3);g.lineTo(x+w+5,y-20+i*3);g.lineTo(x+w+4.4,y-17.4+i*3);g.lineTo(x+w+1.6,y-17.4+i*3);g.closePath();g.fill()}};
// ---------- club HQ ----------
F10.reception=it=>{const {x,y,w,h}=it,cc=clubCols(),c0=solid(cc[0]);cs10(x,y+h,w,10,.34);
 rb10(x,y-24,w,h,[8,8,2,2],lg10(0,y-24,0,y+h-24,'#fbfaf6','#e2ded4'),'rgba(40,30,30,.35)');g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+4,y-23,w-8,1.4);
 rb10(x,y+h-24,w,24,[0,0,6,6],lg10(0,y+h-24,0,y+h,shd(c0,1.12),shd(c0,.72)),'rgba(20,20,30,.45)');g.fillStyle='rgba(255,255,255,.18)';for(let i=x+10;i<x+w-6;i+=12)g.fillRect(i,y+h-21,1,18);
 g.fillStyle='rgba(255,236,170,.75)';g.fillRect(x+2,y+h-24.5,w-4,1.2);crest(x+w/2,y+h-12,7,nm(mine().n));
 screen10(x+w-34,y-34,22,13,'#2f8f6f');g.fillStyle='#3a3f4c';g.fillRect(x+w-25,y-21,4,3);g.fillStyle='#d9dde3';g.fillRect(x+w-36,y-14,26,3);
 g.fillStyle='#f4f1ea';g.save();g.translate(x+18,y-14);g.rotate(-.12);g.fillRect(0,0,14,9);g.fillStyle='rgba(30,40,70,.35)';for(let i=0;i<3;i++)g.fillRect(2,2+i*2.4,10-i*2,.7);g.restore();
 g.fillStyle='#c9a227';g.beginPath();g.ellipse(x+44,y-10,4,1.6,0,0,7);g.fill();g.beginPath();g.arc(x+44,y-11,3,Math.PI,0);g.fill();g.fillStyle='#fff3c4';g.fillRect(x+43,y-14.5,1,1)};
F10.dining=it=>{const {x,y,w,h}=it;cs10(x,y+h+6,w,10,.3);
 for(let i=0;i<4;i++){chair10(x+10+i*26,y-6,'#7a5232','up')}
 rb10(x,y-10,w,h,3,lg10(0,y-10,0,y+h-10,'#ffffff','#e6e3dc'),'rgba(40,30,30,.3)');g.fillStyle=lg10(0,y+h-10,0,y+h+2,'#efece6','#c9c4ba');g.beginPath();g.moveTo(x,y+h-10);g.lineTo(x+w,y+h-10);g.lineTo(x+w-2,y+h+2);g.lineTo(x+2,y+h+2);g.closePath();g.fill();
 g.strokeStyle='rgba(180,170,150,.5)';g.lineWidth=.6;for(let i=x+8;i<x+w;i+=10){g.beginPath();g.moveTo(i,y+h-9);g.lineTo(i-1,y+h+1);g.stroke()}
 g.fillStyle=solid(clubCols()[0]);g.globalAlpha=.85;g.fillRect(x+w/2-10,y-10,20,h);g.globalAlpha=1;
 for(let i=0;i<4;i++){plate10(x+16+i*26,y-2,5.2,i);plate10(x+16+i*26,y+h-17,5.2,i+1);g.fillStyle='rgba(200,230,255,.6)';g.fillRect(x+24+i*26,y-5,2,4);g.fillRect(x+24+i*26,y+h-20,2,4)}
 g.fillStyle='#f5b700';g.beginPath();g.ellipse(x+w/2,y+h/2-10,6,3.4,0,0,7);g.fill();g.fillStyle='#c0392b';for(let i=0;i<4;i++){g.beginPath();g.arc(x+w/2-3+i*2,y+h/2-11+(i%2),1.4,0,7);g.fill()}
 for(let i=0;i<4;i++)chair10(x+10+i*26,y+h+3,'#7a5232','down')};
F10.mdesk=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,9,.34);
 rb10(x,y-18,w,h,2,lg10(0,y-18,0,y+h-18,'#6b4426','#4a2f17'),'rgba(20,10,4,.6)');rb10(x+6,y-15,w-12,h-8,1,lg10(0,y-15,0,y+h-23,'#2f6b4a','#1f4a33'));g.strokeStyle='rgba(201,162,39,.6)';g.lineWidth=.5;g.strokeRect(x+7.5,y-13.5,w-15,h-11);
 wood10(x,y+h-18,w,18,'#5d3b1c',[0,0,2,2]);for(const dx of [x+6,x+w-26]){g.strokeStyle='rgba(30,15,5,.5)';g.strokeRect(dx+.5,y+h-15.5,20,12);g.fillStyle='#c9a227';g.fillRect(dx+8,y+h-10,4,1.4)}
 g.fillStyle='#d9dde3';g.save();g.translate(x+w-30,y-14);g.fillStyle='#2a2d35';g.beginPath();g.moveTo(0,0);g.lineTo(20,0);g.lineTo(22,3);g.lineTo(-2,3);g.closePath();g.fill();g.restore();screen10(x+w-29,y-27,18,12,'#2f6fb0');
 g.fillStyle='#f4f1ea';g.fillRect(x+10,y-11,14,10);g.fillStyle='rgba(30,40,70,.35)';for(let i=0;i<3;i++)g.fillRect(x+12,y-9+i*2.6,9,.7);
 g.fillStyle='#ffffff';g.beginPath();g.ellipse(x+30,y-6,2.6,1.2,0,0,7);g.fill();g.fillRect(x+27.4,y-10,5.2,4);g.fillStyle='#5c3a21';g.beginPath();g.ellipse(x+30,y-10,2.6,1,0,0,7);g.fill();
 g.fillStyle='#2a2d35';g.fillRect(x+w-12,y-30,1.4,14);g.fillStyle='#1f4a33';g.beginPath();g.moveTo(x+w-16,y-30);g.lineTo(x+w-7,y-30);g.lineTo(x+w-9,y-34);g.lineTo(x+w-14,y-34);g.closePath();g.fill();
 g.fillStyle='#c9a227';g.fillRect(x+w/2-9,y+h-22,18,4);txt(L('BOSS','מאמן'),x+w/2,y+h-19,3.4,'#2a1d00','#0000','center')};
// ---------- home ----------
F10.desk=it=>{const {x,y,w,h}=it;cs10(x,y+h+6,w,9,.3);
 wood10(x,y-18,w,h,'#b98b5a',2);wood10(x,y+h-18,w,18,'#8a5d38',[0,0,2,2]);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+w-20,y+h-16,1,14);g.fillStyle='#c9ced6';g.fillRect(x+w-13,y+h-10,4,1.2);
 g.fillStyle='#2a2d35';g.fillRect(x+w/2-2,y-22,4,6);g.fillRect(x+w/2-7,y-17,14,2);screen10(x+w/2-15,y-38,30,18,'#3a6fd0');g.fillStyle='#ffd24a';g.fillRect(x+w/2-11,y-34,8,2);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+w/2-11,y-30,18,1);g.fillRect(x+w/2-11,y-27.5,14,1);
 rb10(x+w/2-12,y-12,24,5,1,'#e8ecf2','rgba(0,0,0,.25)');g.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<8;i++)g.fillRect(x+w/2-10.5+i*2.8,y-10.8,2,1);rb10(x+w/2+15,y-11,4,6,2,'#e8ecf2','rgba(0,0,0,.25)');
 g.fillStyle='#3a3f4c';g.fillRect(x+6,y-30,1.4,18);g.beginPath();g.moveTo(x+3,y-31);g.lineTo(x+13,y-31);g.lineTo(x+11,y-35);g.lineTo(x+5,y-35);g.closePath();g.fillStyle='#ffd96a';g.fill();
 if(S.t>=2){const gr=g.createRadialGradient(x+8,y-16,1,x+8,y-16,22);gr.addColorStop(0,'rgba(255,220,150,.45)');gr.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=gr;g.fillRect(x-16,y-40,48,48)}
 rb10(x+w/2-8,y+h+2,16,8,3,lg10(0,y+h+2,0,y+h+10,'#3a3f4c','#22252c'));rb10(x+w/2-8,y+h-4,16,5,2,'#2a2d35')};
F10.kitchen=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.3);
 g.fillStyle='#e8ecf2';g.fillRect(x,y-58,w,36);g.strokeStyle='rgba(140,150,165,.4)';g.lineWidth=.5;for(let yy=y-58;yy<y-22;yy+=6){g.beginPath();g.moveTo(x,yy);g.lineTo(x+w,yy);g.stroke()}for(let xx=x;xx<x+w;xx+=8){for(let yy=y-58;yy<y-22;yy+=12){g.beginPath();g.moveTo(xx+((yy/6)%2?4:0),yy);g.lineTo(xx+((yy/6)%2?4:0),yy+6);g.stroke()}}
 wood10(x+2,y-70,w-4,12,'#f4f1ea',2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+w/2-.5,y-69,1,10);g.fillStyle='#8d96a8';g.fillRect(x+w/2-6,y-62,3,1);g.fillRect(x+w/2+3,y-62,3,1);
 rb10(x,y-24,w,h,2,lg10(0,y-24,0,y+h-24,'#5a6270','#3a3f4c'));rb10(x,y+h-24,w,24,[0,0,2,2],lg10(0,y+h-24,0,y+h,'#f4f1ea','#cfcac0'),'rgba(0,0,0,.25)');for(const dx of [x+3,x+w/2+1]){g.strokeStyle='rgba(0,0,0,.18)';g.strokeRect(dx+.5,y+h-20.5,w/2-5,18);g.fillStyle='#8d96a8';g.fillRect(dx+w/4-4,y+h-17,8,1.2)}
 rb10(x+4,y-22,20,12,2,'#c9ced6','rgba(0,0,0,.35)');rb10(x+6,y-20,16,8,1.5,lg10(0,y-20,0,y-12,'#8d96a8','#bfc6d1'));metal10(x+13,y-28,1.6,7);g.fillStyle='#8d96a8';g.fillRect(x+13,y-28,5,1.4);
 for(const [bx,by] of [[x+w-22,y-19],[x+w-10,y-19],[x+w-22,y-12],[x+w-10,y-12]]){g.strokeStyle='#16181d';g.lineWidth=1.2;g.beginPath();g.ellipse(bx,by,4,2,0,0,7);g.stroke()}
 g.fillStyle='#2a2d35';g.beginPath();g.ellipse(x+w-16,y-16,5,2.4,0,0,7);g.fill();metal10(x+w-11,y-17,7,1.2);if(!S.rm&&S.t<2){g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<3;i++){const t=(tick*.4+i*12)%30;g.beginPath();g.arc(x+w-16+Math.sin((t+i)/4)*1.5,y-20-t*.5,1.2+t*.04,0,7);g.globalAlpha=.5*(1-t/30);g.fill()}g.globalAlpha=1}};
F10.phone=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,7,.3);
 wood10(x,y-14,w,h,'#a8784a',3);rb10(x,y+h-14,w,14,[0,0,3,3],lg10(0,y+h-14,0,y+h,'#8a5d38','#5d3b1c'));g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+3,y+h,2.4,4);g.fillRect(x+w-5.4,y+h,2.4,4);
 rb10(x+6,y-11,9,15,1.6,'#16181d');rb10(x+7,y-10,7,12,1,lg10(x,y-10,x+7,y+2,'#4aa3ff','#1f4f8a'));if((tick>>5)%2){g.fillStyle='#ffd96a';g.beginPath();g.arc(x+10.5,y-7,1.6,0,7);g.fill()}
 g.fillStyle='#c9ced6';g.fillRect(x+w-11,y-20,1.4,12);g.fillStyle='#f4f1ea';g.beginPath();g.moveTo(x+w-17,y-20);g.lineTo(x+w-3,y-20);g.lineTo(x+w-6,y-28);g.lineTo(x+w-14,y-28);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.18)';g.stroke();
 if(S.t>=2){const gr=g.createRadialGradient(x+w-10,y-18,1,x+w-10,y-18,20);gr.addColorStop(0,'rgba(255,224,160,.5)');gr.addColorStop(1,'rgba(255,224,160,0)');g.fillStyle=gr;g.fillRect(x+w-30,y-38,40,40)}};
F10.homegym=it=>{const {x,y,w,h}=it;g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.roundRect(x+2,y+3,w,h,3);g.fill();rb10(x,y,w,h,3,'#2c3442');g.strokeStyle='rgba(255,255,255,.08)';for(let i=x+8;i<x+w;i+=8){g.beginPath();g.moveTo(i,y);g.lineTo(i,y+h);g.stroke()}
 F10.bench({x:x+2,y:y+2,w:w-4,h:h-6});};
F10.tv=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.3);
 wood10(x,y-12,w,h,'#3a3f4c',2);rb10(x,y+h-12,w,12,[0,0,2,2],lg10(0,y+h-12,0,y+h,'#2a2d35','#16181d'));for(let i=0;i<3;i++){g.strokeStyle='rgba(255,255,255,.08)';g.strokeRect(x+3+i*(w-6)/3+.5,y+h-10.5,(w-6)/3-2,8)}g.fillStyle='#8d96a8';for(let i=0;i<3;i++)g.fillRect(x+3+i*(w-6)/3+(w-6)/6-4,y+h-7,8,1);
 rb10(x+6,y-9,16,4,1,'#16181d');g.fillStyle='#4aa3ff';g.fillRect(x+8,y-8,2,1);rb10(x+w-24,y-8,18,3,1.5,'#16181d');
 const tw2=it.big?66:52,th=it.big?36:30,tx2=x+w/2-tw2/2,ty2=y-14-th;g.fillStyle='#16181d';g.fillRect(x+w/2-1.5,ty2+th,3,4);
 rb10(tx2-1.5,ty2-1.5,tw2+3,th+3,2,'#0b0d12');const gr=g.createLinearGradient(tx2,ty2,tx2+tw2,ty2+th);gr.addColorStop(0,'#2a64b0');gr.addColorStop(1,'#0b1a33');g.fillStyle=gr;g.fillRect(tx2,ty2,tw2,th);
 g.fillStyle='rgba(255,255,255,.10)';g.beginPath();g.arc(tx2+tw2*.7,ty2+th*.4,th*.32,0,7);g.fill();g.fillStyle='rgba(70,168,82,.55)';g.fillRect(tx2,ty2+th*.58,tw2,th*.2);
 const n=S.news&&S.news[0]?nm(S.news[0].t):'LEGACY FC TV';g.save();g.beginPath();g.rect(tx2,ty2,tw2,th);g.clip();g.fillStyle='rgba(8,10,14,.85)';g.fillRect(tx2,ty2+th-9,tw2,9);g.fillStyle='#c9a227';g.fillRect(tx2,ty2+th-9,tw2,.8);
 txt(n,tx2+tw2-2-((tick*.5)%(tw2*3))+tw2*1.5,ty2+th-2.6,6,'#ffffff','#0000','right');g.fillStyle='#ff3b3b';g.fillRect(tx2+3,ty2+3,13,5);txt('LIVE',tx2+9.5,ty2+7,3.6,'#ffffff','#0000','center');g.restore();
 g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(tx2,ty2);g.lineTo(tx2+tw2*.35,ty2);g.lineTo(tx2+tw2*.15,ty2+th);g.lineTo(tx2,ty2+th);g.closePath();g.fill()};
// ---------- changing room ----------
F10.lbench=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,7,.28);
 for(let lx=x+6;lx<x+w-6;lx+=Math.max(40,(w-12)/4))metal10(lx,y-2,3,h+2);metal10(x+w-9,y-2,3,h+2);
 for(let i=0;i<3;i++)wood10(x,y-10+i*4.2,w,4,i%2?'#b98b5a':'#a8784a',1);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y+2.6,w,1.2);
 const cc=clubCols(),c0=solid(cc[0]);for(let i=x+10,k=0;i<x+w-16;i+=38,k++){if(k%2===0){rb10(i,y-12,16,6,2,lg10(0,y-12,0,y-6,'#ffffff','#d9dde3'),'rgba(0,0,0,.18)');g.fillStyle=c0;g.fillRect(i+2,y-10,12,1.2)}
  else{g.fillStyle=c0;g.beginPath();g.moveTo(i,y-12);g.lineTo(i+14,y-12);g.lineTo(i+16,y-8);g.lineTo(i+13,y-8);g.lineTo(i+13,y-4);g.lineTo(i+1,y-4);g.lineTo(i+1,y-8);g.lineTo(i-2,y-8);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.stroke()}
  g.fillStyle='#16181d';g.beginPath();g.ellipse(i+4,y+h+1,3.4,1.6,0,0,7);g.ellipse(i+11,y+h+1.4,3.4,1.6,0,0,7);g.fill();g.fillStyle='#ffd24a';g.fillRect(i+2,y+h+.6,2,.8);g.fillRect(i+9,y+h+1,2,.8)}};
F10.hamper=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,7,.3);
 rb10(x,y-22,w,h+22,[3,3,5,5],lg10(x,0,x+w,0,'#a8956a','#6b5a3a'),'rgba(40,30,15,.6)');g.strokeStyle='rgba(60,45,20,.45)';g.lineWidth=.6;for(let yy=y-18;yy<y+h;yy+=4){g.beginPath();g.moveTo(x+1,yy);g.lineTo(x+w-1,yy);g.stroke()}for(let xx=x+3;xx<x+w;xx+=4){g.beginPath();g.moveTo(xx,y-22);g.lineTo(xx,y+h);g.stroke()}
 const cc=clubCols();g.fillStyle=solid(cc[0]);g.beginPath();g.moveTo(x+2,y-22);g.quadraticCurveTo(x+w*.3,y-30,x+w*.55,y-24);g.quadraticCurveTo(x+w*.8,y-31,x+w-2,y-22);g.closePath();g.fill();g.fillStyle=solid(cc[1]||'#fff');g.beginPath();g.moveTo(x+w*.45,y-25);g.quadraticCurveTo(x+w*.6,y-29,x+w*.75,y-25);g.closePath();g.fill()};
// ---------- medical centre ----------
F10.medbed=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.3);
 for(const lx of [x+4,x+w-8])metal10(lx,y+h-14,3,14);metal10(x+2,y+h-6,w-4,2);
 rb10(x,y-16,w,h,4,lg10(0,y-16,0,y+h-16,'#d9eef3','#a9cfd8'),'rgba(40,70,80,.45)');rb10(x,y+h-16,w,5,[0,0,3,3],'#7f8b98');
 g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x+30,y-16,w-46,h);g.strokeStyle='rgba(150,170,180,.4)';g.lineWidth=.5;g.beginPath();g.moveTo(x+30,y-16);g.lineTo(x+30,y+h-16);g.moveTo(x+w-16,y-16);g.lineTo(x+w-16,y+h-16);g.stroke();
 rb10(x+5,y-13,22,h-10,5,lg10(0,y-13,0,y+h-23,'#ffffff','#e0e6ea'),'rgba(0,0,0,.12)');
 g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x-4,y+h-2,6,2,0,0,7);g.fill();metal10(x-5,y-50,2,48);g.fillStyle='#5a6270';g.fillRect(x-10,y-50,12,1.4);rb10(x-10,y-48,7,11,2,'rgba(200,235,255,.75)','rgba(90,130,160,.6)');g.fillStyle='rgba(90,170,230,.5)';g.fillRect(x-9,y-42,5,4.4);g.strokeStyle='rgba(160,190,210,.8)';g.lineWidth=.6;g.beginPath();g.moveTo(x-6.5,y-37);g.quadraticCurveTo(x-2,y-24,x+12,y-10);g.stroke()};
F10.curtain=it=>{const {x,y,w,h}=it,top=y-62,bot=y+h;metal10(x-34,top-2,44,2);for(let i=0;i<5;i++){g.fillStyle=i%2?'#7fbfd0':'#9fd3e0';g.beginPath();g.moveTo(x-2+i*2.4,top);g.lineTo(x+.4+i*2.4,top);g.lineTo(x+1.6+i*2.6,bot);g.lineTo(x-1.4+i*2.6,bot);g.closePath();g.fill()}g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+5,bot+1,8,2,0,0,7);g.fill();g.fillStyle='#5a6270';for(let i=0;i<5;i++)g.fillRect(x-2+i*2.4,top-2.4,1.4,2.4)};
F10.physio=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.3);
 for(const lx of [x+6,x+w-10])metal10(lx,y+h-14,3,14);
 rb10(x,y-14,w,h,4,lg10(0,y-14,0,y+h-14,'#38a3a3','#1f6b6b'),'rgba(10,40,40,.55)');g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=.6;g.beginPath();g.moveTo(x+w*.35,y-13);g.lineTo(x+w*.35,y+h-15);g.stroke();
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+3,y-12,w-6,1.4);rb10(x,y+h-14,w,5,[0,0,3,3],'#14504f');
 rb10(x+6,y-12,20,8,3,lg10(0,y-12,0,y-4,'#ffffff','#dfe6ea'));
 rb10(x+w-30,y-10,22,6,3,lg10(0,y-10,0,y-4,'#f5b700','#b07f00'));g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<5;i++)g.fillRect(x+w-28+i*4,y-9.4,.8,4.8);
 g.fillStyle='#ffffff';g.fillRect(x+w/2-6,y-7,12,3);g.fillStyle='#d04a4a';g.fillRect(x+w/2-.6,y-7,1.2,3)};
// ---------- agent's office ----------
F10.exdesk=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,10,.36);
 rb10(x,y-20,w,h,3,lg10(0,y-20,0,y+h-20,'#4a2f17','#2e1c0c'),'rgba(10,5,2,.7)');rb10(x+8,y-17,w-16,h-8,1.5,lg10(0,y-17,0,y+h-25,'#2a2d35','#16181d'));g.strokeStyle='rgba(201,162,39,.55)';g.lineWidth=.5;g.strokeRect(x+9.5,y-15.5,w-19,h-11);
 wood10(x,y+h-20,w,20,'#3d2410',[0,0,3,3]);g.fillStyle='rgba(201,162,39,.7)';g.fillRect(x+2,y+h-20,w-4,1);for(const dx of [x+8,x+w-38]){g.strokeStyle='rgba(0,0,0,.45)';g.strokeRect(dx+.5,y+h-16.5,30,13);g.fillStyle='#c9a227';g.fillRect(dx+12,y+h-10.5,6,1.4)}
 for(const [sx,c] of [[x+w-62,'#2f6fb0'],[x+w-36,'#2f8f6f']]){g.fillStyle='#16181d';g.fillRect(sx+10,y-24,3,6);g.fillRect(sx+6,y-19,11,1.6);screen10(sx,y-40,23,15,c)}
 g.fillStyle='rgba(255,255,255,.65)';for(let i=0;i<3;i++)g.fillRect(x+w-58,y-35+i*3,12-i*3,1);g.fillStyle='#5dff8a';g.beginPath();g.moveTo(x+w-32,y-29);g.lineTo(x+w-27,y-34);g.lineTo(x+w-22,y-31);g.lineTo(x+w-17,y-37);g.strokeStyle='#5dff8a';g.lineWidth=.8;g.stroke();
 g.fillStyle='#f4f1ea';g.save();g.translate(x+20,y-14);g.rotate(.08);g.fillRect(0,0,22,14);g.fillStyle='rgba(30,40,70,.35)';for(let i=0;i<4;i++)g.fillRect(3,3+i*2.4,16-(i%2)*4,.7);g.fillStyle='#2e6fb8';g.fillRect(12,11,7,.9);g.restore();
 g.fillStyle='#16181d';g.save();g.translate(x+40,y-8);g.rotate(-.5);g.fillRect(0,0,12,1.4);g.fillStyle='#c9a227';g.fillRect(9,0,3,1.4);g.restore();
 g.fillStyle='#c9a227';g.fillRect(x+56,y-16,10,6);g.fillStyle='#8a6a12';g.fillRect(x+56,y-12,10,2);txt(L('AGENT','סוכן'),x+w/2,y+h-5,4,'#c9a227','#0000','center')};
F10.cardstand=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,7,.3);wood10(x,y-14,w,h,'#5d3b1c',3);rb10(x,y+h-14,w,14,[0,0,3,3],lg10(0,y+h-14,0,y+h,'#4a2f17','#2e1c0c'));
 g.fillStyle='#16181d';g.fillRect(x+6,y-14,w-12,5);for(let i=0;i<3;i++){g.fillStyle='#ffffff';g.fillRect(x+7+i*1.2,y-20+i,w-14,7);g.fillStyle='#c9a227';g.fillRect(x+9+i*1.2,y-18+i,6,1.2);g.fillStyle='rgba(30,40,70,.4)';g.fillRect(x+9+i*1.2,y-15.5+i,w-20,.7)}};
// ---------- shop ----------
F10.counter=it=>{const {x,y,w,h}=it,c0='#2e6fb8';cs10(x,y+h,w,10,.34);
 rb10(x,y-22,w,h,3,lg10(0,y-22,0,y+h-22,'#fbfaf6','#dcd8ce'),'rgba(40,30,30,.35)');rb10(x,y+h-22,w,22,[0,0,4,4],lg10(0,y+h-22,0,y+h,shd(c0,1.15),shd(c0,.72)),'rgba(10,20,40,.5)');
 g.fillStyle='rgba(255,255,255,.85)';g.font='800 8px '+FONTS;g.textAlign='center';g.fillText('LEGACY STORE',x+w/2-12,y+h-8);
 g.fillStyle='#2a2d35';g.fillRect(x+w-26,y-24,4,6);screen10(x+w-36,y-38,24,15,'#2f6fb0');txt('LFC',x+w-24,y-28,6,'#ffffff','#0000','center');rb10(x+w-38,y-16,14,7,1.5,'#3a3f4c');g.fillStyle='#5dff8a';g.fillRect(x+w-36,y-14.6,4,1.4);
 rb10(x+10,y-30,22,16,[2,2,1,1],lg10(0,y-30,0,y-14,'#ffffff','#e6e3dc'),'rgba(0,0,0,.25)');g.strokeStyle='#8d96a8';g.lineWidth=1;g.beginPath();g.arc(x+21,y-30,4,Math.PI,0);g.stroke();g.fillStyle=c0;g.fillRect(x+16,y-24,10,4);
 g.fillStyle='#16181d';g.beginPath();g.ellipse(x+44,y-12,8,3,0,0,7);g.fill();g.fillStyle='#f4f4f4';g.fillRect(x+38,y-14,3,1.4)};
F10.ballbin=it=>{const {x,y,w,h}=it;cs10(x,y+h,w,8,.3);
 rb10(x,y-18,w,h+18,5,'rgba(30,32,40,.85)','rgba(0,0,0,.6)');for(let i=0;i<6;i++){const bx=x+8+(i%3)*14,by=y-14-(i>2?7:0)+4;g.fillStyle=lg10(bx-7,by-7,bx+7,by+7,'#ffffff','#c9ced6');g.beginPath();g.arc(bx,by,7,0,7);g.fill();g.fillStyle='#16181d';g.beginPath();for(let k=0;k<5;k++){const a=k/5*6.283-1.57;g.lineTo(bx+Math.cos(a)*2.6,by+Math.sin(a)*2.6)}g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=.5;g.beginPath();g.arc(bx,by,7,0,7);g.stroke()}
 g.strokeStyle='rgba(160,170,185,.55)';g.lineWidth=.7;for(let xx=x+3;xx<x+w;xx+=5){g.beginPath();g.moveTo(xx,y-6);g.lineTo(xx,y+h);g.stroke()}for(let yy=y-4;yy<y+h;yy+=5){g.beginPath();g.moveTo(x,yy);g.lineTo(x+w,yy);g.stroke()}metal10(x-1,y-7,w+2,2.4);
 rb10(x+w/2-12,y+h-10,24,7,2,'#ffd24a');txt('$25',x+w/2,y+h-5,5,'#2a1d00','#0000','center')};
// ---------- painter switch: new drawing for pieces listed above, the original for everything else ----------
var furn9o=furn9;furn9=function(it){const f=F10[it.k];if(!f||INT10.off)return furn9o(it);g.save();try{f(it)}catch(e){INT10.off=1;console.warn('interior painter',it.k,e)}g.restore()};
var INT10={off:0};
// ---------- wall decor in the free wall space (never over a window, board or tall piece) + ceiling lights ----------
function decor10(R,kind){const busy=[];for(const [wx,ww] of R.windows)busy.push([wx-4,wx+ww+4]);if(kind==='hq'||kind==='tr')busy.push([222,258]);for(const it of R.items)if(it.y<=110)busy.push([it.x-6,it.x+it.w+6]);
 const free=[];let x=26;busy.sort((a,b)=>a[0]-b[0]);for(const [a,b] of busy){if(a-x>=26)free.push([x,a]);x=Math.max(x,b)}if(454-x>=26)free.push([x,454]);
 const cc=clubCols(),c0=solid(cc[0]),c1=solid(cc[1]||'#ffffff');let n=0;
 for(const [a,b] of free){const mid=(a+b)/2,span=b-a;
  if(n===0){clock10(mid,46);n++;continue}
  if(span>=40&&kind!=='gym'&&kind!=='cl'){frame10(mid-13,34,26,20,n);n++;continue}
  if(kind==='gym'){g.save();g.fillStyle='#16181d';g.fillRect(mid-15,32,30,24);g.fillStyle='#ffd24a';g.font='800 6px '+FONTS;g.textAlign='center';g.fillText(L('NO PAIN','בלי כאב'),mid,42);g.fillText(L('NO GAIN','אין הישג'),mid,51);g.restore();n++;continue}
  if(kind==='cl'){g.save();rb10(mid-12,34,24,22,2,'#ffffff','rgba(0,0,0,.3)');g.fillStyle='#d04a4a';g.fillRect(mid-2,38,4,14);g.fillRect(mid-7,43,14,4);g.restore();n++;continue}
  g.save();g.fillStyle=c0;g.beginPath();g.moveTo(mid-9,30);g.lineTo(mid+9,30);g.lineTo(mid+9,56);g.lineTo(mid,51);g.lineTo(mid-9,56);g.closePath();g.fill();g.fillStyle=c1;g.fillRect(mid-9,36,18,2.4);g.restore();n++}}
function clock10(x,y){g.save();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+1,y+1.5,8.5,0,7);g.fill();g.fillStyle='#2a2d35';g.beginPath();g.arc(x,y,8.5,0,7);g.fill();g.fillStyle='#f8f6f0';g.beginPath();g.arc(x,y,7,0,7);g.fill();
 g.fillStyle='#2a2d35';for(let i=0;i<12;i++){const a=i/12*6.283;g.fillRect(x+Math.cos(a)*5.6-.4,y+Math.sin(a)*5.6-.4,.8,.8)}
 const hr=[8,13,18,22][S.t|0]+(tick/3600)%1,mn=(tick/60)%60;g.strokeStyle='#16181d';g.lineCap='round';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(hr/12*6.283)*3.6,y-Math.cos(hr/12*6.283)*3.6);g.stroke();g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(mn/60*6.283)*5.4,y-Math.cos(mn/60*6.283)*5.4);g.stroke();g.fillStyle='#c0392b';g.beginPath();g.arc(x,y,.9,0,7);g.fill();g.restore()}
function frame10(x,y,w,h,i){g.save();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+1,y+2,w,h);g.fillStyle='#c9a227';g.fillRect(x,y,w,h);g.fillStyle=['#8fc4ee','#2f8a3c','#1b2240','#e8e2d4'][i%4];g.fillRect(x+2,y+2,w-4,h-4);
 if(i%4===1){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=.6;g.strokeRect(x+4,y+4,w-8,h-8);g.beginPath();g.moveTo(x+w/2,y+4);g.lineTo(x+w/2,y+h-4);g.stroke()}
 else if(i%4===2){cup9(x+w/2,y+h/2+3)}else if(i%4===3){g.fillStyle='#c0392b';g.beginPath();g.arc(x+w/2,y+h/2,4,0,7);g.fill();g.fillStyle='#ffffff';g.fillRect(x+w/2-6,y+h-6,12,1.2)}else{g.fillStyle='#46a852';g.fillRect(x+2,y+h-8,w-4,6);g.fillStyle='#ffffff';g.beginPath();g.arc(x+w*.65,y+h-9,1.6,0,7);g.fill()}g.restore()}
function lamps10(kind){const xs=kind==='st'||kind==='tr'?[120,240,360]:[140,340],warm=S.t>=2||kind==='home',gym=kind==='gym';
 g.save();for(const lx of xs){g.fillStyle='#2a2d35';g.fillRect(lx-.5,22,1,gym?10:6);if(gym){g.fillStyle='#3a3f4c';g.beginPath();g.moveTo(lx-9,38);g.lineTo(lx+9,38);g.lineTo(lx+4,31);g.lineTo(lx-4,31);g.closePath();g.fill()}else{rb10(lx-12,27,24,3,1.5,'#e8ecf2','rgba(0,0,0,.25)')}
  g.fillStyle=warm?'rgba(255,236,190,.95)':'rgba(240,248,255,.95)';g.fillRect(lx-(gym?7:10),gym?37.5:29.5,gym?14:20,1.4)}
 g.globalCompositeOperation='lighter';for(const lx of xs){const top=gym?38:30,gr=g.createLinearGradient(0,top,0,300);gr.addColorStop(0,S.t>=2?'rgba(255,220,160,.18)':warm?'rgba(255,226,175,.08)':'rgba(220,235,255,.09)');gr.addColorStop(1,'rgba(255,240,210,0)');g.fillStyle=gr;g.beginPath();g.moveTo(lx-(gym?7:10),top);g.lineTo(lx+(gym?7:10),top);g.lineTo(lx+70,300);g.lineTo(lx-70,300);g.closePath();g.fill();
  const pg=g.createRadialGradient(lx,230,4,lx,230,80);pg.addColorStop(0,S.t>=2?'rgba(255,225,170,.16)':warm?'rgba(255,230,180,.07)':'rgba(230,240,255,.08)');pg.addColorStop(1,'rgba(255,240,210,0)');g.fillStyle=pg;g.beginPath();g.ellipse(lx,230,80,34,0,0,7);g.fill()}g.restore()}
var lightIn10=lightIn9;lightIn9=function(R){lightIn10(R);if(!INT9||INT10.off)return;try{decor10(R,INT9.kind);lamps10(INT9.kind)}catch(e){INT10.off=1;console.warn('interior decor',e)}};
