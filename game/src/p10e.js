// ===================== v9 TRAINING: real input-based drills (shooting, passing, dribbling, sprint) =====================
// mini(0) shooting, mini(3) passing, mini(4) dribbling, mini(6) sprint are now skill games played with the movement keys and
// the action key (J / Space / Enter / A button, mouse). The score comes only from what the player does; attributes shape
// the mechanics (accuracy, ball speed, touch, top speed). The reward uses the original drill formula (same attributes,
// same daily diminishing returns, trust, form, XP, overtraining risk), fed with the measured performance.
// The defence, fitness and reaction drills keep the timing bar.
var DR9=null,DR9K={act:0};
const DR9T={0:'shoot',3:'pass',4:'drib',6:'sprint'};
var mini0=mini;mini=function(i){if(!DR9T[i])return mini0(i);if(S.inj){say(L('You are injured! Visit the clinic.','אתה פצוע! בקר במרפאה.'));return}const D0=DRILLS[i];if(tired(D0.e))return;S.en-=D0.e;adv(1);startDrill9(i)};
function a9(k){return S.att?S.att[k]:30}
function gauss9(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5}
function startDrill9(ty){held.length=0;DR9K.act=0;const kind=DR9T[ty];DR9={ty,kind,ph:'intro',t:0,score:0,n:0,max:0,log:[],res:null};
 if(kind==='shoot')Object.assign(DR9,{max:8,spots:[[240,252],[168,240],[312,240],[240,212],[150,214],[330,214],[200,188],[280,188]].sort(()=>Math.random()-.5),gk:{x:240,v:0},aim:240,pow:0,charging:0,ball:null,pts:0});
 if(kind==='pass')Object.assign(DR9,{max:10,mates:[0,1,2,3,4,5].map(i=>{const a=-Math.PI/2+i*Math.PI/3;return{x:240+Math.cos(a)*150,y:188+Math.sin(a)*96,a}}),defs:[0,1,2].map(i=>({r:62+i*12,a:i*2.1,sp:(.012+i*.004)*(i%2?-1:1)*(1+Math.min(1,S.lvl/20)*.6)})),target:-1,sel:-1,tl:0,ball:null,ok:0,int:0});
 if(kind==='drib')Object.assign(DR9,{max:7,x:44,y:282,vx:0,vy:0,dir:'u',ph2:0,bx:44,by:270,gates:[[110,236],[210,196],[120,152],[220,112],[330,150],[410,196],[330,246]].map(([x,y])=>({x,y,done:0})),gi:0,cones:[],tm:0,pen:0,hits:0,started:0,fin:0});
 if(kind==='sprint')Object.assign(DR9,{max:1,x:0,v:0,stam:1,last:'',go:80+Math.floor(Math.random()*70),started:0,fs:0,tm:0,rx:0,rv:0,fin:0,stumbles:0,rt:clamp(8.8-S.lvl*.06,7,8.8)});
 if(kind==='drib'){for(const gt of DR9.gates){DR9.cones.push({x:gt.x-16,y:gt.y,w:0},{x:gt.x+16,y:gt.y,w:0})}for(const [x,y] of [[165,262],[160,175],[270,130],[372,175],[372,222],[250,60]])DR9.cones.push({x,y,w:0})}
 scr={t:'',l:[],o:0,draw:drawDrill9,key:keyDrill9,click:clickDrill9};sfx('whistle')}
// ---------- input ----------
function keyDrill9(k){const D=DR9;if(!D)return;const act=k==='enter'||k==='z'||k===' '||k==='j';
 if(D.ph==='intro'){if(act){D.ph='play';D.t=0;sfx('whistle')}else if(k==='x'||k==='escape'){finishDrill9(1)}return}
 if(D.ph==='done'){if(act||k==='x'||k==='escape'){scr=null;DR9=null;sfx('back')}return}
 if(k==='x'||k==='escape'){finishDrill9(1);return}
 const d=DIRS[k];
 if(D.kind==='shoot'&&act&&!D.ball&&!D.charging){D.charging=1;D.pow=0}
 if(D.kind==='pass'){if(d)passSelect9(d);if(act&&D.sel>=0&&!D.ball)passKick9(D.sel)}
 if(D.kind==='sprint'&&(d==='l'||d==='r'))sprintTap9(d)}
