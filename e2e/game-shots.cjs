// Captures reference screenshots of the built game (v9 live match + character) into e2e/shots/.
// usage: CHROME_PATH=... node game-shots.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core'),fs=require('fs'),path=require('path');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const SETUP=`window.ADV=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);logicStep();if(Tr){Tr.f++;if(Tr.f>34){const c=Tr.cb;Tr=null;c()}}}};
window.LMSETUP=(o)=>{o=o||{};NOFLUSH=1;initPlayer('Finisher','Professional');if(!S.W)S.W=genWorld(S.region||1);S.club=o.club==null?3:o.club;S.ct=mkCt(S.W.clubs[S.club],1);mkTable();title=false;S.en=100;S.inj=0;S.lmTut=o.tut?0:1;S.trust=100;S.t=o.t||0;window.startP=()=>1;dlg=null;menu=null;scr=null;B=null;LM=null;banner=null;TQ.length=0;
 playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}ADV(40);if(o.wx)B.wx=o.wx;if(o.t!=null)S.t=o.t;return !!(LM&&B&&B.live)};
window.FREEZE=()=>{window.logicStep0=window.logicStep0||logicStep;logicStep=()=>{}};window.THAW=()=>{if(window.logicStep0)logicStep=window.logicStep0};`;
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(900);await p.evaluate(()=>localStorage.clear());await p.evaluate(SETUP);
const shot=async(name)=>{await wait(120);const el=await p.$('canvas');await el.screenshot({path:path.join(OUT,name+'.png')});console.log('saved',name)};
const run=async(fn,arg)=>{await p.evaluate(()=>THAW());await p.evaluate(fn,arg);await p.evaluate(()=>FREEZE())};
await shot('01-title-menu');
// live match: controls screen (Hebrew), open play (English), night + rain, goal, half time, full time
await run(()=>{setLang('he',1);LMSETUP({tut:1})});await shot('02-live-controls-he');
await run(()=>{setLang('en',1);lmDown('pass');if(LM.kicker&&LM.kicker.me)lmDown('pass');ADV(900)});await shot('03-live-play-day-en');
await run(()=>{LMSETUP({t:3,wx:'Rain'});lmDown('pass');ADV(700)});await shot('04-live-night-rain');
await run(()=>{LMSETUP();lmDown('pass');ADV(60);for(let k=0;k<12&&LM.state!=='goal';k++){LM.state='play';const e=LM.eli,gx=lmGoalX(0);e.x=gx-LM.tm[0].side*95;e.y=LMP.W/2+30;LM.P.filter(q=>q.team===1&&q.grp!='GK').forEach(q=>{if(Math.abs(q.x-gx)<200)q.x=gx-LM.tm[0].side*260});LM.ball.own=null;LM.ball.x=e.x;LM.ball.y=e.y;lmGain(e);held.length=0;held.push('u');lmDown('shoot');ADV(30);lmUp('shoot');held.length=0;for(let i=0;i<70&&LM.state==='play';i++)ADV(1)}ADV(40)});await shot('05-live-goal-celebration');
await run(()=>{lmAfterGoal();lmDown('pass');ADV(400);LM.min=44.999;LM.ball.shot=null;let n=0;while(LM.state!=='ht'&&n<3000){if(LM.state==='restart'||LM.state==='goal'||LM.state==='kick'){ADV(1);n++;continue}LM.min=44.999;ADV(1);n++}ADV(50)});await shot('06-live-half-time-stats');
await run(()=>{LM.stT=99;lmDown('pass');LM.half=2;LM.min=89.999;let n=0;while(LM.state!=='ft'&&n<3000){ADV(1);n++}ADV(330)});await shot('07-full-time-report');
await run(()=>{key('arrowright')});await shot('08-full-time-match-stats');
// character sheet: the player in four directions and the main animation states
await run(()=>{scr=null;banner=null;title=false;window.drawWorld0=window.drawWorld0||drawWorld;drawWorld=()=>{const a=pkx(S.ap),o=Object.assign(plOpts(),{sh:solid(a[0]),hc:solid(a[4]||'#2b1a10'),bt:solid(a[5]||'#15161a'),pa:solid(a[6]||'#1b2240'),out:'kit',tier:0});o.sk=solid(o.sk);o.c2=solid(o.c2||'#ffffff');
 g.setTransform(SCv,0,0,SCv,0,0);const gr=g.createLinearGradient(0,0,0,320);gr.addColorStop(0,'#4f8a46');gr.addColorStop(1,'#3d7537');g.fillStyle=gr;g.fillRect(0,0,480,320);
 [['d','idle',0],['r','idle',0],['r','walk',1],['r','run',1],['l','run',3],['u','walk',1],['r','kick',2],['l','idle',0],['d','walk',1],['d','cel',1]].forEach((r,i)=>{const x=46+(i%5)*94,y=140+Math.floor(i/5)*150;drawActor(x,y,o,2.4,r[0],r[1],r[2]);txt(r.join(' '),x,y+18,8,'#fff','#000','center')})}});
await shot('09-character-sheet');
// a phone-width viewport reloads the page in Chromium, so set the viewport first and then build the scene
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await p.goto('file://'+FILE);await wait(900);await p.evaluate(SETUP);
await run(()=>{setLang('he',1);LMSETUP();lmDown('pass');if(LM.kicker&&LM.kicker.me)lmDown('pass');ADV(500)});await wait(300);await p.screenshot({path:path.join(OUT,'10-narrow-screen-live-match.png')});console.log('saved 10-narrow-screen-live-match');
console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
