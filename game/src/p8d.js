// ===================== v8 runtime: input, physics, collision, camera, interaction, city life =====================
// Speeds (pixels/second). The old grid walk moved 32px every 8 logic steps at 60 Hz = 240 px/s.
var SPD8={old:240,walk:168,run:252},PL8={x:0,y:0,vx:0,vy:0,tx:-1,ty:-1,ph:0,dir:'d',st:'idle',f:0,act:null,at:0,turn:0,sit:null,runT:0,blink:0,moved:0,lastInt:0,react:0},CAM8={x:0,y:0,lx:0,ly:0,init:0},SHIFT8=0,RUNLOCK8=0,FOOT8={hw:5,hh:3},
 PEDS8=[],CARS8=[],TRAIN8=null,PLANE8=null,FX8=[],INTR8=null,OBJDONE8=null,LANE8=null,PW8=null,OCC8=null,BALLN8=0,WORLD8T=0;
function dirVec(d){return d==='u'?[0,-1]:d==='d'?[0,1]:d==='l'?[-1,0]:[1,0]}
// ---------- input plumbing ----------
function input8(){addEventListener('keydown',e=>{if(KN(e)==='Shift')SHIFT8=1;const k=KN(e).toLowerCase();if(k==='e'&&!e.ctrlKey&&!e.metaKey){e.stopImmediatePropagation();e.preventDefault();if(!e.repeat)key('enter');return}if(e.repeat&&['enter','z',' ','e','x','escape','m','l'].includes(k)){e.stopImmediatePropagation();e.preventDefault()}if(!title&&['w','a','s','d'].includes(k)&&!e.ctrlKey&&!e.metaKey)e.preventDefault()},true);
 addEventListener('keyup',e=>{if(KN(e)==='Shift')SHIFT8=0},true);
 const clear=()=>{held.length=0;SHIFT8=0;PL8.vx=PL8.vy=0};addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear()})}
function moveInput8(){let x=0,y=0;for(const d of held){if(d==='l')x-=1;if(d==='r')x+=1;if(d==='u')y-=1;if(d==='d')y+=1}x=clamp(x,-1,1);y=clamp(y,-1,1);let face=null;for(let i=held.length-1;i>=0;i--){const d=held[i],v=dirVec(d);if((v[0]&&v[0]===x)||(v[1]&&v[1]===y)){face=d;break}}return{x,y,face}}
// ---------- collision ----------
function solidTile8(tx,ty){if(!inb(tx,ty))return true;const t=M[ty][tx];return !isWalkT(t,tx,ty)}
function boxHit8(px,py,hw,hh,ignoreCars){const x0=Math.floor((px-hw)/T8),x1=Math.floor((px+hw)/T8),y0=Math.floor((py-hh)/T8),y1=Math.floor((py+hh)/T8);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(solidTile8(tx,ty))return true;
 for(const o of objsNear(px,py,64)){if(!o.c)continue;if(px+hw>o.c[0]&&px-hw<o.c[2]&&py+hh>o.c[1]&&py-hh<o.c[3])return true;if(o.c2){const c=[o.x+o.c2[0],o.y+o.c2[1],o.x+o.c2[2],o.y+o.c2[3]];if(px+hw>c[0]&&px-hw<c[2]&&py+hh>c[1]&&py-hh<c[3])return true}}
 for(const n of NPCS){const nx=n.x*T8+16,ny=n.y*T8+24;if(Math.abs(px-nx)<hw+6&&Math.abs(py-ny)<hh+3)return true}
 if(drillActive8())for(const [nx,ny] of DRILL8.pts){if(Math.abs(px-nx)<hw+6&&Math.abs(py-ny)<hh+3)return true}
 if(!ignoreCars)for(const c of CARS8){const hz=c.dir==='E'||c.dir==='W',w=hz?22:10,h=hz?9:20;if(Math.abs(px-c.x)<hw+w&&Math.abs(py-c.y)<hh+h)return true}
 return px<12||py<16||px>MW*T8-12||py>MH*T8-6}
function move8(dx,dy){let moved=0;const h=FOOT8;
 if(dx){if(!boxHit8(PL8.x+dx,PL8.y,h.hw,h.hh)){PL8.x+=dx;moved=1}else{ // corner assist: slide around small edges
   let ok=0;for(const s of [2,4,6,8]){for(const sg of [-1,1]){if(!boxHit8(PL8.x+dx,PL8.y+sg*s,h.hw,h.hh)&&!boxHit8(PL8.x,PL8.y+sg*Math.min(2,s),h.hw,h.hh)){PL8.y+=sg*Math.min(1.2,s);ok=1;break}}if(ok)break}PL8.vx*=.3}}
 if(dy){if(!boxHit8(PL8.x,PL8.y+dy,h.hw,h.hh)){PL8.y+=dy;moved=1}else{let ok=0;for(const s of [2,4,6,8]){for(const sg of [-1,1]){if(!boxHit8(PL8.x+sg*s,PL8.y+dy,h.hw,h.hh)&&!boxHit8(PL8.x+sg*Math.min(2,s),PL8.y,h.hw,h.hh)){PL8.x+=sg*Math.min(1.2,s);ok=1;break}}if(ok)break}PL8.vy*=.3}}
 return moved}
