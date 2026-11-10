// ===================== v10 music (p10l): warm, generated, different for every place =====================
// The old loops (square waves, one tune for the whole city) are replaced by a small composer. Each place has a mood (title, city by day,
// city by night, park, beach, cafe, stadium, sport, club, shop, clinic, home, travel, lounge, live match, battle). When Eli goes to
// another place the current track fades out while a new one fades in, and every visit composes a NEW tune (a seeded random walk over
// the chords of the mood), so coming back to the same street never plays the same melody twice. Music has its own random stream and
// never touches the match engine's. ?mute and the music volume in Settings apply as before.
var MUS10={off:false,err:null,mood:null,cand:null,candAt:0,visits:{},base:Math.random()*1e6|0,trk:null,bar:0,step:0,nextT:0,plan:null,seed:0,log:[]};
const SC10={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],lyd:[0,2,4,6,7,9,11],dor:[0,2,3,5,7,9,10]};
const MD10={ // bpm, mode, lead voice, pad, drums (0 none, 1 soft, 2 groove, 3 brushes), swing, chord progressions (scale degrees), keys, name pool
 title:{bpm:84,mode:'maj',lead:'bell',pad:1,dr:0,sw:0,P:[[0,5,3,4],[0,4,5,3],[0,3,4,0]],K:[0,2,5,7],N:['Kick-off Dreams','Tunnel Lights','Legacy Theme']},
 city:{bpm:104,mode:'maj',lead:'pluck',pad:1,dr:1,sw:.1,P:[[0,4,5,3],[0,5,1,4],[3,4,2,5],[0,2,3,4]],K:[0,2,3,5,7,9],N:['Morning Run','Sunny Streets','Corner Shop Groove','Market Day']},
 night:{bpm:78,mode:'min',lead:'bell',pad:1,dr:0,sw:0,P:[[0,5,2,6],[0,3,5,4],[0,6,5,4]],K:[0,2,5,7,9],N:['City After Dark','Late Tram','Rain on the Pitch']},
 street:{bpm:96,mode:'dor',lead:'ep',pad:0,dr:3,sw:.2,P:[[0,3,0,4],[0,4,3,0],[1,4,0,0]],K:[0,2,5,7],N:['Back Alley Ball','Street Rhythm']},
 park:{bpm:70,mode:'lyd',lead:'harp',pad:1,dr:0,sw:0,P:[[0,1,4,0],[0,4,1,5],[0,2,1,4]],K:[0,2,5,7,9],N:['Green Grass','Morning Dew','Picnic Breeze']},
 beach:{bpm:80,mode:'lyd',lead:'ep',pad:1,dr:3,sw:.2,P:[[0,1,0,4],[0,4,5,1]],K:[0,2,5,7],N:['Seaside Walk','Salt and Sun']},
 cafe:{bpm:90,mode:'maj',lead:'ep',pad:0,dr:3,sw:.3,P:[[1,4,0,5],[0,5,1,4],[3,4,0,0]],K:[0,3,5,7],N:['Espresso Bossa','Corner Cafe']},
 arena:{bpm:112,mode:'maj',lead:'pluck',pad:1,dr:2,sw:0,P:[[0,4,5,3],[0,3,4,4],[5,3,0,4]],K:[0,2,5,7],N:['Stadium Lights','Matchday Anthem']},
 sport:{bpm:118,mode:'min',lead:'pluck',pad:0,dr:2,sw:0,pulse:1,P:[[0,5,3,4],[0,3,0,6],[0,6,5,4]],K:[0,2,5,7],N:['Interval Training','Gym Energy']},
 club:{bpm:100,mode:'maj',lead:'pluck',pad:1,dr:1,sw:.05,P:[[0,5,3,4],[0,3,5,4]],K:[0,2,5,7],N:['Club Pride','Training Day']},
 shop:{bpm:96,mode:'maj',lead:'ep',pad:0,dr:3,sw:.25,P:[[0,2,3,4],[3,4,2,5],[0,5,3,4]],K:[0,2,3,5],N:['Window Shopping','New Boots']},
 clinic:{bpm:60,mode:'maj',lead:'bell',pad:1,dr:0,sw:0,P:[[0,3,0,4],[0,5,3,0]],K:[0,5,7],N:['Quiet Recovery','Deep Breath']},
 home:{bpm:68,mode:'maj',lead:'ep',pad:1,dr:3,sw:.3,P:[[1,4,0,5],[0,5,1,4],[3,2,1,4]],K:[0,3,5,8],N:['Sunday at Home','Slippers and Tea','Warm Lamp']},
 travel:{bpm:92,mode:'dor',lead:'pluck',pad:1,dr:1,sw:.1,P:[[0,3,4,0],[0,4,3,3]],K:[0,2,5,7],N:['Departures','Platform Nine']},
 lounge:{bpm:84,mode:'dor',lead:'ep',pad:1,dr:3,sw:.3,P:[[1,4,0,0],[0,3,1,4]],K:[0,3,5,7],N:['Rooftop Lounge','Velvet Seats']},
 match:{bpm:120,mode:'min',lead:'pluck',pad:1,dr:2,sw:0,pulse:1,P:[[0,5,3,4],[0,3,4,0],[0,6,5,4]],K:[0,2,5,7],N:['Kick-off','Final Whistle']},
 battle:{bpm:128,mode:'dor',lead:'pluck',pad:0,dr:2,sw:0,pulse:1,P:[[0,3,0,4],[0,6,5,4]],K:[0,2,5],N:['Head to Head','Duel']}};
