// ===================== v9 LIVE MATCH: real-time 2D football (physics ball, two AI teams, direct control of Eli) =====================
// World units: 10 per metre. Pitch 105 x 68 m. One logic step = 1/60 s (logicStep -> matchStep).
// Official league / cup matches use this mode; street duels keep the turn-based duel. Every stat shown comes from LM.stats,
// which is only written by real events in this simulation (a kick, a reception, a tackle, a save, a goal).
var LM=null,LMK={},LMRB=null;
const LMP={L:1050,W:680,M:84,GW:73.2,GH:24.4,ZP:.72,SC:.7,BOX:165,BOXW:403};
const LMTAC={Balanced:{line:0,press:1,width:1,tempo:14,prog:1,direct:0,shoot:1},Possession:{line:.02,press:1,width:1.12,tempo:15,prog:.88,direct:-.25,shoot:.95},'Counter Attack':{line:-.05,press:1,width:.95,tempo:9,prog:1.5,direct:.45,shoot:1.1},'High Press':{line:.05,press:2,width:1,tempo:12,prog:1.1,direct:0,shoot:1},'Low Block':{line:-.06,press:0,width:.85,tempo:14,prog:1.05,direct:.2,shoot:1},Direct:{line:0,press:1,width:1.05,tempo:10,prog:1.4,direct:.8,shoot:1.3}};
function lmRand(){return Math.random()}
function lmGauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5}
function lmD(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
// ---------- match set-up ----------
function lmGroup(pos){return pos=='GK'?'GK':['CB','LB','RB'].includes(pos)?'DF':['DM','CM','AM'].includes(pos)?'MF':'FW'}
function lmXI(clubId,fm,withEli){const slots=FMPOS[fm]||FMPOS['4-3-3'],lay=fm.split('-').map(Number),counts=[1,lay[0],lay.slice(1,-1).reduce((a,v)=>a+v,0),lay[lay.length-1]],grpN=['GK','DF','MF','FW'];
 const sqd=(clubId!=null?sq(clubId):[]).filter(p=>!(p.inj>0)).sort((a,b)=>b.ovr-a.ovr),used=new Set(),out=[],eliG=S.arch=='Playmaker'?2:3;let si=0;
 for(let gi=0;gi<4;gi++)for(let k=0;k<counts[gi];k++){const pos=slots[si++]||[.5,.5];
  if(withEli&&gi==eliG&&k==Math.floor(counts[gi]/2)&&!out.some(o=>o.me)){out.push({me:1,grp:grpN[gi],slot:pos});continue}
  let p=sqd.find(q=>!used.has(q)&&lmGroup(q.pos)==grpN[gi]);if(!p)p=sqd.find(q=>!used.has(q)&&(gi==0?true:lmGroup(q.pos)!='GK'))||sqd.find(q=>!used.has(q));
  if(p)used.add(p);out.push({p,grp:grpN[gi],slot:pos})}
 return out}
function lmAttOf(p,fallbackOvr){if(p)return npcAtt(p);const o={};ALL.forEach(k=>o[k]=clamp(Math.round(fallbackOvr+lmGauss()*10),10,99));return o}
function lmEliAtt(){const A=Object.assign({},S.att||{}),eq=(S.boots|0)*2+(S.ball|0)*2,fm=(S.form-60)/20;ALL.forEach(k=>{if(A[k]==null)A[k]=30});
 ['shooting','finishing','passing'].forEach(k=>A[k]=clamp(A[k]+eq*.6+fm,5,99));['pace','dribbling','ballctl'].forEach(k=>A[k]=clamp(A[k]+fm,5,99));return A}
function lmLooks(seed,kit){const out=[];for(let i=0;i<3;i++){const h=hashS(seed+':'+i);out.push({sk:NPCSK[h%NPCSK.length],hc:NPCHC[(h>>>5)%NPCHC.length],hs:(h>>>9)%6,br:((h>>>13)%6==0)?1:0,bd:(h>>>16)%3,ht:.96+((h>>>19)%8)/100,out:'kit',sh:kit.sh,c2:kit.c2,pa:kit.pa,so:kit.so||kit.sh,bt:['#15161a','#f4f4f4','#c0392b','#1b2a49'][(h>>>22)%4],pat:kit.pat||'',tier:kit.tier|0})}return out}
function lmColDist(a,b){const x=hx(solid(a)),y=hx(solid(b));return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])}
function lmKits(oppName){const tk=teamKit(),a=pkx(S.ap),ok=clubColsN(oppName);let us={sh:solid(tk.sh),c2:solid(tk.c2||'#ffffff'),pa:solid(tk.pa||'#1b2240'),pat:tk.pat,so:solid(tk.sh),tier:a[7]>=3?2:a[7]>=2?1:0};
 let them={sh:solid(ok[0]),c2:solid(ok[1]),pa:'#1b2240',so:solid(ok[0])};if(lmColDist(us.sh,them.sh)<160||Math.abs(lum(us.sh)-lum(them.sh))<.2&&lmColDist(us.sh,them.sh)<230){const lt=lum(us.sh)>.5;them={sh:lt?'#1d2433':'#f2f2f0',c2:solid(ok[0]),pa:lt?'#1d2433':'#f2f2f0',so:lt?'#1d2433':'#f2f2f0'}}return{us,them}}
function lmOppTac(oc){if(!oc)return'Balanced';return['Balanced','Direct','Possession','Counter Attack','Low Block','Balanced','High Press'][oc.ph|0]||'Balanced'}
function lmOppFm(name){const k=Object.keys(FMPOS);return k[hashS(name)%k.length]}
function lmMakePlayer(team,ent,look,att,name,ovrv){const sl=ent.slot;return{team,me:!!ent.me,grp:ent.grp,fa:1-sl[1],fy:sl[0],x:0,y:0,vx:0,vy:0,dir:'r',st:'idle',f:0,ph:0,act:null,A:att,ovr:ovrv,stam:1,cd:0,stun:0,tk:0,dec:0,hold:0,look,n:name,np:ent.p||null,sl:0,dive:null}}
function lmStart(e,txt0,done){S.en=Math.max(0,S.en-6);const oc=oppClub(e),wx=wxNow(),kits=lmKits(e.n),fmUs=S.fm||'4-3-3',fmThem=lmOppFm(e.n);
 B={live:1,e,off:true,oc,min:0,gf:0,ga:0,ev:[],st:{tr:[0,0,0,0,0,0],ok:[0,0,0,0,0,0],sh:0,on:0,yc:0,red:0,oa:0,oc:0},used:{},myG:0,myA:0,et:0,wx,done,fx:0,cfx:0,an:null,fl:[],slide:0,sk:0,pk:0,ph:1,pmax:1,dh:1,dp:1,dist:0};
 const P=[],looksUs=lmLooks(nm(mine().n),kits.us),looksThem=lmLooks(e.n,kits.them),a=pkx(S.ap),eli=Object.assign(plOpts(),{sh:kits.us.sh,c2:kits.us.c2,pa:kits.us.pa,so:kits.us.so,pat:kits.us.pat,hc:a[4],bt:a[5],out:'kit',tier:kits.us.tier});
 eli.sk=solid(eli.sk||'#f1c27d');eli.hc=solid(eli.hc||'#2b1a10');eli.bt=solid(eli.bt||'#15161a');
 const gkUs={sh:'#ff8a3a',c2:'#2b2b2b',pa:'#2b2b2b',so:'#ff8a3a',out:'kit',gk:'#ffffff',sk:'#e0ac69',hc:'#2b1a10',hs:3,bt:'#15161a'},gkThem={sh:'#c9e83a',c2:'#2b2b2b',pa:'#2b2b2b',so:'#c9e83a',out:'kit',gk:'#ffffff',sk:SKINS2[hashS(e.n)%SKINS2.length],hc:'#222',hs:2,bt:'#15161a'};
 lmXI(S.club,fmUs,1).forEach((en,i)=>{if(en.me){P.push(lmMakePlayer(0,en,eli,lmEliAtt(),L('Eli','אלי'),ovr()));return}const pp=en.p;P.push(lmMakePlayer(0,en,en.grp=='GK'?gkUs:looksUs[i%3],lmAttOf(pp,40),pp?nm(pp.n):L('Teammate','חבר קבוצה'),pp?pp.ovr:40))});
 const fbO=clamp(18+e.lvl*3,25,90);lmXI(oc?oc.id:null,fmThem,0).forEach((en,i)=>{const pp=en.p;P.push(lmMakePlayer(1,en,en.grp=='GK'?gkThem:looksThem[i%3],lmAttOf(pp,fbO),pp?nm(pp.n):e.n,pp?pp.ovr:fbO))});
 const home=!!e.home;LM={P,f:0,min:0,half:1,state:S.lmTut?'kick':'intro',stT:0,tm:[{side:home?1:-1,kit:kits.us,tac:S.tac||'Balanced',fm:fmUs,name:nm(mine().n)},{side:home?-1:1,kit:kits.them,tac:lmOppTac(oc),fm:fmThem,name:e.n}],
  ball:{x:LMP.L/2,y:LMP.W/2,z:0,vx:0,vy:0,vz:0,own:null,last:null,lastTeam:-1,pass:null,shot:null,tgt:null,rot:0,ast:null},kickTeam:home?0:1,firstKick:home?0:1,
  stats:{pos:[0,0],sh:[0,0],on:[0,0],pa:[0,0],pc:[0,0],tk:[0,0],it:[0,0],fo:[0,0],co:[0,0],sv:[0,0],yc:[0,0],of:[0,0]},cam:{x:LMP.L/2,y:LMP.W/2},charge:-1,call:0,msg:null,rs:null,shake:0,conf:[],eli:null,simmed:0,hint:0};
 LM.eli=P.find(p=>p.me)||null;P.forEach(p=>{if(p.grp=='GK'){p.gkr=clamp((p.ovr||40)+(p.A.positioning-50)*.2,10,99)}});lmCompress(P);
 const sm=.55+S.en/100*.45;LM.P.forEach(p=>p.stam=p.me?sm:.9+lmRand()*.1);lmKickoffSetup(LM.kickTeam);
 Tr={f:0,cb:()=>{sfx('whistle');lmMsg(L(`Kick-off! ${nm(mine().n)} vs ${e.n} · ${wxName(wx)}`,`שריקת פתיחה! ${nm(mine().n)} נגד ${e.n} · ${wxName(wx)}`),'#ffd96a',200)}}}