function syncFromTile8(){PL8.x=S.x*T8+16;PL8.y=S.y*T8+22;if(boxHit8(PL8.x,PL8.y,FOOT8.hw,FOOT8.hh,1)){fixPos();PL8.x=S.x*T8+16;PL8.y=S.y*T8+22;outer:for(let r=1;r<8&&boxHit8(PL8.x,PL8.y,FOOT8.hw,FOOT8.hh,1);r++)for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=S.x+dx*r,ny=S.y+dy*r;if(!boxHit8(nx*T8+16,ny*T8+22,FOOT8.hw,FOOT8.hh,1)){S.x=nx;S.y=ny;PL8.x=nx*T8+16;PL8.y=ny*T8+22;break outer}}}PL8.tx=S.x;PL8.ty=S.y;PL8.vx=PL8.vy=0;PL8.sit=null;CAM8.init=0}
function canRun8(){return S.en>=15}
function vehBoost8(){return S.car?[1,1.08,1.14,1.2,1.26][S.car]||1:1}
// ---------- per-step player update ----------
function player8Step(){if(S.x!==PL8.tx||S.y!==PL8.ty)syncFromTile8();
 const free=!Tr&&!dlg&&!menu&&!B&&!mg&&!scr&&!title;const inp=free?moveInput8():{x:0,y:0,face:null};
 if(PL8.sit){if(inp.x||inp.y){PL8.sit=null;PL8.act={st:'idle',t:4}}else{benchTick8();PL8.st='sit';PL8.f=0;return}}
 if(PL8.act&&PL8.act.lock&&PL8.act.t>0){inp.x=0;inp.y=0}
 const mag=Math.hypot(inp.x,inp.y),running=(SHIFT8||RUNLOCK8)&&canRun8()&&mag>0;const tsp=(running?SPD8.run*vehBoost8():SPD8.walk)/60;
 const tx=mag?inp.x/mag*tsp:0,ty=mag?inp.y/mag*tsp:0,acc=mag?.24:.3;PL8.vx+=(tx-PL8.vx)*acc;PL8.vy+=(ty-PL8.vy)*acc;if(!mag&&Math.hypot(PL8.vx,PL8.vy)<.05){PL8.vx=PL8.vy=0}
 if(inp.face&&inp.face!==PL8.dir){if(PL8.st==='idle')PL8.turn=5;PL8.dir=inp.face}
 const ox=PL8.x,oy=PL8.y;move8(PL8.vx,PL8.vy);const d=Math.hypot(PL8.x-ox,PL8.y-oy);PL8.moved=d;
 if(running&&d>.5){PL8.runT++;if(PL8.runT%300===0){S.en=Math.max(0,S.en-1)}}
 // animation state machine (distance driven so the feet never slide)
 if(PL8.act&&PL8.act.t>0){PL8.act.t--;PL8.st=PL8.act.st;PL8.f=PL8.act.f!=null?PL8.act.f:Math.floor((PL8.act.t0-PL8.act.t)/(PL8.act.fd||6))%(PL8.act.n||1);if(PL8.act.t<=0)PL8.act=null}
 else if(d>.35){const run=running&&d>2.4;PL8.ph+=d/(run?13:11);PL8.st=run?'run':'walk';PL8.f=Math.floor(PL8.ph*2)&7}
 else if(PL8.turn>0){PL8.turn--;PL8.st='turn';PL8.f=0}
 else{PL8.st='idle';PL8.ph=0;PL8.blink=PL8.blink>0?PL8.blink-1:(Math.random()<.008?8:0);PL8.f=PL8.blink>0?2:((tick>>5)&1)}
 if(PL8.react>0)PL8.react--;
 const ntx=Math.floor(PL8.x/T8),nty=Math.floor(PL8.y/T8);if(ntx!==S.x||nty!==S.y){S.x=ntx;S.y=nty;PL8.tx=ntx;PL8.ty=nty;S.dir=PL8.dir;onTile8()}else S.dir=PL8.dir}
function actAnim8(st,t,o){PL8.act=Object.assign({st,t,t0:t},o||{})}
function onTile8(){dcheck();const t=M[S.y][S.x];
 if(t===2&&S.arch&&Math.random()<.10){held.length=0;PL8.vx=PL8.vy=0;const l=Math.max(1,S.lvl+Math.floor(Math.random()*3)-1);battle(enemyOf(l,rnd(['Street Kid','Park Rival','Cage Star'])))}
 save()}
