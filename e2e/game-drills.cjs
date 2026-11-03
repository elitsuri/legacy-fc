// Training drills (v9): plays the shooting, passing, dribbling and sprint drills with real key input (puppeteer keyboard,
// real time) or steered input for the slalom, then checks scoring, rewards, personal bests and the daily limits.
// Loops are bounded so a stuck drill fails the check instead of hanging the browser. Story pop-ups that the game
// legitimately shows between drills are dismissed before each drill is started directly, as a player would.
// usage: CHROME_PATH=... node game-drills.cjs /abs/path/to/frontend/public/game/index.html [shots]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],SHOTS=process.argv[3]==='shots';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;setLang('en',1);S.en=100;S.money=1000;window.SNAP=k=>JSON.stringify(DRILLS[k].K.map(a=>+S.att[a].toFixed(3)))});
const shot=async n=>{if(!SHOTS)return;await wait(120);await (await p.$('canvas')).screenshot({path:path.join(OUT,'drill-'+n+'.png')});console.log('saved drill-'+n)};
const st=()=>p.evaluate(()=>LFC_DRILL());
await p.focus('canvas');
// ---- 1. shooting: hold J to power, release; aim left with the arrow key for some shots ----
let r=await p.evaluate(()=>{S.en=100;const e0=S.en;mini(0);return{d:LFC_DRILL(),cost:e0-S.en}});ok('shooting drill opens (energy spent)',r.d&&r.d.kind==='shoot'&&r.d.ph==='intro'&&r.cost===15,JSON.stringify(r));await shot('shoot-intro');
await p.keyboard.press('j');ok('A/J starts the drill',(await st()).ph==='play');
const att0=await p.evaluate(()=>SNAP(0));
for(let i=0;i<8;i++){if(i%2){await p.keyboard.down('ArrowLeft');await wait(250);await p.keyboard.up('ArrowLeft')}await p.keyboard.down('j');await wait(i===3?1100:550);if(i===2)await shot('shoot-aim');await p.keyboard.up('j');await wait(i===0?200:1400);if(i===0){await shot('shoot-flight');await wait(1200)}}
await wait(500);r=await st();ok('8 shots taken by holding and releasing J',r.ph==='done'&&r.n===8,JSON.stringify(r));ok('a shooting score comes from the shots',r.pts>=0&&typeof r.av==='number',`points ${r.pts}, grade ${r.grade}`);await shot('shoot-result');
const att1=await p.evaluate(()=>SNAP(0));ok('skill gain only when the session is good enough',(r.av>.45)===(att0!==att1),`av ${r.av&&r.av.toFixed(2)} ${att0} -> ${att1}`);
await p.keyboard.press('j');ok('A/J closes the results',!(await st()));
// ---- 2. passing: choose the lit team-mate with the arrows, J to pass ----
await p.evaluate(()=>{S.en=100;mini(3)});await p.keyboard.press('j');
for(let k=0;k<10;k++){for(let w=0;w<20;w++){const s2=await p.evaluate(()=>DR9&&DR9.target>=0&&!DR9.ball);if(s2)break;await wait(60)}
 const dir=await p.evaluate(()=>{if(!DR9||DR9.target<0)return null;const m=DR9.mates[DR9.target],dx=m.x-240,dy=m.y-188;return[dx>40?'ArrowRight':dx<-40?'ArrowLeft':null,dy>30?'ArrowDown':dy<-30?'ArrowUp':null]});if(!dir)break;
 for(const kk of dir.filter(Boolean))await p.keyboard.down(kk);await wait(40);for(const kk of dir.filter(Boolean))await p.keyboard.up(kk);if(k===1)await shot('pass-play');await p.keyboard.press('j');await wait(900)}