// balance: inside one match every attribute is pulled towards the average of the 22 players (LMBAL.k keeps that share of
// the difference). The better side still wins more often, without the blow-outs a raw 25-point gap produced.
var LMBAL={k:.45,idle:200,cap:3,gkCap:4,form:4};
// big gaps between the two teams are softened (the gap between team averages is soft-capped with tanh: equal teams are
// untouched, top-vs-bottom keeps a clear but beatable edge); every player keeps his place relative to his own team-mates,
// so Eli's own progress still counts in full. Each team also gets a small match-day form swing, so upsets can happen.
function lmSoften(P){const out=P.filter(p=>p.grp!='GK'),side=t=>out.filter(p=>p.team===t),f=[lmGauss()*LMBAL.form,lmGauss()*LMBAL.form];
 for(const k of Object.keys(P[0].A)){const m0=side(0).reduce((a,p)=>a+(+p.A[k]||0),0)/Math.max(1,side(0).length),m1=side(1).reduce((a,p)=>a+(+p.A[k]||0),0)/Math.max(1,side(1).length),d=(m0-m1)/2,dn=LMBAL.cap*Math.tanh(d/LMBAL.cap),sh=dn-d;
  for(const p of P){const v=(+p.A[k]||0)+(p.team===0?sh:-sh)+f[p.team];p.A=Object.assign({},p.A,{[k]:clamp(v,1,99)})}}
 const gk=t=>P.find(p=>p.grp=='GK'&&p.team===t);const g0=gk(0),g1=gk(1);if(g0&&g1){const d=(g0.gkr-g1.gkr)/2,dn=LMBAL.gkCap*Math.tanh(d/LMBAL.gkCap),sh=dn-d;g0.gkr=clamp(g0.gkr+sh+f[0],10,99);g1.gkr=clamp(g1.gkr-sh+f[1],10,99)}}
function lmCompress(P){const keys=Object.keys(P[0].A);for(const k of keys){const m=P.reduce((a,p)=>a+(+p.A[k]||0),0)/P.length;for(const p of P)p.A=Object.assign({},p.A,{[k]:m+((+p.A[k]||0)-m)*LMBAL.k})}
 const gk=P.filter(p=>p.grp=='GK');if(gk.length){const m=gk.reduce((a,p)=>a+p.gkr,0)/gk.length;gk.forEach(p=>p.gkr=m+(p.gkr-m)*LMBAL.k)}lmSoften(P)}
function lmEliIdle(){return LM.f-(LM.inT|0)>LMBAL.idle} // no input for ~3 s: Eli keeps his place in the shape
function lmMsg(s,c,t){LM.msg={s,c:c||'#ffffff',t:t||150,t0:t||150}}
// coordinates relative to a team's attacking direction (0 = own goal line, 1 = opponent goal line)
function lmAx(team,x){return LM.tm[team].side>0?x/LMP.L:1-x/LMP.L}
function lmWx(team,a){return LM.tm[team].side>0?a*LMP.L:(1-a)*LMP.L}
function lmGoalX(team){return LM.tm[team].side>0?LMP.L:0} // the goal this team attacks
function lmOwnGoalX(team){return LM.tm[team].side>0?0:LMP.L}
function lmTP(team){return LMTAC[LM.tm[team].tac]||LMTAC.Balanced}
function lmKickoffSetup(team){const b=LM.ball;Object.assign(b,{x:LMP.L/2,y:LMP.W/2,z:0,vx:0,vy:0,vz:0,own:null,pass:null,shot:null,tgt:null,ast:null});
 for(const p of LM.P){const a=p.grp=='GK'?.035:Math.min(.46,p.fa*.55+.04);p.x=lmWx(p.team,a);p.y=LMP.W*(.5+(p.fy-.5)*.86);p.vx=p.vy=0;p.stun=0;p.act=null;p.hold=0;p.dive=null;p.sl=0;
  if(p.team!==team&&p.grp!='GK'){const dx=p.x-LMP.L/2,dy=p.y-LMP.W/2,d=Math.hypot(dx,dy);if(d<100){const k=100/(d||1);p.x=LMP.L/2+dx*k;p.y=LMP.W/2+dy*k;if(Math.sign(p.x-LMP.L/2)!==-LM.tm[p.team].side)p.x=LMP.L/2-LM.tm[p.team].side*100}}
  p.dir=LM.tm[p.team].side>0?'r':'l'}
 // kick-off taker: the forward nearest the centre (Eli if he is a forward)
 const cand=LM.P.filter(p=>p.team===team&&p.grp!='GK').sort((a,c)=>(Math.abs(a.y-LMP.W/2)+(1-a.fa)*200)-(Math.abs(c.y-LMP.W/2)+(1-c.fa)*200));const tk=cand[0];
 if(tk){tk.x=LMP.L/2-LM.tm[team].side*9;tk.y=LMP.W/2;LM.kicker=tk}LM.kickTeam=team;LM.state=LM.state==='intro'?'intro':'kick';LM.stT=0}
// ---------- the per-step update ----------
function lmPaused(){return !!(menu||dlg||Tr||scr||title)}
function lmStep(){if(!LM||lmPaused())return;LM.f++;LM.stT++;if(LM.msg&&--LM.msg.t<=0)LM.msg=null;if(LM.call>0)LM.call--;if(LM.shake>0)LM.shake--;
 for(let i=LM.conf.length-1;i>=0;i--){const c=LM.conf[i];c.x+=c.vx;c.y+=c.vy;c.vy+=.06;c.vx*=.99;if(--c.l<=0)LM.conf.splice(i,1)}
 const st=LM.state;
 if(st==='intro'){lmCamera();return}
 if(st==='ht'||st==='ft'||st==='et'){lmCamera();if(st==='ft'&&LM.stT>300)lmEnd();return}
 if(st==='goal'){lmCelebrate();lmMoveAll(1);lmCamera();if(LM.stT>200)lmAfterGoal();return}
 if(st==='kick'){lmMoveAll(0,1);lmCamera();const k=LM.kicker;if(k){k.x=LMP.L/2-LM.tm[LM.kickTeam].side*9;k.y=LMP.W/2;k.vx=k.vy=0}
  if(k&&(!k.me&&LM.stT>70||k.me&&LM.stT>420)){lmKickoffPass(k)}return}
 if(st==='restart'){lmEliControl();lmRestartStep();lmMoveAll(0);lmBall();lmCamera();lmClock();return}
 // open play
 lmEliControl();lmAI();lmMoveAll(0);lmBall();lmContacts();lmKeepers();lmRules();lmCamera();lmClock();
 const b=LM.ball;if(b.own)LM.stats.pos[b.own.team]++;else if(b.lastTeam>=0)LM.stats.pos[b.lastTeam]++}
function lmRate(){return 90/((S.mlen||6)*3600)}
function lmClock(){const end=LM.half==1?45:LM.half==2?90:LM.half==3?105:120;LM.min=Math.min(end,LM.min+lmRate());B.min=Math.floor(LM.min);
 if(LM.min>=end&&LM.state==='play'&&!(LM.ball.shot&&LM.ball.shot.live)){sfx('whistle');
  if(LM.half==1||LM.half==3){LM.state='ht';LM.stT=0;sfx('whistle')}
  else if(LM.half==2&&B.e.cup&&B.gf==B.ga){LM.state='et';LM.stT=0;B.et=1}
  else{LM.state='ft';LM.stT=0}}}