// ---------- camera: smooth follow, gentle look-ahead, world-bounded ----------
function camera8(){const vw=480,vh=320;if(window.DBG8&&DBG8.cam){CAM8.x=DBG8.cam[0];CAM8.y=DBG8.cam[1];CAM.x=CAM8.x;CAM.y=CAM8.y;return}CAM8.lx+=(PL8.vx*14-CAM8.lx)*.04;CAM8.ly+=(PL8.vy*10-CAM8.ly)*.04;
 let tx=PL8.x-vw/2+CAM8.lx,ty=PL8.y-vh/2-8+CAM8.ly;tx=clamp(tx,0,MW*T8-vw);ty=clamp(ty,0,MH*T8-vh);
 if(!CAM8.init||S.rm||Math.hypot(tx-CAM8.x,ty-CAM8.y)>420){CAM8.x=tx;CAM8.y=ty;CAM8.init=1}else{CAM8.x+=(tx-CAM8.x)*.11;CAM8.y+=(ty-CAM8.y)*.11}
 CAM.x=CAM8.x;CAM.y=CAM8.y}
// ---------- interaction targets ----------
function avail8(k){if(k==='st'){if(!S.arch)return[0,L('Talk to the Coach first','דבר קודם עם המאמן')];if(S.inj)return[0,L('Injured','פצוע')];if(S.en<20)return[0,L('Too tired','עייף מדי')];if(S.md>=S.cfg.len)return[1,L('Season finale','סיום עונה')];return[1,L('Match available','יש משחק')]}
 if(k==='tr'||k==='track'||k==='courts'){if(S.inj)return[0,L('Injured','פצוע')];if(S.en<10)return[0,L('Too tired','עייף מדי')];return[1,'']}
 if(k==='gym'){if(S.en<20)return[0,L('Too tired','עייף מדי')];return[1,'']}
 if(k==='street'){if(S.nl&&S.nl.st===S.day)return[0,L('Done today','הושלם היום')];return[1,'']}
 return[1,'']}
function findTarget8(){if(Tr||dlg||menu||B||mg||scr||title||PL8.sit)return null;const [fx,fy]=dirVec(PL8.dir),ax=PL8.x+fx*14,ay=PL8.y+fy*10;let best=null,bs=1e9;
 const cand=(kind,d,obj,label,pri)=>{const s=d-(pri||0);if(s<bs){bs=s;best={kind,obj,label,d}}};
 for(const n of NPCS){const nx=n.x*T8+16,ny=n.y*T8+24,d=Math.hypot(ax-nx,ay-ny);if(d<26&&!wallBetween8(PL8.x,PL8.y,nx,ny)){const lab=n.id=='coach'||String(n.id).startsWith('loc')?L('Talk','דבר'):n.id=='fan'?L('Chat','שיחה'):S.beaten[n.id]?L('Talk','דבר'):L('Challenge','אתגר');cand('npc',d,n,tr(n.n)+' · '+lab,6)}}
 for(const f of FAC){const b=f[5];if(!b)continue;const dx=b.door.x*T8+16,dy=(b.door.y+1)*T8;const ddx=Math.abs(PL8.x-dx),ddy=PL8.y-dy;if(ddx<20&&ddy>-2&&ddy<24&&(PL8.dir==='u'||ddy<10)){cand('door',ddx+Math.abs(ddy),b,tr(b.name),10)}}
 for(const o of objsNear(PL8.x,PL8.y,48)){if(o.k==='bench'){const d=Math.hypot(ax-o.x,ay-(o.y-2));if(d<22&&!PL8.sit)cand('bench',d,o,L('Sit & rest','שב ונח'))}}
 for(const q of GATES){const gx=q.x*T8+16,gy=q.y*T8+16,d=Math.hypot(ax-gx,ay-gy);if(d<26&&!q.open)cand('gate',d,q,L('Open gate','פתח שער'),4)}
 for(const bl of BALLS8){const d=Math.hypot(ax-bl.x,ay-bl.y);if(d<20)cand('ball',d,bl,L('Shoot','בעיטה'),2)}
 return best}
