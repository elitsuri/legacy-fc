// Interiors (v9): enters every walk-in room through its real door, screenshots it, and checks that hotspots run the real
// facility actions and that walking out through the exit returns to the city.
// usage: CHROME_PATH=... node game-interiors.cjs /abs/path/to/frontend/public/game/index.html [shots]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],SHOTS=process.argv[3]==='shots';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;setLang('en',1);S.money=50000;S.en=100;S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.t=1;
 window.STEPN=n=>{for(let i=0;i<n;i++){logicStep();if(Tr){Tr.f=99;const c=Tr.cb;Tr=null;c()}}};
 window.LEAVES=[];const lv0=leaveInt9;leaveInt9=function(){LEAVES.push((INT9&&INT9.kind)+' y'+(INT9&&Math.round(INT9.y))+' '+new Error().stack.split(String.fromCharCode(10)).slice(2,4).map(x=>x.trim()).join(' < '));return lv0()};
 window.CLEAN=()=>{dlg=null;menu=null;scr=null;mg=null;DR9=null;window.startP=()=>1;banner=null;TQ.length=0};
 // walk to a building's door and press E (the real way in); random story pop-ups (news dialogs) are cleared first,
 // because an open dialog correctly blocks doors and would make the result depend on the dice
 window.ENTER=kind=>{CLEAN();const f=FAC.find(f=>f[4]===kind&&f[5]);const b2=f[5];S.x=b2.door.x;S.y=b2.door.y+1;PL8.tx=-1;STEPN(5);PL8.dir='u';PL8.x=b2.door.x*T8+16;PL8.y=(b2.door.y+1)*T8+6;PL8.lastInt=-99;STEPN(2);CLEAN();interact();STEPN(3);return LFC_INT()};});
const shot=async n=>{if(!SHOTS)return;await wait(200);await (await p.$('canvas')).screenshot({path:path.join(OUT,'int-'+n+'.png')});console.log('saved int-'+n)};
// 1. each door opens its room
for(const k of ['hq','gym','tr','shop','st','ag','cl']){const r=await p.evaluate(k=>{const i=ENTER(k);STEPN(30);return i},k);const minHot={hq:6,gym:4,tr:5,shop:5,st:5,ag:4,cl:2}[k]; // each room's real services (the clinic offers exactly two)
 ok(`${k} door opens a walk-in room`,r&&r.kind===k&&r.items.length>=minHot,JSON.stringify(r&&r.items));
 await p.evaluate(()=>{held.length=0;held.push('u');STEPN(40);held.length=0;STEPN(10)});await shot(k);await p.evaluate(()=>{INT9=null})}
// 2. home: no home -> agency menu as before; owning a home -> the room, richer with the property tier
let r=await p.evaluate(()=>{S.home=0;CLEAN();const i=ENTER('home');const m=menu&&menu.title;CLEAN();return{i,m}});ok('without a home the Homes door still opens the agency',!r.i&&!!r.m,JSON.stringify(r));
for(const t of [1,2,3,4]){r=await p.evaluate(t=>{S.home=t;S.hist.g=t>1?12:0;S.tro=t>2?2:0;S.hist.tro=t>2?[['League S1','ליגה ע1'],['Cup S1','גביע ע1']]:[];const i=ENTER('home');STEPN(20);return i},t);ok(`home tier ${t} room`,r&&r.kind==='home'&&r.items.length>=5+(t>=2?1:0),`${r&&r.items.length} hotspots`);
 await p.evaluate(()=>{held.length=0;held.push('u');STEPN(30);held.length=0;STEPN(5)});await shot('home'+t);if(t<4)await p.evaluate(()=>{INT9=null})}
// 3. hotspots run the real actions
r=await p.evaluate(()=>{if(!INT9)return{err:LEAVES.slice(-3),now:LFC_INT()};const it=INT9.R.items.find(i=>i.k==='bed');const d0=S.day;S.en=40;int9Use(it);const res={dayAdvanced:S.day===d0+1,energy:S.en};CLEAN();
 int9Use(INT9.R.items.find(i=>i.k==='wardrobe'));res.wardrobe=!!(scr&&scr.draw===drawWardrobe);CLEAN();return res});
