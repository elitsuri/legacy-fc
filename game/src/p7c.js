// ===================== VISUAL REBIRTH: weather, lighting, living world, world frame =====================
function wxNow(){const h=H(S.day,7,3);return h<14?'Rain':h<26?'Cloudy':h<36?'Windy':h<44?'Hot':'Clear'}
function wxHeavy(){return wxNow()=='Rain'&&H(S.day,8,4)<45}
function wxName(w){return({Clear:['Clear','בהיר'],Rain:['Rain','גשם'],Cloudy:['Cloudy','מעונן'],Windy:['Windy','סוער'],Hot:['Hot','חם']}[w]||[w,w])[S.lang=='he'?1:0]}
function wxIcon(w){return w=='Rain'?'rain':w=='Cloudy'?'cloud':w=='Windy'?'wind':w=='Hot'?'hot':(S.t==3?'moon':'sun')}
var LCUR=null;
const LPRE=[{mul:[255,238,222],ls:.05,warm:'rgba(255,190,120,.14)'},{mul:[255,255,255],ls:0,warm:null},{mul:[255,196,160],ls:.5,warm:'rgba(255,120,60,.16)'},{mul:[78,92,152],ls:1,warm:null}];
function lightTarget(){const p=LPRE[S.t]||LPRE[1],w=wxNow();let mul=p.mul.slice(),ls=p.ls;if(w=='Rain'){const f=wxHeavy()?.72:.8;mul=mul.map((c,i)=>c*f*[.95,1,1.08][i]);ls=Math.min(1,ls+.3)}else if(w=='Cloudy'){mul=mul.map((c,i)=>c*.86*[.97,1,1.04][i])}else if(w=='Hot'&&S.t<2){mul=[mul[0],mul[1]*.97,mul[2]*.88]}return{mul,ls}}
function drawLight(cx,cy){const tg=lightTarget();if(!LCUR)LCUR={mul:tg.mul.slice(),ls:tg.ls};const k=S.rm?1:.035;for(let i=0;i<3;i++)LCUR.mul[i]+=(tg.mul[i]-LCUR.mul[i])*k;LCUR.ls+=(tg.ls-LCUR.ls)*k;
 g.save();g.globalCompositeOperation='multiply';g.fillStyle=`rgb(${LCUR.mul.map(v=>clamp(v|0,0,255)).join(',')})`;g.fillRect(0,0,480,320);g.restore();
 const p=LPRE[S.t];if(p&&p.warm&&wxNow()!='Rain'){g.save();g.globalCompositeOperation='screen';const gr=g.createLinearGradient(0,0,300,260);gr.addColorStop(0,p.warm);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,480,320);g.restore()}
 if(LCUR.ls>.03&&NLc){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,LCUR.ls)*.8;smooth(1);g.drawImage(NLc,cx/2,cy/2,240,160,0,0,480,320);g.restore()}
 const w=wxNow();
 if(w=='Rain'){puddles(cx,cy);const heavy=wxHeavy(),n=S.rm?25:heavy?150:85;if(!LCUR.rain||LCUR.rain.length!=n){LCUR.rain=[];for(let i=0;i<n;i++)LCUR.rain.push({x:Math.random()*520,y:Math.random()*320,v:7+Math.random()*5})}g.save();g.strokeStyle=heavy?'rgba(200,215,240,.55)':'rgba(200,215,240,.45)';g.lineWidth=1;g.beginPath();for(const r of LCUR.rain){if(!S.rm){r.y+=r.v;r.x-=2}if(r.y>320){r.y=-10;r.x=Math.random()*520}g.moveTo(r.x,r.y);g.lineTo(r.x+2.2,r.y-9)}g.stroke();
  if(!S.rm){for(let i=0;i<(heavy?7:4);i++)SPLASH.push({x:Math.random()*480,y:40+Math.random()*280,t:0});SPLASH=SPLASH.filter(s=>++s.t<14);g.strokeStyle='rgba(220,235,255,.5)';for(const s of SPLASH){g.beginPath();g.ellipse(s.x,s.y,s.t*.45,s.t*.18,0,0,7);g.stroke()}}g.restore()}
 if((w=='Windy'||w=='Cloudy')&&!S.rm){if(LEAVES.length<(w=='Windy'?16:0))LEAVES.push({x:-10,y:Math.random()*320,v:1.2+Math.random()*1.5,p:Math.random()*6,c:['#e08a3a','#c9a227','#7fb04a','#b4572a'][Math.random()*4|0]});LEAVES=LEAVES.filter(l=>l.x<500);for(const l of LEAVES){l.x+=l.v;l.y+=Math.sin(tick/14+l.p)*.7;g.fillStyle=l.c;g.save();g.translate(l.x,l.y);g.rotate(tick/9+l.p);g.fillRect(-2,-1,4,2);g.restore()}}
 if(!S.rm){const dark=w=='Cloudy'||w=='Rain'?.13:w=='Windy'?.09:.06,sp=w=='Windy'?.5:.16;g.save();g.fillStyle=`rgba(10,18,40,${dark})`;const ox=(tick*sp)%760-140;g.beginPath();g.ellipse(ox,90+Math.sin(tick/400)*20,110,30,0,0,7);g.ellipse((ox+380)%760-80,235,130,34,0,0,7);g.fill();g.restore()}
 if(w=='Hot'&&S.t<2&&!S.rm){g.save();g.globalAlpha=.06;g.fillStyle='#fff3c0';for(let i=0;i<5;i++){const yy=(tick*.4+i*70)%320;g.fillRect(0,yy,480,2+Math.sin(tick/20+i)*1)}g.restore()}
 smooth(1);g.drawImage(VG,0,0,480,320)}
