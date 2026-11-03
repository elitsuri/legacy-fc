// ===================== VISUAL REBIRTH: HUD, dialogs, menus, input, frame loop =====================
var HIT=[],TTm={i:0,mode:'main'},PERFS=[];
function news(e,h){S.news.unshift({d:S.day,t:[e,h]});if(S.news.length>40)S.news.pop();if(S.away)S.away.push([e,h]);else if(TQ)TQ.push({t:[e,h],f:0,ic:'news'})}
function toast(e,h,ic){if(TQ)TQ.push({t:[e,h],f:0,ic:ic||'bell'})}
function drawToasts(){if(!TQ||!TQ.length||scr)return;const vis=TQ.slice(0,2);vis.forEach((q,i)=>{q.f++;const life=240,a=q.f<12?q.f/12:q.f>life-20?Math.max(0,(life-q.f)/20):1,y=8+i*30-(1-Math.min(1,q.f/12))*12;g.save();g.globalAlpha=a;panel(210,y,156,26,.96);icon(q.ic,216,y+5,14,UIC.goldL);const he=S.lang=='he';txt(ell(nm(q.t),126,8),he?360:234,y+16,8,UIC.txt,'#000a',he?'right':'left');g.restore()});TQ=TQ.filter(q=>q.f<240)}
function bust(x,y,w,h,o,sc=1.5){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();drawChar(x+w/2-16*sc,y+4+10*sc-9*sc,o,sc,1);g.restore()}
function shield(x,y,v,sz=13){g.save();smooth(1);g.fillStyle=goldG(y-sz,y+sz);g.strokeStyle='#3a2a00';g.lineWidth=1;g.beginPath();g.moveTo(x-sz*.8,y-sz*.85);g.lineTo(x+sz*.8,y-sz*.85);g.lineTo(x+sz*.8,y+sz*.1);g.quadraticCurveTo(x+sz*.6,y+sz*.7,x,y+sz);g.quadraticCurveTo(x-sz*.6,y+sz*.7,x-sz*.8,y+sz*.1);g.closePath();g.fill();g.stroke();g.restore();txt(String(v),x,y+sz*.32,sz*.78,'#2a1d00','#0000','center')}
function drawHUD(o){const he=S.lang=='he',time=[L('Morning','בוקר'),L('Afternoon','צהריים'),L('Evening','ערב'),L('Night','לילה')][S.t],w=wxNow();
 panel(6,6,200,54,.95);const a=pkx(S.ap),po=plOpts();Object.assign(po,{sh:a[0],dir:'d',fr:(tick%200<6)?5:0,hc:a[4],bt:a[5],pa:a[6],k:a[7]});const cc=clubCols();g.save();smooth(1);const gr=g.createLinearGradient(0,10,0,56);gr.addColorStop(0,shd(cc[0],.55));gr.addColorStop(1,'#0b0d12');g.fillStyle=gr;rr(10,10,40,46,6);g.fill();g.restore();bust(10,10,40,46,po,1.55);const fc=frameCol();g.save();smooth(1);g.strokeStyle=fc||'rgba(212,167,44,.7)';g.lineWidth=fc?2:1;rr(10,10,40,46,6);g.stroke();g.restore();
 shield(52,17,ovr(),12);txt(ell(tr(L('Eli','אלי'))+' · '+L('Lv ','רמה ')+S.lvl+' · '+tr(stage()),132,9),66,21,9,UIC.txt);
 [['heart',S.hp/S.mhp,'#ef5350',`${Math.ceil(S.hp)}/${S.mhp}`],['star',S.xp/(S.lvl*20),'#4aa3ff',`${S.xp}/${S.lvl*20}`],['bolt',S.en/100,'#ffc93c',`${Math.round(S.en)}`]].forEach((q,i)=>{const y=29+i*9;icon(q[0],56,y-1,8,q[2]);barX(67,y,104,5,q[1],q[2]);txt(q[3],202,y+5,6,UIC.mut,'#0000','right')});
 panel(6,62,200,16,.9,0);icon('cal',11,64,11,UIC.goldL);txt(hudLine(),110,73,7,'#cfe9ff','#000a','center');
 panel(372,6,102,32,.95);icon('coin',378,9,12,'#ffc93c');txt('$'+fmt(S.money),468,19,11,'#ffd96a','#000a','right');icon(wxIcon(w),378,23,11,w=='Rain'?'#9fd3ff':'#ffd96a');txt(time+' · '+L('Day ','יום ')+S.day,468,33,7,'#cfe9ff','#000a','right');
 panel(372,41,102,78,.92,0);miniMap(o);icon('heart',378,108,8,'#ff8fb4');txt(fmt(S.fol)+' '+L('fans','אוהדים'),468,115,7,UIC.txt,'#000a','right')}