function wallBetween8(x0,y0,x1,y1){const n=6;for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(solidTile8(Math.floor(x/T8),Math.floor(y/T8)))return true}return false}
function interact(){const t=findTarget8()||INTR8;if(!t)return;if(tick-PL8.lastInt<10)return;PL8.lastInt=tick;
 if(t.kind==='npc'){const n=t.obj,nx=n.x*T8+16,ny=n.y*T8+24,dx=nx-PL8.x,dy=ny-PL8.y;PL8.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');S.dir=PL8.dir;actAnim8('int',10,{f:0});talkNPC8(n)}
 else if(t.kind==='door'){const b=t.obj,kk=b.kind;PL8.dir='u';S.dir='u';actAnim8('int',10,{f:0});b.dopen=Math.max(b.dopen||0,.6);DOORFX=14;inc('visit',kk);S.fvis[b.name+'|'+b.door.x+','+b.door.y]=S.day;sfx('door');F[kk]();save()}
 else if(t.kind==='bench'){const o=t.obj;PL8.sit=o;PL8.x=o.x;PL8.y=o.y+3;PL8.dir='d';S.dir='d';PL8.vx=PL8.vy=0;sfx('blip');toast('Resting on the bench','נח על הספסל','heart')}
 else if(t.kind==='gate'){t.obj.open=1;t.obj.t=600;sfx('door')}
 else if(t.kind==='ball'){kickBall8(t.obj)}}
function talkNPC8(n){if(LOC[n.id]){const q=LOC[n.id];say(`${L(q[0],q[1])}: ${L(q[2],q[3])}`);if(!S.nl['t'+n.id]){S.nl['t'+n.id]=1;S.money+=20;S.fx.i+=20;sfx('coin')}return}
 if(n.id=='coach'){if(!S.arch)say([L('Coach: Welcome, nobody! Everyone starts somewhere.','המאמן: ברוך הבא, אלמוני! כולם מתחילים מאיפשהו.'),L('Coach: Doors with arrows are facilities - stand at a door and press E or A to go in.','המאמן: דלתות עם חצים הן מתקנים - עמוד מול דלת ולחץ E או A כדי להיכנס.'),L('Coach: Pick your style, kid:','המאמן: בחר סגנון, ילד:')],()=>mk(['Finisher','Playmaker','Speedster'],i=>{const a=['Finisher','Playmaker','Speedster'][i];mk(PERS.map(p=>nm(p)),j=>{initPlayer(a,PERS[j][0]);S.ct=mkCt(mine(),.8);say([L(`Coach: Good. You are "The ${a}" - ${PERS[j][0]}.`,`המאמן: מצוין. אתה "${tr(a)}" - ${PERS[j][1]}.`),L('Coach: Follow the gold arrow - it points to your next goal! Hold Shift to run. Open the menu (X) for attributes and skills.','המאמן: עקוב אחרי החץ הזהוב - הוא מצביע על המטרה הבאה! החזק Shift לריצה. פתח תפריט (X) לתכונות וכישורים.')])},L('PERSONALITY','אישיות'))},L('STYLE','סגנון')));else say(L(`Coach: Keep going, ${stage()}! Fans: ${S.fol}. Manager trust: ${Math.round(S.trust)}.`,`המאמן: המשך כך, ${tr(stage())}! אוהדים: ${S.fol}. אמון המאמן: ${Math.round(S.trust)}.`));return}
 if(n.id=='fan'){say(L(`Fan: Is that ${statLine()}? Sign my shirt!`,`אוהד: זה ${tr(statLine())}? תחתום לי על החולצה!`));S.fol++;return}
 if(S.beaten[n.id]){say(`${n.n}: Good game. Respect.`);return}
 if(!S.arch){say(L('Coach: Come see me first.','המאמן: בוא אליי קודם.'));return}
 battle({...enemyOf(n.lv+4*(S.region-1),n.n),trainer:1},n.txt,()=>{S.beaten[n.id]=1;save()})}
// ---------- benches: real recovery, capped per day ----------
function benchTick8(){if(!S.nl.bn||S.nl.bn.d!==S.day)S.nl.bn={d:S.day,e:0};if(tick%120===0&&S.en<100&&S.nl.bn.e<15){S.en=Math.min(100,S.en+1);S.nl.bn.e++;if(S.nl.bn.e===15)toast('Rested enough on benches today','מספיק מנוחה על ספסלים היום','heart')}}
// ---------- training balls: rolling physics, goals with a daily-capped reward ----------
function kickBall8(bl){const [fx,fy]=dirVec(PL8.dir);let ax=bl.x-PL8.x,ay=bl.y-PL8.y;const m=Math.hypot(ax,ay)||1;ax=ax/m*.4+fx*.8;ay=ay/m*.4+fy*.8;const pw=4.6+att('shooting')/40;bl.vx=ax*pw;bl.vy=ay*pw;actAnim8('shoot',22,{fd:6,n:4,lock:1});sfx('kick')}
function ball8Step(){for(const bl of BALLS8){const near=Math.hypot(bl.x-PL8.x,bl.y-PL8.y);
  if(near<12&&PL8.moved>.4&&!PL8.act){const [fx,fy]=dirVec(PL8.dir);bl.vx+=fx*.9+PL8.vx*.5;bl.vy+=fy*.9+PL8.vy*.5}
  const sp=Math.hypot(bl.vx,bl.vy);if(sp<.02){bl.vx=bl.vy=0;continue}
  const nx=bl.x+bl.vx,ny=bl.y+bl.vy;const tx=Math.floor(nx/T8),ty=Math.floor(ny/T8);
  // goal mouths at both ends of the pitch
  const gyMid=(bl.gy[0]+bl.gy[1]+1)/2*T8;if(Math.abs(ny-gyMid)<26&&(nx<bl.gx[0]*T8+8||nx>(bl.gx[1]+1)*T8-8)){goal8(bl);continue}
  if(solidTile8(tx,ty)||tx<bl.gx[0]-1||tx>bl.gx[1]+1||ty<bl.gy[0]-1||ty>bl.gy[1]+1){if(solidTile8(Math.floor(nx/T8),Math.floor(bl.y/T8)))bl.vx*=-.6;else bl.vy*=-.6;sfx('step')}else{bl.x=nx;bl.y=ny}
  bl.vx*=.965;bl.vy*=.965;bl.spin=(bl.spin||0)+sp*.25}}
function goal8(bl){bl.vx=bl.vy=0;FX8.push({k:'net',x:bl.x<(bl.gx[0]+bl.gx[1])/2*T8?bl.gx[0]*T8+8:(bl.gx[1]+1)*T8-8,y:(bl.gy[0]+bl.gy[1]+1)/2*T8,t:40});bl.x=bl.home[0];bl.y=bl.home[1];sfx('goal');
 if(!S.nl.pg||S.nl.pg.d!==S.day)S.nl.pg={d:S.day,n:0};if(S.nl.pg.n<3){S.nl.pg.n++;train(['finishing','shooting'],.15);const pm=[];addXP(5,pm);toast(L(`Practice goal ${S.nl.pg.n}/3 today · +XP, finishing up`,`גול באימון ${S.nl.pg.n}/3 היום · +ניסיון, סיומת עלתה`),null,'ball')}else toast('Practice goal! (daily bonus used)','גול באימון! (הבונוס היומי נוצל)','ball');{const cs=celSt8();actAnim8(cs,cs==='kneel'?50:40,{fd:cs==='celw'?6:9,n:ACT8N[cs]||2,lock:1})}save()}
// ---------- collectibles ----------
function collect8Step(){for(const c of COLLECT){if(S.col8[c.id])continue;if(Math.abs(c.x-PL8.x)<16&&Math.abs(c.y-PL8.y)<14){S.col8[c.id]=S.day;const n=Object.keys(S.col8).length;S.money+=25;S.fx.i+=25;const pm=[];addXP(6,pm);sfx('ach');FX8.push({k:'burst',x:c.x,y:c.y-10,t:40});banner={t:120,s:L('LEGACY CARD','כרטיס מורשת'),s2:`${n}/${COLLECT.length} · +$25`};news(`Eli found Legacy Card ${n}/${COLLECT.length}`,`אלי מצא כרטיס מורשת ${n}/${COLLECT.length}`);chkFree();save()}}}
// ---------- gates close at night ----------
function gates8Step(){const night=S.t===3;for(const q of GATES){if(q.t>0){q.t--;q.open=1;continue}const want=night?0:1;if(q.open!==want){const px=q.x*T8+16,py=q.y*T8+16;if(!want&&Math.hypot(PL8.x-px,PL8.y-py)<34)continue;q.open=want}}}
// ---------- doors animate open when the player approaches ----------
function doors8Step(){for(const f of FAC){const b=f[5];if(!b)continue;const dx=b.door.x*T8+16,dy=(b.door.y+1)*T8,near=Math.abs(PL8.x-dx)<26&&PL8.y-dy>-4&&PL8.y-dy<40;b.dopen=clamp((b.dopen||0)+(near?.08:-.05),0,1)}}
// ---------- pedestrians ----------
function pedGrid8(){PW8=new Uint8Array(MW*MH);OCC8=new Uint8Array(MW*MH);OBJ.forEach(o=>{if(!o.c)return;for(let y=Math.floor(o.c[1]/T8);y<=Math.floor(o.c[3]/T8);y++)for(let x=Math.floor(o.c[0]/T8);x<=Math.floor(o.c[2]/T8);x++)if(inb(x,y))OCC8[y*MW+x]=1});
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x];let ok=t===34||t===30||t===31||t===36;if(t===0){for(const s of INTS){if(((y===s.y||y===s.y+1)&&(x===s.x-1||x===s.x+2))||((x===s.x||x===s.x+1)&&(y===s.y-1||y===s.y+2))){ok=true;break}}}if(t===35&&ZN[y*MW+x]===11)ok=true;if(ok&&!OCC8[y*MW+x])PW8[y*MW+x]=t===0?2:1}}
function pedOK8(x,y){return inb(x,y)&&PW8[y*MW+x]>0}
function roleFor8(x,y){const z=ZN[y*MW+x],r=Math.random();switch(z){case 11:return r<.6?'beach':r<.8?'casual':'kid';case 10:return r<.5?'traveler':r<.7?'work':'casual';case 7:return r<.5?'suit':r<.8?'dress':'casual';case 3:return r<.6?'kid':r<.8?'player':'coach';case 9:return r<.3?'old':r<.5?'kid':'casual';case 2:return r<.6?'fan':'casual';case 5:case 6:return r<.3?'suit':r<.45?'dress':'casual';case 8:return r<.4?'kid':r<.6?'hoodie':'casual';case 0:return r<.5?'track':'player';case 4:return r<.25?'old':r<.45?'kid':r<.6?'dress':'casual';default:return 'casual'}}
function pedTarget8(){let n=S.t===3?7:S.t===2?18:24;if(wxNow()==='Rain')n=Math.round(n*.6);return n}
function spawnPed8(fan){for(let k=0;k<40;k++){let x,y;if(fan){x=81+Math.floor(Math.random()*36);y=20+Math.floor(Math.random()*13)}else{const a=Math.random()*6.283,r=11+Math.random()*9;x=Math.floor(PL8.x/T8+Math.cos(a)*r);y=Math.floor(PL8.y/T8+Math.sin(a)*r*.8)}if(!pedOK8(x,y)||PW8[y*MW+x]===2)continue;const sx=x*T8+16-CAM8.x,sy=y*T8+16-CAM8.y;if(sx>-40&&sx<520&&sy>-60&&sy<360)continue;
  const role=fan?'fan':roleFor8(x,y),look=npcLook8('p'+Math.floor(Math.random()*1e9),role);if(wxNow()==='Rain'&&role!=='fan'&&Math.random()<.7){look.acc='umbrella';look.uc=['#2e6fb8','#c0392b','#1b1e25','#f5b700','#7a4fb8'][Math.floor(Math.random()*5)]}
  const p={x:x*T8+16,y:y*T8+20,tx:x,ty:y,dir:'d',spd:(role==='old'?.42:role==='kid'?.72:.55+Math.random()*.25)*(fan?.8:1),look,pause:0,ph:0,fan:!!fan,idle:0,sit:null};PEDS8.push(p);return p}return null}
