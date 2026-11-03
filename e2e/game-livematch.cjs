// Live match (v9) checks on the built game file. The match is stepped deterministically through logicStep(),
// so the result does not depend on requestAnimationFrame timing; keyboard input goes through real key events.
// usage: CHROME_PATH=... node game-livematch.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
const SETUP=`window.ADV=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);logicStep();if(Tr){Tr.f++;if(Tr.f>34){const c=Tr.cb;Tr=null;c()}}}};
window.LMSETUP=(o)=>{o=o||{};NOFLUSH=1;initPlayer('Finisher','Professional');if(!S.W)S.W=genWorld(S.region||1);S.club=o.club||0;S.ct=mkCt(S.W.clubs[S.club],1);mkTable();title=false;S.en=100;S.inj=0;S.lmTut=o.tut?0:1;S.trust=100;window.startP=()=>1;dlg=null;menu=null;scr=null;B=null;LM=null;
 if(o.cup){S.cup=null;playCup()}else playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}ADV(40);return !!(LM&&B&&B.live)};
window.LMRUN=(max)=>{let n=0,nan=0;while(LM&&LM.state!=='ft'&&n<(max||40000)){if(['intro','ht','et'].includes(LM.state)){LM.stT=99;lmDown('pass')}if(LM.state==='kick'&&LM.kicker&&LM.kicker.me)lmDown('pass');if(LM.state==='goal'&&LM.stT>80)lmAfterGoal();ADV(1);n++;if(n%300==0&&LM&&LM.P.some(p=>!isFinite(p.x+p.y)))nan++}return{n,nan}};`;
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:800,height:720});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(800);await p.evaluate(()=>localStorage.clear());await p.evaluate(SETUP);
// 1. official league match starts in live mode, first time with the controls screen
let r=await p.evaluate(()=>{const live=LMSETUP({tut:1});return{live,state:LM&&LM.state,eli:!!(LM&&LM.eli),n:LM?LM.P.length:0}});
ok('league match opens the live engine',r.live,JSON.stringify(r));ok('first match shows the controls screen',r.state==='intro');ok('22 players, Eli among them',r.n===22&&r.eli);
// 2. real keyboard input: J starts, WASD moves Eli, K hold/release shoots
await p.focus('canvas');await p.keyboard.press('j');r=await p.evaluate(()=>LM.state);ok('J leaves the controls screen',r==='kick',r);
r=await p.evaluate(()=>{const k=LM.kicker;return k&&k.me});if(r){await p.keyboard.press('j');}else{await p.evaluate(()=>ADV(80))}
r=await p.evaluate(()=>LM.state);ok('kick-off happens',r==='play',r);
const x0=await p.evaluate(()=>LM.eli.x);await p.keyboard.down('d');await p.evaluate(()=>ADV(60));await p.keyboard.up('d');const x1=await p.evaluate(()=>LM.eli.x);
ok('D key moves Eli right (step-driven)',x1-x0>40,`${x0.toFixed(1)} -> ${x1.toFixed(1)}`);
const y0=await p.evaluate(()=>LM.eli.y);await p.keyboard.down('ArrowUp');await p.evaluate(()=>ADV(40));await p.keyboard.up('ArrowUp');const y1=await p.evaluate(()=>LM.eli.y);ok('Arrow keys move Eli',y0-y1>20,`${y0.toFixed(1)} -> ${y1.toFixed(1)}`);
r=await p.evaluate(()=>{const e=LM.eli;LM.ball.own=null;LM.ball.x=e.x;LM.ball.y=e.y;lmGain(e);return LM.ball.own===e});ok('Eli can take the ball',r);
await p.keyboard.down('k');await p.evaluate(()=>ADV(24));const ch=await p.evaluate(()=>LM.charge);await p.keyboard.up('k');r=await p.evaluate(()=>({own:LM.ball.own?LM.ball.own.n:null,shot:!!LM.ball.shot,sh:LM.stats.sh[0],eliSh:B.st.sh}));
ok('holding K charges a shot',ch>.3,String(ch));ok('releasing K shoots (a real shot is recorded)',r.shot&&r.sh>=1&&r.eliSh===1,JSON.stringify(r));
// 3. pause menu via Esc, resume
await p.keyboard.press('Escape');r=await p.evaluate(()=>!!menu);ok('Esc opens the pause menu',r);await p.evaluate(()=>{const s=LM.f;ADV(30);window._pf=LM.f-s});r=await p.evaluate(()=>window._pf);ok('match is frozen while paused',r===0,String(r));
await p.keyboard.press('Escape');r=await p.evaluate(()=>!menu);ok('Esc resumes',r);
// 4. full 90 minutes: honest, consistent numbers and career integration
r=await p.evaluate(()=>{const md=S.md,m=S.hist.m;const run=LMRUN();const s=LM.stats,gf=B.gf,ga=B.ga,evUs=B.ev.filter(e=>e.us).length,evThem=B.ev.filter(e=>!e.us).length;
 const out={n:run.n,nan:run.nan,state:LM.state,min:LM.min,gf,ga,evUs,evThem,sh:s.sh,on:s.on,pa:s.pa,pc:s.pc,sv:s.sv,pos:s.pos};ADV(320);out.after={LM:!!LM,B:!!B,ft:!!(scr&&String(scr.draw).includes('drawFT')),md:S.md,dmd:S.md-md,dm:S.hist.m-m,pts:Object.values(S.tb).reduce((a,t)=>a+t.p,0)};return out});