function releaseDrill9(){const D=DR9;if(D&&D.kind==='shoot'&&D.charging&&!D.ball&&D.ph==='play')shootKick9()}
function clickDrill9(x,y){const D=DR9;if(!D)return;if(D.ph!=='play'){keyDrill9('enter');return}
 if(D.kind==='pass'&&!D.ball){let best=-1,bd=30;D.mates.forEach((m,i)=>{const dd=Math.hypot(m.x-x,m.y-y);if(dd<bd){bd=dd;best=i}});if(best>=0){D.sel=best;passKick9(best)}}}
(function(){const isAct=k=>k==='enter'||k==='z'||k===' '||k==='j';
 addEventListener('keyup',e=>{if(DR9&&isAct(KN(e).toLowerCase()))releaseDrill9()},true);
 addEventListener('blur',()=>{if(DR9&&DR9.charging)releaseDrill9()});
 document.querySelectorAll('[data-k]').forEach(b=>{if(String(b.dataset.k).toLowerCase()!=='enter')return;['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{if(DR9)releaseDrill9()}))});
 // mouse on the canvas: hold = power, move = aim (shooting)
 C.addEventListener('pointerdown',ev=>{if(!DR9||DR9.ph!=='play'||DR9.kind!=='shoot')return;const [x]=canvasXY(ev);DR9.aim=clamp(x,176,304);if(!DR9.ball&&!DR9.charging){DR9.charging=1;DR9.pow=0}});
 C.addEventListener('pointermove',ev=>{if(DR9&&DR9.kind==='shoot'&&DR9.charging){const [x]=canvasXY(ev);DR9.aim=clamp(x,176,304)}});
 C.addEventListener('pointerup',()=>{if(DR9)releaseDrill9()})})();
// ---------- step ----------
var world8Step10=world8Step;world8Step=function(){if(DR9){if(!menu&&!dlg)drillStep9();return}world8Step10()};
function drillStep9(){const D=DR9;D.t++;if(D.ph!=='play')return;
 if(D.kind==='shoot')shootStep9(D);else if(D.kind==='pass')passStep9(D);else if(D.kind==='drib')dribStep9(D);else sprintStep9(D)}
// SHOOTING: aim along the goal line, hold to power, release; the keeper reads the shot
function shootStep9(D){const inp=moveInput8();if(!D.ball){D.aim=clamp(D.aim+inp.x*2.4,176,304);if(D.charging)D.pow=Math.min(1.2,D.pow+.024);D.at=(D.at||0)+1;if(D.at>480&&!D.charging){D.charging=1;D.pow=.45}if(D.charging&&D.pow>=1.2)shootKick9()}
 const gk=D.gk,lv=Math.min(1,S.lvl/25),gsp=1.1+lv*1.6;
 if(!D.ball){gk.x+=Math.sin(D.t/(38-lv*14))*1.1;gk.x=clamp(gk.x,186,294)}
 else{const b=D.ball;b.t++;b.x+=b.vx;b.y+=b.vy;b.z=Math.max(0,b.z+b.vz);b.vz-=.08;if(b.t>D.react){const dx=b.tx-gk.x;gk.x+=clamp(dx,-gsp,gsp)}
  if(b.y<=58&&!b.done){b.done=1;const inGoal=b.x>178&&b.x<302,over=b.over,saved=Math.abs(b.x-gk.x)<16+lv*6&&!over&&inGoal;let pts=0,msg;
   if(over){msg=L('Over the bar!','מעל המשקוף!')}else if(!inGoal){msg=L('Wide!','החוצה!')}else if(saved){msg=L('Saved!','נהדף!');sfx('save')}else{const corner=b.x<196||b.x>284;pts=corner?2:1;msg=corner?L('TOP CORNER! +2','לפינה! +2'):L('GOAL! +1','גול! +1');sfx('goal')}
   D.pts+=pts;D.log.push(pts);D.msg={s:msg,t:60,c:pts?'#7dff9a':'#ff8a80'};b.end=50}
  if(b.end!=null&&--b.end<=0){D.ball=null;D.n++;gk.x=240;D.aim=240;D.at=0;if(D.n>=D.max)finishDrill9()}}}
function shootKick9(){const D=DR9,sp=D.spots[D.n%D.spots.length],pw=D.pow;D.charging=0;const sh=a9('shooting'),fin=a9('finishing'),err=gauss9()*(1-(sh*.6+fin*.4)/100)*30*(.7+pw*.5),tx=D.aim+err,dist=Math.hypot(tx-sp[0],50-sp[1]),spd=4.2+Math.min(1,pw)*5+sh/60,steps=dist/spd;
 const over=pw>1.02&&Math.random()<(pw-1)*4,weak=pw<.3;D.ball={x:sp[0],y:sp[1]-6,z:0,vz:weak?.4:1.2+pw*.8,vx:(tx-sp[0])/steps,vy:(50-sp[1])/steps,tx,t:0,over};
 D.react=Math.round(10-Math.min(1,S.lvl/25)*5+(weak?-4:0));sfx('kick')}
// PASSING: pick the lit team-mate fast and find a lane past the moving defenders
function passStep9(D){for(const d of D.defs){d.a+=d.sp;d.x=240+Math.cos(d.a)*d.r*1.5;d.y=188+Math.sin(d.a)*d.r}
 if(D.target<0&&!D.ball){if(D.n>=D.max){finishDrill9();return}let t;do{t=Math.floor(Math.random()*6)}while(t===D.last);D.target=t;D.last=t;D.tl=Math.round(Math.max(130,230-D.n*8)+a9('vision')*.5);D.tlMax=D.tl;D.t0=D.t} /* vision buys decision time */
 if(!D.ball&&D.target>=0){D.tl--;if(D.tl<=0){D.n++;D.log.push(0);D.msg={s:L('Too slow!','איטי מדי!'),t:50,c:'#ff8a80'};D.target=-1}}
 const b=D.ball;if(b){b.x+=b.vx;b.y+=b.vy;b.t++;
  for(const d of D.defs)if(Math.hypot(d.x-b.x,d.y-b.y)<11){D.msg={s:L('Intercepted!','יורט!'),t:50,c:'#ff8a80'};D.log.push(0);D.int++;D.n++;D.ball=null;D.target=-1;sfx('hit');return}
  for(let i=0;i<6;i++){const m=D.mates[i];if(Math.hypot(m.x-b.x,m.y-b.y)<12){const right=i===D.target,quick=Math.max(0,D.tl)/(D.tlMax||200);const pts=right?Math.round(100+quick*100):20;D.score+=pts;D.log.push(pts);if(right)D.ok++;D.msg={s:right?L(`Perfect pass! +${pts}`,`מסירה מדויקת! +${pts}`):L('Wrong team-mate +20','שחקן לא נכון +20'),t:50,c:right?'#7dff9a':'#ffd96a'};sfx(right?'coin':'ok');D.n++;D.ball=null;D.target=-1;return}}
  if(b.t>90||b.x<0||b.x>480||b.y<30||b.y>320){D.msg={s:L('Misplaced!','מסירה לא מדויקת!'),t:50,c:'#ff8a80'};D.log.push(0);D.n++;D.ball=null;D.target=-1}}}
function passSelect9(d){const D=DR9,v=dirVec(d),inp=moveInput8(),ax=inp.x||v[0],ay=inp.y||v[1],an=Math.atan2(ay,ax);let best=-1,bd=9;D.mates.forEach((m,i)=>{let da=Math.abs(Math.atan2(Math.sin(m.a-an),Math.cos(m.a-an)));if(da<bd){bd=da;best=i}});D.sel=best;sfx('menu')}
function passKick9(i){const D=DR9,m=D.mates[i],pa=a9('passing');let an=Math.atan2(m.y-188,m.x-240)+gauss9()*(1-pa/100)*.22;const sp=4.6+pa/40;D.ball={x:240,y:188,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,t:0};sfx('kick')}
// DRIBBLING: slalom through the gates in order; the ball stays a touch ahead, cones cost time
function dribStep9(D){if(D.fin)return;const inp=moveInput8(),m=Math.hypot(inp.x,inp.y),dr=a9('dribbling'),bc=a9('ballctl'),ag=a9('agility'),mx=1.55+dr/100*1.05,acc=.08+ag/100*.1;
 if(m&&!D.started)D.started=1;if(D.started)D.tm++;
 D.vx+=((m?inp.x/m*mx:0)-D.vx)*acc;D.vy+=((m?inp.y/m*mx:0)-D.vy)*acc;D.x=clamp(D.x+D.vx,16,464);D.y=clamp(D.y+D.vy,50,304);if(inp.face)D.dir=inp.face;
 const sp=Math.hypot(D.vx,D.vy);D.ph2+=sp/5.5;const touch=7+(1-bc/100)*9,fx=sp>.2?D.vx/sp:0,fy=sp>.2?D.vy/sp:1;D.bx+=((D.x+fx*touch)-D.bx)*.35;D.by+=((D.y+fy*touch*.8+2)-D.by)*.35;
 for(const c of D.cones){if(c.w>0)c.w--;if(c.w<=0&&(Math.hypot(c.x-D.bx,c.y-D.by)<7||Math.hypot(c.x-D.x,c.y-D.y)<8)){c.w=40;D.pen+=90;D.hits++;D.vx*=-.4;D.vy*=-.4;D.msg={s:L('Cone! +1.5 s','קונוס! +1.5 שנ׳'),t:40,c:'#ff8a80'};sfx('hit')}}
 const gt=D.gates[D.gi];if(gt&&Math.abs(D.x-gt.x)<15&&Math.abs(D.y-gt.y)<9){gt.done=1;D.gi++;sfx('coin');D.msg={s:L(`Gate ${D.gi}/${D.gates.length}`,`שער ${D.gi}/${D.gates.length}`),t:30,c:'#7dff9a'}}
 if(D.gi>=D.gates.length&&D.x>420&&D.y<84){D.fin=1;finishDrill9()}if(D.tm>45*60){D.fin=1;finishDrill9()}}
// SPRINT: react to GO, then alternate left / right; cadence beats mashing, stamina fades
function sprintTap9(d){const D=DR9;if(D.fin)return;if(!D.started){if(D.t<D.go){if(!D.fs){D.fs=1;D.msg={s:L('False start! +0.3 s','זינוק מוקדם! +0.3 שנ׳'),t:60,c:'#ff8a80'};sfx('err')}return}D.started=1;D.react=D.t-D.go}
 if(d===D.last){D.v*=.72;D.stumbles++;D.msg={s:L('Stumble! Alternate the keys','מעידה! החלף מקשים'),t:30,c:'#ff8a80'};sfx('hit');return}D.last=d;
 const ac=a9('accel'),st=a9('stamina');D.v+=(.012+ac/100*.012)*(.55+.45*D.stam);D.stam=Math.max(0,D.stam-(.016-st/100*.009));D.ph2=(D.ph2||0)+1}
function sprintStep9(D){if(D.t>=D.go&&!D.goSaid){D.goSaid=1;sfx('whistle')}if(D.t>=D.go){D.tm++;const t=D.tm/60;D.rx=Math.min(60,60*Math.pow(Math.min(1,t/D.rt),1.12));}
 if(D.fin)return;const pace=a9('pace'),vmax=.13+pace/100*.07;D.v=Math.min(vmax,D.v)*.988;D.x+=D.v;if(D.started&&D.v<.02&&D.tm>600){D.fin=1;finishDrill9()}
 if(D.x>=60){D.fin=1;finishDrill9()}if(D.tm>20*60){D.fin=1;finishDrill9()}}
// ---------- results: grade, personal best, the original drill reward fed with the measured performance ----------
function finishDrill9(quit){const D=DR9;if(!D||D.ph==='done')return;D.ph='done';D.t=0;const pm=[];let av=0,line='',val=null,better=null;S.dr9=S.dr9||{};
 if(D.kind==='shoot'){av=Math.min(1,D.pts/(D.max*1.4));line=L(`${D.pts} points · ${D.log.filter(x=>x).length}/${D.n} scored`,`${D.pts} נקודות · ${D.log.filter(x=>x).length}/${D.n} גולים`);val=D.pts;better=(a,b)=>a>b}
 if(D.kind==='pass'){av=Math.min(1,D.score/(D.max*150));line=L(`${D.score} points · ${D.ok}/${D.n} to the right man · ${D.int} intercepted`,`${D.score} נקודות · ${D.ok}/${D.n} לשחקן הנכון · ${D.int} יורטו`);val=D.score;better=(a,b)=>a>b}
 if(D.kind==='drib'){const time=(D.tm+D.pen)/60,par=26-a9('dribbling')/10,done=D.gi>=D.gates.length;av=done?clamp((par*1.5-time)/(par*.8),0,1):clamp(D.gi/D.gates.length*.4,0,.4);line=done?L(`${time.toFixed(1)} s · ${D.hits} cones hit (par ${par.toFixed(0)} s)`,`${time.toFixed(1)} שנ׳ · ${D.hits} קונוסים (יעד ${par.toFixed(0)} שנ׳)`):L(`Course not finished: ${D.gi}/${D.gates.length} gates`,`המסלול לא הושלם: ${D.gi}/${D.gates.length} שערים`);if(done){val=+time.toFixed(2);better=(a,b)=>a<b}}
 if(D.kind==='sprint'){const time=D.tm/60+(D.fs?.3:0),done=D.x>=60;av=done?clamp((10.6-time)/(10.6-6.8),0,1):0;line=done?L(`60 m in ${time.toFixed(2)} s · rival ${D.rt.toFixed(2)} s · start ${D.react!=null?(D.react/60).toFixed(2)+' s':'-'}`,`60 מ׳ ב-${time.toFixed(2)} שנ׳ · יריב ${D.rt.toFixed(2)} שנ׳ · זינוק ${D.react!=null?(D.react/60).toFixed(2)+' שנ׳':'-'}`):L('Did not finish','לא סיים');if(done){val=+time.toFixed(2);better=(a,b)=>a<b;if(time<D.rt)pm.push(L('You beat the rival!','ניצחת את היריב!'))}}
 if(quit&&D.n===0&&!D.started){av=0}
 const pb=S.dr9[D.kind];D.pb=pb;if(val!=null&&(pb==null||better(val,pb))){S.dr9[D.kind]=val;D.newPb=pb!=null||true}
 D.av=av;D.grade=av>=.9?'S':av>=.75?'A':av>=.55?'B':av>=.4?'C':'D';D.line=line;
 // the original drill reward, unchanged, fed with the measured performance
 const D0=DRILLS[D.ty],mul=tdMul();S.tr++;S.td.c++;inc('train');if(av>.45){train(D0.K,(.5+av)*mul);if(D0.mhp){S.mhp+=1;S.hp+=1}pm.push(L('Improved: ','שיפור: ')+D0.K.map(aname).join(', '))}else pm.push(L('Too low for a skill gain - try again tomorrow.','נמוך מדי לשיפור - נסה שוב מחר.'));
 if(mul<1)pm.push(L(`Fatigue from repeated drills: rewards x${mul.toFixed(2)} today.`,`עייפות מתרגילים חוזרים: תגמול x${mul.toFixed(2)} היום.`));S.trust=clamp(S.trust+(av>.6?1.5:.3)*mul*(1+has('trust')*.3),0,100);S.form=clamp(S.form+2,0,100);{const xp=Math.round((av*30+5)*mul);addXP(xp,pm);pm.push(L(`+${xp} XP`,`+${xp} ניסיון`))}
 if(Math.random()<.05&&S.en<40){S.inj=2;pm.push(L('Overtraining! Minor injury (2 days).','אימון יתר! פציעה קלה (יומיים).'))}D.pm=pm;save();sfx(av>.55?'troph':'ok')}
// ---------- drawing ----------
// training bibs: team-mates yellow, defenders red, keeper green - readable at a glance
var BIB9={};function bib9(k){if(BIB9[k])return BIB9[k];const role=k.replace(/[0-9]/g,''),o=npcLook8('bib'+k,'player');o.num='';o.acc='';
 const c=role==='mate'?['#f5d33a','#1b2240']:role==='def'?['#d8423a','#ffffff']:['#3fb56a','#16181d'];o.sh=c[0];o.c2=c[1];o.so=c[0];o.pa='#1b2240';if(role==='gk')o.gk='#ffffff';return BIB9[k]=o}
function arena9(grass){const gr=g.createLinearGradient(0,0,0,320);gr.addColorStop(0,grass?'#3d9b48':'#c4583f');gr.addColorStop(1,grass?'#46a852':'#b04e38');g.fillStyle=gr;g.fillRect(0,0,480,320);if(grass)for(let i=0;i<12;i++){g.fillStyle=i%2?'rgba(255,255,255,.035)':'rgba(0,0,0,.035)';g.fillRect(i*40,0,40,320)}}
function hud9(title,sub){g.save();g.fillStyle='rgba(8,10,14,.82)';g.fillRect(0,0,480,24);g.restore();txt(title,10,16,9,'#ffd96a','#000a','left');txt(sub,470,16,8,'#ffffff','#000a','right')}
function drawDrill9(){const D=DR9;if(!D)return;smooth(1);
 if(D.kind==='shoot')drawShoot9(D);else if(D.kind==='pass')drawPass9(D);else if(D.kind==='drib')drawDrib9(D);else drawSprint9(D);
 if(D.msg&&D.msg.t>0){D.msg.t--;txt(D.msg.s,240,152,14,D.msg.c,'#000c','center')}
 if(D.ph==='intro')introCard9(D);if(D.ph==='done')resultCard9(D);HIT.push({x:0,y:0,w:480,h:320,fn:()=>{}})}
function introCard9(D){const info={shoot:[L('SHOOTING DRILL','תרגיל בעיטה'),[L('◀ ▶ move the aim along the goal line','◀ ▶ הזזת הכוונת לאורך קו השער'),L('Hold A / J / Space for power, release to shoot','החזק A / J / רווח לעוצמה, שחרר לבעיטה'),L('Corners score 2, too much power flies over','פינות = 2 נקודות, עוצמה מופרזת עפה מעל'),L('Mouse: hold to charge, move to aim','עכבר: החזק לטעינה, הזז לכיוון')]],
  pass:[L('PASSING DRILL','תרגיל מסירות'),[L('A team-mate lights up: pass to him, fast','שחקן נדלק: מסור אליו, מהר'),L('Arrows choose a team-mate, A / J passes','חצים בוחרים שחקן, A / J מוסר'),L('Defenders cut the lanes - time your pass','מגינים חוסמים - תזמן את המסירה'),L('Mouse: click a team-mate to pass','עכבר: לחץ על שחקן כדי למסור')]],
  drib:[L('DRIBBLING COURSE','מסלול כדרור'),[L('Run through the gates in order (lit gate)','עבור בשערים לפי הסדר (השער המואר)'),L('Then to the FINISH flag, top right','ואז לדגל הסיום, למעלה מימין'),L('Hitting a cone costs 1.5 s','פגיעה בקונוס = 1.5 שנ׳'),L('Time starts with your first touch','הזמן מתחיל במגע הראשון')]],
  sprint:[L('SPRINT TRACK · 60 m','מסלול ספרינט · 60 מ׳'),[L('Wait for GO - a false start costs 0.3 s','חכה ל-GO - זינוק מוקדם = 0.3 שנ׳'),L('Alternate ◀ ▶ (or A / D) to run','החלף ◀ ▶ (או A / D) כדי לרוץ'),L('Same key twice = stumble','אותו מקש פעמיים = מעידה'),L('Stamina fades - keep a steady rhythm','הכושר יורד - שמור על קצב')]]}[D.kind];
 g.save();g.fillStyle='rgba(4,6,10,.7)';g.fillRect(0,0,480,320);g.restore();panel(90,58,300,190,.97);txt(info[0],240,84,13,'#ffd96a','#000a','center');info[1].forEach((s,i)=>txt(s,240,112+i*20,8.5,UIC.txt,'#000a','center'));
 const pb=S.dr9&&S.dr9[D.kind];if(pb!=null)txt(L('Personal best: ','שיא אישי: ')+pb+(D.kind==='drib'||D.kind==='sprint'?L(' s',' שנ׳'):''),240,206,8,'#9fe8ff','#000a','center');
 txt(L('A: start · B: skip','A: התחל · B: דלג'),240,232,9,tick%60<44?'#ffffff':'#ffd96a','#000a','center')}
function resultCard9(D){g.save();g.fillStyle='rgba(4,6,10,.72)';g.fillRect(0,0,480,320);g.restore();panel(70,40,340,240,.97);txt(L('SESSION COMPLETE','האימון הושלם'),240,64,12,'#ffd96a','#000a','center');
 g.save();smooth(1);g.fillStyle=goldG(78,122);g.beginPath();g.arc(240,100,22,0,7);g.fill();g.fillStyle='#14161b';g.beginPath();g.arc(240,100,19,0,7);g.fill();g.restore();txt(D.grade,240,108,20,'#ffd96a','#0000','center');
 txt(D.line,240,140,8.5,UIC.txt,'#000a','center');if(D.newPb)txt(L('NEW PERSONAL BEST!','שיא אישי חדש!'),240,156,9,'#7dff9a','#000a','center');
 (D.pm||[]).slice(0,5).forEach((s,i)=>txt(ell(s,310,8),240,176+i*15,8,'#cfe9ff','#000a','center'));txt(L('A: continue','A: המשך'),240,268,9,tick%60<44?'#ffffff':'#ffd96a','#000a','center')}
function drawShoot9(D){arena9(1);g.save();g.translate(0,20); // keep the crossbar clear of the top bar
g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.strokeRect(120,44,240,90);g.beginPath();g.moveTo(0,44);g.lineTo(480,44);g.stroke();g.beginPath();g.arc(240,134,40,0,Math.PI);g.stroke();
 // goal: net + posts, corner targets
 g.fillStyle='rgba(255,255,255,.12)';g.fillRect(176,26,128,18);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=.5;for(let x=176;x<=304;x+=6){g.beginPath();g.moveTo(x,26);g.lineTo(x,44);g.stroke()}g.strokeStyle='#ffffff';g.lineWidth=3;g.beginPath();g.moveTo(176,46);g.lineTo(176,24);g.lineTo(304,24);g.lineTo(304,46);g.stroke();
 g.fillStyle='rgba(255,217,106,.22)';g.fillRect(178,26,18,18);g.fillRect(286,26,18,18);
 drawActor(D.gk.x,58,bib9('gk'),1.3,'d',D.ball&&D.ball.t>D.react?'celw':'idle',0);
 const sp=D.spots[D.n%D.spots.length]||[240,250];if(!D.ball||D.ball.t<6)drawActor(sp[0]-6,sp[1]+6,eliLook9(),1.4,'u',D.ball?'shoot':D.charging?'shoot':'idle',D.ball?2:D.charging?0:0);
 if(!D.ball&&D.ph==='play'){g.strokeStyle='#ffd24a';g.lineWidth=1.5;g.setLineDash([3,3]);g.beginPath();g.moveTo(sp[0],sp[1]-6);g.lineTo(D.aim,44);g.stroke();g.setLineDash([]);g.beginPath();g.arc(D.aim,38,5,0,7);g.stroke();
  barX(sp[0]-22,sp[1]+16,44,5,Math.min(1,D.pow/1.2),D.pow>1?'#ff5a4a':D.pow>.75?'#ffd24a':'#7dff9a')}
 const b=D.ball;if(b)g.drawImage(ballSpr(ballCol(),Math.floor(b.t/3)&3),b.x-5,b.y-5-b.z*3,10,10);else g.drawImage(ballSpr(ballCol(),0),sp[0]-5,sp[1]-12,10,10);
 g.restore();hud9(L('SHOOTING DRILL','תרגיל בעיטה'),L(`Shot ${Math.min(D.n+1,D.max)}/${D.max} · ${D.pts} pts`,`בעיטה ${Math.min(D.n+1,D.max)}/${D.max} · ${D.pts} נק׳`))}
function drawPass9(D){arena9(1);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;g.beginPath();g.ellipse(240,188,150,96,0,0,7);g.stroke();
 D.mates.forEach((m,i)=>{if(i===D.target){g.strokeStyle='#ffd24a';g.lineWidth=2.5;g.beginPath();g.ellipse(m.x,m.y+1,14,6,0,0,7);g.stroke();const k=Math.max(0,D.tl)/(D.tlMax||200);barX(m.x-14,m.y+8,28,4,k,'#ffd24a')}if(i===D.sel){g.strokeStyle='#ffffff';g.lineWidth=1.5;g.beginPath();g.ellipse(m.x,m.y+1,11,4.5,0,0,7);g.stroke()}
  drawActor(m.x,m.y,bib9('mate'+(i%3)),1.15,m.y<188?'d':'u','idle',0)});
 for(const d of D.defs)drawActor(d.x,d.y,bib9('def'+(D.defs.indexOf(d)%3)),1.1,'d','walk',(D.t>>2)&7);
 drawActor(240,188,eliLook9(),1.25,D.sel>=0?(Math.abs(D.mates[D.sel].x-240)>Math.abs(D.mates[D.sel].y-188)?(D.mates[D.sel].x>240?'r':'l'):(D.mates[D.sel].y>188?'d':'u')):'d',D.ball&&D.ball.t<12?'pass':'idle',1);
 const b=D.ball;if(b)g.drawImage(ballSpr(ballCol(),Math.floor(b.t/2)&3),b.x-5,b.y-5,10,10);
 hud9(L('PASSING DRILL','תרגיל מסירות'),L(`Pass ${Math.min(D.n+1,D.max)}/${D.max} · ${D.score} pts`,`מסירה ${Math.min(D.n+1,D.max)}/${D.max} · ${D.score} נק׳`))}
function drawDrib9(D){arena9(1);
 // finish flag
 g.fillStyle='#ffffff';g.fillRect(440,40,2,40);for(let i=0;i<4;i++)for(let j=0;j<3;j++){g.fillStyle=(i+j)%2?'#16181d':'#ffffff';g.fillRect(442+i*5,40+j*5,5,5)}txt(L('FINISH','סיום'),441,92,7,'#ffffff','#000a','center');
 D.gates.forEach((gt,i)=>{g.strokeStyle=gt.done?'rgba(125,255,154,.6)':i===D.gi?'#ffd24a':'rgba(255,255,255,.35)';g.lineWidth=i===D.gi?2:1;g.setLineDash(i===D.gi?[]:[3,3]);g.beginPath();g.moveTo(gt.x-14,gt.y);g.lineTo(gt.x+14,gt.y);g.stroke();g.setLineDash([]);if(i===D.gi)txt(String(i+1),gt.x,gt.y-6,7,'#ffd96a','#000a','center')});
 for(const c of D.cones){const wob=c.w>0?Math.sin(c.w)*2:0;g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(c.x-5+wob,c.y+3);g.lineTo(c.x+wob,c.y-9);g.lineTo(c.x+5+wob,c.y+3);g.closePath();g.fill();g.fillStyle='#ffffff';g.fillRect(c.x-2.5+wob,c.y-4,5,1.6)}
 const sp=Math.hypot(D.vx,D.vy);drawActor(D.x,D.y,eliLook9(),1.2,D.dir,sp>.3?'drib':'idle',sp>.3?Math.floor(D.ph2*2)&7:0);g.drawImage(ballSpr(ballCol(),Math.floor(D.ph2*2)&3),D.bx-5,D.by-5,10,10);
 const time=(D.tm+D.pen)/60;hud9(L('DRIBBLING COURSE','מסלול כדרור'),L(`Gate ${Math.min(D.gi+1,D.gates.length)}/${D.gates.length} · ${time.toFixed(1)} s`,`שער ${Math.min(D.gi+1,D.gates.length)}/${D.gates.length} · ${time.toFixed(1)} שנ׳`))}
function drawSprint9(D){arena9(0);const X=m=>50+m/60*390;
 for(const [y,lab] of [[150,L('Rival','יריב')],[214,L('Eli','אלי')]]){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(40,y+12,410,2);g.fillRect(40,y-40,410,2);txt(lab,22,y-8,7,'#ffffff','#000a','left')}
 for(let m=0;m<=60;m+=10){g.fillStyle='rgba(255,255,255,.5)';g.fillRect(X(m),110,1,120);txt(m+L(' m',' מ׳'),X(m),244,6,'#ffffff','#000a','center')}g.fillStyle='#ffffff';g.fillRect(X(60),106,3,128);
 drawActor(X(D.rx),150,npcLook9('trainer'),1.25,'r',D.t>=D.go?(D.rx>=60?'idle':'sprint'):'idle',Math.floor(D.rx*2.2)&7);
 drawActor(X(D.x),214,eliLook9(),1.25,'r',D.started&&D.v>.02&&!D.fin?'sprint':'idle',Math.floor(D.x*2.2)&7);
 // start lights, stamina, speed
 if(D.t<D.go){const n=D.t<D.go*.4?1:D.t<D.go*.75?2:3;for(let i=0;i<3;i++){g.fillStyle=i<n?'#ff3b3b':'#3a3f4c';g.beginPath();g.arc(214+i*26,74,9,0,7);g.fill()}txt(n<3?L('READY...','היכון...'):L('SET...','הכון...'),240,100,10,'#ffffff','#000a','center')}
 else if(D.t<D.go+50){for(let i=0;i<3;i++){g.fillStyle='#46d16a';g.beginPath();g.arc(214+i*26,74,9,0,7);g.fill()}txt('GO!',240,104,16,'#7dff9a','#000c','center')}
 txt(L('STAMINA','כושר'),40,284,7,'#ffffff','#000a','left');barX(90,278,120,6,D.stam,D.stam>.4?'#4caf50':'#ffc93c');txt(L('SPEED','מהירות'),240,284,7,'#ffffff','#000a','left');barX(290,278,120,6,D.v/.2,'#4aa3ff');
 hud9(L('SPRINT TRACK','מסלול ספרינט'),(D.tm/60).toFixed(2)+L(' s',' שנ׳'))}
window.LFC_DRILL=()=>DR9?{kind:DR9.kind,ph:DR9.ph,n:DR9.n,score:DR9.score,pts:DR9.pts,gi:DR9.gi,x:DR9.x,tm:DR9.tm,av:DR9.av,grade:DR9.grade}:null;
