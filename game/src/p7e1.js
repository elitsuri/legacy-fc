// ===================== VISUAL REBIRTH: Match Engine 3.0 (real 90-minute matches, honest stats) =====================
var MOVEN=[['Shot','בעיטה'],['Dribble','כדרור'],['Through Pass','מסירת עומק'],['Press','לחץ'],['Cross','הגבהה'],['Risk','סיכון']];
function clubColsN(n){let h=7;for(const ch of n)h=(h*31+ch.charCodeAt(0)*17)>>>0;h=((h^h>>>13)*2654435761)>>>0;return[hsl2hex(h%360,.62,.42),hsl2hex((h>>>9)%360,.7,.62)]}
function oppClub(e){return S.W.clubs.find(c=>nm(c.n)==e.n)||null}
function battle(e,txt0,done){S.en=Math.max(0,S.en-6);const off=!!(e.lg||e.cup);if(off){e.mhp=Math.round(e.mhp*1.6);e.hp=e.mhp}
 Tr={f:0,cb:()=>{const oc=oppClub(e);B={e,off,oc,min:0,gf:0,ga:0,pmax:Math.round(S.mhp*1.6),ph:0,dh:e.mhp,dp:off?0:S.hp,slide:60,sk:0,pk:0,fl:[],mo:0,used:{},last:0,wx:wxNow(),st:{tr:[0,0,0,0,0,0],ok:[0,0,0,0,0,0],sh:0,on:0,yc:0,red:0,oa:0,oc:0},ev:[],ht:0,et:0,an:null,fx:0,cfx:0,myG:0,myA:0,done,flash:0,crowd:0};B.ph=B.pmax;B.dp=off?B.ph:S.hp;
  if(off){sfx('whistle');say((txt0?[`${e.n}: "${txt0}"`]:[]).concat([L(`Kick-off! ${nm(mine().n)} vs ${e.n} · ${wxName(B.wx)}`,`שריקת פתיחה! ${nm(mine().n)} נגד ${e.n} · ${wxName(B.wx)}`)]),()=>cmd(done))}
  else say(txt0?`${e.n}: "${txt0}"`:L(`${e.n} challenges you to a 1v1 duel!`,`${e.n} מזמין אותך לדו-קרב 1 על 1!`),()=>cmd(done))}}}
function cmd(done){const off=B.off,items=MOVEN.map(m=>nm(m)).concat([off?L('Tactics','טקטיקה'):L('Run','בריחה')]);mk(items,i=>{
 if(i==6){if(off){mk(Object.keys(TAC).map(t=>tr(t)+(t==S.tac?' ✓':'')),j=>{S.tac=Object.keys(TAC)[j];save();say(L(`New instructions: ${S.tac}.`,`הוראות חדשות: ${tr(S.tac)}.`),()=>cmd(done))},L('TACTICS','טקטיקה'));return}if(B.e.trainer){say(L('No running from this one!','אין בריחה מהמשחק הזה!'),()=>cmd(done));return}B=null;return}
 act(i,done)},L('What will you do?','מה תעשה?'),1);menu.cols=4}
