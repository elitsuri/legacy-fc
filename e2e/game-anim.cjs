// Character animation checks (p10j): the new poses draw and differ from standing still, a foul knocks the fouled player down and
// he gets up, the throw-in taker holds the ball over his head and throws it, a keeper holding the ball shows it at his chest,
// room staff turn towards Eli and the gym trainer warms up. The animation layer must not change the match: the same seeded
// match is played with the layer on and off and must end in exactly the same state.
// usage: CHROME_PATH=... node game-anim.cjs /abs/path/to/frontend/public/game/index.html [shots]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],SHOTS=process.argv[3]==='shots';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewport({width:960,height:660,deviceScaleFactor:1.5});await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;setLang('en',1);if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();
 window.PRNG=s=>function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 // the match engine draws all its randomness through lmRand/lmGauss; they get their own seeded stream, apart from cosmetic randomness
 window.SEED=s=>{Math.random=PRNG(s);const m=PRNG(s*31+7);lmRand=m;lmGauss=()=>(m()+m()+m()-1.5)/1.5};
 window.START=()=>{S.t=1;S.lmTut=1;S.en=100;S.md=0;window.startP=()=>1;Tr=null;LM=null;B=null;playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}for(let i=0;i<40&&!LM;i++){logicStep();if(Tr){const c=Tr.cb;Tr=null;c()}}if(Tr){const c=Tr.cb;Tr=null;if(c)c()}return!!LM&&!Tr}});
const shot=async n=>{if(!SHOTS)return;await wait(120);await (await p.$('canvas')).screenshot({path:path.join(OUT,'anim-'+n+'.png')});console.log('saved anim-'+n)};
// 1. every new pose draws something of its own (not the standing sprite)
let r=await p.evaluate(()=>{const o=Object.assign(plOpts(),{out:'kit',sh:'#e33',pa:'#1b2240',num:'9'}),pic=(d,st,f)=>actorSpr8(o,d,st,f,3).toDataURL();const idle=pic('d','idle',0),idleR=pic('r','idle',0);
 const L=[['d','dive',0],['d','dive',1],['d','fall',0],['d','fall',1],['r','getup',0],['r','getup',1],['u','throw',0],['r','throw',0],['r','throw',1],['d','catch',0],['d','jack',0],['d','stretch10',0]];
 const same=L.filter(([d,st,f])=>pic(d,st,f)===(d==='r'?idleR:idle)).map(x=>x.join(' '));const w2=pic('r','walk',2)!==pic('r','walk',6);return{n:L.length,same,walk:w2,frames:['dive','fall','getup','throw','catch','jack'].every(k=>ACT8N[k]===2)}});
ok('new poses draw their own sprites (dive, fall, get up, throw-in, keeper catch, warm-ups)',r.same.length===0&&r.frames&&r.walk,JSON.stringify(r));
// 2. a foul knocks the fouled player down; he falls, lies, gets up, then plays on
r=await p.evaluate(()=>{SEED(7);if(!START())return{err:'no match'};const P=LM.P.filter(q=>!q.off&&q.grp!='GK'),d=P.find(q=>q.team===1),c=P.find(q=>q.team===0&&!q.me);c.x=d.x+6;c.y=d.y;
 const seq=[.99,0,.99],rr=lmRand;lmRand=()=>seq.length?seq.shift():.5;const fo=LM.stats.fo[1];lmTackle(d,c,false);lmRand=rr;const foul=LM.stats.fo[1]>fo,set=!!c.fall10;
 const ph=[];let rot=0;const r0=rot10;rot10=function(){rot++;return r0.apply(this,arguments)};for(let i=0;i<60;i++){logicStep();if(c.fall10)ph.push(fallPh10(c.fall10));else ph.push('up');if(i%4==0)lmDraw()}rot10=r0;
 const seen=[...new Set(ph)];return{foul,set,seen,rot,end:ph[ph.length-1],stGetup:ph.includes('getup')}});
ok('a foul knocks the fouled player down: falls, lies, gets up, plays on',r.foul&&r.set&&['falling','lying','getup','up'].every(k=>r.seen.includes(k))&&r.rot>3&&r.end==='up',JSON.stringify(r));
// 3. throw-in: ball over the head while waiting, a two-handed throw when it is taken
r=await p.evaluate(()=>{SEED(11);if(!START())return{err:'no match'};lmRestart('throw',0,LMP.L*.4,1);const tk=LM.rs.taker;let held=0,holder=0,thrown=0,ballUp=0;
 for(let i=0;i<400&&(LM.rs||tk.act);i++){logicStep();if(tk.st==='throw'&&tk.f===0&&LM.rs){held++;if(ballHolder10()===tk)holder++}if(tk.act&&tk.act.st==='throw')thrown++;if(i%3==0)lmDraw()}
 return{taker:tk.n,held,holder,thrown,rsLeft:!!LM.rs}});
