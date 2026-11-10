// Music checks (p10l): every mood composes valid music, the same (mood, seed) gives the same tune and a new seed a different one,
// the tune follows the place (city, park, cafe, stadium, gym, clinic, rooms, title), switching fades the old track out and the new
// one in, every new visit to a place composes a new tune, mute stops it, and the player never throws.
// usage: CHROME_PATH=... node game-music.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2];const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewport({width:960,height:660});await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=true;dlg=null;menu=null;scr=null;setLang('en',1);if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.mute=0;S.t=1;initA()});
// 1. the composer
let r=await p.evaluate(()=>{const out={moods:0,bad:[]};for(const m of Object.keys(MD10)){out.moods++;const a=compose10(m,12345),b=compose10(m,12345),c=compose10(m,999),sc=SC10[a.mode];
  if(JSON.stringify(a)!==JSON.stringify(b))out.bad.push(m+': not deterministic');if(JSON.stringify(a.bars)===JSON.stringify(c.bars))out.bad.push(m+': seed ignored');
  if(a.bars.length!==8)out.bad.push(m+': bars');let leadN=0;
  a.bars.forEach((bar,i)=>{if(bar.tones.length<4)out.bad.push(m+': chord');if(!bar.bass.length)out.bad.push(m+': bass '+i);leadN+=bar.lead.length;
   for(const e of bar.lead){const midi=60+a.key+e.n;if(!(midi>=62&&midi<=96))out.bad.push(m+': lead range '+midi);if(!sc.includes(((e.n%12)+12)%12))out.bad.push(m+': off scale '+e.n);if(e.s<0||e.s>7||!(e.d>=1))out.bad.push(m+': event')}
   for(const e of bar.bass){const midi=60+a.key-12+e.n;if(!(midi>=30&&midi<=66))out.bad.push(m+': bass range '+midi)}});
  if(leadN<12)out.bad.push(m+': melody too sparse '+leadN)}
 const names=new Set();for(let s=1;s<40;s++)names.add(compose10('city',s*77).name);out.names=names.size;
 const A=compose10('city',1),B=compose10('city',2);out.melodiesDiffer=JSON.stringify(A.bars.map(x=>x.lead))!==JSON.stringify(B.bars.map(x=>x.lead));return out});