function lmNextPeriod(){if(LM.state==='ht'){LM.half++;LM.tm.forEach(t=>t.side*=-1);lmKickoffSetup(LM.half==2||LM.half==4?1-LM.firstKick:LM.firstKick);sfx('whistle');return}
 if(LM.state==='et'){LM.half=3;LM.min=90;LM.tm.forEach(t=>t.side*=-1);lmKickoffSetup(LM.firstKick);lmMsg(L('EXTRA TIME','הארכה'),'#ffd96a',160);sfx('whistle')}}
// ---------- Eli: direct control ----------
function lmInput(){let x=0,y=0;for(const d of held){if(d==='l')x-=1;if(d==='r')x+=1;if(d==='u')y-=1;if(d==='d')y+=1}return{x:clamp(x,-1,1),y:clamp(y,-1,1)}}
function lmEliControl(){const p=LM.eli;if(!p||p.off)return;if(p.stun>0||p.sl>0){return}const inp=lmInput(),m=Math.hypot(inp.x,inp.y),b=LM.ball;
 const mx=lmMaxSpd(p)*(lmSprint()?1:.8)*(b.own===p?lmDribF(p):1);
 if(m){LM.inT=LM.f;p.tx=p.x+inp.x/m*40;p.ty=p.y+inp.y/m*40;p.want=mx;p.face=[inp.x/m,inp.y/m]}
 else if(b.tgt===p&&!b.own&&lmD(p,b)<90){const lead=lmPredict(14);p.tx=lead.x;p.ty=lead.y;p.want=mx*.85}
 else{p.tx=p.x;p.ty=p.y;p.want=0}
 if(lmSprint()&&m){p.stam=Math.max(.05,p.stam-.00095*(1.25-p.A.stamina/100))}
 if(LM.charge>=0){if(b.own!==p)LM.charge=-1;else LM.charge=Math.min(1.12,LM.charge+1/48)}}
function lmMaxSpd(p){return (1.38+p.A.pace/100*.62)*(.72+.28*p.stam)}
function lmAccel(p){return .07+p.A.accel/100*.08}
function lmDribF(p){return .84+p.A.dribbling/100*.12}
// actions triggered by the keyboard / touch buttons
function lmDown(a){if(!LM)return;LM.inT=LM.f;const p=LM.eli,b=LM.ball;
 if(a==='pause'){lmPause();return}
 if(LM.state==='intro'){if(a==='pass'||a==='shoot'){S.lmTut=1;save();LM.state='kick';LM.stT=0;sfx('whistle')}return}
 if(LM.state==='ht'||LM.state==='et'){if(a==='pass'&&LM.stT>40)lmNextPeriod();return}
 if(LM.state==='ft'){if(a==='pass'&&LM.stT>40)lmEnd();return}
 if(LM.state==='goal'){if(a==='pass'&&LM.stT>70)lmAfterGoal();return}
 if(!p||p.off)return;
 if(LM.state==='kick'){if(LM.kicker===p&&(a==='pass'||a==='through'))lmKickoffPass(p);return}
 if(LM.state==='restart'){const r=LM.rs;if(r&&r.taker===p&&r.t>30&&(a==='pass'||a==='through'||a==='shoot'))lmTakeRestart(a);return}
 if(p.stun>0||p.sl>0)return;
 if(b.own===p){if(a==='pass')lmEliPass(0);else if(a==='through')lmEliPass(1);else if(a==='shoot')LM.charge=0;return}
 // without the ball
 if(a==='pass'){const car=b.own;if(car&&car.team!==p.team&&!(car.grp=='GK'&&car.hold>0)&&lmD(p,car)<16)lmTackle(p,car,0);else if(car&&car.team===p.team){LM.call=110;lmMsg(L('Eli calls for the ball!','אלי מבקש את הכדור!'),'#9fe8ff',60)}}
 else if(a==='shoot'){lmSlide(p)}}
function lmUp(a){if(!LM)return;if(a==='shoot'&&LM.charge>=0){const p=LM.eli,pw=LM.charge;LM.charge=-1;if(p&&LM.ball.own===p&&LM.state==='play')lmEliShoot(pw)}}
function lmEliDir(){const inp=lmInput(),m=Math.hypot(inp.x,inp.y),p=LM.eli;if(m)return[inp.x/m,inp.y/m];if(p.face)return p.face;return[LM.tm[p.team].side,0]}
function lmEliPass(through){const p=LM.eli,dir=lmEliDir();let best=null,bs=-9;
 for(const q of LM.P){if(q.team!==p.team||q===p||q.off)continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d<18||d>620)continue;const dot=(dx*dir[0]+dy*dir[1])/d;if(dot<.55)continue;
  const s=dot*1.4-d/700+lmOpen(q,p)*.5-(q.grp=='GK'?.6:0);if(s>bs){bs=s;best=q}}
 const wide=lmAx(p.team,p.x)>.72&&Math.abs(p.y-LMP.W/2)>150;
 if(best){let tx=best.x,ty=best.y;if(through){const sd=LM.tm[p.team].side;tx=best.x+sd*80;ty=best.y+(LMP.W/2-best.y)*.12}else{tx+=best.vx*18;ty+=best.vy*18}
  const d=Math.hypot(tx-p.x,ty-p.y),loft=d>330||(wide&&best.grp=='FW'&&!through);lmKick(p,tx,ty,loft?'loft':'ground',best);B.used[loft?4:2]=1;B.st.tr[loft?4:2]++}
 else{const tx=p.x+dir[0]*150,ty=p.y+dir[1]*150;lmKick(p,tx,ty,'ground',null);B.used[2]=1;B.st.tr[2]++}
 p.act={st:'pass',t:15,t0:15,n:3,fd:5}}
function lmEliShoot(pw){const p=LM.eli,inp=lmInput(),gx=lmGoalX(p.team),cy=LMP.W/2;let ay;
 if(inp.y<0)ay=cy-LMP.GW/2+7;else if(inp.y>0)ay=cy+LMP.GW/2-7;else{const gk=LM.P.find(q=>q.team!==p.team&&q.grp=='GK');ay=gk&&gk.y<cy?cy+LMP.GW/2-9:cy-LMP.GW/2+9}
 lmShoot(p,gx,ay,Math.max(.2,pw));B.used[0]=1}