function ped8Step(){if(!PW8)return;const want=pedTarget8(),md=S.arch&&S.md<S.cfg.len&&(S.t===1||S.t===2),fans=PEDS8.filter(p=>p.fan).length,wantFans=md?14:3;
 if(PEDS8.length-fans<want&&tick%9===0)spawnPed8(0);if(fans<wantFans&&tick%13===0&&Math.abs(PL8.x/T8-98)<40&&Math.abs(PL8.y/T8-26)<30)spawnPed8(1);
 for(let i=PEDS8.length-1;i>=0;i--){const p=PEDS8[i],dist=Math.hypot(p.x-PL8.x,p.y-PL8.y);const sx=p.x-CAM8.x,sy=p.y-CAM8.y,off=sx<-60||sx>540||sy<-80||sy>380;
  if(off&&(dist>30*T8||(PEDS8.length>want+(md?14:3)+2&&!p.fan))){PEDS8.splice(i,1);continue}
  if(dist>36*T8)continue;
  if(p.pause>0){p.pause--;if(p.pause%70===0&&!p.sit)p.dir=['d','l','r','u'][Math.floor(Math.random()*4)];continue}
  const gx=p.tx*T8+16,gy=p.ty*T8+20,dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy);
  if(d<.8){p.x=gx;p.y=gy;if(Math.random()<.04){p.pause=60+Math.floor(Math.random()*150);continue}
   const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=p.tx+a,ny=p.ty+b;if(!pedOK8(nx,ny))return false;if(p.fan&&(nx<81||nx>116||ny<20||ny>33))return false;return true});
   if(!opts.length){p.pause=30;continue}const cur=dirVec(p.dir),str=opts.find(o=>o[0]===cur[0]&&o[1]===cur[1]),back=opts.filter(o=>!(o[0]===-cur[0]&&o[1]===-cur[1]));let ch=str&&Math.random()<.78?str:(back.length?back[Math.floor(Math.random()*back.length)]:opts[0]);
   p.tx+=ch[0];p.ty+=ch[1];p.dir=ch[0]>0?'r':ch[0]<0?'l':ch[1]>0?'d':'u';continue}
  // yield to the player and to each other
  const [fx,fy]=dirVec(p.dir);if(Math.hypot(p.x+fx*12-PL8.x,p.y+fy*10-PL8.y)<12){p.idle++;if(p.idle>40){p.tx-=fx;p.ty-=fy;p.dir=fx>0?'l':fx<0?'r':fy>0?'u':'d';p.idle=0}continue}
  if(PW8[p.ty*MW+p.tx]===2&&CARS8.some(c=>Math.hypot(c.x-gx,c.y-gy)<60)){continue}
  let blk=0;for(const o of PEDS8){if(o!==p&&Math.abs(o.x-(p.x+fx*10))<7&&Math.abs(o.y-(p.y+fy*8))<6){blk=1;break}}if(blk){p.idle++;if(p.idle>50){p.pause=20;p.idle=0;p.tx=Math.round((p.x-16)/T8);p.ty=Math.round((p.y-20)/T8)}continue}
  p.idle=0;const s=Math.min(d,p.spd);p.x+=dx/d*s;p.y+=dy/d*s;p.ph+=s/10}}
