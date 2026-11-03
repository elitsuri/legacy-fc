// ===================== v8 renderer: chunked ground, depth-sorted world, lighting, weather, navigation =====================
var LCUR8=0,LMUL8=[255,255,255],GLOW8={},NAVF=null,NAVK='',LASTOBJ8=null,BIRDS8=[],RAIN8=[],SPLASH8=[];
function glow8(col){if(GLOW8[col])return GLOW8[col];const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d'),gr=q.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,64,64);GLOW8[col]=c;return c}
function view8(){return{x0:CAM8.x-80,y0:CAM8.y-60,x1:CAM8.x+560,y1:CAM8.y+420}}
// ---------- building live overlays: doors, availability lamps, windows, clocks, poles, LEDs, flags ----------
function bldLive8(b,cx,cy){const yb=(b.y+b.h)*T8-cy;
 if(b.kind!=='deco'&&b.type!=='stadium'){const dx=b.door.x*T8+16-cx,op=b.dopen||0,wood=['hq','campus','cafe','agency','station','barber','smallshop'].includes(b.type);
  g.fillStyle='#0d1015';g.fillRect(dx-10,yb-27,20,27);g.fillStyle='rgba(255,220,150,.25)';g.fillRect(dx-10,yb-27,20,27);
  const pw=10*(1-op*.85);for(const s of [-1,1]){const px=s<0?dx-10:dx+10-pw;if(wood){g.fillStyle='#6b4423';g.fillRect(px,yb-27,pw,27);g.fillStyle='#7d5230';g.fillRect(px+1,yb-24,Math.max(0,pw-2),9);g.fillRect(px+1,yb-13,Math.max(0,pw-2),10);g.fillStyle='#ffd24a';if(pw>4)g.fillRect(s<0?px+pw-2:px+1,yb-14,1,2)}else{const gr=g.createLinearGradient(0,yb-27,0,yb);gr.addColorStop(0,'rgba(200,232,255,.92)');gr.addColorStop(1,'rgba(70,115,160,.92)');g.fillStyle=gr;g.fillRect(px,yb-27,pw,27);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(px+1,yb-26,1.4,24);g.fillStyle='#9aa1ad';g.fillRect(s<0?px+pw-1:px,yb-27,1,27)}}
  const av=avail8(b.kind)[0];g.fillStyle=av?'#3ce07a':'#ffb020';g.beginPath();g.arc(dx+12,yb-29,1.6,0,7);g.fill();g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(glow8(av?'rgba(60,224,122,.8)':'rgba(255,176,32,.8)'),dx+7,yb-34,10,10);g.restore();
  if(S.disc[(distOf(b.door.x,b.door.y)||{}).k]&&!S.fvis[b.name+'|'+b.door.x+','+b.door.y]&&S.arch){const bb=S.rm?0:Math.sin(tick/10)*1.5;g.save();g.fillStyle=goldG(yb-60,yb-50);rr(dx-12,yb-62+bb,24,10,4);g.fill();g.restore();txt(L('NEW','חדש'),dx,yb-54.4+bb,7,'#2a1d00','#0000','center')}}
 if(b.disp&&b.disp.length){const items=CAT.filter(i=>i.cat===(b.type==='boutique'?'kits':'balls')).slice(0,6);b.disp.forEach((r,j)=>{const [x,y,w,h]=r;for(let k=0;k<2;k++){const it=items[(j*2+k+Math.floor(S.day/3))%items.length];if(!it)continue;const ix=x-cx+w*(.3+k*.42),iy=y-cy+h*.35;if(it.data&&it.data.c1)shirt8(g,ix,iy,it.data.c1,it.data.c2||'#fff',1.1);else{g.fillStyle=it.data?it.data.c:'#fff';g.beginPath();g.arc(ix,iy+5,3.6,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=.6;g.stroke()}if(owns(it.id)){g.fillStyle='#3ce07a';g.beginPath();g.arc(ix+4,iy-1,2,0,7);g.fill();txtR('✓',ix+2.6,iy+.4,3.4,'#fff')}}})}
 if(b.pole){const [x,y]=b.pole;g.fillStyle='#e9ecf0';g.fillRect(x-cx-2,y-cy,4,14);g.save();g.beginPath();g.rect(x-cx-2,y-cy,4,14);g.clip();g.fillStyle='#c0392b';for(let i=-2;i<6;i++){const yy=y-cy+((i*5+tick*.25)%30)-6;g.beginPath();g.moveTo(x-cx-2,yy);g.lineTo(x-cx+2,yy-3);g.lineTo(x-cx+2,yy-1);g.lineTo(x-cx-2,yy+2);g.fill()}g.restore()}
 if(b.clock){const [x,y]=b.clock,mins=(S.t*6+6)*60+((tick/20)|0)%60,ha=(mins/720)*Math.PI*2-Math.PI/2,ma=((mins%60)/60)*Math.PI*2-Math.PI/2;g.strokeStyle='#1b1e25';g.lineWidth=1.1;g.beginPath();g.moveTo(x-cx,y-cy);g.lineTo(x-cx+Math.cos(ha)*4,y-cy+Math.sin(ha)*4);g.moveTo(x-cx,y-cy);g.lineTo(x-cx+Math.cos(ma)*6,y-cy+Math.sin(ma)*6);g.stroke()}
 if(b.bulbs&&!S.rm){for(let i=0;i<b.bulbs.length;i++){const [x,y]=b.bulbs[i];g.fillStyle=(i+(tick>>3))%3===0?'#fff6c8':'#d9a520';g.fillRect(x-cx-.8,y-cy-.8,1.6,1.6)}}
 if(b.flags)b.flags.forEach(([x,y],i)=>flagCloth8(x-cx,y-cy-28,i%2?['#ffffff',clubCols()[0]]:clubCols(),i,S.tro>0));
 if(b.led){const [x,y,lw]=b.led,w=lw;g.save();g.beginPath();g.rect(x-cx-w/2,y-cy-4,w,8);g.clip();const ad=`★ ${nm(mine().n)} ★ ${L('MATCHDAY','יום משחק')} ${S.md+1}/${S.cfg.len} ★ ${L('SEASON','עונה')} ${S.season} ★ LEGACY FC `;txtR(ad+ad,x-cx-w/2-((tick*.5)%(tw(ad,7)+4)),y-cy+3,7,'#ffd96a');g.restore()}
 if(b.beacon&&tick%60<30){g.fillStyle='#ff3b3b';g.beginPath();g.arc(b.beacon[0]-cx,b.beacon[1]-cy,1.8,0,7);g.fill()}}
// ---------- the scene ----------
function drawWorld(){const cx=Math.round(CAM8.x*SCv)/SCv,cy=Math.round(CAM8.y*SCv)/SCv,V=view8();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';
 const S0=CH8*T8;for(let j=Math.floor(cy/S0);j<=Math.floor((cy+320)/S0);j++)for(let i=Math.floor(cx/S0);i<=Math.floor((cx+480)/S0);i++){if(i<0||j<0||i*CH8>=MW||j*CH8>=MH)continue;g.drawImage(chunk8(i,j),i*S0-cx,j*S0-cy,S0+.6,S0+.6)}
 prefetch8(cx,cy);dynGround8(cx,cy);
 const ents=[];
 for(const b of BLD){const bb=bBox8(b);if(bb[0]>V.x1||bb[0]+bb[2]<V.x0||bb[1]>V.y1||bb[1]+bb[3]<V.y0)continue;const yb=b.type==='stadium'?(b.el.cy+b.el.ry)*T8:(b.y+b.h)*T8;ents.push([yb,0,()=>{const e=bSprite8(b);g.drawImage(e.cv,e.sx-cx,e.sy-cy,e.sw,e.sh);bldLive8(b,cx,cy)}])}
 for(const o of objsNear(cx+240,cy+170,420)){if(o.x<V.x0||o.x>V.x1||o.y<V.y0||o.y>V.y1+60||o.k==='crest')continue;ents.push([o.sy,1,()=>drawProp8(o,o.x-cx,o.y-cy)])}
 for(const x of RAILX)for(const yy of [86*T8+28,89*T8+8]){const sx=x*T8+16-cx;if(sx>-40&&sx<520)ents.push([yy,1,()=>crossing8(x,sx+(yy<88*T8?-14:14),yy-cy)])}
 for(const n of NPCS){const nx=n.x*T8+16,ny=n.y*T8+24;if(nx<V.x0||nx>V.x1||ny<V.y0||ny>V.y1)continue;ents.push([ny,2,()=>drawNPC8(n,nx-cx,ny-cy)])}
 for(const p of PEDS8){if(p.x<V.x0||p.x>V.x1||p.y<V.y0||p.y>V.y1)continue;ents.push([p.y,2,()=>{const moving=p.pause<=0&&p.idle===0;pedDraw9(p,p.x-cx,p.y-cy,moving)}])}
 for(const c of CARS8){if(c.x<V.x0||c.x>V.x1||c.y<V.y0||c.y>V.y1)continue;ents.push([c.y+8,2,()=>{carDraw8(c.x-cx,c.y-cy,c.ang,c.col,c.kind);if(c.honk>0&&tick%10<6)txt('♪',c.x-cx,c.y-cy-16,10,'#ffd96a','#000','center')}])}
 if(drillActive8()&&V.x0<17*T8&&V.y0<14*T8){const D=DRILL8,a=D.pts[D.i],b2=D.pts[(D.i+1)%4],k=D.t/70;D.pts.forEach((pt,j)=>{const look=NPCL8['dr'+j]||(NPCL8['dr'+j]=Object.assign(npcLook8('drill'+j,'player'),{sh:clubCols()[0],so:clubCols()[0],c2:clubCols()[1],tier:1}));const tgt=j===D.i?b2:a,dx=tgt[0]-pt[0],dy=tgt[1]-pt[1],dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');const kick=j===D.i&&D.t<18;ents.push([pt[1],2,()=>drawActor(pt[0]-cx,pt[1]-cy,look,1.12,dir,kick?'kick':'idle',kick?Math.min(2,Math.floor(D.t/6)):((tick>>5)&1))])});const bx=a[0]+(b2[0]-a[0])*Math.min(1,k*1.4),by=a[1]+(b2[1]-a[1])*Math.min(1,k*1.4)+4;ents.push([by,2,()=>ball(bx-cx,by-cy-Math.sin(Math.min(1,k*1.4)*Math.PI)*6,'#ffffff',(tick>>2)&3)]);const co=NPCL8.drc||(NPCL8.drc=npcLook8('drcoach','coach'));ents.push([9*T8,2,()=>drawActor(9*T8-cx,9*T8-cy,co,1.12,'d','idle',(tick>>5)&1)])}
 if(TRAIN8)ents.push([TRAIN8.y+12,2,()=>trainDraw8(cx)]);
 for(const bl of BALLS8){if(bl.x<V.x0||bl.x>V.x1||bl.y<V.y0||bl.y>V.y1)continue;ents.push([bl.y,2,()=>ball(bl.x-cx,bl.y-cy-3,'#ffffff',Math.floor(bl.spin||0)&3)])}
 for(const c of COLLECT){if(S.col8[c.id]||c.x<V.x0||c.x>V.x1||c.y<V.y0||c.y>V.y1)continue;ents.push([c.y,2,()=>card8(c,c.x-cx,c.y-cy)])}
 const pdraw=(alpha)=>{const a=pkx(S.ap),o=plOpts();Object.assign(o,{sh:a[0],hc:a[4],bt:a[5],pa:a[6],k:a[7],tier:tier8(),dir:PL8.dir});const px=PL8.x-cx,py=PL8.y-cy;
  if(alpha==null&&!PL8.sit&&!['cel','celw','celf','kneel','award'].includes(PL8.st)){const [fx,fy]=dirVec(PL8.dir),mv2=PL8.moved>.3,kk=PL8.st==='run'?5:3,bx=px+fx*(11+(mv2?((PL8.f>>1)&1)*kk:0))+(PL8.dir==='d'?5:PL8.dir==='u'?-5:0),by=py+fy*4+(PL8.dir==='u'?-3:1);if(PL8.dir==='u'){ballFx(bx,by);ball(bx,by-(mv2?Math.abs(Math.sin(PL8.ph*1.6))*2:0),ballCol(),Math.floor(PL8.ph*2)&3)}
   drawActor(px,py,o,1.2,PL8.dir,PL8.st,PL8.f,0,alpha);if(PL8.dir!=='u'){ballFx(bx,by);ball(bx,by-(mv2?Math.abs(Math.sin(PL8.ph*1.6))*2:0),ballCol(),Math.floor(PL8.ph*2)&3)}}
  else drawActor(px,py-(PL8.st==='cel'?0:0),o,1.2,PL8.sit?'d':PL8.dir,PL8.sit?'sit':PL8.st,PL8.f,alpha!=null,alpha)};
 ents.push([PL8.y+(PL8.sit?4:0),3,()=>pdraw()]);
 ents.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);for(const e of ents)e[2]();
 // x-ray silhouette when a building hides the player
 for(const b of BLD){if(b.type==='stadium'){const e=b.el;if(((PL8.x/T8-e.cx)/e.rx)**2+((PL8.y/T8-e.cy+1.6)/(e.ry+1.6))**2<1&&PL8.y<(e.cy+e.ry)*T8){pdraw(.38);break}continue}const G=bGeo8(b);if(PL8.x>G.A-4&&PL8.x<G.A+G.W+4&&PL8.y<b.y*T8+4&&PL8.y>G.rt-6){pdraw(.38);break}}
 topFX8(cx,cy);lighting8(cx,cy);weather8(cx,cy);markers8(cx,cy);
 if(window.DBG8&&DBG8.noHud)return;const o=obj();navArrow8(o,cx,cy);if(INTR8&&!dlg&&!menu&&!scr)prompt8(INTR8,cx,cy);
 drawHUD(o);if(!dlg&&!menu)drawObj(o);drawToasts()}
function tier8(){return S.lvl>=15?2:S.lvl>=6?1:0}
function prefetch8(cx,cy){if(tick%3)return;const S0=CH8*T8,i0=Math.floor((cx-S0)/S0),i1=Math.floor((cx+480+S0)/S0),j0=Math.floor((cy-S0)/S0),j1=Math.floor((cy+320+S0)/S0);for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(i<0||j<0||i*CH8>=MW||j*CH8>=MH)continue;if(!CHK.has(i+','+j)){chunk8(i,j);return}}}
function drawNPC8(n,sx,sy){const near=Math.hypot(PL8.x-(n.x*T8+16),PL8.y-(n.y*T8+24))<90,dx=PL8.x-(n.x*T8+16),dy=PL8.y-(n.y*T8+24);const face=near?(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u')):(n.id=='coach'?'d':['d','l','d','r'][((tick+n.x*40)>>8)&3]);
 const role=n.id=='coach'?'coach':String(n.id).startsWith('loc')?'casual':'player',look=NPCL8[n.id]||(NPCL8[n.id]=Object.assign(npcLook8('npc'+n.id,role),role==='player'?{sh:n.c,so:n.c,pa:'#1b2240',c2:'#ffffff',num:String((n.lv||0)+7),tier:n.lv>8?1:0}:role==='coach'?{}:{sh:n.c}));
 const st=n.id.startsWith('t')&&!near&&((tick+n.x*17)%400)<60?'kick':'idle',f=st==='kick'?Math.floor(((tick+n.x*17)%400)/20)%3:((tick+n.y)%220<8?2:(tick>>5)&1);drawActor(sx,sy,look,1.18,face,st,f);
 if(!(n.id in S.beaten)&&n.lv&&S.arch||n.id=='coach'&&!S.arch){const b=S.rm?0:Math.sin(tick/8)*2;g.save();g.fillStyle=goldG(sy-66+b,sy-50+b);rr(sx-6,sy-67+b,12,15,5);g.fill();g.strokeStyle='#4a3500';g.lineWidth=1;g.stroke();g.restore();txt('!',sx,sy-55.6+b,11,'#3a2600','#0000','center')}}
var NPCL8={};
// ---------- ground-level animation ----------
function dynGround8(cx,cy){const tx0=Math.floor(cx/T8),ty0=Math.floor(cy/T8);if(S.rm)return;
 for(let y=ty0;y<=ty0+11;y++)for(let x=tx0;x<=tx0+15;x++){if(!inb(x,y))continue;const t=M[y][x],px=x*T8-cx,py=y*T8-cy;
  if(t===7){const ph=(tick/40+H(x,y,3)/20)%1;g.fillStyle=`rgba(255,255,255,${.22*Math.sin(ph*Math.PI)})`;g.fillRect(px+H(x,y,4)%20+2,py+H(x,y,5)%24+4,7+H(x,y,6)%6,1.2);if(H(x,y,8)<14&&(tick+H(x,y,9)*3)%90<8){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(px+H(x,y,10)%28,py+H(x,y,11)%28,1.4,1.4)}}
  else if(t===2){const sw=Math.sin(tick/26+x*.7+y*.3)*(wxNow()==='Windy'?2.6:1.2);g.strokeStyle='#3f8a35';g.lineWidth=1.3;g.beginPath();for(let i=0;i<4;i++){const a=px+4+i*7+(H(x,y,i)%4),b=py+30;g.moveTo(a,b);g.quadraticCurveTo(a+sw*.5,b-7,a+sw,b-13)}g.stroke()}}}
// ---------- effects above the scene ----------
function topFX8(cx,cy){for(const f of FX8){const x=f.x-cx,y=f.y-cy,k=f.t/40;if(f.k==='burst'){for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=(1-k)*26;g.fillStyle=i%2?'#ffd96a':'#ffffff';g.fillRect(x+Math.cos(a)*r-1,y+Math.sin(a)*r-1,2.2,2.2)}}else if(f.k==='net'){g.strokeStyle=`rgba(255,255,255,${k})`;g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,6+(1-k)*14,18+(1-k)*8,0,0,7);g.stroke();txt(L('GOAL!','גול!'),x,y-30-(1-k)*10,12,'#ffd96a','#000','center')}else if(f.k==='check'){txt('✓',x,y-20-(1-k)*16,16,'#3ce07a','#000','center')}}
 if(PLANE8){const x=PLANE8.x-cx,y=PLANE8.y-cy;g.fillStyle='rgba(15,25,35,.18)';g.beginPath();g.ellipse(x+80,y+120,40,7,0,0,7);g.fill();g.save();g.translate(x,y);g.rotate(-.18);const e=pspr8('plane',120,90,60,60,()=>{});g.drawImage(e.cv,-e.ax*.8,-e.ay*.8,e.w*.8,e.h*.8);g.restore()}
 if(!S.rm&&S.t<3&&wxNow()!=='Rain'){if(BIRDS8.length<1&&tick%900===300){const y0=40+Math.random()*80;for(let i=0;i<5;i++)BIRDS8.push({x:-20-i*14,y:y0+Math.abs(i-2)*8,v:1.1})}for(let i=BIRDS8.length-1;i>=0;i--){const b=BIRDS8[i];b.x+=b.v;const w=Math.sin(tick/5+i)*2.2;g.strokeStyle='rgba(30,35,45,.75)';g.lineWidth=1.1;g.beginPath();g.moveTo(b.x-4,b.y+w*.4);g.quadraticCurveTo(b.x-2,b.y-w,b.x,b.y);g.quadraticCurveTo(b.x+2,b.y-w,b.x+4,b.y+w*.4);g.stroke();if(b.x>520)BIRDS8.splice(i,1)}}}
// ---------- day/night lighting with real light sources ----------
function lighting8(cx,cy){const tg=lightTarget();const k=S.rm?1:.03;for(let i=0;i<3;i++)LMUL8[i]+=(tg.mul[i]-LMUL8[i])*k;LCUR8+=(tg.ls-LCUR8)*k;
 if(LMUL8.some(v=>v<250)){g.save();g.globalCompositeOperation='multiply';g.fillStyle=`rgb(${LMUL8.map(v=>clamp(v|0,0,255)).join(',')})`;g.fillRect(0,0,480,320);g.restore()}
 const p=LPRE[S.t];if(p&&p.warm&&wxNow()!=='Rain'){g.save();g.globalCompositeOperation='screen';const gr=g.createLinearGradient(0,0,320,260);gr.addColorStop(0,p.warm);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,480,320);g.restore()}
 if(LCUR8<.04)return;const L0=LCUR8,V=view8();g.save();g.globalCompositeOperation='lighter';
 const lampG=glow8('rgba(255,214,140,.95)'),warm=glow8('rgba(255,200,120,.9)'),cool=glow8('rgba(200,225,255,.9)');
 for(const o of objsNear(cx+240,cy+170,440)){if(o.x<V.x0||o.x>V.x1||o.y<V.y0||o.y>V.y1+60)continue;const x=o.x-cx,y=o.y-cy;
  if(o.k==='lamp'){g.globalAlpha=.85*L0;g.drawImage(lampG,x-8,y-60,32,32);g.globalAlpha=.42*L0;g.drawImage(lampG,x-36,y-24,80,44)}
  else if(o.k==='screen'){g.globalAlpha=.5*L0;g.drawImage(cool,x-80,y-110,160,110)}
  else if(o.k==='stall'||o.k==='kiosk'||o.k==='booth'){g.globalAlpha=.5*L0;g.drawImage(warm,x-30,y-40,60,46)}
  else if(o.k==='busstop'){g.globalAlpha=.5*L0;g.drawImage(cool,x-22,y-40,44,40)}}
 for(const b of BLD){const bb=bBox8(b);if(bb[0]>V.x1||bb[0]+bb[2]<V.x0||bb[1]>V.y1||bb[1]+bb[3]<V.y0)continue;bSprite8(b);
  for(const w of b.wins||[]){if(H(w[0]|0,(w[1]|0)+S.day,7)>w[4]*100*(S.t===3?1:.8))continue;g.globalAlpha=.75*L0;g.fillStyle='rgba(255,206,130,1)';g.fillRect(w[0]-cx,w[1]-cy,w[2],w[3]);g.globalAlpha=.3*L0;g.drawImage(warm,w[0]-cx-w[2]*.6,w[1]-cy-w[3]*.6,w[2]*2.2,w[3]*2.2)}
  if(b.kind!=='deco'&&b.type!=='stadium'){const dx=b.door.x*T8+16-cx,yb=(b.y+b.h)*T8-cy;g.globalAlpha=.7*L0;g.drawImage(warm,dx-30,yb-30,60,46)}
  if(b.sign){g.globalAlpha=.35*L0;g.drawImage(warm,b.sign[0]-cx-6,b.sign[1]-cy-6,b.sign[2]+12,24)}
  if(b.floods){const md=S.arch&&S.md<S.cfg.len;b.floods.forEach(([x,y])=>{g.globalAlpha=(md?.95:.6)*L0;g.drawImage(cool,x-cx-40,y-cy-40,80,80)});if(md&&b.pitch){g.globalAlpha=.35*L0;g.drawImage(cool,b.pitch[0]-cx-40,b.pitch[1]-cy-40,b.pitch[2]+80,b.pitch[3]+80)}}
  if(b.type==='lighthouse'&&b.beacon){const a=tick/50,x=b.beacon[0]-cx,y=b.beacon[1]-cy;g.globalAlpha=.55*L0;g.fillStyle='rgba(255,245,200,.5)';g.beginPath();g.moveTo(x,y);g.arc(x,y,260,a-.12,a+.12);g.closePath();g.fill();g.drawImage(warm,x-16,y-16,32,32)}}
 for(const c of CARS8){const x=c.x-cx,y=c.y-cy;if(x<-80||x>560||y<-80||y>400)continue;g.globalAlpha=.65*L0;g.save();g.translate(x,y);g.rotate(c.ang);g.fillStyle='rgba(255,240,190,.55)';g.beginPath();g.moveTo(16,-6);g.lineTo(62,-18);g.lineTo(62,18);g.lineTo(16,6);g.closePath();g.fill();g.fillStyle='rgba(255,60,50,.8)';g.fillRect(-20,-7,3,4);g.fillRect(-20,3,3,4);g.restore()}
 if(TRAIN8){g.globalAlpha=.5*L0;for(let i=0;i<TRAIN8.cars;i++){const x=TRAIN8.x-cx+(TRAIN8.dir>0?-i*68:i*68);g.drawImage(warm,x-34,TRAIN8.y-cy-26,68,40)}}
 g.restore()}
// ---------- weather ----------
function weather8(cx,cy){const w=wxNow();
 if(w==='Rain'){const heavy=wxHeavy(),n=S.rm?30:heavy?170:100;if(RAIN8.length!==n){RAIN8=[];for(let i=0;i<n;i++)RAIN8.push({x:Math.random()*540,y:Math.random()*320,v:7+Math.random()*5})}
  g.save();g.strokeStyle=heavy?'rgba(200,215,240,.5)':'rgba(200,215,240,.42)';g.lineWidth=1;g.beginPath();for(const r of RAIN8){if(!S.rm){r.y+=r.v;r.x-=2}if(r.y>320){r.y=-10;r.x=Math.random()*540;if(SPLASH8.length<40)SPLASH8.push({x:Math.random()*480,y:40+Math.random()*280,t:10})}g.moveTo(r.x,r.y);g.lineTo(r.x+2.2,r.y-9)}g.stroke();
  for(let i=SPLASH8.length-1;i>=0;i--){const s=SPLASH8[i];s.t--;g.strokeStyle=`rgba(220,235,255,${s.t/14})`;g.beginPath();g.ellipse(s.x,s.y,(10-s.t)*.6+1,(10-s.t)*.25+.5,0,0,7);g.stroke();if(s.t<=0)SPLASH8.splice(i,1)}
  const tx0=Math.floor(cx/T8),ty0=Math.floor(cy/T8);for(let y=ty0;y<=ty0+11;y++)for(let x=tx0;x<=tx0+15;x++){if(!inb(x,y))continue;const t=M[y][x];if((t===0||t===34||t===30)&&H(x,y,5)<14){const px=x*T8-cx+8+H(x,y,6)%14,py=y*T8-cy+10+H(x,y,7)%12;g.fillStyle='rgba(120,160,210,.32)';g.beginPath();g.ellipse(px,py,9,3.4,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.22)';g.fillRect(px-4,py-1,5,.8)}}g.restore()}
 if(w==='Cloudy'||w==='Rain'||w==='Windy'){if(!S.rm){g.save();g.fillStyle='rgba(10,20,40,.08)';const ox=(tick*.25)%900-200;g.beginPath();g.ellipse(ox,80,140,40,0,0,7);g.ellipse((ox+460)%900-200,240,170,46,0,0,7);g.fill();g.restore()}}
 if(w==='Windy'&&!S.rm){if(!LCUR.leaves)LCUR.leaves=[];if(LCUR.leaves.length<14)LCUR.leaves.push({x:-10,y:Math.random()*320,v:2+Math.random()*2,ph:Math.random()*6});for(let i=LCUR.leaves.length-1;i>=0;i--){const l=LCUR.leaves[i];l.x+=l.v;l.y+=Math.sin(tick/12+l.ph)*.8;g.fillStyle=i%2?'#d9822b':'#8fbf4a';g.beginPath();g.ellipse(l.x,l.y,2.6,1.3,tick/10+l.ph,0,7);g.fill();if(l.x>500)LCUR.leaves.splice(i,1)}}
 // vignette
 if(!VIG8){VIG8=document.createElement('canvas');VIG8.width=240;VIG8.height=160;const q=VIG8.getContext('2d'),vg=q.createRadialGradient(120,85,85,120,85,165);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.28)');q.fillStyle=vg;q.fillRect(0,0,240,160)}g.drawImage(VIG8,0,0,480,320)}
var VIG8=null;
// ---------- navigation: path-distance field toward the objective ----------
function navField8(tx,ty){const key=tx+','+ty;if(NAVK===key&&NAVF)return NAVF;NAVK=key;const D=new Int16Array(MW*MH).fill(-1),q=[];const seed=(x,y)=>{if(inb(x,y)&&isWalkT(M[y][x],x,y)&&D[y*MW+x]<0){D[y*MW+x]=0;q.push(x,y)}};
 if(inb(tx,ty)&&isWalkT(M[ty][tx],tx,ty))seed(tx,ty);else{seed(tx,ty+1);seed(tx,ty-1);seed(tx-1,ty);seed(tx+1,ty)}
 for(let i=0;i<q.length;i+=2){const x=q[i],y=q[i+1],d=D[y*MW+x];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(!inb(nx,ny)||D[ny*MW+nx]>=0)continue;const t=M[ny][nx];if(!isWalkT(t,nx,ny)&&t!==46)continue;D[ny*MW+nx]=d+1;q.push(nx,ny)}}NAVF=D;return D}
function pathDist8(o){if(!o||o[1]==null)return null;const D=navField8(o[1],o[2]),v=D[S.y*MW+S.x];return v>=0?v:Math.round(Math.hypot(o[1]-S.x,o[2]-S.y))}
function navArrow8(o,cx,cy){if(!o||o[1]==null||dlg||menu||scr)return;const ok=o[1]+','+o[2];if(LASTOBJ8&&LASTOBJ8.k!==ok&&LASTOBJ8.x!=null)FX8.push({k:'check',x:LASTOBJ8.x*T8+16,y:LASTOBJ8.y*T8+16,t:50});if(!LASTOBJ8||LASTOBJ8.k!==ok)LASTOBJ8={k:ok,x:o[1],y:o[2]};
 const D=navField8(o[1],o[2]);let x=S.x,y=S.y,d=D[y*MW+x];if(d<=2&&d>=0){}else{for(let s=0;s<5&&d>0;s++){let best=null;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const v=D[(y+b)*MW+x+a];if(inb(x+a,y+b)&&v>=0&&v<d){d=v;best=[x+a,y+b]}}if(!best)break;x=best[0];y=best[1]}}
 // gold ring at the destination
 const tx=o[1]*T8+16-cx,ty=(M[o[2]]&&M[o[2]][o[1]]===4?(o[2]+1)*T8+4:o[2]*T8+24)-cy;if(tx>-40&&tx<520&&ty>-40&&ty<360){const b=S.rm?0:Math.sin(tick/8)*2;g.save();g.strokeStyle='rgba(255,210,74,.9)';g.lineWidth=2;g.beginPath();g.ellipse(tx,ty,15+b,6+b/2,0,0,7);g.stroke();g.strokeStyle='rgba(255,240,180,.5)';g.lineWidth=1;g.beginPath();g.ellipse(tx,ty,21+b,8+b/2,0,0,7);g.stroke();g.restore()}
 const dist=D[S.y*MW+S.x];if(dist>=0&&dist<=2)return;const an=Math.atan2((y*T8+16)-PL8.y,(x*T8+16)-PL8.x),sx=PL8.x-cx,sy=PL8.y-cy-18,r=40+(S.rm?0:Math.sin(tick/8)*3);
 g.save();g.translate(sx+Math.cos(an)*r,sy+Math.sin(an)*r*.8);g.rotate(an);g.shadowColor='rgba(255,200,60,.7)';g.shadowBlur=8;g.fillStyle=goldG(-7,7);g.strokeStyle='#3a2a00';g.lineWidth=1.4;g.beginPath();g.moveTo(11,0);g.lineTo(-6,-7.5);g.lineTo(-2.5,0);g.lineTo(-6,7.5);g.closePath();g.fill();g.shadowBlur=0;g.stroke();g.restore()}
function markers8(cx,cy){}
function prompt8(t,cx,cy){let x,y;if(t.kind==='npc'){x=t.obj.x*T8+16-cx;y=t.obj.y*T8+24-cy-62}else if(t.kind==='door'){x=t.obj.door.x*T8+16-cx;y=(t.obj.door.y+1)*T8-cy-46}else if(t.kind==='gate'){x=t.obj.x*T8+16-cx;y=t.obj.y*T8-cy-8}else{x=(t.obj.x||PL8.x)-cx;y=(t.obj.y||PL8.y)-cy-34}
 const key=matchMedia&&matchMedia('(pointer:coarse)').matches?'A':'E';let lab=t.label;if(t.kind==='door'){const a=avail8(t.obj.kind);lab=L('Enter ','כניסה: ')+t.label+(a[1]&&!a[0]?' · '+a[1]:'')}pbub(clamp(x,60,420),clamp(y,20,300),key,lab)}
// ---------- HUD helpers rewired for the bigger world ----------
function drawObj(o){const d=pathDist8(o),he=S.lang=='he',w=332;panel(6,288,w,26,.94,0);g.save();smooth(1);g.fillStyle=goldG(288,314);rr(he?w+2:6,288,4,26,2);g.fill();g.restore();icon('flag',he?w-14:14,294,13,UIC.goldL);txt(ell(tr(o[0]),w-92,10),he?w-20:32,305,10,'#ffd96a','#000a',he?'right':'left');if(d!=null){const lab=d+L(' m walk',' מ׳ הליכה'),lw=tw(lab,8);icon('arrow',he?10:w-lw-20,296,10,'#9fe8ff');txt(lab,he?24:w-6,305,8,'#9fe8ff','#000a',he?'left':'right')}}
function miniMap(o){const X=376,Y=45,Wm=94,Hm=58;g.save();smooth(1);rr(X,Y,Wm,Hm,5);g.clip();g.fillStyle='#0c1116';g.fillRect(X,Y,Wm,Hm);const s=2.6,px0=PL8.x/T8,py0=PL8.y/T8,sx0=clamp(px0-Wm/s/2,0,MW-Wm/s),sy0=clamp(py0-Hm/s/2,0,MH-Hm/s);if(MAPC)g.drawImage(MAPC,sx0*6,sy0*6,Wm/s*6,Hm/s*6,X,Y,Wm,Hm);
 DIS.forEach(d=>{if(S.disc&&!S.disc[d.k]){const x=X+(d.r[0]-sx0)*s,y=Y+(d.r[1]-sy0)*s;g.fillStyle='rgba(6,8,12,.72)';g.fillRect(x,y,(d.r[2]-d.r[0]+1)*s,(d.r[3]-d.r[1]+1)*s)}});
 FAC.forEach(f=>{const b=f[5];if(!b)return;const dd=distOf(b.door.x,b.door.y);if(dd&&!S.disc[dd.k])return;const x=X+(b.door.x+.5-sx0)*s,y=Y+(b.door.y+.5-sy0)*s;if(x<X||x>X+Wm||y<Y||y>Y+Hm)return;g.fillStyle='#1b1e25';g.beginPath();g.arc(x,y,2.3,0,7);g.fill();g.fillStyle=b.col;g.beginPath();g.arc(x,y,1.6,0,7);g.fill()});
 if(o&&o[1]!=null){const ox=clamp(X+(o[1]+.5-sx0)*s,X+3,X+Wm-3),oy=clamp(Y+(o[2]+.5-sy0)*s,Y+3,Y+Hm-3);g.fillStyle=tick%30<20?'#ffd24a':'#a07a10';g.save();g.translate(ox,oy);g.rotate(Math.PI/4);g.fillRect(-2.5,-2.5,5,5);g.restore()}
 const px=X+(px0-sx0)*s,py=Y+(py0-sy0)*s,an={r:0,d:Math.PI/2,l:Math.PI,u:-Math.PI/2}[PL8.dir];g.translate(px,py);g.rotate(an);g.fillStyle='#fff';g.strokeStyle='#e53935';g.lineWidth=1;g.beginPath();g.moveTo(4.5,0);g.lineTo(-3,-3.2);g.lineTo(-1.5,0);g.lineTo(-3,3.2);g.closePath();g.fill();g.stroke();g.restore();
 g.save();smooth(1);g.strokeStyle='rgba(212,167,44,.6)';g.lineWidth=1;rr(X,Y,Wm,Hm,5);g.stroke();g.restore();txt('N',X+5,Y+9,7,'#fff','#000','center')}
// ---------- full world map ----------

function openMap(){scr={t:'',l:[],o:0,i:0,draw:drawMapScr,key:k=>{const d=DIRS[k.toLowerCase()],ds=destList();if(k=='x'||k=='escape'){scr=null;sfx('back');return}if(!ds.length)return;if(d=='l'||d=='u')scr.i=(scr.i+ds.length-1)%ds.length;if(d=='r'||d=='d')scr.i=(scr.i+1)%ds.length;if(d)sfx('menu');if(k=='enter'||k=='z'||k==' '){const f=ds[scr.i];S.dest=[f[0]+1,f[1]+2,f[2]];sfx('coin');save();scr=null;say(L(`Destination set: ${f[2]}. Follow the gold arrow.`,`יעד נקבע: ${tr(f[2])}. עקוב אחר החץ הזהוב.`))}},
 click:(x,y)=>{const ds=destList();let b=-1,bd=99;ds.forEach((f,i)=>{const dx=MAPO8.x+(f[0]+1.5)*MAPO8.s-x,dy=MAPO8.y+(f[1]+2.5)*MAPO8.s-y,d=Math.hypot(dx,dy);if(d<bd){bd=d;b=i}});if(b>=0&&bd<12){if(scr.i==b)scr.key('enter');else scr.i=b}else if(y>292)scr.key('x')}}}
var MAPO8={x:0,y:0,s:2.2};
function drawMapScr(){const he=S.lang=='he',s=2.2,ox=240-MW*s/2,oy=34,ds=destList();MAPO8={x:ox,y:oy,s};g.fillStyle='#0a0d13';g.fillRect(0,0,480,320);panel(4,4,472,312,1);txt(L('WORLD MAP','מפת העולם')+' · '+regName(),240,24,13,'#ffd24a','#000a','center');
 g.save();smooth(1);g.drawImage(MAPC,ox,oy,MW*s,MH*s);
 DIS.forEach(d=>{const x=ox+d.r[0]*s,y=oy+d.r[1]*s,w=(d.r[2]-d.r[0]+1)*s,h=(d.r[3]-d.r[1]+1)*s;if(!S.disc[d.k]){g.fillStyle='rgba(8,12,20,.86)';g.fillRect(x,y,w,h);txt('?',x+w/2,y+h/2+6,18,'#5d6676','#000','center')}else{g.strokeStyle=d.c;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);g.fillStyle='rgba(8,12,20,.7)';const lw=tw(nm(d.n),7)+8;g.fillRect(x+w/2-lw/2,y+3,lw,11);txt(nm(d.n),x+w/2,y+11.5,7,'#ffffff','#0000','center')}});
 ds.forEach((f,i)=>{const b=f[5],x=ox+(b.door.x+.5)*s,y=oy+(b.door.y+.5)*s,sel=i==scr.i;g.fillStyle='#14161b';g.beginPath();g.arc(x,y,sel?5:3.4,0,7);g.fill();g.fillStyle=sel?'#ffd24a':b.col;g.beginPath();g.arc(x,y,sel?3.8:2.4,0,7);g.fill();if(sel){g.strokeStyle='#ffd24a';g.lineWidth=1.2;g.beginPath();g.arc(x,y,7+Math.sin(tick/6)*1.5,0,7);g.stroke()}});
 COLLECT.forEach(c=>{if(!S.col8[c.id])return;g.fillStyle='#ffd24a';g.fillRect(ox+c.x/T8*s-1,oy+c.y/T8*s-1,2,2)});
 const px=ox+PL8.x/T8*s,py=oy+PL8.y/T8*s;g.fillStyle=tick%30<18?'#e94560':'#ffffff';g.beginPath();g.arc(px,py,3.4,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=1;g.stroke();
 if(S.dest){g.fillStyle='#39ff88';g.fillRect(ox+(S.dest[0]+.5)*s-2,oy+(S.dest[1]+.5)*s-2,4,4)}g.restore();
 const sel=ds[scr.i];panel(8,296,464,18,.95);txt(sel?`◀ ${tr(sel[2])} ▶   A: ${L('set destination','קבע יעד')} · B: ${L('close','סגירה')}   ·   ${L('Cards','כרטיסים')} ${Object.keys(S.col8||{}).length}/${COLLECT.length}`:L('Explore to discover districts · B: close','חקור כדי לגלות רובעים · B: סגירה'),he?466:14,309,8,'#9fe8ff','#000a',he?'right':'left')}