// ---------- AI ----------
function lmOpen(q,from){let m=80;for(const o of LM.P){if(o.team===q.team||o.off)continue;m=Math.min(m,lmD(o,q))}let lane=40;if(from){const dx=q.x-from.x,dy=q.y-from.y,L2=dx*dx+dy*dy||1;for(const o of LM.P){if(o.team===q.team||o.off)continue;let t=((o.x-from.x)*dx+(o.y-from.y)*dy)/L2;if(t<0||t>1)continue;const px=from.x+dx*t,py=from.y+dy*t;lane=Math.min(lane,Math.hypot(o.x-px,o.y-py))}}return Math.min(1,m/80)*.5+Math.min(1,lane/40)*.5}
function lmPredict(n){const b=LM.ball;let x=b.x,y=b.y,vx=b.vx,vy=b.vy;const fr=b.z>0?.996:lmFric();for(let i=0;i<n;i++){x+=vx;y+=vy;vx*=fr;vy*=fr}return{x,y}}
function lmFric(){return B.wx=='Rain'?.987:.982}
function lmAI(){const b=LM.ball,P=LM.P;
 const possT=b.own?b.own.team:(b.pass?b.pass.team:-1);
 for(let t=0;t<2;t++){const tp=lmTP(t),mine2=P.filter(p=>p.team===t&&!p.off),ballA=lmAx(t,b.x),inPos=possT===t,attack=inPos;
  // who goes for the ball
  let chasers=[];if(!inPos){const out=mine2.filter(p=>p.grp!='GK'&&!p.me).sort((p,q)=>lmD(p,b)-lmD(q,b));const trig=tp.press==0?ballA<.6:tp.press==2?true:ballA<.68;
   if(!b.own)chasers=out.slice(0,1);else if(trig){chasers=out.slice(0,tp.press==2&&ballA>.55&&out[1]&&lmD(out[1],b)<70?2:1)}else if(lmD(out[0],b)<70)chasers=out.slice(0,1)}
  for(const p of mine2){if(p.grp=='GK'||p.me&&(b.own===p||!lmEliIdle()))continue;if(b.own===p){lmCarrier(p,tp);continue}
   if(b.tgt===p&&!b.own){const pr=lmPredict(Math.min(30,lmD(p,b)/3));p.tx=pr.x;p.ty=pr.y;p.want=lmMaxSpd(p);continue}
   if(chasers.includes(p)){const pr=b.own?{x:b.own.x-LM.tm[t].side*-0,y:b.own.y}:lmPredict(Math.min(26,lmD(p,b)/3));const gx=lmOwnGoalX(t);let tx=pr.x,ty=pr.y;if(b.own){const dx=gx-tx,dy=LMP.W/2-ty,d=Math.hypot(dx,dy)||1;tx+=dx/d*5;ty+=dy/d*5}
    p.tx=tx;p.ty=ty;p.want=lmMaxSpd(p)*(lmD(p,b)>40?1:.85);if(tp.press==2&&b.own)p.stam=Math.max(.36,p.stam-.00035); // pressing high costs legs
    if(b.own&&b.own.team!==t&&!(b.own.grp=='GK'&&b.own.hold>0)&&p.tk<=0&&lmD(p,b.own)<14.5&&lmRand()<.045*(1+tp.press*.15)+(p.A.tackling-50)/2500){lmTackle(p,b.own,lmRand()<.12?1:0)}continue}
   // shape: formation slot moved with the ball, compressed when defending
   let fa=p.fa+(ballA-.5)*(attack?.62:.5)+tp.line*(p.grp=='DF'?1:p.grp=='MF'?.7:.3)+(attack&&p.grp=='FW'?.08:0)+(attack&&p.grp=='MF'?.04:0);
   if(!attack)fa=fa+(ballA-fa)*.14;if(!attack&&p.grp=='DF')fa=Math.min(fa,ballA-.03);
   // the back line holds around the edge of its box and only drops deeper when the ball is in the box
   fa=clamp(fa,p.grp=='DF'?(ballA<.17?.06:.13):(ballA<.17?.1:.16),p.grp=='FW'?.9:.84);
   let fy=.5+(p.fy-.5)*(attack?tp.width:.78)+(b.y/LMP.W-.5)*.28;
   // wide forwards cut inside as the attack reaches the final third (wingers attack the box, not the touchline)
   if(attack&&p.grp=='FW'){const k=clamp((ballA-.45)/.4,0,1)*.6;fy=.5+(fy-.5)*(1-k)}else if(attack&&p.grp=='MF'&&p.fa>.5){const k=clamp((ballA-.55)/.35,0,1)*.3;fy=.5+(fy-.5)*(1-k)}
   fy=clamp(fy,.04,.96);
   let tx=lmWx(t,fa),ty=fy*LMP.W;
   // goal-side marking of the nearest attacker in my zone
   if(!attack&&p.grp!='FW'){let mk=null,md=110;for(const o of P){if(o.team===t||o.grp=='GK'||o===b.own||o.off)continue;const d=Math.hypot(o.x-tx,o.y-ty);if(d<md){md=d;mk=o}}
    if(mk){const gx=lmOwnGoalX(t),dx=gx-mk.x,dy=LMP.W/2-mk.y,d=Math.hypot(dx,dy)||1;tx=tx*.45+(mk.x+dx/d*16)*.55;ty=ty*.45+(mk.y+dy/d*16)*.55}}
   // attacking runs in behind for forwards when a team-mate carries the ball forward
   if(attack&&p.grp=='FW'&&b.own&&b.own!==p&&lmAx(t,b.own.x)>.4){const deep=lmDeepest(1-t);tx=lmWx(t,Math.min(.92,Math.max(fa,lmAx(t,deep.x)-.006)))}
   // stay onside while the team has the ball
   if(attack&&lmAx(t,tx)>.5){const offL=Math.max(.5,lmOffsideLine(t),lmAx(t,b.x));if(lmAx(t,tx)>offL-.004)tx=lmWx(t,offL-.006)}
   p.tx=tx;p.ty=ty;const far=Math.hypot(tx-p.x,ty-p.y);p.want=lmMaxSpd(p)*(far>60?.95:far>18?.62:.4)}}
 // the requested pass to Eli is honoured by the AI carrier through lmCarrier's scoring
}
// offside: judged at the moment of the pass (second-last opponent, ball, halfway line)
function lmOffsideLine(t){const a=LM.P.filter(p=>p.team!==t&&!p.off).map(p=>lmAx(t,p.x)).sort((x,y)=>y-x);return a.length>1?a[1]:1}
function lmIsOff(q,line){const a=lmAx(q.team,q.x);return a>.5&&a>lmAx(q.team,LM.ball.x)+.004&&a>(line==null?lmOffsideLine(q.team):line)+.004}
function lmDeepest(t){let best=null,ba=-1;for(const p of LM.P){if(p.team!==t||p.grp=='GK'||p.off)continue;const a=1-lmAx(t,p.x);if(a>ba){ba=a;best=p}}return best||{x:LMP.L/2}} // most advanced defender of team t, seen from the opponent
function lmCarrier(p,tp){const t=p.team,b=LM.ball;p.dec--;if(p.pq>0)p.pq--;const gx=lmGoalX(t),gy=LMP.W/2,dg=Math.hypot(gx-p.x,gy-p.y),press=lmNearestOpp(p);
 // breakaway: no outfield defender ahead in my corridor -> run at goal and finish
 {const sd=LM.tm[t].side,ax=lmAx(t,p.x);if(ax>.58&&!LM.P.some(o=>o.team!==t&&!o.off&&o.grp!='GK'&&(o.x-p.x)*sd>-14&&Math.abs(o.y-p.y)<95+(o.x-p.x)*sd*.35)){
  if(dg<125||press.d<13&&dg<220){const gk=LM.P.find(q=>q.team!==t&&q.grp=='GK'),side=gk&&gk.y<gy?1:-1;lmShoot(p,gx,gy+side*(LMP.GW/2-7-lmRand()*12),.6+lmRand()*.35);return}
  p.tx=gx-sd*30;p.ty=gy+(p.y-gy)*.45;p.want=lmMaxSpd(p)*lmDribF(p);return}}
 // a defender closing in forces a fresh decision (at most once every 24 steps)
 const urgent=press.d<20&&!(p.pq>0);if(urgent)p.pq=24;
 if(p.dec<=0||urgent){p.dec=tp.tempo+Math.floor(lmRand()*6);
  // shoot?
  const ang=Math.abs(gy-p.y)/Math.max(1,Math.abs(gx-p.x));let ps=dg<120?.75:dg<190?.42:dg<260?.14:0;if(ang>1.4)ps*=.25;ps*=tp.shoot*(.7+p.A.shooting/170);
  if(lmRand()<ps){const gk=LM.P.find(q=>q.team!==t&&q.grp=='GK'),side=gk&&gk.y<gy?1:-1,ay=gy+side*(LMP.GW/2-6-lmRand()*14);lmShoot(p,gx,ay,.55+lmRand()*.45);return}
  // pass options
  let best=null,bs=-9;for(const q of LM.P){if(q.team!==t||q===p||q.off)continue;const d=lmD(p,q);if(d<30||d>560)continue;const prog=lmAx(t,q.x)-lmAx(t,p.x),op=lmOpen(q,p);
   let s=.25+prog*1.7*tp.prog+op*1.1-(d<60?.25:0)-(d>300?(d-300)/300*(1-tp.direct):0)-(q.grp=='GK'?.9:0);
   if(q.me){s+=LM.f-(LM.inT|0)<200?.25+(S.trust-50)/250+(LM.call>0?1.1:0):-.6}if(lmIsOff(q))s-=1.6;if(s>bs){bs=s;best=q}}
  const ahead=lmSpaceAhead(p),dribS=.2+(press.d>60?.55:press.d>35?.2:-.45)+ahead*.3+(p.A.dribbling-50)/200;
  // ball over the top: a high defensive line leaves space behind it for an onside runner
  {const offL=lmOffsideLine(t),room=.86-offL;if(room>.14&&lmAx(t,p.x)>(room>.3?.08:.3)&&lmRand()<(room>.3?.85:.6)){for(const q of LM.P){if(q.team!==t||q.off||q.grp=='GK'||q===p||q.grp=='DF')continue;const qa=lmAx(t,q.x);if(qa<offL-.08||lmIsOff(q,offL))continue;
   const tx=lmWx(t,Math.min(.9,offL+Math.min(.2,room*.55))),ty=clamp(q.y+(LMP.W/2-q.y)*.25,40,LMP.W-40),gp={x:tx,y:ty,team:t},d=Math.hypot(tx-p.x,ty-p.y);if(d>520)continue;
   let near=99;for(const o of LM.P)if(o.team!==t&&!o.off)near=Math.min(near,Math.hypot(o.x-tx,o.y-ty));const s2=.05+room*2+Math.min(1,near/70)*.6-(q.me&&lmEliIdle()?2:0)+(q.me?.2:0);
   if(s2>bs&&s2>dribS){lmKick(p,tx,ty,d>300?'loft':'ground',q);return}}}}
  if(best&&(bs>dribS||press.d<12)){let tx=best.x+best.vx*16,ty=best.y+best.vy*16;const thr=best.grp=='FW'&&lmAx(t,best.x)>.55&&lmRand()<.45;if(thr){tx+=LM.tm[t].side*60}
   const d=Math.hypot(tx-p.x,ty-p.y),wide=lmAx(t,p.x)>.7&&Math.abs(p.y-gy)>150;lmKick(p,tx,ty,d>320||(wide&&lmRand()<.6)?'loft':'ground',best);return}
  // dribble: forward with a side-step away from the nearest opponent
  const sd=LM.tm[t].side;let dy=(gy-p.y)*.25;if(press.o&&press.d<50)dy+=(p.y-press.o.y>0?1:-1)*40;p.drx=p.x+sd*70;p.dry=clamp(p.y+dy,30,LMP.W-30)}
 p.tx=p.drx!=null?p.drx:p.x+LM.tm[t].side*40;p.ty=p.dry!=null?p.dry:p.y;p.want=lmMaxSpd(p)*lmDribF(p)*(press.d<40?.95:.8)}
