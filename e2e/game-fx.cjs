// Atmosphere checks (p10n): running kicks up dust that fades away, walking does not, fireflies only on warm nights in the park, the
// effects change nothing the game logic can see, and they never throw.
// usage: CHROME_PATH=... node game-fx.cjs /abs/path/to/frontend/public/game/index.html [shots]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],SHOTS=process.argv[3]==='shots';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewport({width:960,height:660});await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;setLang('en',1);if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.t=1;
 window.AT=k=>{INT9=null;Tr=null;B=null;LM=null;const f=FAC.find(q=>q[4]===k);PL8.x=(f[0]+2)*T8;PL8.y=(f[1]+3)*T8;CAM8.init=0;PL8.st='idle';PL8.moved=0};
 window.WDAY=w=>{for(let d=1;d<500;d++){S.day=d;if(WXD()===w)return d}return -1};
 window.STEP=(n,run)=>{for(let i=0;i<n;i++){if(run){PL8.st='run';PL8.moved=1;PL8.dir='r';PL8.x+=1.2}tick++;drawWorld()}}});
// 1. running kicks up dust
let r=await p.evaluate(()=>{AT('cafe');STEP(3,0);const walk0=FX10.dust.length;STEP(40,1);const run=FX10.dust.length;const cols=[...new Set(FX10.dust.map(d=>d.c))];return{walk0,run,cols}});
ok('running kicks up dust puffs behind Eli',r.walk0===0&&r.run>=6,JSON.stringify(r));
// 2. standing still lets them fade away; walking makes none
r=await p.evaluate(()=>{PL8.st='idle';PL8.moved=0;STEP(60,0);const gone=FX10.dust.length;PL8.st='walk';PL8.moved=1;STEP(30,0);return{gone,afterWalk:FX10.dust.length}});
ok('the puffs fade away, and walking makes none',r.gone===0&&r.afterWalk===0,JSON.stringify(r));
// 3. fireflies: only at night, in the park, not in the rain
r=await p.evaluate(()=>{const out={};AT('park');S.t=1;STEP(5,0);out.day=FX10.fly;S.t=3;WDAY('Clear');STEP(40,0);out.nightPark=FX10.fly;WDAY('Rain');STEP(5,0);out.rain=FX10.fly;AT('cafe');WDAY('Clear');STEP(5,0);out.nightCafe=FX10.fly;S.t=1;return out});
ok('fireflies appear on clear nights in the park only',r.day===0&&r.nightPark>0&&r.rain===0&&r.nightCafe===0,JSON.stringify(r));
// 4. purely cosmetic: the game state is identical with the effects on or off
r=await p.evaluate(()=>{const run=off=>{AT('cafe');FX10.off=off;FX10.dust.length=0;S.t=3;WDAY('Clear');STEP(80,1);const snap=JSON.stringify([S,PL8.x,PL8.y,PL8.st]);FX10.off=false;return snap};const a=run(false),c=run(true);return{same:a===c,len:a.length}});
ok('the effects change nothing the game logic can see (same state with them on or off)',r.same,JSON.stringify(r));
// 5. cost
r=await p.evaluate(()=>{AT('park');S.t=3;WDAY('Clear');FX10.off=true;STEP(20,1);const t0=performance.now();for(let i=0;i<120;i++){PL8.st='run';PL8.moved=1;tick++;drawWorld()}const off=(performance.now()-t0)/120;FX10.off=false;STEP(20,1);const t1=performance.now();for(let i=0;i<120;i++){PL8.st='run';PL8.moved=1;tick++;drawWorld()}const on=(performance.now()-t1)/120;S.t=1;return{offMs:+off.toFixed(2),onMs:+on.toFixed(2),extra:+(on-off).toFixed(2)}});
ok('the effects cost under 1.5 ms per frame',r.extra<1.5,JSON.stringify(r));
if(SHOTS){await p.evaluate(()=>{AT('cafe');S.t=1;STEP(60,1)});await wait(150);await (await p.$('canvas')).screenshot({path:path.join(OUT,'fx-dust.png')});
 await p.evaluate(()=>{AT('park');S.t=3;WDAY('Clear');STEP(30,0)});await wait(150);await (await p.$('canvas')).screenshot({path:path.join(OUT,'fx-fireflies.png')});console.log('saved fx-*.png')}
const fin=await p.evaluate(()=>({err:FX10.err,off:FX10.off}));
ok('the effects never threw; no page errors',!fin.err&&!fin.off&&errs.length===0,JSON.stringify({fin,errs}));
console.log(R.join('\n'));console.log(R.some(x=>x.startsWith('FAIL'))?'SOME FAILED':'ALL PASSED ('+R.length+')');await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