// ---------- living world ----------
function carSprite(c,bus){if(!BALLC)BALLC={};const k='car'+c+(bus?1:0);if(BALLC[k])return BALLC[k];const W0=bus?56:32,H0=18,cv=document.createElement('canvas');cv.width=W0;cv.height=H0;const q=cv.getContext('2d');
 if(bus){Q(q,1,2,54,14,c);Q(q,1,2,54,2,shd(c,1.25));Q(q,1,14,54,2,shd(c,.7));for(let i=0;i<7;i++)Q(q,6+i*7,4,5,4,'#8fc9ef');Q(q,50,3,4,12,'#8fc9ef');Q(q,1,9,54,1,'#c0392b')}
 else{Q(q,2,4,28,11,c);Q(q,1,6,30,7,c);Q(q,2,13,28,2,shd(c,.65));Q(q,8,5,14,9,shd(c,.84));Q(q,21,5,4,9,'#8fc9ef');Q(q,5,6,3,7,'#6f9fc4');Q(q,9,4,12,1,shd(c,1.35));Q(q,30,6,1,2,'#fff6c8');Q(q,30,11,1,2,'#fff6c8');Q(q,1,6,1,2,'#d33');Q(q,1,11,1,2,'#d33')}
 Q(q,bus?6:4,bus?1:3,5,2,'#15161a');Q(q,bus?44:22,bus?1:3,5,2,'#15161a');Q(q,bus?6:4,bus?16:15,5,2,'#15161a');Q(q,bus?44:22,bus?16:15,5,2,'#15161a');
 outlineC(q,W0,H0);BALLC[k]=cv;return cv}
function initLife2(){PEDS=[];const pants=['#2f4a7a','#a08a5a','#22252c','#5b6270','#6b4a2a','#3d5a3d'],tops=['#e67e22','#3498db','#9b59b6','#e74c3c','#16a085','#f1c40f','#ecf0f1','#34495e','#ff8fb4','#2ecc71'];
 for(let i=0;i<14;i++){const t=rnd(RT),h=hashS('ped'+i),fan=i<5;const cc=clubCols();PEDS.push({x:t[0]*T,y:t[1]*T,tx:t[0],ty:t[1],dx:0,dy:0,f:0,side:i%2?1:-1,off:0,wait:0,o:{sk:SKINS2[h%6],hc:NPCH[(h>>>3)%8],hs:(h>>>6)%6,br:(h>>>9)%6==0?2:0,bd:(h>>>11)%3,sh:fan?cc[0]:tops[(h>>>13)%tops.length],c2:fan?cc[1]:'#ffffff',pat:fan&&(h&1)?'stripes':null,pa:pants[(h>>>17)%pants.length],cas:1,bt:['#2b2b2b','#e8e8e8','#7a4a2a'][(h>>>20)%3],num:''}})}
 CARS2=[];[9,14,19,29,39,49].forEach((r,j)=>{for(let k=0;k<2;k++){const bus=(j+k)%5==0;CARS2.push({x:k*1300+j*170,r,d:(j+k)%2?-1:1,c:bus?'#f5b700':['#d33','#3a7bd5','#f5b700','#1f9d55','#8d96a8','#eeeeee','#16181d'][(j*3+k)%7],bus,v:(bus?.5:.65)+((j*7+k*3)%5)*.08,st:0})}})}