function lmNearestOpp(p){let o=null,d=999;for(const q of LM.P){if(q.team===p.team||q.off)continue;const dd=lmD(p,q);if(dd<d){d=dd;o=q}}return{o,d}}
function lmSpaceAhead(p){const sd=LM.tm[p.team].side;let m=1;for(const q of LM.P){if(q.team===p.team||q.off)continue;const dx=(q.x-p.x)*sd;if(dx>0&&dx<120&&Math.abs(q.y-p.y)<40)m=Math.min(m,dx/120)}return m}
// ---------- movement / animation ----------
function lmMoveAll(celebrate,frozen){const b=LM.ball,possT=b.own?b.own.team:b.pass?b.pass.team:-1;
 for(const p of LM.P){if(p.off)continue;if(p.cd>0)p.cd--;if(p.tk>0)p.tk--;if(p.stun>0){p.stun--;p.vx*=.86;p.vy*=.86}
  if(frozen&&p!==LM.kicker){const a=p.grp=='GK'?.035:Math.min(.46,p.fa*.55+.04);p.tx=lmWx(p.team,a);p.ty=LMP.W*(.5+(p.fy-.5)*.86);p.want=lmMaxSpd(p)*.5}
  if(p.sl>0){p.sl--;p.x+=p.vx;p.y+=p.vy;p.vx*=.93;p.vy*=.93;p.st='slide';continue}
  if(p.dive){p.dive.t--;p.x+=p.vx;p.y+=p.vy;p.vx*=.9;p.vy*=.9;if(p.dive.t<=0){p.dive=null;p.stun=18}continue}
  if(p.stun<=0&&p.tx!=null){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),w=d<2?0:Math.min(p.want||0,d*.18),ac=lmAccel(p);const ux=d?dx/d:0,uy=d?dy/d:0;let wb=w;if(possT>=0&&possT!==p.team&&p.grp!='GK'&&-LM.tm[p.team].side*ux>.6)wb*=.86; /* turning and running back towards your own goal is slower: a high line can be beaten for pace */
  p.vx+=(ux*wb-p.vx)*ac*2.2;p.vy+=(uy*wb-p.vy)*ac*2.2}
  // keep players from stacking on top of each other
  for(const q of LM.P){if(q===p||q.off||q.team!==p.team)continue;const dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;if(d<144&&d>.01){const k=(12-Math.sqrt(d))*.04;p.x+=dx*k;p.y+=dy*k}}
  p.x+=p.vx;p.y+=p.vy;p.x=clamp(p.x,-30,LMP.L+30);p.y=clamp(p.y,-20,LMP.W+20);
  if(!isFinite(p.x+p.y+p.vx+p.vy)){p.x=lmWx(p.team,p.fa);p.y=p.fy*LMP.W;p.vx=p.vy=0;p.tx=p.x;p.ty=p.y} // safety net: never let a bad value spread
  if(!p.me&&p.stam>.3)p.stam-=Math.hypot(p.vx,p.vy)>1.6?.00012:0;if(Math.hypot(p.vx,p.vy)<1.2)p.stam=Math.min(1,p.stam+.0002);
  // animation state (distance driven, so the feet do not slide)
  const sp=Math.hypot(p.vx,p.vy);
  if(sp>.25){const nd=Math.abs(p.vx)>Math.abs(p.vy)*.85?(p.vx>0?'r':'l'):(p.vy>0?'d':'u');if(nd!==p.dir&&(p.dirT|0)<=0){p.dir=nd;p.dirT=6}}if(p.dirT>0)p.dirT--;
  if(b.own===p&&sp<.25){p.dir=LM.tm[p.team].side>0?'r':'l'}
  if(p.act&&p.act.t>0){p.act.t--;p.st=p.act.st;p.f=Math.min((p.act.n||1)-1,Math.floor((p.act.t0-p.act.t)/(p.act.fd||6)));if(p.act.t<=0)p.act=null}
  else if(celebrate&&p.cel){const cs=p.me?celSt8():p===(LM.goal&&LM.goal.by)?'celw':'celf';p.st=cs;p.f=cs==='celw'?(LM.stT>>2)&3:cs==='kneel'?0:(LM.stT>>3)&1}
  else if(p.react>0){p.react--;p.st='react';p.f=0}
  else if(sp>.35){p.ph+=sp/(sp>1.7?13:10);const own=LM.ball.own===p;p.st=own?'drib':sp>2.05?'sprint':sp>1.7?'run':'walk';p.f=Math.floor(p.ph*2)&7}
  else{p.st='idle';p.f=(LM.f+(p.x|0))%140<8?1:0}}}
// ---------- the ball ----------
function lmBall(){const b=LM.ball;b.rot+=Math.hypot(b.vx,b.vy);
 if(b.own){const p=b.own,sp=Math.hypot(p.vx,p.vy),fx=sp>.2?p.vx/sp:LM.tm[p.team].side,fy=sp>.2?p.vy/sp:0,touch=6+sp*2.2+(1-p.A.ballctl/100)*3;
  const tx=p.x+fx*touch,ty=p.y+fy*touch*.8+1;b.vx=(tx-b.x)*.45;b.vy=(ty-b.y)*.45;b.x+=b.vx;b.y+=b.vy;b.z=0;b.vz=0;return}
 b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;
 if(b.z>0){b.vz-=.22;b.vx*=.996;b.vy*=.996;if(B.wx=='Windy'){b.vx+=.012;b.vy+=.006}}
 if(b.z<=0){b.z=0;if(b.vz<-1){b.vz=-b.vz*.42;const dmp=b.shot?.86:.58;b.vx*=dmp;b.vy*=dmp}else b.vz=0;if(b.vz==0){const f=lmFric();b.vx*=f;b.vy*=f}}
 if(Math.hypot(b.vx,b.vy)<.04){b.vx=b.vy=0}
 if(b.shot){b.shot.t++;if(b.shot.t>140)b.shot=null}}
function lmKick(p,tx,ty,kind,target){const b=LM.ball,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1;let ux=dx/d,uy=dy/d;
 const acc=(p.A.passing*.6+p.A.vision*.25+p.A.composure*.15)/100,press=lmNearestOpp(p).d<14?1:0,err=lmGauss()*((1-acc)*.38+press*.1+(1-p.stam)*.08+(B.wx=='Rain'?.03:0));
 const ca=Math.cos(err),sa=Math.sin(err);[ux,uy]=[ux*ca-uy*sa,ux*sa+uy*ca];
 let v,vz=0;if(kind==='loft'){vz=3.1+d/320;const T=2*vz/.22;v=d*.74/T}else{v=Math.min(9.5,d*(1-lmFric())*1.1+.6)}
 const offL=lmOffsideLine(p.team),offs=LM.P.filter(q=>q.team===p.team&&q!==p&&!q.off&&lmIsOff(q,offL));
 b.own=null;b.x=p.x+ux*5;b.y=p.y+uy*4;b.vx=ux*v;b.vy=uy*v;b.vz=vz;b.z=kind==='loft'?1:0;b.last=p;b.lastTeam=p.team;b.pass={from:p,team:p.team,f:LM.f,loft:kind==='loft',offs};b.tgt=target||null;b.shot=null;
 p.cd=14;p.act=kind==='loft'?{st:'kick',t:16,t0:16,n:3,fd:6}:{st:'pass',t:15,t0:15,n:3,fd:5};LM.stats.pa[p.team]++;sfx('kick')}
function lmShoot(p,gx,ay,pw){const b=LM.ball,dx=gx-p.x,dy=ay-p.y,d=Math.hypot(dx,dy)||1,A=p.A;let ux=dx/d,uy=dy/d;
 const fin=(A.finishing*.6+A.shooting*.25+A.composure*.15)/100,press=lmNearestOpp(p).d<14?1:0,err=lmGauss()*((1-fin)*.56+press*.16+(1-p.stam)*.1+(B.wx=="Rain"?.04:0)+(pw>1?(pw-1)*1.6:0)+d/2200);
 const ca=Math.cos(err),sa=Math.sin(err);[ux,uy]=[ux*ca-uy*sa,ux*sa+uy*ca];
 const v=6.4+Math.min(1,pw)*4.4+A.shooting/100*1.4;let vz=.5+Math.min(1,pw)*1.7-fin*.5+lmRand()*.5+(pw>.95?(pw-.95)*24:0)+d/900;
 b.own=null;b.x=p.x+ux*5;b.y=p.y+uy*4;b.vx=ux*v;b.vy=uy*v;b.vz=Math.max(0,vz);b.z=.5;b.last=p;b.lastTeam=p.team;b.pass=null;b.tgt=null;b.shot={team:p.team,by:p,t:0,live:1,gk:0,d0:Math.hypot(gx-p.x,LMP.W/2-p.y)};
 p.cd=16;p.act={st:'shoot',t:22,t0:22,n:4,fd:6};LM.stats.sh[p.team]++;if(p.me){B.st.tr[0]++;B.st.sh++}if(p.team===1)B.st.oa++;sfx('kick');if(!S.rm)LM.shake=6}