function act(i,done){const mvv=MOVES[i],A=S.att,at=(A[MA[i][0]]+A[MA[i][1]])/2,pm=[],ef=.75+.25*S.en/100,fm=FM[S.fm],tc=TAC[S.tac],e=B.e,off=B.off,st=B.st,mn=nm(MOVEN[i]);
 const acc=mvv[2]+S.boots*2+S.ball*2+(A.composure-40)/10+(i==2?(chemAvg()-50)/12:0)+(B.wx=='Rain'&&i<3?-6:0)+(B.wx=='Windy'&&(i==0||i==4)?-5:0)+(B.wx=='Hot'?-(1-S.en/100)*4:0)+(e.home?-2:3)+(i==5&&S.pers=='Risk Taker'?8:0)+(S.pers=='Calm'?2:0)+(S.form-60)/20+(off&&B.min>=80&&B.ga>=B.gf&&S.pers=='Competitive'?4:0);
 B.used[i]=1;st.tr[i]++;if(i==0||i==5||i==4)st.sh++;sfx('kick');
 if(off){const m0=B.min;B.min+=ri(Math.random,8,13)+(B.et?-3:0);if(!B.ht&&m0<45&&B.min>=45){B.ht=1}}
 const mm=off?Math.min(B.min,B.et?120:90)+"' ":'';let scored=false;
 if(Math.random()*100<acc){st.ok[i]++;if(i==0||i==5||i==4)st.on++;
  const bn=S.arch=='Finisher'&&i==0||S.arch=='Playmaker'&&i==2||S.arch=='Speedster'&&i==1?3:0,tb=(cstr(S.club)-50)/20,d=Math.max(1,Math.round(dmg(mvv[1]*(.55+at/100)*tc.m[i],(S.atk+S.boots*2+S.ball*2+tb+bn)*ef*fm.a,e.df)*(1+.08*B.mo)));
  e.hp=Math.max(0,e.hp-d);B.mo=Math.min(3,B.mo+1);B.last=i;B.sk=20;sfx('hit');B.fl.push({t:'-'+d,x:330,y:96,l:50,c:'#ffd24a'});
  if(e.hp<=0&&off){scored=true;B.gf++;const mate=rnd(tmates()),me=[0,1,3,5].includes(i),who=me?L('Eli','אלי'):(mate?nm(mate.n):L('a teammate','חבר לקבוצה'));if(me)B.myG++;else B.myA++;B.ev.push({m:Math.min(B.min,B.et?120:90),us:1,who,ast:me?null:L('Eli','אלי')});e.hp=e.mhp;B.mo=0;B.fx=70;B.crowd=1;sfx('goal');
   pm.push(mm+L(`${mn}... GOAL! ${who} scores${me?'':' - assist Eli'}! (${B.gf}-${B.ga})`,`${mn}... גול! ${who} כובש${me?'':' - בישול של אלי'}! (${B.gf}-${B.ga})`));B.an={k:i,t:0,d:40,res:'goal'}}
  else if(e.hp<=0){B.an={k:i,t:0,d:36,res:'goal'};B.fx=60;win(pm,done);return}
  else{pm.push(mm+L(`${mn}! The defence is stretched (-${d}).`,`${mn}! ההגנה נמתחת (-${d}).`));B.an={k:i,t:0,d:32,res:i==0||i==5||i==4?'save':'beat'};if(i==0||i==5)sfx('save')}}
 else{B.mo=0;B.miss=1;pm.push(mm+L(`${mn}... ${i==2||i==4?'intercepted':i==3?'beaten to the ball':'off target'}.`,`${mn}... ${i==2||i==4?'יורט':i==3?'הפסיד בקרב על הכדור':'מחוץ למסגרת'}.`));B.an={k:i,t:0,d:30,res:i==2||i==4||i==3?'int':'wide'}}
 if(i==3&&Math.random()<.06*(1+has('cards'))){S.hist.yc++;st.yc++;S.trust=clamp(S.trust-2,0,100);if(st.yc>=2){st.red=1;S.hist.rc++;pm.push(L('Second yellow - RED CARD! You are sent off.','צהוב שני - כרטיס אדום! הורחקת.'))}else pm.push(L('Yellow card!','כרטיס צהוב!'))}
 if(S.tac&&TAC[S.tac].en)S.en=Math.max(0,S.en-1);
 if(!off){if(e.hp<=0){win(pm,done);return}const ed=Math.max(1,Math.round(dmg(24,e.atk,S.df)*fm.d*tc.dm*(e.rv?1.1:1)));S.hp=Math.max(0,S.hp-ed);B.mo=0;B.pk=20;B.fl.push({t:'-'+ed,x:120,y:150,l:50,c:'#ff6b6b'});pm.push(L(`${e.n} counters (-${ed}).`,`${tr(e.n)} מתקיף חזרה (-${ed}).`));
  if(S.hp<=0){pm.push(L('You are exhausted... back to the club!','אתה מותש... חוזר למועדון!'));say(pm.join('\n'),()=>{B=null;S.x=door('hq')[0];S.y=door('hq')[1]+1;fixPos();heal()});return}
  say(pm.join('\n'),()=>cmd(done));return}
 // official match: opponent phase
 if(!scored&&!st.red)oppPhase(pm,mm);
 if(st.red){redOut(pm);return}
 const end=B.et?120:90;if(B.min>=end){fullTimeFlow(pm);return}
 if(B.ht==1){B.ht=2;pm.push(L(`HALF TIME: ${B.gf}-${B.ga}.`,`מחצית: ${B.gf}-${B.ga}.`));sfx('whistle')}
 say(pm.join('\n'),()=>cmd(done))}