function lifeEnts(cx,cy){const o=[],nPed=S.rm?4:S.t==3?6:S.t==2?10:14;
 for(let i=0;i<nPed;i++){const p=PEDS[i];if(!p)break;if(Math.hypot(p.tx-S.x,p.ty-S.y)>26){for(let a=0;a<30;a++){const t=rnd(RT),d=Math.hypot(t[0]-S.x,t[1]-S.y);if(d<13&&d>6){p.x=t[0]*T;p.y=t[1]*T;p.tx=t[0];p.ty=t[1];p.f=0;p.dx=p.dy=0;break}}}
  if(p.f<=0){const ds=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>isRd(p.tx+d[0],p.ty+d[1])&&!(d[0]==-p.dx&&d[1]==-p.dy));const d=ds.length?rnd(ds):[-p.dx,-p.dy];if(p.tx+d[0]==S.x&&p.ty+d[1]==S.y){p.wait=30}else{p.dx=d[0];p.dy=d[1];p.tx+=d[0];p.ty+=d[1];p.f=T}}
  if(p.wait>0)p.wait--;else if(p.f>0){p.x+=p.dx*.5;p.y+=p.dy*.5;p.f-=.5}
  const tgt=p.side*10;p.off+=(tgt-p.off)*.15;const ox=p.dy?p.off:0,oy=p.dx?p.off*.8:0,moving=p.wait<=0&&p.f>0,frm=moving?[1,2,3,0][(Math.floor((p.x+p.y)/4))&3]:((tick+i*37)%160<6?5:0);
  o.push({y:p.y+oy,dr:()=>drawChar(p.x+ox-cx,p.y+oy-cy-4,Object.assign({dir:p.dx>0?'r':p.dx<0?'l':p.dy<0?'u':'d',fr:frm},p.o))})}
 for(const c of CARS2){const lane=c.r*T+(c.d>0?16:2);let blocked=false;if(isRd(S.x,c.r)&&S.y==c.r){const ahead=(S.x*T+16-c.x-(c.bus?28:16))*c.d;if(ahead>0&&ahead<56)blocked=true}
  if(!blocked&&!S.rm||(!blocked&&tick%2==0))c.x+=c.d*c.v;if(c.x>MW*T+60)c.x=-60;if(c.x<-60)c.x=MW*T+60;c.st=blocked?c.st+1:0;
  const sx=c.x-cx,sy=lane-cy;if(sx<-70||sx>540||sy<-30||sy>340)continue;
  o.push({y:lane+14,dr:()=>{const cv=carSprite(c.c,c.bus),w0=cv.width;g.save();smooth(0);if(c.d<0){g.translate(sx+w0/2,0);g.scale(-1,1);g.translate(-(sx+w0/2),0)}g.fillStyle='rgba(8,12,20,.28)';g.fillRect(sx+3,sy+12,w0-4,5);g.drawImage(cv,sx,sy);g.restore();
   if(LCUR&&LCUR.ls>.3){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(.55,LCUR.ls*.5);const hx0=c.d>0?sx+w0:sx,gr=g.createLinearGradient(hx0,0,hx0+c.d*46,0);gr.addColorStop(0,'rgba(255,240,180,.9)');gr.addColorStop(1,'rgba(255,240,180,0)');g.fillStyle=gr;g.beginPath();g.moveTo(hx0,sy+5);g.lineTo(hx0+c.d*46,sy-2);g.lineTo(hx0+c.d*46,sy+20);g.lineTo(hx0,sy+12);g.fill();g.restore()}
   if(c.st>20&&c.st<60&&(c.st>>3)%2==0)txt('♪',sx+(c.d>0?w0:0),sy-2,9,'#ffd24a','#000a','center')}})}
 return o}