// ---------- traffic: lanes, signals, following distance, yielding ----------
function laneInit8(){LANE8=new Uint8Array(MW*MH);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]!==0)continue;let v=0;const R=isRoadXY;
  if(!R(x,y-1))v|=1; // W lane (top row)
  if(!R(x,y+1))v|=2;// E lane (bottom row)
  if(!R(x-1,y))v|=4;// S lane (left col)
  if(!R(x+1,y))v|=8;// N lane (right col)
  LANE8[y*MW+x]=v}
 for(const s of INTS){LANE8[s.y*MW+s.x]|=1|4;LANE8[s.y*MW+s.x+1]|=1|8;LANE8[(s.y+1)*MW+s.x]|=2|4;LANE8[(s.y+1)*MW+s.x+1]|=2|8}}
const DV8={E:[1,0],W:[-1,0],N:[0,-1],S:[0,1]},LB8={W:1,E:2,S:4,N:8},RIGHT8={E:'S',S:'W',W:'N',N:'E'},LEFT8={E:'N',N:'W',W:'S',S:'E'};
function laneOK8(x,y,d){return inb(x,y)&&M[y][x]===0&&(LANE8[y*MW+x]&LB8[d])}
function carColor8(){return ['#c0392b','#2e6fb8','#f4f4f4','#16181d','#8d96a8','#f5b700','#1f9d55','#7a4fb8','#e67e22','#2c3e50'][Math.floor(Math.random()*10)]}
function spawnCar8(){for(let k=0;k<30;k++){const a=Math.random()*6.283,r=10+Math.random()*12,x=Math.floor(PL8.x/T8+Math.cos(a)*r),y=Math.floor(PL8.y/T8+Math.sin(a)*r*.8);if(!inb(x,y)||M[y][x]!==0||inInt8(x,y))continue;const sx=x*T8+16-CAM8.x,sy=y*T8+16-CAM8.y;if(sx>-60&&sx<540&&sy>-60&&sy<380)continue;
  const ds=['E','W','N','S'].filter(d=>laneOK8(x,y,d)&&laneOK8(x+DV8[d][0],y+DV8[d][1],d));if(!ds.length)continue;const d=ds[Math.floor(Math.random()*ds.length)];if(CARS8.some(c=>Math.abs(c.x-(x*T8+16))<40&&Math.abs(c.y-(y*T8+16))<40))continue;
  const kind=Math.random()<.1?'bus':Math.random()<.12?'van':Math.random()<.1?'sport':'car';CARS8.push({x:x*T8+16,y:y*T8+16,tx:x,ty:y,dir:d,ang:{E:0,S:Math.PI/2,W:Math.PI,N:-Math.PI/2}[d],spd:kind==='bus'?.95:1.1+Math.random()*.35,v:0,col:kind==='bus'?'#f5b700':carColor8(),kind,wait:0,turn:null,honk:0});return}}