function rng10(s){s|=0;return function(){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash10(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
// scale degree d (may exceed 6 / be negative) -> semitones above the key root
function deg10(sc,d){const o=Math.floor(d/7);return sc[((d%7)+7)%7]+12*o}
// move a note up or down by whole scale steps (never leaves the scale)
function shift10(sc,n,steps){for(let i=-7;i<22;i++)if(deg10(sc,i)===n)return deg10(sc,i+steps);return n}
// a pure function of (mood, seed): 8 bars of chord / bass / lead events, 8 eighth-note steps per bar
function compose10(mood,seed){const m=MD10[mood]||MD10.city,R=rng10(seed),sc=SC10[m.mode],prog=m.P[Math.floor(R()*m.P.length)],key=m.K[Math.floor(R()*m.K.length)];
 const pick=a=>a[Math.floor(R()*a.length)],bars=[];let motif=null,prev=7;
 for(let b=0;b<8;b++){const root=prog[b%prog.length],tones=[0,2,4,6].map(o=>deg10(sc,root+o)),bass=[];
  const dens=m.dr===2?.7:m.pad&&m.dr===0?.45:.6;
  const mk=()=>{const ev=[];let p=prev;for(let s=0;s<8;s++){const strong=s%4===0;if(!strong&&R()>dens){continue}
    if(strong){const near=[...tones,...tones.map(t=>t+12),...tones.map(t=>t-12)].filter(t=>t>=5&&t<=22);p=near.reduce((a,t)=>Math.abs(t-p)<Math.abs(a-p)?t:a,near[0])}
    else{const step=pick([-2,-1,-1,0,1,1,2]);let idx=0,best=99; // move by scale steps from the current pitch
     for(let i=-3;i<16;i++){const t=deg10(sc,i);if(Math.abs(t-p)<best){best=Math.abs(t-p);idx=i}}p=deg10(sc,Math.max(-1,Math.min(15,idx+step)))}
    ev.push({s,n:p,d:strong?2+(R()<.4?2:0):1+(R()<.3?1:0)});}
    prev=p;return ev};
  let lead;if(b===0||b===4)lead=motif=mk();else if(b===1||b===5)lead=motif.map(e=>({...e,n:R()<.25?shift10(sc,e.n,pick([-1,1])):e.n}));else if(b===7){lead=mk();const last=lead[lead.length-1];if(last){last.n=deg10(sc,0)+12;last.d=4}}else lead=mk();
  if(b===3||b===7){const w=lead.filter(e=>e.s<6);lead=w}
  // bass: root on beats 1 and 3, a fifth on the way; sport/battle/match pulse in eighths
  if(m.pulse){for(let s=0;s<8;s+=1)bass.push({s,n:tones[s%4===2?2:0]-12,d:1})}else{bass.push({s:0,n:tones[0]-12,d:3});bass.push({s:4,n:(R()<.5?tones[0]:tones[2])-12,d:3})}
  bars.push({tones,bass,lead,root})}
 return{mood,seed,bpm:m.bpm,key,mode:m.mode,bars,name:pick(m.N)}}
// ---------- voices (all go through the track bus, which fades in and out) ----------
function bus10(){return MUS10.trk||MUSB||mg0}
function osc10(type,f,t,d,v,o){o=o||{};const ac=AC,os=ac.createOscillator(),g=ac.createGain();os.type=type;os.frequency.value=f;if(o.det)os.detune.value=o.det;
 const a=o.a||.006,pk=v;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+a);if(o.hold)g.gain.setValueAtTime(pk,t+d-(o.rel||.2));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let out=g;if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,t);if(o.lp2)fl.frequency.exponentialRampToValueAtTime(o.lp2,t+d);os.connect(fl);fl.connect(g)}else os.connect(g);
 g.connect(bus10());os.start(t);os.stop(t+d+.05)}