// ---------- ball contacts: receptions, interceptions, deflections ----------
function lmContacts(){const b=LM.ball;if(b.own)return;const sp=Math.hypot(b.vx,b.vy);let best=null,bd=99;
 // keepers test the whole path the ball travelled this step, so a fast shot cannot skip past their reach
 if(b.shot&&b.shot.live){const ax=b.x-b.vx,ay=b.y-b.vy,L2=b.vx*b.vx+b.vy*b.vy||1;for(const p of LM.P){if(p.grp!='GK'||p.off||p.cd>0||p.team===b.shot.team||!lmInBox(p))continue;let t=((p.x-ax)*b.vx+(p.y-ay)*b.vy)/L2;t=clamp(t,0,1);const d=Math.hypot(ax+b.vx*t-p.x,ay+b.vy*t-p.y),reach=13+p.gkr/12+(p.dive?7:0);if(d<reach&&b.z<26){lmSave(p);return}}}
 for(const p of LM.P){if(p.off||p.cd>0||p.stun>0&&!p.dive||p.sl>0&&p.team===b.lastTeam||p.dive&&p.grp!='GK')continue;const r=p.grp=='GK'&&lmInBox(p)?(p.dive?17:12):9.5;if(b.z>(p.grp=='GK'&&lmInBox(p)?28:14))continue;const d=Math.hypot(p.x-b.x,p.y-b.y);if(d<r&&d<bd){bd=d;best=p}}
 if(!best)return;const p=best;
 if(p.grp=='GK'&&b.shot&&b.shot.live&&b.shot.team!==p.team){lmSave(p);return}
 const ctrl=clamp(.62+(p.A.ballctl-50)/110-(sp-4.2)*.09-(b.z>4?.15:0),.15,.97);
 if(sp<4.2||lmRand()<ctrl){lmGain(p)}else{b.vx=b.vx*-.25+lmGauss()*1.2;b.vy=b.vy*-.25+lmGauss()*1.2;b.vz=Math.max(b.vz,.8);b.last=p;b.lastTeam=p.team;p.cd=10;if(b.shot&&b.shot.team!==p.team){b.shot.live=0;lmMsg(L(`Blocked by ${p.n}!`,`${p.n} חוסם!`),'#cfe9ff',70)}}}
function lmGain(p){const b=LM.ball,pa=b.pass;
 if(pa&&pa.team===p.team&&pa.from!==p&&pa.offs&&pa.offs.includes(p)){LM.stats.of[p.team]++;sfx('whistle');lmMsg(L(`Offside: ${p.n}`,`נבדל: ${p.n}`),'#ffd0d0',90);lmRestart('fk',1-p.team,p.x,p.y);return}
 if(pa&&pa.from!==p){if(pa.team===p.team){LM.stats.pc[p.team]++;if(pa.from.me)B.st.ok[pa.loft?4:2]++;b.ast={p:pa.from,f:LM.f}}else{LM.stats.it[p.team]++;if(p.me){B.st.tr[3]++;B.st.ok[3]++;B.used[3]=1}}}
 if(b.shot&&b.shot.team!==p.team&&b.shot.live){b.shot.live=0}
 if(b.lastTeam!==p.team)b.ast=null;b.own=p;b.pass=null;b.shot=null;b.tgt=null;b.last=p;b.lastTeam=p.team;p.dec=4+Math.floor(lmRand()*6);p.drx=null;p.dry=null;
 if(p.grp=='GK'&&lmInBox(p)){p.hold=60+Math.floor(lmRand()*40);b.z=8}}
function lmInBox(p){const ox=lmOwnGoalX(p.team);return Math.abs(p.x-ox)<LMP.BOX&&Math.abs(p.y-LMP.W/2)<LMP.BOXW/2}
// ---------- tackles ----------
function lmTackle(d,c,slide){d.tk=34;const dist=lmD(d,c);if(dist>(slide?22:15)){d.stun=slide?40:14;return}
 const behind=((d.x-c.x)*(c.vx)+(d.y-c.y)*(c.vy))<-1&&Math.hypot(c.vx,c.vy)>.8;
 let ps=clamp(.42+(d.A.tackling-c.A.dribbling)/120+(slide?.08:0)-(behind?.18:0)+(d.A.strength-c.A.balance)/400,.1,.86);
 LM.stats.tk[d.team]++;if(d.me){B.st.tr[3]++;B.used[3]=1}if(c.me){B.st.tr[1]++;B.used[1]=1}
 d.act={st:'tackle',t:16,t0:16,n:2,fd:8};
 if(lmRand()<ps){const b=LM.ball;b.own=null;b.vx=(c.vx+(d.x<c.x?1:-1)*-.3)*.4+lmGauss()*1.4;b.vy=c.vy*.4+lmGauss()*1.4;b.last=d;b.lastTeam=d.team;b.pass=null;c.cd=24;c.stun=10;if(d.me)B.st.ok[3]++;sfx('hit');
  if(lmD(d,b)<11&&lmRand()<.65)lmGain(d);if(d.me)lmMsg(L('Clean tackle by Eli!','תיקול נקי של אלי!'),'#7dff9a',70);return}
 d.stun=slide?44:24;if(c.me)B.st.ok[1]++;
 const foul=lmRand()<(slide?.26:.08)+(behind?.22:0)+(d.me&&has('cards')?.05:0);
 if(foul){LM.stats.fo[d.team]++;const card=lmRand()<(behind&&slide?.55:slide?.18:.04);if(card){LM.stats.yc[d.team]++;if(d.me){B.st.yc++;S.hist.yc++;S.trust=clamp(S.trust-2,0,100)}
   d.yc=(d.yc|0)+1;lmMsg(L(`Yellow card: ${d.n}`,`כרטיס צהוב: ${d.n}`),'#ffd24a',110);if(d.yc>=2)lmSendOff(d)}else lmMsg(L(`Foul by ${d.n}`,`עבירה של ${d.n}`),'#ffd0d0',80);
  sfx('whistle');lmRestart('fk',c.team,c.x,c.y)}}
function lmSlide(p){const dir=p.face||[LM.tm[p.team].side,0];p.vx=dir[0]*3.3;p.vy=dir[1]*3.3;p.sl=22;p.act=null;const c=LM.ball.own;
 if(c&&c.team!==p.team){const fx=p.x+dir[0]*14,fy=p.y+dir[1]*14;if(Math.hypot(c.x-fx,c.y-fy)<20){lmTackle(p,c,1);return}}
 LM.stats.tk[p.team]+=0;p.stun=26}
function lmSendOff(p){p.off=1;if(p.me){B.st.red=1;S.hist.rc++;lmMsg(L('Second yellow - RED CARD! Eli is sent off.','צהוב שני - כרטיס אדום! אלי מורחק.'),'#ff6b6b',200)}else lmMsg(L(`RED CARD: ${p.n}`,`כרטיס אדום: ${p.n}`),'#ff6b6b',160);if(LM.ball.own===p)LM.ball.own=null}
// ---------- goalkeepers ----------
function lmKeepers(){const b=LM.ball;for(const p of LM.P){if(p.grp!='GK'||p.off||p.dive)continue;const t=p.team,gx=lmOwnGoalX(t),sd=LM.tm[t].side,cy=LMP.W/2;
  if(b.own===p){p.tx=p.x;p.ty=p.y;p.want=0;if(--p.hold<=0)lmKeeperDistribute(p);continue}
  // shot on its way: dive along the line of the ball
  if(b.shot&&b.shot.live&&b.shot.team!==t&&!b.shot.gk){const vxT=b.vx*sd;if(vxT<-.5){const tt=(p.x-b.x)/b.vx;if(tt>0&&tt<70){const yAt=b.y+b.vy*tt,zAt=b.z+b.vz*tt-.11*tt*tt;
     if(Math.abs(yAt-cy)<LMP.GW/2+14){const need=yAt-p.y,reach=11+p.gkr/11,spd=1.6+p.gkr/100*1.7;
      if(Math.abs(need)>reach*.6&&tt<26&&!p.dove){p.dive={t:24,s:Math.sign(need)};p.vx=0;p.vy=Math.sign(need)*Math.min(spd*1.7,Math.abs(need)/Math.max(6,tt)*1.25);p.dove=1;p.act=null}
      else{p.tx=p.x;p.ty=clamp(yAt,cy-LMP.GW/2-6,cy+LMP.GW/2+6);p.want=spd}continue}}}}
  if(!b.shot)p.dove=0;
  // loose ball in the box: come and claim it
  if(!b.own&&lmInBox({x:b.x,y:b.y,team:t})&&Math.hypot(b.x-p.x,b.y-p.y)<120){const opp=LM.P.filter(q=>q.team!==t&&!q.off).reduce((m,q)=>Math.min(m,lmD(q,b)),999);if(lmD(p,b)<opp+10){const pr=lmPredict(10);p.tx=pr.x;p.ty=pr.y;p.want=lmMaxSpd(p);continue}}
  // positioning: on the line between ball and goal centre
  const dx=b.x-gx,dy=b.y-cy,d=Math.hypot(dx,dy)||1,out=clamp(d*.075,5,24);p.tx=gx+dx/d*out;p.ty=clamp(cy+dy/d*out,cy-LMP.GW/2-4,cy+LMP.GW/2+4);if(Math.sign(p.tx-gx)!==sd)p.tx=gx+sd*5;p.want=lmMaxSpd(p)*.8}}