ok('home bed: sleep starts a new day and restores energy',r.dayAdvanced&&r.energy===100,JSON.stringify(r));ok('home wardrobe opens the wardrobe',r.wardrobe);
r=await p.evaluate(()=>{INT9=null;ENTER('gym');STEPN(5);const it=INT9.R.items.find(i=>i.k==='treadmill');const m0=S.money,h0=S.mhp;S.en=100;int9Use(it);const res={paid:m0-S.money,stamina:S.mhp-h0};CLEAN();return res});
ok('gym treadmill runs the gym cardio action',r.paid>0&&r.stamina===3,JSON.stringify(r));
r=await p.evaluate(()=>{INT9=null;ENTER('tr');STEPN(5);int9Use(INT9.R.items.find(i=>i.k==='goal'));const res={mini:!!mg||!!(DR9&&DR9.kind==='shoot')};CLEAN();return res});ok('training goal starts the shooting drill',r.mini);
r=await p.evaluate(()=>{INT9=null;ENTER('shop');STEPN(5);int9Use(INT9.R.items.find(i=>i.k==='counter'));const res={market:!!(scr&&scr.draw===drawMarket)};CLEAN();int9Use(INT9.R.items.find(i=>i.k==='kitrack'));res.kits=!!(menu&&/KIT|תלבוש/i.test(menu.title||''));CLEAN();return res});
ok('shop counter opens the Career Market',r.market);ok('shop kit rack opens the kits menu',r.kits);
r=await p.evaluate(()=>{INT9=null;ENTER('hq');STEPN(5);int9Use(INT9.R.items.find(i=>i.k==='board'&&i.table));const res={table:!!scr};CLEAN();return res});ok('HQ notice board shows the league table',r.table);
// 3b. the new rooms run their real actions
r=await p.evaluate(()=>{INT9=null;CLEAN();if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.en=100;S.inj=0;S.lmTut=1;ENTER('st');STEPN(5);int9Use(INT9.R.items.find(i=>i.k==='tunnel'));const pre=!!(scr&&scr.go);CLEAN();B=null;LM=null;
 INT9=null;ENTER('cl');STEPN(5);S.hp=Math.max(1,S.mhp-10);const m0=S.money;int9Use(INT9.R.items.find(i=>i.k==='medbed'));const healed=S.hp===S.mhp&&S.money===m0-15;CLEAN();
 INT9=null;ENTER('ag');STEPN(5);int9Use(INT9.R.items.find(i=>i.k==='files'));const offers=!!(menu||scr||dlg);CLEAN();return{pre,healed,offers}});
ok('changing-room tunnel leads to the pre-match screen',r.pre);ok('medical bed runs the real treatment ($15, full health)',r.healed);ok('agent files open offers & contract',r.offers);
// 4. furniture collides, and walking out through the exit returns to the city at the door
r=await p.evaluate(()=>{INT9=null;ENTER('hq');STEPN(5);INT9.x=240;INT9.y=200;held.length=0;held.push('u');STEPN(80);held.length=0;const yBlocked=INT9.y;INT9.x=240;INT9.y=270;held.push('d');STEPN(60);held.length=0;STEPN(3);return{yBlocked:Math.round(yBlocked),out:!INT9,city:!title&&!B}});
ok('reception desk blocks walking through it',r.yBlocked>=150,String(r.yBlocked));ok('walking through the exit returns to the city',r.out&&r.city,JSON.stringify(r));
// 5. a door that is not an interior keeps its menu
r=await p.evaluate(()=>{CLEAN();const i=ENTER('cafe');const m=!!menu;CLEAN();return{i,m}});ok('other doors keep their menus',!r.i&&r.m,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