function note10(voice,f,t,d,v){v*=S.vol.mu;if(v<=0)return;
 if(voice==='pluck'){osc10('triangle',f,t,d*1.5,v,{lp:3600,lp2:800});osc10('sine',f*2,t,d*.8,v*.25)}
 else if(voice==='bell'){osc10('sine',f,t,1.8,v);osc10('sine',f*2.76,t,.9,v*.22);osc10('sine',f*5.4,t,.4,v*.08)}
 else if(voice==='ep'){osc10('sine',f,t,d*2.2,v,{a:.008});osc10('triangle',f*2,t,d*1.1,v*.28);osc10('sine',f*4,t,.18,v*.1)}
 else if(voice==='harp'){osc10('triangle',f,t,1.1,v,{lp:2800,lp2:700})}
 else if(voice==='bass'){osc10('sine',f,t,d,v*1.2,{a:.01});osc10('triangle',f,t,d,v*.35,{lp:520})}}
function pad10(freqs,t,d,v){v*=S.vol.mu;freqs.forEach(f=>{osc10('sine',f,t,d,v,{a:.5,hold:1,rel:.9,det:-5});osc10('triangle',f,t,d,v*.5,{a:.6,hold:1,rel:.9,det:5,lp:1100})})}
function drum10(kind,t,v){v*=S.vol.mu;if(!AC||v<=0)return;const ac=AC;
 if(kind==='kick'){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(125,t);o.frequency.exponentialRampToValueAtTime(46,t+.1);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(bus10());o.start(t);o.stop(t+.2);return}
 if(!NOISEB)return;const s=ac.createBufferSource();s.buffer=NOISEB;const fl=ac.createBiquadFilter(),g=ac.createGain();
 if(kind==='hat'){fl.type='highpass';fl.frequency.value=7500;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.04)}
 else if(kind==='snare'){fl.type='bandpass';fl.frequency.value=1900;fl.Q.value=.8;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.11)}
 else{fl.type='bandpass';fl.frequency.value=4200;fl.Q.value=.7;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.13)} // brush
 s.connect(fl);fl.connect(g);g.connect(bus10());s.start(t,Math.random()*.4);s.stop(t+.2)}
const mid10=m=>440*2**((m-69)/12);
// ---------- where is Eli? ----------
function area10(){const tx=PL8.x/T8,ty=PL8.y/T8;let best=null,bd=1e9;for(const f of FAC){const d=Math.hypot(tx-(f[0]+2),ty-(f[1]+2));if(d<bd){bd=d;best=f}}
 if(best&&bd<6.5){const k=best[4];if(k==='park')return'park';if(k==='cafe')return'cafe';if(k==='st')return'arena';if(k==='gym'||k==='tr'||k==='track'||k==='courts')return'sport';
  if(k==='hq'||k==='ac'||k==='ag')return'club';if(k==='cl')return'clinic';if(k==='shop'||k==='market'||k==='barber'||k==='car')return'shop';if(k==='air'||k==='station')return'travel';if(k==='vip'||k==='home')return'lounge';if(k==='street')return'street'}
 let w=0;const cx=Math.floor(tx),cy=Math.floor(ty);for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++)if(M[y]&&M[y][x]===7)w++;if(w>=14)return'beach';
 return S.t===3||WXD()==='Rain'?'night':'city'}