function dynGround(cx,cy){const x0=Math.floor(cx/T),y0=Math.floor(cy/T),inV=(x,y)=>x>=x0-1&&x<=x0+16&&y>=y0-1&&y<=y0+11;
 g.save();g.globalAlpha=.75;for(const [x,y] of WATERV){if(!inV(x,y))continue;for(let i=0;i<2;i++){const w=(tick/(S.rm?9:2.5)+i*17+x*5+y*3)%30;g.fillStyle='rgba(225,245,255,.55)';g.fillRect(x*T-cx+w,y*T-cy+9+i*13,6,1)}}g.restore();
 if(!S.rm)for(const [x,y] of TALLV){if(!inV(x,y))continue;const sw=Math.sin(tick/16+x*.9+y*.6)*(wxNow()=='Windy'?2.4:1.2);for(let i=0;i<5;i++){const bx=x*T-cx+3+i*6+(H(x,y,i)%3),by=y*T-cy+4+(i%2)*14;g.fillStyle='#62c266';g.fillRect(bx+sw,by,1,4);g.fillStyle='#a9ef9e';g.fillRect(bx+sw*1.4,by-1,1,2)}}
 for(const [fx,fy0] of FOUNT){const sx=fx-cx,sy=fy0-cy;if(sx<-40||sx>520||sy<-40||sy>360)continue;g.save();smooth(1);for(let i=0;i<14;i++){const a=i/14*6.28+tick*.02,ph=((tick*1.8+i*9)%30)/30,r=ph*16,hgt=Math.sin(ph*Math.PI)*12;g.fillStyle=`rgba(220,240,255,${.8-ph*.6})`;g.fillRect(sx+Math.cos(a)*r,sy-14+(-hgt+ph*14),1.5,1.5)}g.strokeStyle='rgba(230,245,255,.5)';const rp=(tick%60)/60;g.beginPath();g.ellipse(sx,sy,6+rp*16,4.5+rp*12,0,0,7);g.stroke();g.restore()}
 for(const d of DUCKS){if(!S.rm&&tick%2==0){d.t--;if(d.t<=0){d.a+=(Math.random()-.5)*1.6;d.t=40+Math.random()*80}const nx=d.x+Math.cos(d.a)*.35,ny=d.y+Math.sin(d.a)*.35;if(isW(Math.floor(nx/T),Math.floor(ny/T))&&isW(Math.floor((nx+6)/T),Math.floor((ny+4)/T))&&isW(Math.floor((nx-6)/T),Math.floor((ny-4)/T))){d.x=nx;d.y=ny}else d.a+=Math.PI*.8}
  const sx=d.x-cx,sy=d.y-cy;if(sx<-20||sx>500||sy<-20||sy>340)continue;g.save();g.strokeStyle='rgba(225,245,255,.5)';g.beginPath();g.moveTo(sx-Math.cos(d.a)*10-Math.sin(d.a)*4,sy-Math.sin(d.a)*10+Math.cos(d.a)*4);g.lineTo(sx,sy);g.lineTo(sx-Math.cos(d.a)*10+Math.sin(d.a)*4,sy-Math.sin(d.a)*10-Math.cos(d.a)*4);g.stroke();const fl=Math.cos(d.a)<0;g.translate(sx,sy);if(fl)g.scale(-1,1);R(-4,-2,7,4,'#f4f4f4');R(-4,0,7,2,'#d9d9d9');R(1,-5,3,4,'#2e7d32');R(4,-4,2,1,'#f5a623');R(2,-4,1,1,'#111');g.restore()}}
