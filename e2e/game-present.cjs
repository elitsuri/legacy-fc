// Presentation checks: match messages use the current language, city speech bubbles are moved clear of HUD panels
// (or skipped when there is no free space), stadium effects run through a full night + rain match without errors.
// usage: CHROME_PATH=... node game-present.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewport({width:960,height:660});await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable()});
// 1. team names in match messages follow the current language
let r=await p.evaluate(()=>{setLang('he',1);const he=lmTeamNm9(0);setLang('en',1);const en=lmTeamNm9(0);return{he,en,heHeb:/[\u0590-\u05FF]/.test(he),enHeb:/[\u0590-\u05FF]/.test(en)}});
ok('match team name follows the language (no Hebrew name inside English text)',r.heHeb&&!r.enHeb,JSON.stringify(r));
// 2. speech bubbles: drawn above the HUD, moved below the speaker when a HUD panel is in the way, skipped if no room
r=await p.evaluate(()=>{const cap=[];const T=txt;txt=function(s,x,y){cap.push([s,Math.round(y)]);return T.apply(this,arguments)};
 const one=(rects,bub)=>{cap.length=0;HUDR9.length=0;rects.forEach(q=>HUDR9.push(q));BUB9.length=0;BUB9.push(bub);bubbles9();return cap.filter(c=>c[0]===bub.line).map(c=>c[1])[0]};
 const free=one([],{x:240,y:200,line:'Free',a:1}),moved=one([[150,100,180,60]],{x:240,y:200,line:'Moved',a:1}),blocked=one([[0,0,480,320]],{x:240,y:200,line:'Blocked',a:1});txt=T;return{free,moved,blocked:blocked===undefined?null:blocked}});
ok('bubble drawn above the speaker when the space is free',r.free<200-40,JSON.stringify(r));ok('bubble under a HUD panel is moved below the speaker',r.moved>200,JSON.stringify(r));ok('bubble with no free space is skipped (never drawn under the HUD)',r.blocked===null,JSON.stringify(r));
// 3. a full night + rain live match renders every effect without errors and without disabling the effects layer
r=await p.evaluate(()=>{S.t=3;S.lmTut=1;S.en=100;window.startP=()=>1;playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}if(!B||!LM)return{err:'no match'};B.wx='Rain';const t0=performance.now();let n=0;
 for(let i=0;i<1500&&LM;i++){logicStep();if(i%5==0){lmDraw();n++}}return{n,ms:+((performance.now()-t0)/n).toFixed(2),fxOff:!!(LM&&LM.noFx9),pz:!!(LMPC&&LMPC.pz9),flags:LM?LM.flags9.length:0}});
ok('night + rain match: stadium effects ran the whole time',r.n>200&&!r.fxOff&&r.pz&&r.flags>10,JSON.stringify(r));
// 4. illustrated interiors: every room and home tier draws with the new painters, day and night, without falling back
r=await p.evaluate(()=>{const used=new Set(),rooms=[];const kinds=[['hq',0],['gym',0],['tr',0],['shop',0],['st',0],['ag',0],['cl',0],['home',1],['home',2],['home',3],['home',4]];
 for(const [k,h] of kinds)for(const t of [1,3]){S.home=h;S.t=t;const R=room9(k);INT9={kind:k,R,x:240,y:250,dir:'u',st:'idle',f:0,npcL:{},near:null};for(const it of R.items)if(F10[it.k])used.add(it.k);drawInt9();rooms.push(k+h)}
 INT9=null;return{rooms:rooms.length,painters:used.size,off:INT10.off,unused:Object.keys(F10).filter(k=>!used.has(k))}});
ok('every room draws with the illustrated painters (no fallback, no errors)',r.rooms===22&&r.off===0&&r.painters>=20,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))||errs.length?1:0)})();
