// ===================== VISUAL REBIRTH (v5): foundation / typography / sprites =====================
var SCv=1,lastT=0,acc60=0,SPRC=null,TQ=[],HXC={},SHC={},ICO=null,TRX=null,DOORFX=0,HOVER=null;
var FONTS="'Rubik','Heebo','Segoe UI','Arial Hebrew',Arial,sans-serif";
function fitCanvas(){const r=C.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(clamp((r.width||480)*dpr,480,1440));if(C.width!==w){C.width=w;C.height=Math.round(w*2/3)}SCv=C.width/480}
function smooth(on){g.imageSmoothingEnabled=!!on}
function rr(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
// ---------- colour helpers ----------
function hx(h){if(HXC[h])return HXC[h];let s=String(h).replace('#','');if(s.length==3||s.length==4)s=s.split('').map(c=>c+c).join('');const v=[parseInt(s.slice(0,2),16)||0,parseInt(s.slice(2,4),16)||0,parseInt(s.slice(4,6),16)||0];HXC[h]=v;return v}
function solid(h){h=String(h||'#888');return h.length>7?h.slice(0,7):h.length==5?h.slice(0,4):h}
function shd(h,f){const k=h+'|'+f;if(SHC[k])return SHC[k];const v=hx(h),t=f>1?(c=>c+(255-c)*(f-1)):(c=>c*f);const o='#'+v.map(c=>clamp(Math.round(t(c)),0,255).toString(16).padStart(2,'0')).join('');SHC[k]=o;return o}
function mixC(a,b,t){const p=hx(a),q=hx(b);return '#'+p.map((c,i)=>clamp(Math.round(c+(q[i]-c)*t),0,255).toString(16).padStart(2,'0')).join('')}
function lum(h){const v=hx(h);return (v[0]*.299+v[1]*.587+v[2]*.114)/255}
// ---------- typography ----------
function txt(s,x,y,sz=14,col='#fff',sh='#000a',al='left'){s=tr(String(s));const w=sz>=13?700:sz>=10?600:500;g.font=`${w} ${sz}px ${FONTS}`;g.textAlign=al;g.direction=HE.test(s)?'rtl':'ltr';if(sh&&sh!='#0000'){g.fillStyle=sh;g.fillText(s,x+.6,y+1)}g.fillStyle=col;g.fillText(s,x,y)}
function txtR(s,x,y,sz,col,al){g.font=`700 ${sz}px ${FONTS}`;g.textAlign=al||'left';g.direction='ltr';g.fillStyle=col;g.fillText(String(s),x,y)}
function tw(s,sz){const w=sz>=13?700:sz>=10?600:500;g.font=`${w} ${sz}px ${FONTS}`;return g.measureText(tr(String(s))).width}
function wrapW(s,maxW,sz){const o=[];let c='';for(const w of String(s).split(' ')){const t=c?c+' '+w:w;if(c&&tw(t,sz)>maxW){o.push(c);c=w}else c=t}if(c)o.push(c);return o}
function ell(s,maxW,sz){s=tr(String(s));if(tw(s,sz)<=maxW)return s;while(s.length>1&&tw(s+'…',sz)>maxW)s=s.slice(0,-1);return s+'…'}
// ---------- UI primitives (design system) ----------
var UIC={bg0:'#262a33',bg1:'#121419',line:'rgba(160,170,190,.5)',gold:'#d4a72c',goldL:'#ffd96a',goldD:'#8a6a12',txt:'#f2f4f8',mut:'#9aa3b5',ok:'#4caf50',warn:'#ffb020',bad:'#ef5350',info:'#7cc7ff'};
function panel(x,y,w,h,a=1,acc=1){g.save();smooth(1);g.globalAlpha=S.hc?1:a;g.fillStyle='rgba(0,0,0,.38)';rr(x+1,y+3,w,h,8);g.fill();const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,S.hc?'#0e1014':UIC.bg0);gr.addColorStop(1,S.hc?'#000':UIC.bg1);g.fillStyle=gr;rr(x,y,w,h,8);g.fill();g.strokeStyle=S.hc?'#fff':UIC.line;g.lineWidth=S.hc?1.6:1;g.stroke();g.strokeStyle='rgba(255,255,255,.07)';rr(x+1.5,y+1.5,w-3,h-3,7);g.stroke();if(acc&&w>30){const gg=g.createLinearGradient(x+10,0,x+10+Math.min(46,w-20),0);gg.addColorStop(0,UIC.goldL);gg.addColorStop(1,'rgba(212,167,44,0)');g.fillStyle=gg;g.fillRect(x+10,y,Math.min(46,w-20),2)}g.restore()}
function goldG(y0,y1){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#fff1b8');gr.addColorStop(.45,'#f2c94c');gr.addColorStop(.55,'#d4a72c');gr.addColorStop(1,'#8a6a12');return gr}
function selRow(x,y,w,h){g.save();smooth(1);const gr=g.createLinearGradient(x,0,x+w,0),he=S.lang=='he';gr.addColorStop(he?1:0,'rgba(242,201,76,.38)');gr.addColorStop(he?0:1,'rgba(242,201,76,.04)');g.fillStyle=gr;rr(x,y,w,h,5);g.fill();g.fillStyle=UIC.goldL;g.fillRect(he?x+w-3:x,y+2,3,h-4);g.restore()}
function pill(x,y,w,h,fill,stroke){g.save();smooth(1);g.fillStyle=fill;rr(x,y,w,h,h/2);g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke()}g.restore()}
function barX(x,y,w,h,v,col,bg='#07090d'){g.save();smooth(1);g.fillStyle=bg;rr(x,y,w,h,h/2);g.fill();const vw=Math.max(0,Math.min(1,v))*w;if(vw>1){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,shd(col,1.25));gr.addColorStop(1,col);g.fillStyle=gr;rr(x,y,Math.max(h,vw),h,h/2);g.fill();g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x+2,y+1,Math.max(0,vw-4),Math.max(1,h*.28))}g.restore()}
// ---------- vector icon set ----------
function icon(n,x,y,s,col='#fff'){g.save();smooth(1);g.translate(x,y);g.scale(s/16,s/16);g.fillStyle=col;g.strokeStyle=col;g.lineWidth=1.6;g.lineCap='round';g.lineJoin='round';const B=()=>g.beginPath(),Fi=()=>g.fill(),St=()=>g.stroke();
 switch(n){
 case 'heart':B();g.moveTo(8,14);g.bezierCurveTo(-1,8,2,1,8,5);g.bezierCurveTo(14,1,17,8,8,14);Fi();break;
 case 'star':B();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3.4:7.6;g.lineTo(8+Math.cos(a)*r,8.4+Math.sin(a)*r)}Fi();break;
 case 'bolt':B();g.moveTo(9.5,1);g.lineTo(3,9);g.lineTo(7.5,9);g.lineTo(6.5,15);g.lineTo(13,7);g.lineTo(8.5,7);g.closePath();Fi();break;
 case 'coin':B();g.arc(8,8,6.5,0,7);Fi();g.fillStyle='rgba(0,0,0,.3)';B();g.arc(8,8,4.3,0,7);Fi();g.fillStyle=col;g.font=`800 7px ${FONTS}`;g.textAlign='center';g.fillText('$',8,10.5);break;
 case 'sun':B();g.arc(8,8,3.6,0,7);Fi();for(let i=0;i<8;i++){const a=i*Math.PI/4;B();g.moveTo(8+Math.cos(a)*5.4,8+Math.sin(a)*5.4);g.lineTo(8+Math.cos(a)*7.4,8+Math.sin(a)*7.4);St()}break;
 case 'moon':B();g.arc(8,8,6,0,7);Fi();g.globalCompositeOperation='destination-out';B();g.arc(11,6,5,0,7);Fi();break;
 case 'cloud':B();g.arc(5.5,9.5,3.5,0,7);g.arc(9,7,4.2,0,7);g.arc(12,10,3,0,7);g.rect(5,9,8,4.2);Fi();break;
 case 'rain':icon('cloud',0,-2,16,col);g.strokeStyle='#7cc7ff';for(const p of [[5,12],[9,13],[12,12]]){B();g.moveTo(p[0],p[1]);g.lineTo(p[0]-1,p[1]+3);St()}break;
 case 'wind':for(const [yy,l] of [[5,11],[8.5,14],[12,9]]){B();g.moveTo(2,yy);g.lineTo(l,yy);g.arc(l,yy-1.6,1.6,Math.PI/2,-Math.PI/2,true);St()}break;
 case 'hot':icon('sun',0,0,16,'#ffb347');break;
 case 'trophy':B();g.moveTo(4,2);g.lineTo(12,2);g.lineTo(11.4,7.5);g.quadraticCurveTo(8,11,4.6,7.5);g.closePath();Fi();g.fillRect(7,10,2,3);g.fillRect(4.5,13,7,2);B();g.arc(3.6,4.6,2,Math.PI/2,Math.PI*1.5);St();B();g.arc(12.4,4.6,2,-Math.PI/2,Math.PI/2);St();break;
 case 'ball':B();g.arc(8,8,6.6,0,7);Fi();g.fillStyle='#1b1e26';B();for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;g.lineTo(8+Math.cos(a)*2.4,8+Math.sin(a)*2.4)}Fi();break;
 case 'shirt':B();g.moveTo(5,2);g.lineTo(2,4);g.lineTo(1,7.5);g.lineTo(3.6,8.4);g.lineTo(3.6,14);g.lineTo(12.4,14);g.lineTo(12.4,8.4);g.lineTo(15,7.5);g.lineTo(14,4);g.lineTo(11,2);g.quadraticCurveTo(8,4.5,5,2);Fi();break;
 case 'boot':B();g.moveTo(3,2);g.lineTo(8,2);g.lineTo(8.4,8);g.lineTo(14,10);g.quadraticCurveTo(15,12.6,13,13);g.lineTo(3,13);g.closePath();Fi();break;
 case 'map':B();g.moveTo(1.5,3);g.lineTo(5.5,1.5);g.lineTo(10.5,3);g.lineTo(14.5,1.5);g.lineTo(14.5,13);g.lineTo(10.5,14.5);g.lineTo(5.5,13);g.lineTo(1.5,14.5);g.closePath();St();B();g.moveTo(5.5,1.5);g.lineTo(5.5,13);g.moveTo(10.5,3);g.lineTo(10.5,14.5);St();break;
 case 'bag':g.fillRect(3,5,10,9);B();g.arc(8,5,2.6,Math.PI,0);St();break;
 case 'gear':B();g.arc(8,8,4.5,0,7);g.lineWidth=3.2;St();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.save();g.translate(8,8);g.rotate(a);g.fillRect(-1.2,-7.6,2.4,2.6);g.restore()}break;
 case 'news':g.fillRect(2,3,12,10);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(4,5,8,2);g.fillRect(4,8.5,5,1.2);g.fillRect(4,10.5,5,1.2);g.fillRect(10,8.5,2,3.2);break;
 case 'user':B();g.arc(8,5.4,3.2,0,7);Fi();B();g.arc(8,15,6,Math.PI,0);Fi();break;
 case 'flag':g.fillRect(3,1,1.6,14);B();g.moveTo(4.6,2);g.lineTo(13,4.6);g.lineTo(4.6,7.4);Fi();break;
 case 'home':B();g.moveTo(1.5,8);g.lineTo(8,2);g.lineTo(14.5,8);St();g.fillRect(3.5,8,9,6.5);break;
 case 'car':g.fillRect(1.5,7,13,4.6);B();g.moveTo(4,7);g.lineTo(5.8,3.4);g.lineTo(10.4,3.4);g.lineTo(12.2,7);Fi();g.fillStyle='#1b1e26';B();g.arc(4.6,12,1.8,0,7);g.arc(11.4,12,1.8,0,7);Fi();break;
 case 'plane':B();g.moveTo(1,8);g.lineTo(15,6.6);g.lineTo(15,9.4);g.closePath();Fi();B();g.moveTo(7,7.4);g.lineTo(4,1.5);g.lineTo(6,1.5);g.lineTo(10,7.2);Fi();B();g.moveTo(7,8.6);g.lineTo(4,14.5);g.lineTo(6,14.5);g.lineTo(10,8.8);Fi();break;
 case 'whistle':B();g.arc(6,10,4,0,7);Fi();g.fillRect(6,5.6,8,4);break;
 case 'check':g.lineWidth=2.4;B();g.moveTo(2.5,8.5);g.lineTo(6.4,12.2);g.lineTo(13.6,3.8);St();break;
 case 'lock':g.fillRect(3,7,10,7.5);B();g.arc(8,7,3.2,Math.PI,0);g.lineWidth=2;St();break;
 case 'arrow':B();g.moveTo(14,8);g.lineTo(6,2.5);g.lineTo(6,6);g.lineTo(2,6);g.lineTo(2,10);g.lineTo(6,10);g.lineTo(6,13.5);g.closePath();Fi();break;
 case 'cal':g.fillRect(2,3,12,11);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(3.5,6.5,9,6);g.fillStyle=col;g.fillRect(4.5,1.5,1.6,3);g.fillRect(9.9,1.5,1.6,3);break;
 case 'chart':g.fillRect(2,9,3,5);g.fillRect(6.5,5,3,9);g.fillRect(11,2,3,12);break;
 case 'people':B();g.arc(5.4,5.6,2.4,0,7);g.arc(11,5,2.6,0,7);Fi();B();g.arc(5.4,14,4.4,Math.PI,0);g.arc(11,13.6,4.6,Math.PI,0);Fi();break;
 case 'gk':B();g.arc(8,8,6.4,0,7);St();B();g.moveTo(3,8);g.lineTo(13,8);g.moveTo(8,3);g.lineTo(8,13);St();break;
 default:B();g.arc(8,8,5,0,7);Fi()}
 g.restore()}