function oppPhase(pm,mm){const e=B.e,fm=FM[S.fm],tc=TAC[S.tac],st=B.st;st.oa++;const p=clamp(.6+(e.atk-S.df)*.02-B.mo*.06+(B.miss?.1:0)+(tc.dm<1?-.08:0)+(e.home?.04:-.02),.25,.9);B.miss=0;
 if(Math.random()<p){st.oc++;const ed=Math.max(1,Math.round(dmg(24,e.atk,S.df)*fm.d*tc.dm*(e.rv?1.1:1)));B.ph=Math.max(0,B.ph-ed);B.pk=18;B.fl.push({t:'-'+ed,x:380,y:196,l:50,c:'#ff6b6b'});
  if(B.ph<=0){B.ga++;const sqd=B.oc?sq(B.oc.id):[],sc=sqd.length?nm(rnd(sqd.filter(x=>['ST','LW','RW','AM','CM'].includes(x.pos)).concat(sqd).slice(0,8)).n):e.n;B.ev.push({m:Math.min(B.min,B.et?120:90),us:0,who:sc});B.ph=B.pmax;B.cfx=60;sfx('groan');pm.push(L(`${e.n} strike back... GOAL for them - ${sc}. (${B.gf}-${B.ga})`,`${tr(e.n)} מגיבים... גול שלהם - ${sc}. (${B.gf}-${B.ga})`))}
  else pm.push(L(`${e.n} attack - your defence is under pressure (-${ed}).`,`${tr(e.n)} תוקפים - ההגנה שלך תחת לחץ (-${ed}).`))}
 else pm.push(L(`${e.n} attack - your defence holds.`,`${tr(e.n)} תוקפים - ההגנה שלך מחזיקה.`))}
function redOut(pm){const end=B.et?120:90;while(B.min<end){B.min+=15;if(Math.random()<.3){B.ga++;B.ev.push({m:Math.min(B.min,end),us:0,who:B.e.n})}else if(Math.random()<.1){B.gf++;B.ev.push({m:Math.min(B.min,end),us:1,who:L('a teammate','חבר לקבוצה')})}}pm.push(L(`Your team plays on with ten men. Final score: ${B.gf}-${B.ga}.`,`הקבוצה ממשיכה בעשרה. תוצאה סופית: ${B.gf}-${B.ga}.`));fullTimeFlow(pm)}
function fullTimeFlow(pm){sfx('whistle');if(B.e.cup&&B.gf==B.ga&&!B.et){B.et=1;pm.push(L(`90' - ${B.gf}-${B.ga}. EXTRA TIME!`,`90' - ${B.gf}-${B.ga}. הארכה!`));say(pm.join('\n'),()=>cmd(B.done));return}
 if(B.e.cup&&B.gf==B.ga){pm.push(L(`120' - still level. PENALTIES!`,`120' - עדיין שוויון. פנדלים!`));say(pm.join('\n'),()=>penalties(r=>endOfficial(r,1)));return}
 pm.push(L(`FULL TIME: ${B.gf}-${B.ga}`,`סיום: ${B.gf}-${B.ga}`));say(pm.join('\n'),()=>endOfficial(Math.sign(B.gf-B.ga),0))}