await wait(600);r=await st();ok('10 passes played with arrows + J',r&&r.ph==='done'&&r.n===10,JSON.stringify(r));ok('passing score from real passes',r&&r.score>0,`score ${r&&r.score}, grade ${r&&r.grade}`);await shot('pass-result');await p.keyboard.press('j');
// ---- 3. dribbling: steer through the gates (input held by a simple steering bot), logic stepped ----
r=await p.evaluate(()=>{S.en=100;mini(4);keyDrill9('enter');let n=0;while(DR9&&DR9.ph==='play'&&n<4000){const D=DR9,gt=D.gates[D.gi]||{x:440,y:60};const tx=gt.x,ty=gt.y,dx=tx-D.x,dy=ty-D.y;held.length=0;if(Math.abs(dx)>4)held.push(dx>0?'r':'l');if(Math.abs(dy)>4)held.push(dy>0?'d':'u');logicStep();n++}held.length=0;return LFC_DRILL()});
ok('dribbling course completed through all gates',r&&r.ph==='done'&&r.gi===7,JSON.stringify(r));ok('dribbling time measured',r&&r.tm>0,`${(r.tm/60).toFixed(1)} s, grade ${r.grade}`);await shot('drib-result');
r=await p.evaluate(()=>{keyDrill9('enter');S.en=100;mini(4);keyDrill9('enter');let n=0;while(DR9&&DR9.ph==='play'&&n<500){const D=DR9,gt=D.gates[D.gi]||{x:440,y:60};const dx=gt.x-D.x,dy=gt.y-D.y;held.length=0;if(Math.abs(dx)>4)held.push(dx>0?'r':'l');if(Math.abs(dy)>4)held.push(dy>0?'d':'u');logicStep();n++}held.length=0;return 1});await shot('drib-play');await p.evaluate(()=>{finishDrill9(1);keyDrill9('enter')});
// ---- 4. sprint: wait for GO, alternate left/right; a lazy run scores lower than a fast one ----
await p.evaluate(()=>{dlg=null;menu=null;S.en=100;mini(6)});await p.keyboard.press('j');await shot('sprint-ready');
for(let w=0;w<60;w++){if(await p.evaluate(()=>DR9.t>=DR9.go))break;await wait(50)}
for(let i=0;i<200;i++){await p.keyboard.press(i%2?'ArrowRight':'ArrowLeft');await wait(45);if(i===40)await shot('sprint-run');if(!(await p.evaluate(()=>DR9&&DR9.ph==='play')))break}
await wait(400);r=await st();const fast=r;ok('sprint finished with alternating taps',r&&r.ph==='done'&&r.x>=60,JSON.stringify(r));await shot('sprint-result');await p.keyboard.press('j');
r=await p.evaluate(()=>{dlg=null;menu=null;S.en=100;mini(6);keyDrill9('enter');let n=0;while(DR9&&DR9.t<DR9.go&&n++<3000)logicStep();for(let i=0;i<4000&&DR9.ph==='play';i++){if(i%24===0)keyDrill9(i%48?'arrowright':'arrowleft');logicStep()}return LFC_DRILL()});
ok('a slow tapping rhythm runs slower than a fast one',r&&fast&&(r.ph==='done')&&(r.tm>fast.tm||r.x<60),`fast ${(fast.tm/60).toFixed(2)} s, slow ${(r.tm/60).toFixed(2)} s`);await p.evaluate(()=>keyDrill9('enter'));
r=await p.evaluate(()=>{S.en=100;mini(6);keyDrill9('enter');keyDrill9('arrowleft');const fs2=DR9.fs;finishDrill9(1);keyDrill9('enter');return fs2});ok('pressing before GO is a false start',r===1);
// ---- 5. personal bests saved, daily diminishing returns still applied ----
r=await p.evaluate(()=>({pb:S.dr9,mul:tdMul(),tdc:S.td.c}));ok('personal bests saved for all four drills',r.pb&&['shoot','pass','drib','sprint'].every(k=>r.pb[k]!=null),JSON.stringify(r.pb));ok('repeated drills reduce today\'s rewards',r.mul<1,`x${r.mul.toFixed(2)} after ${r.tdc} sessions`);
// ---- 6. drills without a new game keep the timing bar; tired players cannot train ----
r=await p.evaluate(()=>{S.en=100;mini(1);const bar=!!mg&&!DR9;mg=null;S.en=5;dlg=null;mini(0);const blocked=!DR9;dlg=null;return{bar,blocked}});ok('defence drill keeps the timing bar',r.bar);ok('too tired: no drill starts',r.blocked);
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
