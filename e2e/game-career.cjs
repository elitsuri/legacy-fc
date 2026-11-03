// Career checks: offers come from real state (overall, reputation, recent match ratings), show the playing-time
// trade-off, a transfer happens exactly once, and the new club / contract survive a save + reload.
// usage: CHROME_PATH=... node game-career.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+FILE);await wait(800);
await p.evaluate(()=>{localStorage.clear();initPlayer('Finisher','Professional');title=false;setLang('en',1);if(!S.W)S.W=genWorld(1);S.club=1;S.ct=mkCt(S.W.clubs[1],1);mkTable();ALL.forEach(k=>S.att[k]=Math.max(S.att[k],48))});
// 1. offers respond to how Eli plays: same player, good vs poor recent ratings
let r=await p.evaluate(()=>{const run=rt=>{let n=0,sal=0;for(let k=0;k<400;k++){S.int={};S.offers=[];S.hist.rts=rt;for(let w=0;w<3;w++)tWindow();for(const o of S.offers){n++;sal+=o.ct.sal}}return{n,sal:n?sal/n:0}};const good=run([7.8,8.1,7.6,8.0,7.9,8.2]),poor=run([5.1,4.8,5.4,5.0,5.2,4.9]);return{good,poor}});
ok('good recent ratings bring more offers than poor ones',r.good.n>r.poor.n*1.15,JSON.stringify(r));ok('good recent ratings bring better wages',r.good.sal>r.poor.sal,`$${r.good.sal.toFixed(1)} vs $${r.poor.sal.toFixed(1)} per day`);
// 2. every offer is a real club with a contract built from the player's market value
r=await p.evaluate(()=>{S.int={};S.offers=[];S.hist.rts=[7.5,7.5,7.5];let k=0;while(!S.offers.length&&k++<200)tWindow();const o=S.offers[0];return o?{club:o.club,real:!!cb(o.club)&&o.club!==S.club,sal:o.ct.sal,role:o.ct.role,len:o.ct.len,exp:o.exp>S.day}:null});
ok('offers come from real clubs with full contracts',r&&r.real&&r.sal>0&&r.len>=1&&r.exp,JSON.stringify(r));
// 3. playing time: a bigger club means fighting for a place
r=await p.evaluate(()=>{const cs=S.W.clubs.slice().sort((a,b)=>a.rep-b.rep),small=cs[0],big=cs[cs.length-1];return{small:+startShare9(small,roleIdx(small),45).toFixed(2),big:+startShare9(big,roleIdx(big),45).toFixed(2),rs:small.rep,rb:big.rep}});
ok('bigger club = less expected playing time',r.big<r.small,JSON.stringify(r));
r=await p.evaluate(()=>{const o=S.offers[0];offerMenu(o);const l=dlg?dlg.l.join(' | '):'';dlg=null;return l});ok('offer screen shows the expected playing time',/\d+%/.test(r),r.slice(0,160));
// 4. accept once: club, contract and history change exactly once; a second accept is refused
r=await p.evaluate(()=>{const o=S.offers[0],from=S.club,tr0=S.hist.tr.length;doTransfer(o);const after={club:S.club,tr:S.hist.tr.length,offers:S.offers.length,sal:S.ct&&S.ct.sal};dlg=null;menu=null;doTransfer(o);const again={club:S.club,tr:S.hist.tr.length,msg:dlg?dlg.l[0]:''};dlg=null;return{from,to:o.club,after,again,tr0}});
ok('accepting moves Eli to the new club with the new contract',r.after.club===r.to&&r.after.tr===r.tr0+1&&r.after.offers===0,JSON.stringify(r.after));ok('the same offer cannot be accepted twice',r.again.club===r.to&&r.again.tr===r.tr0+1&&/no longer/i.test(r.again.msg),JSON.stringify(r.again));
// 5. the move survives save + reload
const before=await p.evaluate(()=>{save();flush(1);return{club:S.club,sal:S.ct.sal,tr:S.hist.tr.length}});await p.reload();await wait(900);
r=await p.evaluate(()=>({club:S.club,sal:S.ct&&S.ct.sal,tr:S.hist.tr.length}));ok('club, contract and transfer history survive a reload',r.club===before.club&&r.sal===before.sal&&r.tr===before.tr,JSON.stringify({before,after:r}));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})();