function lmSave(p){const b=LM.ball,s=b.shot,sh=s.by,sp=Math.hypot(b.vx,b.vy);s.gk=1;
 const far=clamp(((s.d0||150)-110)/400,0,.25),ps=clamp(.73+(p.gkr-(sh?sh.A.finishing:50))/110-Math.max(0,sp-9)*.04+(p.dive?0:.1)+far-(b.z>18?.12:0),.25,.95);
 // only a shot whose path crosses the line inside the frame counts as a save / shot on target
 const gx=lmOwnGoalX(p.team),tl=b.vx?(gx-b.x)/b.vx:999,onT=tl>=0&&tl<120&&Math.abs(b.y+b.vy*tl-LMP.W/2)<LMP.GW/2&&b.z+b.vz*tl-.11*tl*tl<LMP.GH;
 if(lmRand()<ps){if(sh&&sh.me)sh.react=55;if(onT){LM.stats.sv[p.team]++;LM.stats.on[s.team]++;if(sh&&sh.me){B.st.ok[0]++;B.st.on++}}s.live=0;
  if(sp<7.5&&lmRand()<.55+p.gkr/300){b.vx=b.vy=b.vz=0;lmGain(p);lmMsg(onT?L(`Saved and held by ${p.n}`,`${p.n} עוצר ותופס`):L(`${p.n} gathers the ball`,`${p.n} אוסף את הכדור`),'#cfe9ff',80)}
  else{const sd=LM.tm[p.team].side;b.vx=sd*Math.abs(b.vx)*(lmRand()<.45?-.22:.3)+lmGauss();b.vy=(b.y<LMP.W/2?-1:1)*(2.4+lmRand()*2.6);b.vz=1.6;b.last=sh||p;b.lastTeam=p.team;p.cd=20;lmMsg(onT?L(`SAVE! ${p.n} pushes it away`,`הצלה! ${p.n} מרחיק`):L(`${p.n} tips it away`,`${p.n} מסיט את הכדור`),'#cfe9ff',80)}
  sfx('save');return}
 // beaten: the ball carries on (a goal is decided by lmRules when it crosses the line)
 p.cd=30}
function lmKeeperDistribute(p){const t=p.team;let best=null,bs=-9;for(const q of LM.P){if(q.team!==t||q===p||q.off)continue;const d=lmD(p,q),s=lmOpen(q,p)*1.3+lmAx(t,q.x)*.6-(d>480?1:0);if(s>bs){bs=s;best=q}}
 if(best){const d=lmD(p,best);lmKick(p,best.x,best.y,d>260?'loft':'ground',best)}else lmKick(p,lmWx(t,.5),LMP.W/2,'loft',null)}
// ---------- laws: goals, out of play, restarts ----------
function lmRules(){const b=LM.ball,cy=LMP.W/2;
 for(const gx of [0,LMP.L]){const crossed=gx===0?b.x<0:b.x>LMP.L;if(!crossed)continue;
  const inMouth=Math.abs(b.y-cy)<LMP.GW/2&&b.z<LMP.GH;
  // posts: a ball that hits the frame bounces back
  if(Math.abs(Math.abs(b.y-cy)-LMP.GW/2)<2.4&&b.z<LMP.GH||b.z>=LMP.GH&&b.z<LMP.GH+3&&Math.abs(b.y-cy)<LMP.GW/2){b.x=gx===0?1:LMP.L-1;b.vx=-b.vx*.55;b.vy+=lmGauss()*1.2;sfx('hit');lmMsg(L('Off the woodwork!','פגע במשקוף!'),'#ffd96a',80);if(b.shot)b.shot.live=0;return}
  if(inMouth){const scorer=b.last,team=LM.tm[0].side>0?(gx===LMP.L?0:1):(gx===0?0:1);lmGoal(team,scorer);return}
  // over the goal line: corner or goal kick
  const defTeam=lmOwnGoalX(0)===gx?0:1;if(b.shot&&b.shot.team!==defTeam&&b.shot.by&&b.shot.by.me)b.shot.by.react=55; /* a wide shot: hands on head */
  if(b.lastTeam===defTeam){LM.stats.co[1-defTeam]++;lmRestart('corner',1-defTeam,gx===0?2:LMP.L-2,b.y<cy?2:LMP.W-2)}
  else lmRestart('gk',defTeam,gx===0?55:LMP.L-55,cy+(b.y<cy?-60:60));return}
 if(b.y<0||b.y>LMP.W){lmRestart('throw',1-Math.max(0,b.lastTeam),clamp(b.x,10,LMP.L-10),b.y<0?1:LMP.W-1)}}
function lmGoal(team,scorer){const b=LM.ball,own=scorer&&scorer.team!==team;b.vx*=.2;b.vy*=.2;b.vz=0;b.shot=null;
 LM.stats.on[team]+=own?0:1;if(scorer&&scorer.me&&!own){B.st.ok[0]++;B.st.on++}
 let who=scorer?scorer.n:L('a player','שחקן');if(own)who+=L(' (own goal)',' (שער עצמי)');let ast=null;
 if(!own&&b.ast&&b.ast.p&&b.ast.p!==scorer&&b.ast.p.team===team&&LM.f-b.ast.f<540)ast=b.ast.p;
 const m=Math.max(1,Math.ceil(LM.min));if(team===0){B.gf++;if(scorer&&scorer.me&&!own)B.myG++;else if(ast&&ast.me)B.myA++;B.fx=70;B.crowd=1;sfx('goal');lmConfetti()}else{B.ga++;B.st.oc++;B.cfx=60;sfx('groan')}
 B.ev.push({m,us:team===0?1:0,who,ast:ast?ast.n:null});
 LM.goal={team,who,ast:ast?ast.n:null,me:!!(scorer&&scorer.me&&!own),by:scorer};LM.state='goal';LM.stT=0;LM.P.forEach(p=>{p.cel=p.team===team&&!p.off&&p.grp!='GK';p.act=null});
 if(!S.rm)LM.shake=14}
function lmConfetti(){if(S.rm)return;const k=LM.tm[0].kit;for(let i=0;i<60;i++)LM.conf.push({x:240+(lmRand()-.5)*300,y:-10-lmRand()*40,vx:(lmRand()-.5)*2,vy:lmRand()*1.5,c:[k.sh,k.c2,'#ffd24a'][i%3],l:120+lmRand()*60})}
function lmCelebrate(){const g0=LM.goal;if(!g0)return;const sc=g0.by;for(const p of LM.P){if(p.off)continue;if(p.cel){if(p===sc){const cx=lmGoalX(p.team)===0?40:LMP.L-40,cy2=p.y<LMP.W/2?40:LMP.W-40;p.tx=cx;p.ty=cy2;p.want=lmMaxSpd(p)*.9}else if(sc){p.tx=sc.x+(p.fy-.5)*30;p.ty=sc.y+(p.fa-.5)*30;p.want=lmMaxSpd(p)*.8}}else{p.tx=p.x;p.ty=p.y;p.want=0}}}
function lmAfterGoal(){const t=LM.goal?1-LM.goal.team:0;LM.goal=null;LM.P.forEach(p=>p.cel=0);lmKickoffSetup(t);sfx('whistle')}
function lmKickoffPass(k){const mates=LM.P.filter(p=>p.team===k.team&&p!==k&&p.grp!='GK'&&!p.off).sort((a,b)=>lmD(a,k)-lmD(b,k)),q=mates[0];LM.state='play';LM.stT=0;
 if(k.me){const dir=lmEliDir();lmKick(k,k.x+dir[0]*90,k.y+dir[1]*90,'ground',null);B.st.tr[2]++;B.used[2]=1}else if(q)lmKick(k,q.x,q.y,'ground',q)}
function lmRestart(kind,team,x,y){const b=LM.ball;Object.assign(b,{x,y,z:0,vx:0,vy:0,vz:0,own:null,pass:null,shot:null,tgt:null});b.lastTeam=team;
 let taker;const cand=LM.P.filter(p=>p.team===team&&!p.off);if(kind==='gk')taker=cand.find(p=>p.grp=='GK');if(!taker)taker=cand.filter(p=>p.grp!='GK').sort((a,c)=>lmD(a,b)-lmD(c,b))[0];
 LM.rs={kind,team,x,y,taker,t:0};LM.state='restart';LM.stT=0;
 if(kind==='corner')lmMsg(L(`Corner to ${lmTeamNm9(team)}`,`קרן ל${lmTeamNm9(team)}`),'#ffffff',90);else if(kind==='throw')lmMsg(L('Throw-in','זריקת חוץ'),'#ffffff',50);else if(kind==='gk')lmMsg(L('Goal kick','בעיטת שער'),'#ffffff',60)}