function miniMap(o){const X=376,Y=45,Wm=94,Hm=58;g.save();smooth(1);rr(X,Y,Wm,Hm,5);g.clip();g.fillStyle='#0c1116';g.fillRect(X,Y,Wm,Hm);const s=3.2,sx0=clamp(S.x+.5-Wm/s/2,0,MW-Wm/s),sy0=clamp(S.y+.5-Hm/s/2,0,MH-Hm/s);if(MAPC)g.drawImage(MAPC,sx0*6,sy0*6,Wm/s*6,Hm/s*6,X,Y,Wm,Hm);
 DIS.forEach(d=>{if(S.disc&&!S.disc[d.k]){const x=X+(d.r[0]-sx0)*s,y=Y+(d.r[1]-sy0)*s;g.fillStyle='rgba(6,8,12,.55)';g.fillRect(x,y,(d.r[2]-d.r[0]+1)*s,(d.r[3]-d.r[1]+1)*s)}});
 if(o&&o[1]!=null){const ox=clamp(X+(o[1]+.5-sx0)*s,X+3,X+Wm-3),oy=clamp(Y+(o[2]+.5-sy0)*s,Y+3,Y+Hm-3);g.fillStyle=tick%30<20?'#ffd24a':'#a07a10';g.save();g.translate(ox,oy);g.rotate(Math.PI/4);g.fillRect(-2.5,-2.5,5,5);g.restore()}
 const px=X+(S.x+.5-sx0)*s,py=Y+(S.y+.5-sy0)*s,an={r:0,d:Math.PI/2,l:Math.PI,u:-Math.PI/2}[S.dir];g.translate(px,py);g.rotate(an);g.fillStyle='#fff';g.strokeStyle='#e53935';g.lineWidth=1;g.beginPath();g.moveTo(4.5,0);g.lineTo(-3,-3.2);g.lineTo(-1.5,0);g.lineTo(-3,3.2);g.closePath();g.fill();g.stroke();g.restore();
 g.save();smooth(1);g.strokeStyle='rgba(212,167,44,.6)';g.lineWidth=1;rr(X,Y,Wm,Hm,5);g.stroke();g.restore();txt('N',X+5,Y+9,7,'#fff','#000','center')}
function drawObj(o){const d=Math.round(Math.hypot(o[1]-S.x,o[2]-S.y)),he=S.lang=='he',w=332;panel(6,288,w,26,.94,0);g.save();smooth(1);g.fillStyle=goldG(288,314);rr(he?w+2:6,288,4,26,2);g.fill();g.restore();icon('flag',he?w-14:14,294,13,UIC.goldL);txt(ell(tr(o[0]),w-80,10),he?w-20:32,305,10,'#ffd96a','#000a',he?'right':'left');
 const an=Math.atan2(o[2]-S.y,o[1]-S.x);g.save();smooth(1);g.translate(he?22:w-36,301);g.rotate(an);g.fillStyle='#9fe8ff';g.beginPath();g.moveTo(5,0);g.lineTo(-3,-3.5);g.lineTo(-3,3.5);g.closePath();g.fill();g.restore();txt(d+L('m',' מ׳'),he?32:w-28,305,8,'#cfe9ff','#000a',he?'left':'right')}
