// Phone layout checks on a 390x844 touch viewport (portrait) and 844x390 (landscape): the touch panel shows menus,
// dialogs, lists and status with readable text and finger-sized targets; taps drive the real game input.
// usage: CHROME_PATH=... node game-phone.cjs /abs/path/to/frontend/public/game/index.html [shots]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],SHOTS=process.argv[3]==='shots';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
const shot=async n=>{if(!SHOTS)return;await wait(250);await p.screenshot({path:path.join(OUT,'phone-'+n+'.png')});console.log('saved phone-'+n)};
const tapText=async re=>{const hs=await p.$$('#ph9 button');for(const h of hs){const t=await h.evaluate(e=>e.textContent);if(new RegExp(re,'i').test(t)){await h.tap();await wait(250);return t}}return null};
const metrics=()=>p.evaluate(()=>{const bs=[...document.querySelectorAll('#ph9 button')].filter(b=>b.offsetParent);const fs=[...document.querySelectorAll('#ph9 *')].filter(e=>e.offsetParent&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>parseFloat(getComputedStyle(e).fontSize));
 return{minBtnH:bs.length?Math.min(...bs.map(b=>b.getBoundingClientRect().height)):0,minFont:fs.length?Math.min(...fs):0,n:bs.length,hScroll:document.documentElement.scrollWidth>innerWidth+1,dir:document.getElementById('ph9').dir}});
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await p.goto('file://'+FILE);await wait(1000);await p.evaluate(()=>localStorage.clear());await p.reload();await wait(1000);
// 1. portrait mode: full-width game view, touch panel visible
let r=await p.evaluate(()=>LFC_PHONE());ok('portrait phone layout active',r.portrait&&r.canvasW>=388,JSON.stringify(r));await p.evaluate(()=>setLang('en',1));await wait(200);
r=await p.evaluate(()=>LFC_PHONE());ok('title menu shown as big buttons',r.mode==='title'&&r.buttons.some(t=>/Start Career|New Career/.test(t)),JSON.stringify(r.buttons));let m=await metrics();ok('title buttons are finger-sized (≥48 px) with ≥14 px text',m.minBtnH>=48&&m.minFont>=14,JSON.stringify(m));await shot('title');
// 2. start a career by tapping
await tapText('Start Career|New Career');await wait(300);r=await p.evaluate(()=>({title,mode:LFC_PHONE().mode}));ok('tapping Start Career leaves the title screen',!r.title,JSON.stringify(r));
await p.evaluate(()=>{dlg=null;menu=null;scr=null;initPlayer('Finisher','Professional');title=false;S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.money=1250;const f=FAC.find(f=>f[4]==='hq');S.x=f[0]+1;S.y=f[1]+3;PL8.tx=-1});await wait(900);
// 3. world: status card + interaction button at the HQ door
await p.evaluate(()=>{PL8.dir='u';PL8.vx=PL8.vy=0});await wait(500);r=await p.evaluate(()=>LFC_PHONE());const st=await p.evaluate(()=>document.querySelector('#ph9 .money')&&document.querySelector('#ph9 .money').textContent);
ok('status card shows real money',st==='$1,250',st);ok('interaction button offered at the door',r.buttons.some(t=>/^E · /.test(t)),JSON.stringify(r.buttons));m=await metrics();ok('world panel readable (≥13 px) and no sideways scroll',m.minFont>=13&&!m.hScroll,JSON.stringify(m));await shot('world-en');
await tapText('^E · ');await wait(1200);r=await p.evaluate(()=>typeof LFC_INT==='function'&&LFC_INT());ok('tapping the E button enters the room',r&&r.kind==='hq',JSON.stringify(r&&r.kind));await shot('room-hq');
r=await p.evaluate(()=>LFC_PHONE());ok('room panel offers Leave room',r.buttons.some(t=>/Leave room/.test(t)),JSON.stringify(r.buttons));await tapText('Leave room');await wait(1200);ok('Leave room returns to the city',!(await p.evaluate(()=>!!INT9)));
// 4. menus: Menu -> list of big buttons; Profile -> readable list screen; Close
await tapText('^Menu$');r=await p.evaluate(()=>LFC_PHONE());ok('Menu opens the pause menu in the panel',r.mode==='menu'&&r.buttons.includes('Profile'),r.mode);m=await metrics();ok('menu rows finger-sized, text ≥15 px',m.minBtnH>=48&&m.minFont>=15,JSON.stringify(m));r=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#ph9 button')],k=bs[bs.length-1].getBoundingClientRect();return{last:bs[bs.length-1].textContent,bottom:Math.round(k.bottom),vh:innerHeight,docH:document.documentElement.scrollHeight}});ok('long menu scrolls inside the panel, Back stays on screen',r.last==='Back'&&r.bottom<=r.vh&&r.docH<=r.vh+1,JSON.stringify(r));await shot('menu');
await tapText('^Profile$');r=await p.evaluate(()=>({mode:LFC_PHONE().mode,rows:document.querySelectorAll('#ph9 .lr').length}));ok('Profile shown as a readable list',r.mode==='list'&&r.rows>5,JSON.stringify(r));await shot('profile');
await tapText('^Close$');r=await p.evaluate(()=>LFC_PHONE().mode);ok('Close returns to the game',r==='world',r);
// 5. dialog: full text + Continue button
await p.evaluate(()=>say(['Coach: First line of the talk.','Coach: Second line.']));await wait(300);r=await p.evaluate(()=>document.querySelector('#ph9 .tx')&&document.querySelector('#ph9 .tx').textContent);ok('dialog text shown in full in the panel',r==='First line of the talk.',r);await shot('dialog');
await tapText('Next');await tapText('Continue');ok('Next / Continue step through and close the dialog',!(await p.evaluate(()=>!!dlg)));
// 6. Hebrew: right-to-left panel
await p.evaluate(()=>setLang('he',1));await wait(400);m=await metrics();ok('Hebrew panel is right-to-left',m.dir==='rtl',m.dir);await shot('world-he');await p.evaluate(()=>setLang('en',1));
// 7. live match on a phone: canvas match, short control hint in the panel
await p.evaluate(()=>{S.lmTut=1;S.en=100;window.startP=()=>1;playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}});await wait(1500);r=await p.evaluate(()=>LFC_PHONE());ok('live match keeps the canvas, panel shows the touch controls hint',r.mode==='busy'&&!!(await p.evaluate(()=>document.querySelector('#ph9 .hint'))),r.mode);await wait(400);r=await p.evaluate(()=>{const e=document.querySelector('#ph9 .sb9 .sc');return e&&e.textContent});ok('phone match panel shows a large live scoreboard',r==='0 - 0',r);await shot('match');await (await p.$('#ph9 .sb9')).tap();await wait(300);r=await p.evaluate(()=>!!menu);ok('tapping the phone scoreboard pauses the match',r);await p.evaluate(()=>{menu=null});
await p.evaluate(()=>{LM=null;B=null;scr=null;Tr=null});
// 8. landscape phone: canvas fills the height, controls float
await p.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});await wait(600);r=await p.evaluate(()=>({...LFC_PHONE(),h:Math.round(C.getBoundingClientRect().height),vh:innerHeight,hs:document.documentElement.scrollWidth>innerWidth+1}));
ok('landscape phone: canvas fills the screen height, no scrolling',r.landscape&&r.h>=r.vh-12&&!r.hs,JSON.stringify(r));await shot('landscape');
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
