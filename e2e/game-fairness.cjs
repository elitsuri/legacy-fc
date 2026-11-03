// Fairness checks (fast): the gap between two teams is soft-capped (equal teams untouched, top-vs-bottom flattened but
// still favouring the stronger side), each player keeps his place relative to his own team-mates, and the AI-vs-AI
// result curve gives realistic top-vs-bottom odds. The full statistical picture comes from game-balance.cjs.
// usage: CHROME_PATH=... node game-fairness.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+FILE);await wait(900);
// 1. soft cap on synthetic teams (form swing off so the numbers are exact)
let r=await p.evaluate(()=>{const f0=LMBAL.form;LMBAL.form=0;const mk=(t,v,i)=>({team:t,grp:i?'MF':'GK',gkr:v,A:{passing:v+i,shooting:v-i}});
 const team=(t,v)=>[0,1,2,3,4].map(i=>mk(t,v,i));const gap=(a,b)=>{const P=team(0,a).concat(team(1,b));const before=P[2].A.passing-P[1].A.passing;lmSoften(P);const m=t=>P.filter(p=>p.team===t&&p.grp!='GK').reduce((s,p)=>s+p.A.passing,0)/4;return{gap:+(m(0)-m(1)).toFixed(2),gk:+(P[0].gkr-P[5].gkr).toFixed(2),within:+(P[2].A.passing-P[1].A.passing).toFixed(2),before}};
 const out={equal:gap(50,48),huge:gap(62,38),cap:LMBAL.cap,gkCap:LMBAL.gkCap};LMBAL.form=f0;return out});
ok('nearly equal teams keep their small gap',Math.abs(r.equal.gap-2)<0.25,JSON.stringify(r.equal));
ok('a huge gap is flattened but the stronger team stays stronger',r.huge.gap>0&&r.huge.gap<=2*r.cap+.01&&r.huge.gap>r.equal.gap,JSON.stringify(r.huge));
ok('goalkeeper gap is capped too',r.huge.gk>0&&r.huge.gk<=2*r.gkCap+.01,JSON.stringify(r.huge));
ok('players keep their place relative to their own team-mates',r.huge.within===r.huge.before&&r.equal.within===r.equal.before,JSON.stringify([r.equal,r.huge].map(x=>[x.before,x.within])));
// 2. a real match: weakest vs strongest club, team gap after setup stays within the cap (form swing off for an exact check)
r=await p.evaluate(()=>{LMBAL.form=0;NOFLUSH=1;localStorage.clear();initPlayer('Finisher','Professional');if(!S.W)S.W=genWorld(1);const ids=S.W.clubs.map(c=>c.id).sort((a,b)=>cstr(a)-cstr(b));S.club=ids[0];S.ct=mkCt(cb(ids[0]),1);mkTable();S.ord=[ids[ids.length-1]];S.md=0;title=false;S.en=100;S.lmTut=1;window.startP=()=>1;playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}for(let i=0;i<40;i++){logicStep();if(Tr){const c=Tr.cb;Tr=null;c()}}
 if(!LM)return null;const m=(t,k)=>{const ps=LM.P.filter(x=>x.team===t&&x.grp!='GK');return ps.reduce((s,x)=>s+(+x.A[k]||0),0)/ps.length};const gaps=Object.keys(LM.P[0].A).map(k=>m(1,k)-m(0,k));LMBAL.form=4;return{avgGap:+(gaps.reduce((a,v)=>a+v,0)/gaps.length).toFixed(2),maxGap:+Math.max(...gaps).toFixed(2),cap:LMBAL.cap,strGap:Math.round(cstr(S.ord[0])-cstr(S.club))}});
ok('weakest vs strongest club: attribute gap is capped in the live match',r&&r.avgGap>0&&r.maxGap<=2*r.cap+.3,JSON.stringify(r));
// 3. AI-vs-AI result curve: biggest gap in the league
r=await p.evaluate(()=>{const ids=S.W.clubs.map(c=>c.id).sort((a,b)=>cstr(a)-cstr(b)),lo=ids[0],hi=ids[ids.length-1];let w=0,d=0,l=0;const N=20000;for(let i=0;i<N;i++){const q=sim2(hi,lo);if(q==1)w++;else if(q==0)d++;else l++}return{w:Math.round(w/N*100),d:Math.round(d/N*100),l:Math.round(l/N*100),gap:Math.round(cstr(hi)-cstr(lo))}});
ok('simulated top-vs-bottom: favourite usually wins, upsets happen',r.w>=60&&r.w<=80&&r.l>=4&&r.l<=15,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))||errs.length?1:0)})();