ok('throw-in: the taker holds the ball over his head, then throws with both hands',r.held>3&&r.holder>3&&r.thrown>3&&!r.rsLeft,JSON.stringify(r));
if(SHOTS){await p.evaluate(()=>{SEED(11);START();lmRestart('throw',0,LMP.L*.4,1);for(let i=0;i<200&&LM.rs&&!(LM.rs.taker.st==='throw');i++)logicStep();LM.cam.x=LM.rs.taker.x;LM.cam.y=LM.rs.taker.y+60;lmDraw()});await shot('throwin')}
// 4. a keeper with the ball in his hands holds it at his chest
r=await p.evaluate(()=>{SEED(3);if(!START())return{err:'no match'};const gk=LM.P.find(q=>q.grp=='GK'&&q.team===1),bl=LM.ball;gk.x=lmOwnGoalX(1)+(lmOwnGoalX(1)>500?-20:20);gk.y=LMP.W/2;gk.vx=gk.vy=0;gk.act=null;bl.own=gk;bl.x=gk.x;bl.y=gk.y;bl.z=0;anim10Match();
 const st=gk.st,h=ballHolder10()===gk;LM.cam.x=gk.x;LM.cam.y=gk.y;lmDraw();return{st,h}});
ok('keeper holding the ball shows it in his hands',r.st==='catch'&&r.h,JSON.stringify(r));await shot('keeper-catch');
// 5. keeper dive: drawn with the dive pose, then he lies and gets up
r=await p.evaluate(()=>{SEED(5);if(!START())return{err:'no match'};const gk=LM.P.find(q=>q.grp=='GK'&&q.team===1);gk.dive={t:24,s:1};gk.vy=1.5;const sts=[];const a0=actorSpr8;actorSpr8=function(o,d,st,f,rf){if(o===gk.look)sts.push(st);return a0.apply(this,arguments)};
 const ph=[];for(let i=0;i<70;i++){logicStep();ph.push(gk.dive?'dive':gk.fall10?fallPh10(gk.fall10):'up');LM.cam.x=gk.x;LM.cam.y=gk.y;lmDraw()}actorSpr8=a0;return{drawn:[...new Set(sts)],seen:[...new Set(ph)]}});
ok('keeper dive uses the dive pose, then he lies and gets up',r.drawn.includes('dive')&&!r.drawn.includes('cel')&&r.drawn.includes('fall')&&r.seen.includes('getup')&&r.seen.includes('up'),JSON.stringify(r));
// 6. the animation layer changes nothing in the match: same seed, layer on vs off, identical end state (the run must include
//    new animations, or the comparison proves nothing). Sound is muted and one
//    warm-up match is played first, so first-time caches are built before the compared runs.
r=await p.evaluate(()=>{const ev=new Set(),run=off=>{ANIM10.off=off;SEED(2024);START();for(let i=0;i<6000&&LM;i++){logicStep();if(!off)for(const q of LM.P)if(q.fall10||['throw','catch','getup','dive'].includes(q.st)||q.dive)ev.add(q.dive?'dive':q.fall10?'fall':q.st)}if(!LM)return'ended';
  const h=[B.us,B.th,LM.f,LM.stats.fo.join(),LM.stats.tk.join(),LM.ball.x.toFixed(3),LM.ball.y.toFixed(3)].concat(LM.P.map(q=>q.x.toFixed(3)+','+q.y.toFixed(3)+','+(q.stun|0)));return h.join('|')};
 const sf=sfx;sfx=()=>{};run(0);const a=run(0),b2=run(1),c=run(0);sfx=sf;ANIM10.off=0;return{same:a===b2,repeat:a===c,len:a.length,anims:[...ev]}});
ok('same seeded match with animations on and off ends in exactly the same state',r.same&&r.repeat&&r.len>200&&r.anims.length>=2,JSON.stringify(r));
// 7. room staff: face Eli when he comes close; the gym trainer warms up when nobody is near
r=await p.evaluate(()=>{const R=room9('gym');INT9={kind:'gym',R,x:60,y:280,dir:'u',st:'idle',f:0,npcL:{},near:null};const n=R.npc[0],acts=new Set();for(let t=0;t<720;t+=8){tick=t;acts.add(npcPose9(n)[1])}
 INT9.x=n.x+40;INT9.y=n.y;const fR=npcPose9(n)[0];INT9.x=n.x-40;const fL=npcPose9(n)[0];INT9.x=n.x;INT9.y=n.y+40;const fD=npcPose9(n)[0];drawInt9();INT9=null;return{acts:[...acts],fR,fL,fD}});
ok('room staff turn towards Eli; the gym trainer warms up when nobody is near',r.fR==='r'&&r.fL==='l'&&r.fD==='d'&&r.acts.includes('jack')&&r.acts.includes('idle'),JSON.stringify(r));
r=await p.evaluate(()=>({off:ANIM10.off,err:ANIM10.err}));ok('animation layer still on after all checks (no errors caught)',r.off===0,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))||errs.length?1:0)})();