function flagCloth(x,y,cols){g.save();smooth(1);const wv=wxNow()=='Windy'?2.2:1;for(let i=0;i<12;i++){const off=Math.sin(tick/(S.rm?50:8)-i*.6)*1.6*wv*(i/12);g.fillStyle=i<6?cols[0]:cols[1];g.fillRect(x+2+i,y+off,1,8);g.fillStyle='rgba(0,0,0,.18)';if(i%4==3)g.fillRect(x+2+i,y+off,1,8)}g.restore()}
function dynTop(cx,cy){const vis=(x,y,pad=60)=>x-cx>-pad&&x-cx<480+pad&&y-cy>-pad&&y-cy<320+pad;
 for(const [fx,fy0,k] of FLAGPOLES){if(!vis(fx,fy0))continue;const sx=fx-cx,sy=fy0-cy;R(sx,sy,2,26,'#c9ced6');R(sx,sy-2,2,2,'#ffd24a');flagCloth(sx,sy,k=='ac'?['#ffd24a','#3a7bd5']:clubCols())}
 if(SCREENPOS&&vis(SCREENPOS.x,SCREENPOS.y,140)){const s=SCREENPOS,sx=s.x-cx,sy=s.y-cy;g.save();g.beginPath();g.rect(sx,sy,s.w,s.h);g.clip();const gr=g.createLinearGradient(0,sy,0,sy+s.h);gr.addColorStop(0,'#10233d');gr.addColorStop(1,'#0a1424');g.fillStyle=gr;g.fillRect(sx,sy,s.w,s.h);
  const it=S.news&&S.news.length?S.news[0]:null,head=it?nm(it.t):L('Welcome to the city!','ברוכים הבאים לעיר!'),sub=it?L('Day ','יום ')+it.d:'LEGACY FC';pill(sx+4,sy+4,26,10,'#d32f2f');txt('LIVE',sx+17,sy+12,7,'#fff','#0000','center');txt(sub,sx+s.w-4,sy+12,7,'#9fe8ff','#0000','right');
  const tw0=tw(head,10),scroll=tw0>s.w-10?(tick*.6)%(tw0+s.w)-s.w*.2:0;const he=HE.test(tr(head));txt(head,he?sx+s.w-6+scroll:sx+6-scroll,sy+30,10,'#ffffff','#0008',he?'right':'left');g.fillStyle='rgba(255,255,255,.05)';for(let yy=0;yy<s.h;yy+=2)g.fillRect(sx,sy+yy,s.w,1);g.restore();
  if(LCUR&&LCUR.ls>.2){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=LCUR.ls*.35;g.fillStyle='#4aa3ff';g.fillRect(sx-6,sy-6,s.w+12,s.h+12);g.restore()}}
 if(STADPOS&&vis(STADPOS.cx,STADPOS.cy,160)){const p=STADPOS,sx=p.cx-cx,sy=p.cy-cy,by=sy+20+p.ry-14;g.save();g.beginPath();g.rect(sx-p.rx+6,by,p.rx*2-12,6);g.clip();g.fillStyle='#0b0e14';g.fillRect(sx-p.rx,by,p.rx*2,6);const msg=('★ '+nm(mine().n)+' ★ '+L('MATCHDAY ','מחזור ')+(S.md+1)+' ★ '+L('SEASON ','עונה ')+S.season+' ').repeat(3);txt(msg,sx-p.rx+6-(tick*.5)%220,by+5,6,'#ffd24a','#0000','left');g.restore();
  txt(L('STADIUM','אצטדיון'),sx,sy+20+p.ry-36,10,'#ffffff','#000c','center')}
 for(const s of SIGNS){if(!s||!vis(s.x,s.y,80))continue;txt(ell(s.label,64,8),s.x-cx,s.y-cy+3,8,'#f6f1e3','#000a','center')}
 FAC.forEach(f=>{if(f[4]=='deco')return;const dx=(f[0]+1)*T-cx+16,dy=(f[1]+3)*T-cy+8;if(dx<-20||dx>500||dy<-20||dy>340)return;const b=S.rm?0:Math.sin(tick/9)*2.5;g.save();smooth(1);g.fillStyle='rgba(255,210,74,.22)';g.beginPath();g.ellipse(dx,dy+6,10,4,0,0,7);g.fill();g.fillStyle=goldG(dy-6+b,dy+4+b);g.strokeStyle='#4a3500';g.lineWidth=1;g.beginPath();g.moveTo(dx,dy-7+b);g.lineTo(dx+7,dy+2+b);g.lineTo(dx+3,dy+2+b);g.lineTo(dx+3,dy+5+b);g.lineTo(dx-3,dy+5+b);g.lineTo(dx-3,dy+2+b);g.lineTo(dx-7,dy+2+b);g.closePath();g.fill();g.stroke();g.restore()});
 if(!S.rm&&S.t<3&&wxNow()!='Rain'){if(!BIRDS.length&&tick%900==0)for(let i=0;i<5;i++)BIRDS.push({x:-20-i*14,y:60+i*9+Math.random()*30,p:i});BIRDS=BIRDS.filter(b=>b.x<520);for(const b of BIRDS){b.x+=1.3;b.y-=.25;const fl=Math.sin(tick/4+b.p)*2;g.fillStyle='rgba(8,12,20,.18)';g.fillRect(b.x+30,b.y+70,4,1);g.strokeStyle='#1b1e25';g.lineWidth=1;g.beginPath();g.moveTo(b.x-3,b.y-fl);g.lineTo(b.x,b.y);g.lineTo(b.x+3,b.y-fl);g.stroke()}}}