// ---------- character sprite system (cached, outlined, shaded) ----------
var SKINS2=['#ffdbac','#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a21'],NPCH=['#1d1a17','#2b1a10','#5a3a1c','#8a5a2b','#c9a227','#e8d5a0','#a0522d','#3b3b3b'];
var DIG={0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111'],4:['101','101','111','001','001'],5:['111','100','111','001','111'],6:['111','100','111','101','111'],7:['111','001','010','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111']};
function charKey(o){return [o.dir,o.fr,o.up?1:0,o.sh,o.c2,o.pat||'',o.sk,o.hc,o.hs,o.br||0,o.bd==null?1:o.bd,o.so,o.bt,o.pa,o.cas?1:0,o.num||'',o.k||0,o.wr||'',o.hd||'',o.gl||'',o.cap||'',o.wa||'',o.ch||'',o.arm?1:0,o.gk||''].join(',')}
function outlineC(c,W,Hh){const id=c.getImageData(0,0,W,Hh),d=id.data,o=new Uint8ClampedArray(d);for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]>40)continue;if((x>0&&d[i-1]>40)||(x<W-1&&d[i+7]>40)||(y>0&&d[i-W*4+3]>40)||(y<Hh-1&&d[i+W*4+3]>40)){o[i]=20;o[i+1]=16;o[i+2]=26;o[i+3]=230}}id.data.set(o);c.putImageData(id,0,0)}
function buildChar(o){const W=40,Hh=48,ox=4,oy=10,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const c=cv.getContext('2d');
 const mir=o.dir=='l',dir=mir?'r':o.dir,fr=o.fr||0,P=(x,y,w,h,col)=>{if(!col||w<=0||h<=0)return;c.fillStyle=col;c.fillRect(x+ox,y+oy,w,h)};
 const sk=o.sk,skS=shd(sk,.83),skD=shd(sk,.68),sh=o.sh,shS=shd(sh,.74),shH=shd(sh,1.22),c2=o.c2||'#fff',pa=o.pa,paS=shd(pa,.72),so=o.so||'#f2f2f2',soS=shd(so,.78),bt=o.bt,btH=shd(bt,1.45),btS=shd(bt,.6),hc=o.hc,hcH=shd(hc,1.35),hcS=shd(hc,.7),eye='#1d1712',mouth='#9a4b33';
 const bd=o.bd==null?1:o.bd,tl=9-bd,trr=22+bd,by=fr==2?-1:0,hy=by+(fr==4?-1:0),k=o.k||0;
 const wr=o.wr||(k>=2?'#ffd24a':null),ch=o.ch||(k>=3?'#ffd24a':null),gl=o.gl||(k>=4?'#15161a':null);
 const pc=(lum(c2)>.5)==(lum(sh)>.5)?(lum(sh)>.5?'#1b2240':'#ffffff'):c2;
 if(dir=='d'||dir=='u'){
  const lu=dir=='d'?(fr==1?2:0):(fr==3?2:0),ru=dir=='d'?(fr==3?2:0):(fr==1?2:0);
  for(const [lx,u] of [[10,lu],[17,ru]]){
   if(o.cas){P(lx,21-u,5,8,pa);P(lx+4,21-u,1,8,paS)}else{P(lx,23-u,5,2,sk);P(lx+4,23-u,1,2,skS);P(lx,25-u,5,4,so);P(lx,25-u,5,1,c2);P(lx+4,26-u,1,3,soS)}
   P(lx,29-u,5,3,bt);P(lx+1,29-u,2,1,btH);P(lx,31-u,5,1,btS)}
  // shorts
  P(9,19+by,14,4,pa);P(9,19+by,14,1,shd(pa,.86));P(21,20+by,1,3,paS);if(!o.cas){P(9,20+by,1,3,c2);P(22,20+by,1,3,c2)}c.clearRect(15+ox,21+by+oy,2,2);
  // torso
  P(tl+1,11+by,trr-tl-1,1,sh);P(tl,12+by,trr-tl+1,7,sh);P(trr-1,12+by,2,7,shS);P(tl,18+by,trr-tl+1,1,shS);if(dir=='d')P(tl+1,12+by,1,3,shH);
  const pt=o.pat,tw0=trr-tl+1;
  if(pt=='stripes')for(let x=tl+2;x<trr;x+=3)P(x,11+by,1,8,c2);
  else if(pt=='hoops'){P(tl,13+by,tw0,1,c2);P(tl,16+by,tw0,1,c2)}
  else if(pt=='sash')for(let i=0;i<7;i++)P(tl+1+i*2,12+by+i,2,1,c2);
  else if(pt=='split')P(16,11+by,trr-15,8,c2);
  else if(pt=='zip'){P(15,11+by,2,8,c2);P(tl,11+by,tw0,1,c2)}
  if(dir=='d'){P(14,11+hy,4,1,c2);P(15,12+hy,2,1,c2);if(ch){P(14,11+hy,1,1,ch);P(17,11+hy,1,1,ch);P(15,12+hy,2,1,ch);P(15,13+hy,2,1,shd(ch,.8))}}
  else{P(13,11+by,6,1,c2);if(o.num){const ds=String(o.num).slice(0,2).split('');const w0=ds.length*4-1;let x0=16-Math.floor(w0/2);for(const d of ds){const gph=DIG[d]||DIG[0];gph.forEach((row,ry)=>row.split('').forEach((b,rx)=>{if(b=='1')P(x0+rx,13+by+ry,1,1,pc)}));x0+=4}}}
  // arms
  const la=dir=='d'?(fr==1?1:fr==3?-1:0):(fr==1?-1:fr==3?1:0),ra=-la;
  if(o.up){for(const ax of [tl-3,trr+1]){P(ax,1+by,3,7,sk);P(ax,8+by,3,4,sh);P(ax,7+by,3,1,c2);P(ax,-1+by,3,2,skS)}}
  else for(const [ax,a,side] of [[tl-3,la,0],[trr+1,ra,1]]){P(ax,12+by+a,3,3,sh);P(ax+(side?2:0),12+by+a,1,3,side?shS:sh);P(ax,14+by+a,3,1,c2);P(ax,15+by+a,3,3,sk);P(ax+(side?2:0),15+by+a,1,3,skS);P(ax,18+by+a,3,2,o.gk?o.gk:skS);if(wr)P(ax,17+by+a,3,1,wr);if(o.wa&&side){P(ax,17+by+a,3,1,'#2b2b33');P(ax+1,17+by+a,1,1,o.wa)}if(o.arm&&side)P(ax,13+by+a,3,1,'#f5c400')}
  // head
  P(14,10+hy,4,2,skS);P(10,2+hy,12,8,sk);P(11,1+hy,10,1,sk);P(11,10+hy,10,1,sk);P(9,5+hy,1,3,skS);P(22,5+hy,1,3,skS);P(21,3+hy,1,7,skS);
  if(dir=='d'){
   if((o.br||0)==1){const st=mixC(sk,hc,.42);P(11,8+hy,10,2,st);P(12,10+hy,8,1,st)}
   if((o.br||0)==2){P(10,7+hy,1,3,hc);P(21,7+hy,1,3,hc);P(11,8+hy,10,2,hc);P(12,10+hy,8,1,hc);P(14,7+hy,4,1,hc)}
   P(12,4+hy,2,1,hcS);P(18,4+hy,2,1,hcS);
   if(fr==5){P(12,6+hy,2,1,eye);P(18,6+hy,2,1,eye)}else{P(12,5+hy,2,2,eye);P(18,5+hy,2,2,eye);P(12,5+hy,1,1,'#fff');P(18,5+hy,1,1,'#fff')}
   P(15,7+hy,2,1,skS);P(15,8+hy,2,1,mouth);P(14,8+hy,1,1,(o.br||0)==2?hc:skS);P(17,8+hy,1,1,(o.br||0)==2?hc:skS);
  }
  const hs=o.hs||0;
  if(dir=='d'){
   if(hs==0){P(11,-1+hy,10,1,hc);P(10,0+hy,12,3,hc);P(9,1+hy,1,4,hc);P(22,1+hy,1,4,hc);P(11,3+hy,6,1,hc);P(12,0+hy,4,1,hcH)}
   else if(hs==1){P(11,-1+hy,10,1,hc);P(10,0+hy,12,3,hc);P(9,1+hy,2,10,hc);P(21,1+hy,2,10,hc);P(11,3+hy,4,1,hc);P(12,0+hy,4,1,hcH);P(9,9+hy,2,2,hcS);P(21,9+hy,2,2,hcS)}
   else if(hs==2){P(10,1+hy,12,1,mixC(sk,hc,.35));P(14,-3+hy,4,5,hc);P(15,-4+hy,2,1,hc);P(15,-3+hy,1,3,hcH)}
   else if(hs==3){P(11,0+hy,10,1,hcS);P(10,1+hy,12,1,hcS);P(9,2+hy,1,2,hcS);P(22,2+hy,1,2,hcS)}
   else if(hs==4){P(10,-1+hy,12,4,hc);for(const x of [10,13,16,19])P(x,-2+hy,2,1,hc);P(9,0+hy,1,5,hc);P(22,0+hy,1,5,hc);for(const [x,y] of [[11,0],[14,-1],[17,0],[20,1],[12,2]])P(x,y+hy,1,1,hcH)}
   else{P(10,0+hy,12,3,hc);for(const x of [11,14,17,20]){P(x,-2+hy,2,2,hc);P(x,-3+hy,1,1,hc)}P(9,1+hy,1,3,hc);P(22,1+hy,1,3,hc);P(12,0+hy,3,1,hcH)}
   if(o.hd){P(10,3+hy,12,1,o.hd);P(9,3+hy,1,1,o.hd);P(22,3+hy,1,1,o.hd)}
   if(gl){P(11,5+hy,4,2,gl);P(17,5+hy,4,2,gl);P(15,5+hy,2,1,gl);P(12,5+hy,1,1,'#8892a8');P(18,5+hy,1,1,'#8892a8')}
   if(o.cap){P(10,-1+hy,12,4,o.cap);P(11,-2+hy,10,1,o.cap);P(9,2+hy,14,1,shd(o.cap,.7));P(15,-2+hy,2,1,shd(o.cap,1.35))}
  }else{ // back view
   P(10,0+hy,12,9,hs==3?hcS:hc);P(11,-1+hy,10,1,hs==3?hcS:hc);P(9,5+hy,1,3,skS);P(22,5+hy,1,3,skS);
   if(hs==1)P(10,8+hy,12,4,hc);
   if(hs==2){P(10,0+hy,12,9,mixC(sk,hc,.3));P(14,-3+hy,4,12,hc);P(15,-4+hy,2,1,hc)}
   if(hs==4)for(const x of [10,13,16,19])P(x,-2+hy,2,1,hc);
   if(hs==5)for(const x of [11,14,17,20]){P(x,-2+hy,2,2,hc);P(x,-3+hy,1,1,hc)}
   if(hs!=2&&hs!=3)P(13,1+hy,4,1,hcH);
   if(o.hd)P(10,3+hy,12,1,o.hd);if(o.cap){P(10,-1+hy,12,4,o.cap);P(13,3+hy,6,1,shd(o.cap,.7))}
  }
 }else{ // side view facing right
  const stride=fr==1||fr==3,fl=stride?16:13,bl=stride?10:13;
  const leg=(lx,u,dark)=>{const s1=dark?skS:sk,s2=dark?soS:so,s3=dark?btS:bt;if(o.cas){P(lx,21-u,5,8,dark?paS:pa)}else{P(lx,23-u,5,2,s1);P(lx,25-u,5,4,s2);P(lx,25-u,5,1,dark?shd(c2,.75):c2)}P(lx,29-u,6,3,s3);if(!dark)P(lx+1,29-u,3,1,btH)};
  leg(bl,0,1);leg(fl,stride?1:0,0);
  P(12,19+by,9,4,pa);P(12,19+by,9,1,shd(pa,.86));if(!o.cas)P(12,20+by,1,3,c2);
  const ttl=11-(bd>1?1:0);P(ttl+1,11+by,9,1,sh);P(ttl,12+by,11,7,sh);P(ttl+9,12+by,2,7,shS);P(ttl,18+by,11,1,shS);
  if(o.pat=='hoops'){P(ttl,13+by,11,1,c2);P(ttl,16+by,11,1,c2)}else if(o.pat=='stripes'){for(let x=ttl+1;x<ttl+11;x+=3)P(x,11+by,1,8,c2)}else if(o.pat=='sash'){for(let i=0;i<6;i++)P(ttl+1+i*1.6|0,12+by+i,2,1,c2)}else if(o.pat=='zip')P(ttl+9,11+by,1,8,c2);
  P(ttl+5,11+by,4,1,c2);
  if(o.up){P(15,1+by,3,7,sk);P(15,8+by,3,4,sh);P(15,7+by,3,1,c2)}
  else if(fr==1){P(15,12+by,3,3,sh);P(17,15+by,3,2,sk);P(19,16+by,2,2,skS);P(15,14+by,3,1,c2);if(wr)P(17,15+by,2,1,wr)}
  else if(fr==3){P(14,12+by,3,3,sh);P(12,15+by,3,2,sk);P(10,16+by,2,2,skS);P(14,14+by,3,1,c2);if(wr)P(12,15+by,2,1,wr)}
  else{P(14,12+by,3,3,sh);P(14,14+by,3,1,c2);P(14,15+by,3,3,sk);P(14,18+by,3,2,skS);if(wr)P(14,17+by,3,1,wr);if(o.arm)P(14,13+by,3,1,'#f5c400')}
  // head (profile)
  P(15,10+hy,4,2,skS);P(12,2+hy,10,8,sk);P(13,1+hy,8,1,sk);P(13,10+hy,8,1,sk);P(22,6+hy,1,2,sk);P(14,5+hy,2,3,skS);
  if((o.br||0)==1)P(16,8+hy,6,3,mixC(sk,hc,.42));if((o.br||0)==2){P(15,7+hy,7,4,hc);P(20,7+hy,2,1,hc)}
  if(fr==5)P(19,6+hy,1,1,eye);else{P(19,5+hy,1,2,eye)}P(18,4+hy,3,1,hcS);P(20,8+hy,2,1,mouth);
  const hs=o.hs||0;
  if(hs==0){P(11,-1+hy,9,1,hc);P(10,0+hy,11,3,hc);P(10,1+hy,4,7,hc);P(18,2+hy,3,1,hc);P(13,0+hy,4,1,hcH)}
  else if(hs==1){P(11,-1+hy,9,1,hc);P(10,0+hy,11,3,hc);P(9,1+hy,5,11,hc);P(18,2+hy,3,1,hc);P(13,0+hy,4,1,hcH)}
  else if(hs==2){P(11,1+hy,9,1,mixC(sk,hc,.35));P(12,-3+hy,8,4,hc);P(13,-4+hy,5,1,hc);P(14,-3+hy,4,1,hcH)}
  else if(hs==3){P(11,0+hy,9,2,hcS);P(10,1+hy,3,5,hcS)}
  else if(hs==4){P(10,-1+hy,11,4,hc);P(10,1+hy,4,7,hc);for(const x of [10,13,16,19])P(x,-2+hy,2,1,hc);P(12,0+hy,1,1,hcH);P(16,-1+hy,1,1,hcH)}
  else{P(10,0+hy,11,3,hc);P(10,1+hy,4,6,hc);for(const x of [10,13,16]){P(x,-2+hy,2,2,hc);P(x-1,-3+hy,1,1,hc)}}
  if(o.hd)P(11,3+hy,11,1,o.hd);if(gl){P(17,5+hy,4,2,gl);P(14,5+hy,3,1,gl)}if(o.cap){P(11,-1+hy,10,4,o.cap);P(19,2+hy,6,1,shd(o.cap,.7))}
 }
 if(mir){const t=document.createElement('canvas');t.width=W;t.height=Hh;const q=t.getContext('2d');q.translate(W,0);q.scale(-1,1);q.drawImage(cv,0,0);c.clearRect(0,0,W,Hh);c.drawImage(t,0,0)}
 outlineC(c,W,Hh);return cv}