function signalGreen8(s,axis){const ph=(Math.floor((WORLD8T/60+s.ph*3)/7))%2;return axis==='x'?ph===0:ph===1}
function trainNear8(x){return TRAIN8&&Math.abs(TRAIN8.x-(x*T8))<14*T8+TRAIN8.len}
function car8Step(){if(!LANE8)return;const want=S.t===3?5:9;if(CARS8.length<want&&tick%23===0)spawnCar8();
 for(let i=CARS8.length-1;i>=0;i--){const c=CARS8[i],dist=Math.hypot(c.x-PL8.x,c.y-PL8.y);const sx=c.x-CAM8.x,sy=c.y-CAM8.y,off=sx<-80||sx>560||sy<-80||sy>400;if(off&&dist>28*T8){CARS8.splice(i,1);continue}
  const gx=c.tx*T8+16,gy=c.ty*T8+16,dx=gx-c.x,dy=gy-c.y,d=Math.hypot(dx,dy);
  let stop=0;
  if(d<1){c.x=gx;c.y=gy;
   // choose the next tile
   let nd=c.dir;const it=inInt8(c.tx,c.ty);
   if(it){if(!c.turn){const opts=[];for(const dd of [c.dir,RIGHT8[c.dir],LEFT8[c.dir]]){const ex=dd==='E'?[it.x+2,it.y+1]:dd==='W'?[it.x-1,it.y]:dd==='S'?[it.x,it.y+2]:[it.x+1,it.y-1];if(inb(ex[0],ex[1])&&M[ex[1]][ex[0]]===0)opts.push(dd)}c.turn=opts.length?(opts.includes(c.dir)&&Math.random()<.55?c.dir:opts[Math.floor(Math.random()*opts.length)]):c.dir}
    if(c.turn!==c.dir&&laneOK8(c.tx,c.ty,c.turn))nd=c.turn}else c.turn=null;
   let nx=c.tx+DV8[nd][0],ny=c.ty+DV8[nd][1];
   if(!inb(nx,ny)||M[ny][nx]!==0){// dead end: U-turn into the opposite lane
    const ud={E:'W',W:'E',N:'S',S:'N'}[c.dir],sh={E:[0,-1],W:[0,1],N:[-1,0],S:[1,0]}[c.dir];nx=c.tx+sh[0];ny=c.ty+sh[1];nd=ud;if(!inb(nx,ny)||M[ny][nx]!==0){CARS8.splice(i,1);continue}}
   // signals + level crossing before entering a junction
   {const n2x=nx+DV8[nd][0],n2y=ny+DV8[nd][1];if(!inInt8(c.tx,c.ty)&&!inInt8(nx,ny)&&inInt8(n2x,n2y)){const s=inInt8(n2x,n2y),axis=nd==='E'||nd==='W'?'x':'y';if(!signalGreen8(s,axis))stop=1}}
   if(RAILX.includes(nx)&&(ny===87||ny===88)&&trainNear8(nx))stop=1;
   if(!stop){c.dir=nd;c.tx=nx;c.ty=ny}}
  if(!stop){const ahead=CARS8.some(o=>o!==c&&Math.hypot(o.x-(c.x+DV8[c.dir][0]*30),o.y-(c.y+DV8[c.dir][1]*30))<20);if(ahead)stop=1}
  // yield to the player and pedestrians on the road ahead
  if(!stop){const ax=c.x+DV8[c.dir][0]*30,ay=c.y+DV8[c.dir][1]*30;if(Math.hypot(ax-PL8.x,ay-PL8.y)<26){stop=1;c.wait++;if(c.wait===80&&dist<9*T8){sfx('err');c.honk=40}}else if(PEDS8.some(p=>Math.hypot(ax-p.x,ay-p.y)<22))stop=1}
  if(stop){c.v=Math.max(0,c.v-.12)}else{c.wait=0;c.v=Math.min(c.spd,c.v+.05)}
  if(c.honk>0)c.honk--;
  const gx2=c.tx*T8+16,gy2=c.ty*T8+16,dx2=gx2-c.x,dy2=gy2-c.y,d2=Math.hypot(dx2,dy2);
  if(d2>0&&c.v>0){const s=Math.min(d2,c.v);c.x+=dx2/d2*s;c.y+=dy2/d2*s}
  // lane offset: drive on the right half of the lane tile
  const ta={E:0,S:Math.PI/2,W:Math.PI,N:-Math.PI/2}[c.dir];let da=ta-c.ang;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;c.ang+=da*.18}}