// ---------- world frame ----------
var WM=[];
function drawWorld(){const sp=mv?mv.f:8,ox=mv?-mv.dx*Math.max(0,T-sp*4):0,oy=mv?-mv.dy*Math.max(0,T-sp*4):0,pxp=S.x*T+ox,pyp=S.y*T+oy;
 const tx0=Math.max(0,Math.min(MW*T-480,pxp-224)),ty0=Math.max(0,Math.min(MH*T-320,pyp-144));if(S.rm||Math.abs(tx0-CAM.x)>160||Math.abs(ty0-CAM.y)>160){CAM.x=tx0;CAM.y=ty0}else{CAM.x+=(tx0-CAM.x)*.16;CAM.y+=(ty0-CAM.y)*.16}const cx=Math.round(CAM.x),cy=Math.round(CAM.y);
 smooth(0);g.drawImage(MC,cx,cy,480,320,0,0,480,320);dynGround(cx,cy);
 WM=[];const ents=[];
 for(const n of NPCS){const sx=n.x*T-cx,sy=n.y*T-cy;if(sx<-40||sx>500||sy<-50||sy>340)continue;const face=n.id=='coach'&&!S.arch?'d':(S.x<n.x?'l':S.x>n.x?'r':S.y>n.y?'d':'u'),idle=(tick+n.x*31)%150,fr=idle<5?5:idle>90&&idle<110?4:0;
  ents.push({y:n.y*T,dr:()=>{drawChar(sx,sy-4,Object.assign(npcOpts(n.c,n.id=='t2'?'#c4a':'#222',n.id),{sh:n.c,dir:face,fr,pa:'#1b2240',bt:'#15161a',hc:n.id=='t2'?'#7a2a5a':NPCH[hashS(n.id)%8],num:n.lv?String(n.lv+7):''}))}});
  if(!(n.id in S.beaten)&&n.lv&&S.arch||n.id=='coach'&&!S.arch)WM.push([sx+16,sy-16])}
 const walk=mv?[1,2,3,0][(mv.f>>1)&3]:0,idle=(tick%200<6)?5:(tick%120>70&&tick%120<92)?4:0,fr=mv?walk:idle;
 ents.push({y:pyp,dr:()=>{const a=pkx(S.ap),o=plOpts();Object.assign(o,{sh:a[0],dir:S.dir,fr,hc:a[4],bt:a[5],pa:a[6],k:a[7]});const sx=pxp-cx,sy=pyp-cy-4-(mv&&!S.rm?(walk==2?1:0):0);drawChar(sx,sy,o);
  const bdx={l:-1,r:1,d:0,u:0}[S.dir],bdy={l:0,r:0,d:1,u:-1}[S.dir],kick=mv&&(walk==1||walk==3)?3:0,bx=sx+16+bdx*(13+kick)+(S.dir=='d'?6:S.dir=='u'?-6:0),by=sy+30+bdy*(4+kick)-(S.dir=='u'?4:0);ballFx(bx,by);ball(bx,by-(mv?Math.abs(Math.sin(sp*.4))*2:0),ballCol(),mv?Math.floor((S.x+S.y)*4+sp/2):0)}});
 for(const e of lifeEnts(cx,cy))ents.push(e);
 ents.sort((a,b)=>a.y-b.y);for(const e of ents)e.dr();
 smooth(0);g.drawImage(FGc,cx,cy,480,320,0,0,480,320);
 dynTop(cx,cy);
 for(const [mx2,my2] of WM){const b=S.rm?0:Math.sin(tick/8)*2;g.save();smooth(1);g.fillStyle=goldG(my2-10+b,my2+6+b);rr(mx2-6,my2-11+b,12,15,5);g.fill();g.strokeStyle='#4a3500';g.lineWidth=1;g.stroke();g.restore();txt('!',mx2,my2+1+b,11,'#3a2600','#0000','center')}
 const o=obj(),ddx=o[1]-S.x,ddy=o[2]-S.y,dist=Math.hypot(ddx,ddy);
 if(dist>2.5&&!dlg){const an=Math.atan2(ddy,ddx),sx=pxp-cx+16,sy=pyp-cy+12,r=50+(S.rm?0:Math.sin(tick/8)*3);g.save();smooth(1);g.translate(sx+Math.cos(an)*r,sy+Math.sin(an)*r);g.rotate(an);g.shadowColor='rgba(255,200,60,.7)';g.shadowBlur=8;g.fillStyle=goldG(-7,7);g.strokeStyle='#3a2a00';g.lineWidth=1.4;g.beginPath();g.moveTo(11,0);g.lineTo(-6,-7.5);g.lineTo(-2.5,0);g.lineTo(-6,7.5);g.closePath();g.fill();g.shadowBlur=0;g.stroke();g.restore()}
 drawLight(cx,cy);drawPrompt(cx,cy);
 drawHUD(o);if(!dlg&&!menu)drawObj(o);drawToasts()}