function drawChar(x,y,o,sc=1,noShadow){if(!SPRC)SPRC=new Map();o.sk=solid(o.sk||'#f1c27d');o.sh=solid(o.sh);o.pa=solid(o.pa||'#223');o.bt=solid(o.bt||'#15161a');o.hc=solid(o.hc||'#2b1a10');o.c2=solid(o.c2||'#ffffff');if(o.so)o.so=solid(o.so);
 const key=charKey(o);let cv=SPRC.get(key);if(!cv){if(SPRC.size>900)SPRC.clear();cv=buildChar(o);SPRC.set(key,cv)}
 if(!noShadow){g.save();smooth(1);g.fillStyle='rgba(10,14,20,.30)';g.beginPath();g.ellipse(x+16*sc,y+31*sc,8.5*sc,3*sc,0,0,7);g.fill();g.fillStyle='rgba(10,14,20,.22)';g.beginPath();g.ellipse(x+16*sc,y+31*sc,5*sc,1.8*sc,0,0,7);g.fill();g.restore()}
 smooth(0);g.drawImage(cv,x-4*sc,y-10*sc,40*sc,48*sc)}
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function npcOpts(col,hair,seed){const h=hashS(String(seed||'')+col+hair);return{sk:SKINS2[h%SKINS2.length],hs:(h>>>4)%6,br:((h>>>9)%7==0)?2:((h>>>9)%5==0)?1:0,bd:(h>>>12)%3,c2:shd(solid(col),1.5),so:'#f2f2f2',num:''}}
function plOpts(){const a=S.ap||{},w=itm(a,'watch'),ch=itm(a,'chain');return{sk:PL.skin||'#f1c27d',hs:PL.hs||0,pat:PL.pat,c2:PL.c2||kitTrim(),so:PL.socks||'#f2f2f2',wr:PL.wrist&&PL.wrist.data.c,hd:PL.head&&PL.head.data.c,gl:PL.glass&&PL.glass.data.c,cap:PL.cap&&PL.cap.data.c,wa:PL.wa!==undefined?PL.wa:(w&&w.data.c),ch:PL.ch!==undefined?PL.ch:(ch&&ch.data.c),br:PL.br!=null?PL.br:(a.br||0),bd:PL.bd!=null?PL.bd:(a.bd==null?1:a.bd),num:String(S.num||10),arm:!!S.cap,lv:careerLv8()}}
// career stage shown on the player (0 Unknown ... 5 Legend); cosmetic only
function careerLv8(){return S.arch?Math.max(0,["Unknown","Amateur","Professional","Star","Superstar","Legend"].indexOf(stage())):0}
function kitTrim(){const k=KITS[S.kit]||KITS[0];return lum(k[1])>.6?'#1b2a49':'#ffffff'}
// legacy entry point: every existing caller keeps working, now with the new sprite art
function spr(x,y,col,dir,fr,sc=1,hair='#3b2314',bt='#111',sh='#223',k=0,up=0,pl=0){const o=pl?plOpts():npcOpts(col,hair,x>400?'':'');o.sh=col;o.dir=dir||'d';o.fr=fr==1?1:fr==2?3:fr||0;o.up=up;o.bt=bt;o.pa=sh;o.k=k;o.hc=hair;drawChar(x,y,o,sc)}
// rolling ball sprite (4 rotation frames)
var BALLC=null;
function ballSpr(col,fr){if(!BALLC)BALLC={};const k=col+fr;if(BALLC[k])return BALLC[k];const cv=document.createElement('canvas');cv.width=cv.height=12;const c=cv.getContext('2d'),P=(x,y,w,h,cc)=>{c.fillStyle=cc;c.fillRect(x,y,w,h)};
 const base=solid(col),dk=lum(base)>.55?'#20232b':shd(base,.45),hl=shd(base,1.4);
 P(3,1,6,10,base);P(1,3,10,6,base);P(2,2,8,8,base);P(2,9,8,1,shd(base,.8));P(9,3,1,6,shd(base,.82));P(3,2,2,1,hl);P(2,3,1,2,hl);
 const pats=[[[5,4,2,2],[2,6,1,2],[8,7,2,1],[5,9,2,1]],[[4,5,2,2],[7,3,2,1],[8,7,1,2],[3,8,2,1]],[[6,5,2,2],[3,3,2,1],[2,7,1,2],[7,8,2,1]],[[5,6,2,2],[8,4,1,2],[3,4,1,2],[5,2,2,1]]];
 for(const p of pats[fr&3])P(p[0],p[1],p[2],p[3],dk);
 const tmp=cv;outlineC(c,12,12);BALLC[k]=tmp;return tmp}
function ball(x,y,c,fr=0){g.save();smooth(1);g.fillStyle='rgba(10,14,20,.32)';g.beginPath();g.ellipse(x,y+4.5,4.2,1.8,0,0,7);g.fill();g.restore();smooth(0);g.drawImage(ballSpr(c,fr),x-6,y-6,12,12)}