function endOfficial(r,pens){const b=B,e=b.e,st=b.st,c=S.ct||{gb:0,ab:0,pb:0},h=S.hist,pm=[],k=r>0?1.2:r==0?.75:.4,xp=Math.round((e.lvl*12+10)*k*(1+has('xp')*.1)),cash=Math.round((e.lvl*15+10)*regC().rw*(r>0?1:r==0?.5:.25)),fl=Math.round((e.lvl*2+6)*(r>0?1:r==0?.5:.2)*(1+has('fan')*.25));
 S.money+=cash+c.pb;S.fx.i+=cash+c.pb;S.fol+=fl;h.m++;if(h.m==1)debut();h.min+=b.et?120:90;S.sm++;
 if(b.myG){h.g+=b.myG;S.sg+=b.myG;S.money+=c.gb*b.myG;S.fx.i+=c.gb*b.myG}if(b.myA){h.a+=b.myA;S.sa+=b.myA;S.money+=c.ab*b.myA;S.fx.i+=c.ab*b.myA}
 if(r>0){S.goals++;inc('win');S.form=clamp(S.form+6,0,100);S.mor=clamp(S.mor+4,0,100);S.rep.fb=clamp(S.rep.fb+1,0,100);S.rep.fan=clamp(S.rep.fan+.5,0,100);S.trust=clamp(S.trust+(4+b.myG*2)*(1+has('trust')*.3),0,100);tmates().forEach(p=>S.chem[p.id]=clamp(S.chem[p.id]+2,0,100))}
 else if(r==0){S.form=clamp(S.form+1,0,100);S.trust=clamp(S.trust+1+b.myG,0,100)}else{S.form=clamp(S.form-8,0,100);S.mor=clamp(S.mor-6,0,100);S.trust=clamp(S.trust-3+b.myG,0,100)}
 MA.forEach((a,i)=>{if(b.used[i])train(a,.15)});if(e.rv)rvRec(r>0);
 if(b.myG>=3){banner={t:170,s:L('HAT-TRICK!','שלושער!'),s2:L(`${b.myG} goals vs ${e.n}`,`${b.myG} שערים מול ${e.n}`)};news(`Eli scores a hat-trick against ${e.n}`,`אלי כובש שלושער מול ${e.n}`);post('goal','Hat-trick! Unforgettable night.','שלושער! ערב בלתי נשכח.');S.hist.tl.push([S.day,'Hat-trick vs '+e.n,'שלושער מול '+e.n])}
 else if(b.myG)post('goal',`Scored vs ${e.n}. Thank you fans!`,`כבשתי מול ${e.n}. תודה לאוהדים!`);
 if(r!=0||b.myG)news(`${nm(mine().n)} ${b.gf}-${b.ga} ${e.n}${b.myG?' (Eli '+b.myG+')':''}`,`${nm(mine().n)} ${b.gf}-${b.ga} ${e.n}${b.myG?' (אלי '+b.myG+')':''}`);
 addXP(xp,pm);let cupMsg=null;
 if(e.lg)matchday(r);
 if(e.cup&&S.cup){if(r>0){S.cup.r++;cupMsg=S.cup.r>=3?L('CUP WINNERS!','זוכים בגביע!'):L(['Through to the semi-final!','Through to the final!'][S.cup.r-1]||'Through!',['עלינו לחצי הגמר!','עלינו לגמר!'][S.cup.r-1]||'עלינו!');if(S.cup.r>=3){S.tro++;S.hist.tro.push(['Cup S'+S.season,'גביע ע'+S.season]);S.cup.out=1;banner={t:170,s:L('CUP WINNERS','זוכי הגביע'),s2:''};sfx('troph');S.money+=800*S.season;S.fol+=60;news('Eli lifts the cup!','אלי מניף את הגביע!');post('trophy','Cup winners!','זוכים בגביע!')}}else{S.cup.out=1;cupMsg=L('Knocked out of the cup.','הודחנו מהגביע.')}}
 chkMS();save();const snap=JSON.parse(JSON.stringify({gf:b.gf,ga:b.ga,ev:b.ev,st:b.st,myG:b.myG,myA:b.myA,et:b.et,wx:b.wx,n:e.n,cup:!!e.cup}));
 const tt=st.tr.reduce((a,v)=>a+v,0),tk=st.ok.reduce((a,v)=>a+v,0),rating=clamp(6+b.myG*1.1+b.myA*.75+(tt?(tk/tt-.6)*2.2:0)+(r>0?.4:r<0?-.4:0)-st.yc*.3-st.red*1.5,3,10);
 (S.hist.rts=S.hist.rts||[]).push(+rating.toFixed(1));if(S.hist.rts.length>60)S.hist.rts.shift();
 B=null;fullTime2({s:snap,r,pens,xp,cash:cash+c.pb+c.gb*snap.myG+c.ab*snap.myA,fl,rating,cupMsg,pm});injChk()}