function lmRestartStep(){const r=LM.rs;if(!r)return;r.t++;const tk=r.taker,b=LM.ball;b.x=r.x;b.y=r.y;
 if(tk){const sd=LM.tm[r.team].side;tk.tx=r.x-(r.kind==='throw'?0:sd*7);tk.ty=r.y+(r.kind==='throw'?(r.y<5?-4:4):0);tk.want=lmMaxSpd(tk);if(lmD(tk,{x:tk.tx,y:tk.ty})>40&&r.t<10){tk.x=tk.tx;tk.y=tk.ty}}
 // everyone else takes up shape; at corners the attackers crowd the box and defenders mark
 lmAI();if(tk){tk.tx=r.x;tk.ty=r.y}
 if(r.kind==='corner'){const gx=lmGoalX(r.team),sd=LM.tm[r.team].side;let i=0;for(const p of LM.P){if(p.off||p===tk||p.grp=='GK')continue;if(p.team===r.team&&p.grp!='DF'){p.tx=gx-sd*(40+(i%3)*30);p.ty=LMP.W/2+((i%4)-1.5)*36;i++}else if(p.team!==r.team&&p.grp=='DF'){p.tx=gx-sd*(28+(i%2)*20);p.ty=LMP.W/2+((i%5)-2)*30;i++}}}
 if(tk&&!tk.me&&r.t>70)lmTakeRestart('pass');else if(tk&&tk.me&&r.t>480)lmTakeRestart('pass')}
function lmTakeRestart(a){const r=LM.rs;lmTakeRestart0(a,r);const b=LM.ball;if(b.pass&&r&&r.kind!=='fk')b.pass.offs=null} // no offside from throw-ins, corners or goal kicks
function lmTakeRestart0(a,r){const tk=r.taker;LM.state='play';LM.stT=0;LM.rs=null;if(!tk)return;tk.x=r.x;tk.y=r.y;const b=LM.ball;b.own=null;
 if(tk.me){if(a==='shoot'&&r.kind==='fk'){lmEliShoot(.7);return}if(r.kind==='corner'){const gx=lmGoalX(tk.team);lmKick(tk,gx-LM.tm[tk.team].side*(50+lmRand()*40),LMP.W/2+lmGauss()*40,'loft',null);B.st.tr[4]++;B.used[4]=1;return}lmEliPass(a==='through'?1:0);return}
 if(r.kind==='corner'){const gx=lmGoalX(tk.team),tgt=LM.P.filter(p=>p.team===tk.team&&p!==tk&&!p.off&&Math.abs(p.x-gx)<170).sort((p,q)=>(q.A.heading||50)-(p.A.heading||50))[0];lmKick(tk,tgt?tgt.x:gx-LM.tm[tk.team].side*70,tgt?tgt.y:LMP.W/2,'loft',tgt||null);return}
 if(r.kind==='fk'&&Math.hypot(lmGoalX(tk.team)-r.x,LMP.W/2-r.y)<230){const gx=lmGoalX(tk.team);lmShoot(tk,gx,LMP.W/2+(lmRand()<.5?-1:1)*(LMP.GW/2-8),.8);return}
 let best=null,bs=-9;for(const q of LM.P){if(q.team!==tk.team||q===tk||q.off||q.grp=='GK')continue;const d=lmD(tk,q),s=lmOpen(q,tk)-d/500+(r.kind==='gk'?lmAx(tk.team,q.x)*.5:0);if(d>30&&s>bs){bs=s;best=q}}
 if(best){const d=lmD(tk,best);lmKick(tk,best.x,best.y,d>280||r.kind==='gk'?'loft':'ground',best)}}
// ---------- camera: follows the ball, biased towards Eli, never leaves the stadium ----------
function lmCamera(){const b=LM.ball,e=LM.eli&&!LM.eli.off?LM.eli:null;let tx=b.x,ty=b.y-b.z*LMP.ZP;if(e){tx=tx*.72+e.x*.28;ty=ty*.72+e.y*.28}
 if(LM.state==='restart'&&LM.rs){tx=LM.rs.x;ty=LM.rs.y}
 const c=LM.cam,k=LM.state==='kick'?.2:.085;c.x+=(tx-c.x)*k;c.y+=(ty-c.y)*k;c.x=clamp(c.x,240-LMP.M,LMP.L+LMP.M-240);c.y=clamp(c.y,160-LMP.M,LMP.W+LMP.M-160)}
// ---------- pause menu, simulate rest, end of match ----------
function lmPause(){if(!LM||LM.state==='ft')return;sfx('open');const items=[L('Resume','המשך'),L('Controls','שליטה'),L('Tactics','טקטיקה'),L('Simulate the rest of the match','דמה את המשך המשחק')];
 mk(items,i=>{if(i==1)lmControlsDlg();if(i==2)lmTacMenu();if(i==3)mk([L('Yes - simulate','כן - לדמות'),L('No','לא')],j=>{if(j==0)lmSimRest()},L('The rest is decided by team strength. Continue?','ההמשך יוכרע לפי כוח הקבוצות. להמשיך?'))},L('MATCH PAUSED','המשחק מושהה'));menu.back=()=>{};}
function lmTacMenu(){mk([L('Formation: ','מערך: ')+S.fm,L('Style: ','סגנון: ')+tr(S.tac),L('Back','חזרה')],i=>{if(i==0)mk(Object.keys(FM),j=>{S.fm=Object.keys(FM)[j];lmApplyFm(0,S.fm);save();lmTacMenu()},L('FORMATION','מערך'));if(i==1)mk(Object.keys(TAC).map(t=>tr(t)),j=>{S.tac=Object.keys(TAC)[j];LM.tm[0].tac=S.tac;save();lmTacMenu()},L('TACTICS','טקטיקה'))},L('TACTICS','טקטיקה'));menu.back=()=>{}}
function lmApplyFm(team,fm){const slots=FMPOS[fm]||FMPOS['4-3-3'],lay=fm.split('-').map(Number),counts=[1,lay[0],lay.slice(1,-1).reduce((a,v)=>a+v,0),lay[lay.length-1]],grpN=['GK','DF','MF','FW'];
 // re-slot the same eleven into the new shape (keeps each player's line where possible)
 const ps=LM.P.filter(p=>p.team===team&&!p.off).sort((a,b)=>['GK','DF','MF','FW'].indexOf(a.grp)-['GK','DF','MF','FW'].indexOf(b.grp)||a.fy-b.fy);let si=0,k=0;
 for(let gi=0;gi<4;gi++)for(let c=0;c<counts[gi];c++){const p=ps[k++];const sl=slots[si++];if(!p||!sl)continue;p.grp=gi==0?'GK':p.grp=='GK'?'DF':grpN[gi];p.fa=1-sl[1];p.fy=sl[0]}LM.tm[team].fm=fm}
function lmSimRest(){const end=B.e.cup&&B.gf==B.ga?90:90,sa=cstr(S.club),sb=B.oc?cstr(B.oc.id):sa,lu=1.3*Math.exp((sa-sb)/28),lt=1.3*Math.exp((sb-sa)/28);LM.simmed=1;
 const sqU=sq(S.club).filter(p=>!(p.inj>0)),sqT=B.oc?sq(B.oc.id):[];
 for(let m=Math.ceil(LM.min);m<end;m+=5){if(lmRand()<lu*5/90){B.gf++;const p=rnd(sqU.filter(x=>x.pos!='GK'))||null;B.ev.push({m:Math.min(m+2,end),us:1,who:p?nm(p.n):L('a teammate','חבר לקבוצה'),sim:1})}if(lmRand()<lt*5/90){B.ga++;const p=rnd(sqT.filter(x=>x.pos!='GK'))||null;B.ev.push({m:Math.min(m+2,end),us:0,who:p?nm(p.n):B.e.n,sim:1})}}
 LM.min=end;B.min=end;LM.half=2;LM.state='ft';LM.stT=0;lmMsg(L('Rest of the match simulated','המשך המשחק דומה'),'#cfe9ff',200)}
function lmEnd(){if(!LM||LM.ended)return;
 if(B.e.cup&&B.gf==B.ga&&!B.et&&!LM.simmed){LM.state='et';LM.stT=0;B.et=1;return}
 LM.ended=1;const s=LM.stats;B.st.team={of:s.of.slice(),pos:s.pos.slice(),sh:s.sh.slice(),on:s.on.slice(),pa:s.pa.slice(),pc:s.pc.slice(),tk:s.tk.slice(),it:s.it.slice(),fo:s.fo.slice(),co:s.co.slice(),sv:s.sv.slice(),yc:s.yc.slice(),simmed:LM.simmed};
 B.min=B.et?120:90;sfx('whistle');
 if(B.e.cup&&B.gf==B.ga){const fin=r=>{LM=null;endOfficial(r,1)};penalties(fin);return}
 const r=Math.sign(B.gf-B.ga);LM=null;endOfficial(r,0)}