// ---------- the commuter train + overflying planes + boats + ducks ----------
function train8Step(){WORLD8T++;if(!TRAIN8&&WORLD8T%2700===600)TRAIN8={x:-12*T8,dir:1,len:6*68,y:87.5*T8,cars:6,spd:2.6};if(!TRAIN8&&WORLD8T%2700===1950)TRAIN8={x:MW*T8+12*T8,dir:-1,len:6*68,y:87.5*T8,cars:6,spd:2.6};
 if(TRAIN8){TRAIN8.x+=TRAIN8.dir*TRAIN8.spd;if(TRAIN8.x>MW*T8+20*T8||TRAIN8.x<-20*T8-TRAIN8.len)TRAIN8=null}
 if(!PLANE8&&WORLD8T%3600===1200)PLANE8={x:-200,y:(70+Math.random()*30)*T8,vx:3.2,vy:-.6};if(PLANE8){PLANE8.x+=PLANE8.vx;PLANE8.y+=PLANE8.vy;if(PLANE8.x>MW*T8+300)PLANE8=null}}
// ---------- the per-step world update ----------
var DRILL8={pts:[[6,6],[12,6],[12,11],[6,11]].map(([x,y])=>[x*T8+16,y*T8+24]),i:0,t:0,look:null,lastB:null};
function drillActive8(){return S.t<2&&wxNow()!=='Rain'}
function drill8Step(){if(!drillActive8())return;DRILL8.t++;if(DRILL8.t>=70){DRILL8.t=0;DRILL8.i=(DRILL8.i+1)%4}}
function world8Step(){if(banner&&banner!==DRILL8.lastB){DRILL8.lastB=banner;const won=(S.tro|0)>(DRILL8.tro==null?(S.tro|0):DRILL8.tro);DRILL8.tro=S.tro|0;
  // a new trophy: lift it; any other banner (level up, milestone, card): fist pump
  if(!PL8.act&&!PL8.sit&&!B){PL8.dir='d';actAnim8(won?'award':'celf',won?140:44,{fd:won?18:11,n:2})}}else if(DRILL8.tro==null)DRILL8.tro=S.tro|0;drill8Step();player8Step();camera8();if(title)return;ball8Step();collect8Step();gates8Step();doors8Step();ped8Step();car8Step();train8Step();
 for(let i=FX8.length-1;i>=0;i--){FX8[i].t--;if(FX8[i].t<=0)FX8.splice(i,1)}
 INTR8=findTarget8()}
function logicStep(){tick++;
 if(!title)world8Step();
 if(mg){mg.p+=mg.d*mg.s;if(mg.p>1){mg.p=1;mg.d=-1}if(mg.p<0){mg.p=0;mg.d=1}}
 if(B&&typeof matchStep=='function')matchStep();
 song=title?'title':B?((B.e&&(B.e.lg||B.e.cup))?'match':'battle'):'world';evTick();if(tick%20==0)ambTick();if(DOORFX>0)DOORFX--}