function playLeague(){if(playCheck())return;if(S.md>=S.cfg.len)return;const oc=cb(S.ord[S.md%S.ord.length]),starts=Math.random()<startP();S.en-=20;adv(1);
 if(!starts){const r=sim2(S.club,oc.id),pm=[L(`The manager keeps you on the bench (trust ${Math.round(S.trust)}). ${nm(oc.n)}: ${r==1?'win':r==0?'draw':'loss'}.`,`המאמן משאיר אותך על הספסל (אמון ${Math.round(S.trust)}). ${nm(oc.n)}: ${r==1?'ניצחון':r==0?'תיקו':'הפסד'}.`)];S.hist.m++;S.hist.min+=22;S.trust=clamp(S.trust-1,0,100);addXP(8,pm);say(pm,()=>matchday(r));return}
 const o=enemyOf(clamp(S.lvl+Math.round((cstr(oc.id)-cstr(S.club))/6),1,99),nm(oc.n));o.trainer=1;o.lg=1;o.home=S.md%2==0;o.rv=S.rival!=null&&S.W.np.some(x=>x.id==S.rival&&x.club==oc.id)?1:0;
 preMatch(o,oc,'League',()=>battle(o,o.rv?L('Your rival is in our squad. No mercy!','היריב שלך בסגל שלנו. בלי רחמים!'):L('Welcome to our stadium!','ברוכים הבאים לאצטדיון שלנו!'),null))}
function playCup(){if(playCheck())return;if(!S.cup)S.cup={r:0,out:0};if(S.cup.out){say(L('You are out of the cup this season.','הודחת מהגביע העונה.'));return}const oc=rnd(S.W.clubs.filter(c=>c.id!=S.club)),r=S.cup.r;S.en-=20;adv(1);
 const o=enemyOf(clamp(S.lvl+r*2+Math.round((cstr(oc.id)-cstr(S.club))/6),1,99),nm(oc.n));o.trainer=1;o.cup=1;o.home=Math.random()<.5;preMatch(o,oc,'Cup',()=>battle(o,[L('Cup quarter-final!','רבע גמר הגביע!'),L('Cup semi-final!','חצי גמר הגביע!'),L('CUP FINAL!','גמר הגביע!')][Math.min(r,2)],null))}
// ---------- penalty shootout ----------
var PEN=null;
function penalties(cb2){PEN={r:0,us:[],them:[],turn:'us',p:0,d:1,s:.024,w:.13,cx:.2+Math.random()*.6,msg:'',wait:0,cb:cb2,kd:0,done:0};scr={t:'',l:[],o:0,draw:drawPens,key:k=>{if(k=='enter'||k=='z'||k==' ')penShoot()},click:()=>penShoot()}}
function penShoot(){const P=PEN;if(!P||P.turn!='us'||P.wait>0||P.done)return;const a=Math.max(0,1-Math.abs(P.p-P.cx)/.32),comp=(S.att?S.att.composure:40)/100,ok=a>.5||Math.random()<a*.5+comp*.25;P.us.push(ok?1:0);P.kd=ok?1:-1;P.msg=ok?L('SCORED!','גול!'):L('SAVED!','נהדף!');sfx(ok?'goal':'save');P.turn='them';P.wait=60}
function penStep(){const P=PEN;if(P.wait>0){P.wait--;if(P.wait==0){if(P.done){const res=P.us.reduce((a,v)=>a+v,0)>P.them.reduce((a,v)=>a+v,0)?1:-1,cb2=P.cb;scr=null;PEN=null;cb2(res);return}if(P.turn=='them'){const sc=Math.random()<.72;P.them.push(sc?1:0);P.kd=sc?2:-2;P.msg=sc?L('They score.','הם כובשים.'):L('Our keeper saves!','השוער שלנו הודף!');sfx(sc?'groan':'goal');P.turn='us';P.r++;P.cx=.15+Math.random()*.7;P.s+=.002;const us=P.us.reduce((a,v)=>a+v,0),th=P.them.reduce((a,v)=>a+v,0),n=P.us.length;if((n>=5&&us!=th)||(n<5&&(us+5-n<th||th+5-n<us))){P.done=1;P.msg=us>th?L('YOU WIN THE SHOOTOUT!','ניצחתם בפנדלים!'):L('Lost on penalties.','הפסד בפנדלים.');P.wait=110}else P.wait=0}}return}
 if(P.turn=='us'&&!P.done){P.p+=P.d*P.s;if(P.p>1){P.p=1;P.d=-1}if(P.p<0){P.p=0;P.d=1}}}
