// City life (v9) checks: pedestrian routines, recognition tied to the career, autographs, real-result reactions, billboard.
// usage: CHROME_PATH=... node game-citylife.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+FILE);await wait(800);
await p.evaluate(()=>{window.FRESH=(lv,fol,x,y,t)=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;B=null;S.lvl=lv;S.fol=fol;S.rep.fan=fol>1e4?80:10;S.t=t==null?1:t;S.lastRes=null;PEDS8.length=0;S.x=x;S.y=y;PL8.tx=-1}});
// 1. routines: destinations exist and pedestrians walk real routes
let r=await p.evaluate(()=>{FRESH(1,0,50,51);let ok=0,fail=0;const p0=path9;path9=function(a,b2,c,d){const r=p0(a,b2,c,d);r?ok++:fail++;return r};for(let i=0;i<2400;i++)logicStep();path9=p0;
 return{poi:POI9.length,cats:new Set(POI9.map(q=>q.cat)).size,ok,fail,routed:PEDS8.filter(q=>q.path||q.pause>0||q.sit||q.leaving).length,n:PEDS8.length}});
ok('points of interest cover the city',r.poi>120&&r.cats>=12,`${r.poi} spots, ${r.cats} kinds`);ok('most route searches succeed (some spots, e.g. the beach, are separate islands)',r.ok>r.fail,`${r.ok} ok / ${r.fail} failed`);ok('pedestrians follow routines (not random walking)',r.routed>=r.n*.6,`${r.routed}/${r.n}`);
// 2. recognition follows fame: an unknown player is ignored, a superstar is noticed
r=await p.evaluate(()=>{const count=(lv,fol)=>{FRESH(lv,fol,53,12);const seen=new Set();for(let i=0;i<4200;i++){logicStep();for(const q of PEDS8)if(q.rec)seen.add(q)}return seen.size};return{unknown:count(1,0),star:count(18,42000)}});
ok('unknown Eli is not recognised',r.unknown===0,String(r.unknown));ok('superstar Eli is recognised',r.star>=3,String(r.star));
// 3. autographs: real fans gained, capped at 6 per day
r=await p.evaluate(()=>{FRESH(18,42000,53,12);for(let i=0;i<120;i++)logicStep();const f0=S.fol;const res=[];for(let k=0;k<8;k++){const q=PEDS8.find(q=>!q.leaving&&!q.sit)||spawnPed8(0);q.rec={t:300,line:'x',signed:0};q.pause=300;
  PL8.x=q.x-14;PL8.y=q.y;PL8.dir='r';PL8.vx=PL8.vy=0;S.x=Math.floor(PL8.x/T8);S.y=Math.floor(PL8.y/T8);PL8.tx=S.x;PL8.ty=S.y;PL8.lastInt=-99;const t=findTarget8();res.push(t&&t.kind);interact();tick+=20}
 return{kinds:res,gained:S.fol-f0,n:S.nl.ag.n}});
ok('autograph target offered next to a recognising fan',r.kinds.every(k=>k==='ped'),JSON.stringify(r.kinds));ok("autographs add fans (1 + career stage each; Superstar = 4), capped at 6 a day",r.n===6&&r.gained===6*(1+4),`gained ${r.gained}, count ${r.n}`);
// 4. the last official result is recorded and drives what people say
r=await p.evaluate(()=>{FRESH(8,2600,53,12);if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.en=100;S.inj=0;S.lmTut=1;window.startP=()=>1;playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}
 for(let i=0;i<60;i++){logicStep();if(Tr){Tr.f=99;const c=Tr.cb;Tr=null;c()}}if(!LM)return{err:'no match'};lmDown('pass');B.gf=2;B.ga=0;B.myG=1;lmSimRest();for(let i=0;i<340;i++)logicStep();scr=null;
 const rec=S.lastRes;FRESH(8,2600,53,12);S.lastRes=rec;const lines=new Set();for(let i=0;i<5000;i++){logicStep();for(const q of PEDS8)if(q.rec)lines.add(q.rec.line)}return{rec,lines:[...lines]}});
ok('official result recorded for the city',r.rec&&r.rec.d>0&&typeof r.rec.r==='number'&&r.rec.opp,JSON.stringify(r.rec));ok('people talk about the real result',r.lines.some(l=>r.rec&&l.includes(r.rec.opp)||/win|goal|draw|loss|ניצחון|גול|תיקו|הפסד/i.test(l)),JSON.stringify(r.lines.slice(0,3)));
// 5. billboard: placed once, club advert before Star, Eli's campaign from Star on
r=await p.evaluate(()=>{FRESH(1,0,60,17);for(let i=0;i<10;i++)logicStep();const bb=CITY9.bb;return{bb:!!bb,collides:bb?boxHit8(bb.x-31,bb.y,3,2,1):null}});
ok('billboard placed in the Football District',r.bb,JSON.stringify(r));ok('billboard posts are solid',r.collides===true);
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();