const INMOOD10={hq:'club',tr:'sport',gym:'sport',shop:'shop',st:'arena',ag:'club',cl:'clinic',home:'home'};
function mood10(){if(title)return'title';if(B)return(B.e&&(B.e.lg||B.e.cup))?'match':'battle';if(LM)return'match';if(INT9)return INMOOD10[INT9.kind]||'home';return area10()}
// ---------- the player of tracks ----------
function startTrack10(mood,hard){MUS10.wasHard=!!hard;const ac=AC,now=ac.currentTime;if(MUS10.trk){const old=MUS10.trk;old.gain.cancelScheduledValues(now);old.gain.setValueAtTime(old.gain.value,now);old.gain.linearRampToValueAtTime(0,now+1.3);setTimeout(()=>{try{old.disconnect()}catch(e){}},2200)}
 const g=ac.createGain();g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(1,now+1.5);g.connect(MUSB||mg0);MUS10.trk=g;
 MUS10.visits[mood]=(MUS10.visits[mood]||0)+1;MUS10.mood=mood;MUS10.seed=hash10(mood)+MUS10.base+MUS10.visits[mood]*7919;MUS10.plan=compose10(mood,MUS10.seed);MUS10.bar=0;MUS10.step=0;MUS10.nextT=now+.25;
 MUS10.log.push({mood,seed:MUS10.seed,name:MUS10.plan.name,key:MUS10.plan.key,bpm:MUS10.plan.bpm});if(MUS10.log.length>60)MUS10.log.shift()}
function playStep10(t){const P=MUS10.plan,m=MD10[P.mood],bar=P.bars[MUS10.bar],s=MUS10.step,key=60+P.key;
 if(s===0&&m.pad)pad10(bar.tones.slice(0,3).map(x=>mid10(key-12+x)),t,8*60/P.bpm/2*.98,.016);
 for(const e of bar.bass)if(e.s===s)note10('bass',mid10(key-12+e.n),t,e.d*60/P.bpm/2,.1);
 for(const e of bar.lead)if(e.s===s)note10(m.lead,mid10(key+e.n),t,e.d*60/P.bpm/2,m.lead==='bell'?.05:.062);
 const dr=m.dr;if(dr===1){if(s===0||s===4)drum10('kick',t,.05);if(s%2===1)drum10('hat',t,.011)}
 else if(dr===2){if(s===0||s===4||(s===6&&MUS10.bar%2))drum10('kick',t,.085);if(s===2||s===6)drum10('snare',t,.03);drum10('hat',t,s%2?.013:.007)}
 else if(dr===3){if(s===2||s===6)drum10('brush',t,.022);if(s%2===1)drum10('hat',t,.006)}}
function sched(){if(!AC||S.mute||MUS10.off)return;try{const now=AC.currentTime;
  const want=mood10(),hard=!!(title||B||LM||INT9);
  if(want!==MUS10.mood){ // title, rooms, battles and matches switch at once; walking between city areas waits 0.9 s so the edge of an area never flickers
   if(MUS10.mood===null||hard||MUS10.wasHard){MUS10.cand=null;startTrack10(want,hard)}
   else{if(want!==MUS10.cand){MUS10.cand=want;MUS10.candAt=now}if(now-MUS10.candAt>.9){MUS10.cand=null;startTrack10(want,hard)}}}
  else MUS10.cand=null;
  if(!MUS10.plan)return;if(MUS10.nextT<now-.5)MUS10.nextT=now+.05;
  const P=MUS10.plan,eighth=60/P.bpm/2,m=MD10[P.mood];
  while(MUS10.nextT<now+.22){const sw=MUS10.step%2?eighth*(m.sw||0):0;playStep10(MUS10.nextT+sw);MUS10.nextT+=eighth;if(++MUS10.step>=8){MUS10.step=0;if(++MUS10.bar>=8){MUS10.bar=0;MUS10.seed+=104729;MUS10.plan=compose10(P.mood,MUS10.seed);MUS10.plan.name=P.name}}}
 }catch(e){MUS10.off=true;MUS10.err=String(e&&e.message||e)}}