ok('a full match reaches full time',r.state==='ft'&&r.min>=90,JSON.stringify({n:r.n,min:r.min}));ok('no invalid positions during the match',r.nan===0);
ok('goal events match the score',r.evUs===r.gf&&r.evThem===r.ga,`${r.gf}-${r.ga} events ${r.evUs}/${r.evThem}`);
ok('stats are consistent (on ≤ shots, completed ≤ attempted)',r.on[0]<=r.sh[0]&&r.on[1]<=r.sh[1]&&r.pc[0]<=r.pa[0]&&r.pc[1]<=r.pa[1],JSON.stringify({sh:r.sh,on:r.on,pa:r.pa,pc:r.pc}));
ok('goals ≤ shots on target (+ own goals)',r.gf<=r.on[0]+1&&r.ga<=r.on[1]+1,JSON.stringify({gf:r.gf,ga:r.ga,on:r.on}));
ok('full-time report shown and the career updated',r.after.ft&&!r.after.B&&r.after.dmd===1&&r.after.dm===1,JSON.stringify(r.after));
// 5. simulate-rest path
r=await p.evaluate(()=>{scr=null;LMSETUP();lmDown('pass');ADV(200);lmSimRest();const st=LM.state;ADV(320);return{st,done:!B,ft:!!(scr&&String(scr.draw).includes('drawFT'))}});ok('“simulate the rest” finishes the match',r.st==='ft'&&r.done&&r.ft,JSON.stringify(r));
// 6. classic mode still uses the turn-based engine
r=await p.evaluate(()=>{scr=null;S.lmode='classic';LMSETUP();const res={live:!!(B&&B.live),B:!!B};S.lmode='live';B=null;menu=null;dlg=null;return res});ok('classic mode keeps the turn-based engine',r.B&&!r.live,JSON.stringify(r));
// 7. cup draw → extra time → penalties
r=await p.evaluate(()=>{scr=null;LMSETUP({cup:1});lmDown('pass');B.gf=1;B.ga=1;LM.half=2;LM.min=89.999;LM.state="play";LM.ball.shot=null;ADV(4);const s1=LM.state;LM.stT=99;lmDown('pass');const half=LM.half;LM.min=119.999;LM.half=4;LM.state="play";LM.ball.shot=null;B.gf=1;B.ga=1;ADV(4);const s2=LM.state;ADV(320);return{s1,half,s2,pens:!!PEN}});
ok('cup draw goes to extra time, then penalties',r.s1==='et'&&r.half===3&&r.s2==='ft'&&r.pens,JSON.stringify(r));
// 8. performance: logic + render cost of one live step
r=await p.evaluate(()=>{PEN=null;scr=null;LMSETUP();lmDown('pass');ADV(120);const t0=performance.now();for(let i=0;i<600;i++){logicStep();HIT=[];g.setTransform(SCv,0,0,SCv,0,0);drawBattle();drawUI()}return (performance.now()-t0)/600});
ok('one live frame (logic + draw) under 8 ms',r<8,r.toFixed(2)+' ms');
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