ok('every mood composes valid music: 8 bars, chords, bass, a melody in range and in the scale',r.bad.length===0&&r.moods>=17,JSON.stringify(r));
ok('same mood and seed = the same tune; another seed = another melody',r.melodiesDiffer&&r.names>=3,'names '+r.names);
// 2. the audio engine runs and starts with the title theme
await wait(900);
r=await p.evaluate(()=>({state:AC&&AC.state,mood:MUS10.mood,plan:!!MUS10.plan,err:MUS10.err,off:MUS10.off}));
ok('audio engine runs and the title theme plays',r.state==='running'&&r.mood==='title'&&r.plan&&!r.off,JSON.stringify(r));
// 3. the music follows the place
// teleport, then wait (up to 5 s) until the music has settled on the expected mood; the area debounce is 0.9 s
const go=async(js,exp)=>{await p.evaluate(js);for(let i=0;i<100;i++){if(await p.evaluate(e=>MUS10.mood===e,exp))break;await wait(50)}await wait(150);return p.evaluate(()=>({mood:MUS10.mood,seed:MUS10.seed,name:MUS10.plan&&MUS10.plan.name,n:MUS10.log.length}))};
const AT=(k)=>`title=false;INT9=null;Tr=null;B=null;LM=null;{const fc=FAC.find(q=>q[4]==='${k}');PL8.x=(fc[0]+2)*T8;PL8.y=(fc[1]+2)*T8}`;
const seen={};
seen.city=await go(`title=false;INT9=null;Tr=null;B=null;LM=null;S.t=1;PL8.x=40*T8;PL8.y=36*T8;`,'city');
seen.park=await go(AT('park'),'park');seen.cafe=await go(AT('cafe'),'cafe');seen.arena=await go(AT('st'),'arena');seen.sport=await go(AT('gym'),'sport');seen.clinic=await go(AT('cl'),'clinic');
ok('the mood follows the place: park, cafe, stadium, gym, clinic',seen.park.mood==='park'&&seen.cafe.mood==='cafe'&&seen.arena.mood==='arena'&&seen.sport.mood==='sport'&&seen.clinic.mood==='clinic',JSON.stringify(Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,v.mood]))));
const nm=await p.evaluate(()=>{S.t=3;title=false;INT9=null;PL8.x=40*T8;PL8.y=36*T8;return 1});await wait(1700);
seen.night=await p.evaluate(()=>({mood:MUS10.mood}));
ok('the city plays a calmer night theme after dark',seen.night.mood==='night'&&seen.city.mood==='city',JSON.stringify({day:seen.city.mood,night:seen.night.mood}));
// 4. rooms switch at once; the title and a match have their own music
let q=await p.evaluate(()=>{S.t=1;title=false;PL8.x=40*T8;PL8.y=36*T8;INT9={kind:'gym',R:room9('gym'),x:240,y:286,vx:0,vy:0,dir:'u',st:'idle',f:0,ph:0,near:null,t:0,npcL:{}};return 1});await wait(250);
let m1=await p.evaluate(()=>MUS10.mood);
ok('walking into a room changes the music at once',m1==='sport',m1);
await p.evaluate(()=>{INT9=null;});await wait(250);const afterLeave=await p.evaluate(()=>MUS10.mood);
ok('leaving the room changes it back at once',afterLeave==='city',afterLeave);
await p.evaluate(()=>{title=true});await wait(250);const t1=await p.evaluate(()=>MUS10.mood);ok('title screen plays the title theme',t1==='title',t1);
// 5. every visit composes a new tune
const visits=[];for(let i=0;i<3;i++){visits.push(await go(AT('park'),'park'));await go(AT('cafe'),'cafe')}
const seeds=new Set(visits.map(v=>v.seed)),parkTunes=await p.evaluate(()=>MUS10.log.filter(l=>l.mood==='park').length);
ok('coming back to the same place composes a new tune each time',seeds.size===3&&parkTunes>=3,JSON.stringify({seeds:[...seeds],parkTunes}));
// 6. fade: the old track goes quiet while the new one comes up
await wait(1800); // let the current track finish fading in
const fade=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms)),old=MUS10.trk;title=false;INT9=null;const fc=FAC.find(q=>q[4]==='cl');PL8.x=(fc[0]+2)*T8;PL8.y=(fc[1]+2)*T8;
 let w=0;while(MUS10.trk===old&&w<6000){await sl(50);w+=50}const t0=performance.now(),atSwitch=old.gain.value;await sl(1700);return{switchedAfterMs:w,oldAtSwitch:+atSwitch.toFixed(2),oldEnd:old.gain.value,newNow:MUS10.trk.gain.value,same:MUS10.trk===old}});
ok('switching fades the old track out and the new one in',!fade.same&&fade.oldAtSwitch>.95&&fade.oldEnd<.05&&fade.newNow>.9,JSON.stringify(fade));
// 7. mute stops it, un-mute resumes; nothing threw
const mu=await p.evaluate(async()=>{S.mute=1;const t0=MUS10.nextT;await new Promise(r=>setTimeout(r,600));const frozen=MUS10.nextT===t0;S.mute=0;await new Promise(r=>setTimeout(r,600));return{frozen,resumed:MUS10.nextT>t0}});
ok('mute stops the music and un-mute resumes it',mu.frozen&&mu.resumed,JSON.stringify(mu));
const fin=await p.evaluate(()=>({err:MUS10.err,off:MUS10.off,tracks:MUS10.log.length}));
ok('the music player never threw, no page errors',!fin.err&&!fin.off&&errs.length===0,JSON.stringify({fin,errs}));
console.log(R.join('\n'));console.log(R.filter(x=>x.startsWith('FAIL')).length?'SOME FAILED':'ALL PASSED ('+R.length+')');await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