function pbub(x,y,k,lab){const w=tw(lab,9)+30;panel(x-w/2,y-9,w,19,.95,0);g.save();smooth(1);g.fillStyle=goldG(y-6,y+7);rr(x-w/2+3,y-6,15,13,4);g.fill();g.restore();txt(k,x-w/2+10.5,y+4,8,'#2a1d00','#0000','center');txt(lab,x-w/2+22,y+4,9,UIC.txt)}
// ---------- dialog / menus ----------
function speakerOpts(name){const n=NPCS.find(n=>tr(n.n)==name||n.n==name);if(n)return Object.assign(npcOpts(n.c,'#222',n.id),{sh:n.c,dir:'d',fr:(tick%180<6)?5:0,pa:'#1b2240',bt:'#15161a',hc:NPCH[hashS(n.id)%8]});return null}
function drawDialog(){let Ls=dlg.l[dlg.i],nmS=null;const mt=/^([^:0-9$!?"]{2,22}): (.*)$/.exec(Ls);if(mt){nmS=mt[1];Ls=mt[2]}
 const pre=dlg.t;dlg.len=Ls.length;dlg.t=Math.min(Ls.length,dlg.t+(S.rm?99:1.4));if(Math.floor(pre/3)!=Math.floor(dlg.t/3))sfx('blip');const full=dlg.t>=Ls.length,he=S.lang=='he';
 panel(10,236,460,78,.97);const sp=nmS?speakerOpts(nmS):null,tx0=sp?62:24,maxW=sp?392:432;
 if(sp){const bx=he?418:16;g.save();smooth(1);g.fillStyle='#0b0d12';rr(bx,244,46,62,6);g.fill();g.restore();bust(bx,244,46,62,sp,1.8);g.save();smooth(1);g.strokeStyle='rgba(212,167,44,.6)';rr(bx,244,46,62,6);g.stroke();g.restore()}
 if(nmS){const w=tw(nmS,10)+20,x=he?(sp?412:466)-w:(sp?66:20);panel(x,224,w,20,1,0);g.save();smooth(1);g.fillStyle=goldG(224,244);g.fillRect(x+4,241,w-8,2);g.restore();txt(nmS,x+w/2,238,10,'#ffd96a','#000a','center')}
 const lines=[].concat(...Ls.slice(0,Math.floor(dlg.t)).split('\n').map(p=>wrapW(p,maxW,13)));const fsz=lines.length>3?10:13,lh=lines.length>3?13:18;lines.slice(0,5).forEach((ln,i)=>he?txt(ln,(sp?412:458),(lines.length>3?256:262)+i*lh,fsz,UIC.txt,'#000a','right'):txt(ln,tx0,(lines.length>3?256:262)+i*lh,fsz,UIC.txt));
 if(full&&(S.rm||tick%40<26)){g.save();smooth(1);const bx=he?(sp?72:24):448,by=300+(S.rm?0:Math.sin(tick/6)*1.5);g.fillStyle=UIC.goldL;g.beginPath();g.moveTo(bx-5,by-3);g.lineTo(bx+5,by-3);g.lineTo(bx,by+3);g.closePath();g.fill();g.restore()}
 HIT.push({x:10,y:236,w:460,h:78,fn:()=>key('enter')})}
function drawMenuList(){const n=menu.items.length,vis=Math.min(n,8),off=clamp(menu.i-3,0,n-vis);let w=200;for(const s of menu.items)w=Math.max(w,tw(s,10)+48);if(menu.title)w=Math.max(w,tw(menu.title,10)+30);w=Math.min(300,w);const h=vis*22+18,y0=Math.max(30,306-h),x0=480-w-8,he=S.lang=='he',al=he?'right':'left',ax=he?x0+w-12:x0+12;
 panel(x0,y0,w,h,.97);if(menu.title){const tw0=Math.min(w-10,tw(menu.title,9)+18),tx=he?x0+w-tw0:x0;panel(tx,y0-18,tw0,17,1,0);txt(ell(menu.title,tw0-12,9),tx+tw0/2,y0-6,9,'#ffd96a','#000a','center')}
 for(let k=0;k<vis;k++){const i=off+k,y=y0+10+k*22,sel=i==menu.i;if(sel)selRow(x0+5,y,w-10,20);txt(ell(menu.items[i],w-34,10),he?x0+w-16:x0+16,y+14,10,sel?'#ffd96a':UIC.txt,'#000a',al);HIT.push({x:x0+5,y,w:w-10,h:20,fn:()=>{if(menu&&menu.i==i){key('enter')}else if(menu)menu.i=i},hv:()=>{if(menu)menu.i=i}})}
 if(off>0)txt('▲',x0+w/2,y0+8,8,UIC.goldL,'#0000','center');if(off+vis<n)txt('▼',x0+w/2,y0+h-1,8,UIC.goldL,'#0000','center')}
function drawMini(){panel(60,74,360,164,.97);txt(mg.n,240,98,15,'#ffd96a','#000a','center');const X=86,Y=128,Wd=308,Hd=26;g.save();smooth(1);g.fillStyle='#16351f';rr(X,Y,Wd,Hd,6);g.fill();for(let i=0;i<14;i++){g.fillStyle=i%2?'rgba(255,255,255,.04)':'rgba(0,0,0,.06)';g.fillRect(X+i*22,Y,22,Hd)}const zx=X+Wd*(mg.cx-mg.w),zw=Wd*mg.w*2,gz=g.createLinearGradient(zx,0,zx+zw,0);gz.addColorStop(0,'rgba(76,175,80,.15)');gz.addColorStop(.5,'rgba(120,230,120,.85)');gz.addColorStop(1,'rgba(76,175,80,.15)');g.fillStyle=gz;g.fillRect(zx,Y+2,zw,Hd-4);g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(X+Wd*mg.cx,Y+2);g.lineTo(X+Wd*mg.cx,Y+Hd-2);g.stroke();g.strokeStyle='rgba(212,167,44,.6)';rr(X,Y,Wd,Hd,6);g.stroke();g.restore();ball(X+Wd*mg.p,Y+Hd/2,'#ffffff',Math.floor(tick/3));
 for(let i=0;i<3;i++){const r=mg.res[i],cx2=210+i*30;g.save();smooth(1);g.fillStyle=r==null?'#2a2f38':r>.85?'#ffd24a':r>.5?'#4caf50':'#ef5350';g.beginPath();g.arc(cx2,178,7,0,7);g.fill();g.restore();if(r!=null)txt(r>.5?'✓':'✗',cx2,181,8,'#111','#0000','center')}
 txt(L(`Round ${mg.r+1}/3 · press A when the ball is in the green zone`,`סיבוב ${mg.r+1}/3 · לחץ A כשהכדור באזור הירוק`),240,206,9,UIC.txt,'#000a','center');if(mg.msg)txt(mg.msg,240,228,14,'#ffd96a','#000a','center');HIT.push({x:60,y:74,w:360,h:164,fn:()=>key('enter')})}
function drawBanner(){banner.t--;const age=(banner.t0||(banner.t0=banner.t))-banner.t,a=Math.min(1,banner.t/24),sc=S.rm?1:Math.min(1,.6+age/14*.4);g.save();g.globalAlpha=a;g.translate(240,122);g.scale(sc,sc);smooth(1);
 if(!S.rm){for(let i=0;i<16;i++){const an=i/16*6.28+tick*.01,r=70+((age*2+i*13)%40);g.fillStyle=i%2?'rgba(255,217,106,.75)':'rgba(255,255,255,.6)';g.fillRect(Math.cos(an)*r*1.8,Math.sin(an)*r*.6,2,2)}}
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.moveTo(-150,-26);g.lineTo(150,-26);g.lineTo(162,0);g.lineTo(150,26);g.lineTo(-150,26);g.lineTo(-162,0);g.closePath();g.fill();const gr=g.createLinearGradient(0,-28,0,28);gr.addColorStop(0,'#2e323d');gr.addColorStop(1,'#101217');g.fillStyle=gr;g.beginPath();g.moveTo(-146,-28);g.lineTo(146,-28);g.lineTo(158,-2);g.lineTo(146,24);g.lineTo(-146,24);g.lineTo(-158,-2);g.closePath();g.fill();g.strokeStyle=goldG(-28,24);g.lineWidth=2;g.stroke();g.restore();
 g.save();g.globalAlpha=a;txt(banner.s,240,124,22,'#ffd96a','#000c','center');if(banner.s2)txt(banner.s2,240,140,10,UIC.txt,'#000a','center');icon('star',90,106,14,UIC.goldL);icon('star',376,106,14,UIC.goldL);g.restore();if(banner.t<=0)banner=null}
function drawUI(){if(scr){scr.draw?scr.draw():drawScr();if(!menu&&!dlg)return}
 if(mg){drawMini();return}
 if(dlg)drawDialog();else if(menu&&!menu.grid)drawMenuList();else if(menu&&menu.grid&&!B)drawMenuList();
 if(banner)drawBanner();
 if(DOORFX>0){g.fillStyle=`rgba(255,250,235,${DOORFX/14*.5})`;g.fillRect(0,0,480,320)}}
function drawScr(){const he=S.lang=='he',x0=26,w=428,rows=scr.l,vis=14,o=clamp(scr.o,0,Math.max(0,rows.length-vis));scr.o=o;g.save();g.fillStyle='rgba(4,6,10,.55)';g.fillRect(0,0,480,320);g.restore();panel(x0,10,w,300,.98);txt(scr.t,240,32,14,'#ffd96a','#000a','center');g.save();smooth(1);g.fillStyle=goldG(38,40);g.fillRect(200,38,80,1.5);g.restore();
 for(let k=0;k<vis&&o+k<rows.length;k++){const r=rows[o+k],y=58+k*17,ax=he?x0+w-16:x0+16,al=he?'right':'left';if(k%2==0){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(x0+8,y-11,w-16,16)}
  if(typeof r=='string'){const head=/^—/.test(r);txt(ell(r,w-40,head?9:10),head?240:ax,y,head?9:10,head?'#ffd96a':UIC.txt,'#000a',head?'center':al)}
  else{txt(ell(r.a,r.bar!=null?w-190:w-110,10),ax,y,10,r.c||'#d9dee8','#000a',al);if(r.bar!=null){const bx=he?x0+18:x0+w-150;barX(bx,y-7,100,6,clamp(r.bar,0,100)/100,r.bar>70?'#4caf50':r.bar>45?'#ffc93c':'#ff8a50')}if(r.b!=null)txt(r.b,he?(r.bar!=null?x0+126:x0+16):x0+w-16,y,10,'#ffd96a','#000a',he?'left':'right')}}
 if(rows.length>vis){const sh0=270*vis/rows.length,sy=52+270*o/rows.length;g.save();smooth(1);g.fillStyle='rgba(255,255,255,.08)';rr(he?x0+4:x0+w-7,52,3,270,1.5);g.fill();g.fillStyle=UIC.goldL;rr(he?x0+4:x0+w-7,sy,3,sh0,1.5);g.fill();g.restore()}
 txt(L('▲▼ scroll · A/B close','▲▼ גלילה · A/B סגירה'),240,304,8,UIC.mut,'#000a','center');HIT.push({x:0,y:0,w:480,h:320,fn:()=>key('enter')})}
// ---------- transitions ----------
function drawTr(){if(!Tr)return;Tr.f++;const t=Tr.f/34;g.save();smooth(1);if(S.rm){g.fillStyle=`rgba(0,0,0,${Math.min(1,t*1.4)})`;g.fillRect(0,0,480,320)}else{const h=Math.min(1,t*1.3)*160;g.fillStyle='#07090d';g.fillRect(0,0,480,h);g.fillRect(0,320-h,480,h);g.fillStyle=goldG(h-2,h);g.fillRect(0,h-2,480,2);g.fillRect(0,320-h,480,2);if(t>.55){g.globalAlpha=Math.min(1,(t-.55)*3);icon('ball',224,144,32,'#fff');}}g.restore();if(Tr.f>34){const c=Tr.cb;Tr=null;c()}}
// ---------- door entry ----------
function arrive(){dcheck();const t=M[S.y][S.x];if(t==4){const kk=DR[S.y*MW+S.x];DOORFX=14;inc('visit',kk);F[kk]();sfx('door')}
 else if(t==2&&S.arch&&Math.random()<.14){const l=Math.max(1,S.lvl+Math.floor(Math.random()*3)-1);battle(enemyOf(l,rnd([L('Street Kid','ילד רחוב'),L('Park Rival','יריב הפארק'),L('Cage Star','כוכב הכלוב')])))}save()}
// ---------- input ----------
function key(k){k=String(k).toLowerCase();initA();if(k=='m'){toggleMute();return}if(k=='l'){setLang(S.lang=='he'?'en':'he');return}
 if(title&&!menu&&!dlg&&!scr){titleKey(k);return}
 if(Tr)return;
 if(mg){if(k=='enter'||k=='z'||k==' ')mgHit();return}
 if(scr&&!menu&&!dlg){if(scr.key){scr.key(k);return}const d0=DIRS[k];if(k=='enter'||k=='z'||k=='x'||k=='escape'||k==' '){const q=scr;scr=null;sfx('back');q.go&&q.go()}else if(d0=='u')scr.o=Math.max(0,scr.o-1);else if(d0=='d')scr.o++;return}
 if(k=='enter'||k=='z'||k==' '){if(dlg){const Ls=dlg.l[dlg.i],ln=dlg.len==null?Ls.length:dlg.len;if(dlg.t<ln)dlg.t=ln+Ls.length;else{dlg.i++;dlg.t=0;dlg.len=null;if(dlg.i>=dlg.l.length){const c=dlg.cb;dlg=null;c&&c()}}}else if(menu){sfx('ok');const q=menu;menu=null;q.cb(q.i)}else if(!B&&!mv)interact();return}
 if(k=='x'||k=='escape'){if(menu&&!B){menu=null;sfx('back')}else if(menu&&B&&menu.back){const f=menu.back;menu=null;f()}else if(!menu&&!dlg&&!B&&!mv){pause();sfx('open')}return}
 const d=DIRS[k];if(!d||!menu)return;const n=menu.items.length;sfx('menu');
 if(menu.grid){const cols=menu.cols||3;const he=S.lang=='he',dd=he&&(d=='l'||d=='r')?(d=='l'?'r':'l'):d;if(dd=='u'&&menu.i>=cols)menu.i-=cols;if(dd=='d'&&menu.i+cols<n)menu.i+=cols;if(dd=='l'&&menu.i%cols)menu.i--;if(dd=='r'&&menu.i%cols<cols-1&&menu.i+1<n)menu.i++}
 else{if(d=='u')menu.i=(menu.i+n-1)%n;if(d=='d')menu.i=(menu.i+1)%n}}
function canvasXY(e){const r=C.getBoundingClientRect();return[(e.clientX-r.left)*480/r.width,(e.clientY-r.top)*320/r.height]}
function onPointer(e){if(scr&&scr.click)return;const [x,y]=canvasXY(e);initA();for(let i=HIT.length-1;i>=0;i--){const h=HIT[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){e.preventDefault&&e.preventDefault();h.fn();return}}if(dlg)key('enter')}
function onHover(e){if(e.pointerType&&e.pointerType!='mouse')return;const [x,y]=canvasXY(e);for(let i=HIT.length-1;i>=0;i--){const h=HIT[i];if(h.hv&&x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){h.hv();C.style.cursor='pointer';return}}C.style.cursor=HIT.some(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h)?'pointer':'default'}
// ---------- frame loop (60 logic steps / second on any refresh rate) ----------
function logicStep(){tick++;
 if(!title&&!Tr&&!mv&&!dlg&&!menu&&!B&&!mg&&!scr&&held.length)tryStep(held[held.length-1]);
 if(mv){mv.f+=S.car?CARS[S.car-1][2]:1;if(mv.f>=8){mv=null;arrive()}}
 if(mg){mg.p+=mg.d*mg.s;if(mg.p>1){mg.p=1;mg.d=-1}if(mg.p<0){mg.p=0;mg.d=1}}
 if(B&&typeof matchStep=='function')matchStep();
 song=title?'title':B?((B.e&&(B.e.lg||B.e.cup))?'match':'battle'):'world';evTick();if(tick%20==0)ambTick();if(DOORFX>0)DOORFX--}
function frame(ts){requestAnimationFrame(frame);ts=ts||performance.now();if(!lastT)lastT=ts;let dt=ts-lastT;lastT=ts;if(dt>250)dt=250;acc60+=dt;if(acc60<15)return;let n=0;while(acc60>=16.667&&n<4){acc60-=16.667;n++;logicStep()}if(!n){acc60=0;logicStep()}
 const t0=performance.now();HIT=[];g.setTransform(SCv,0,0,SCv,0,0);smooth(0);g.clearRect(0,0,480,320);
 try{if(title){drawTitle();drawUI()}else{B?drawBattle():drawWorld();drawUI();drawTr()}}catch(err){console.error(err);g.setTransform(SCv,0,0,SCv,0,0);txt(L('Display error - the game keeps running','שגיאת תצוגה - המשחק ממשיך'),240,160,10,'#ffb020','#000','center')}
 PERFS.push(performance.now()-t0);if(PERFS.length>120)PERFS.shift()}
