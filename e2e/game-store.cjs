// In-game store (p10k): with the online shell reporting a server-side payment provider, Buy asks the shell to open checkout and
// the game grants NOTHING itself; the server's list of owned items replaces whatever the save claimed. Without it, TEST MODE is unchanged.
// The page is served over http on a local port (browsers report file:// origins as "null", which the bridge's same-origin check rejects).
// usage: CHROME_PATH=... node game-store.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core'),path=require('path'),{spawn}=require('child_process');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const PORT=5191,srv=spawn(process.execPath,[path.join(__dirname,'serve.cjs'),path.dirname(path.dirname(FILE)),String(PORT)],{stdio:'ignore'});await wait(700);
const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(`http://localhost:${PORT}/game/index.html`);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;setLang('en',1);S.money=500;
 // (served over http) the page runs top-level here: its own window is its "parent", so shell messages can be posted to it and its replies captured
 BRIDGE9.embedded=true;window.OUT=[];addEventListener('message',e=>{if(e.data&&e.data.src==='lfc-game')OUT.push(e.data)});
 window.SHELL=m=>postMessage(Object.assign({src:'lfc-shell',type:'store'},m),location.origin);window.TICK=()=>new Promise(r=>setTimeout(r,60))});
// 1. no provider: the old behaviour (nothing opens, TEST MODE needed)
let r=await p.evaluate(async()=>{const it=CATBY['c2.ball.gold'];openMarket();startBuy(it);const noTest=!MK.conf&&/not connected/i.test(MK.msg);S.test=true;MK.msg='';startBuy(it);const test=!!MK.conf;MK.conf=null;S.test=false;return{noTest,test,tag:payTag9(),pay:PAY.enabled}});
ok('no payment provider: Buy refuses without TEST MODE, TEST MODE still works',r.noTest&&r.test&&!r.pay&&/NOT CONNECTED/.test(r.tag),JSON.stringify(r));
// 2. provider on but not signed in: asks the shell to show the login, no confirmation dialog
r=await p.evaluate(async()=>{OUT.length=0;SHELL({enabled:true,mode:'test',signed:false});await TICK();const it=CATBY['c2.ball.gold'];MK.conf=null;startBuy(it);await TICK();return{pay:PAY.enabled,conf:!!MK.conf,out:OUT.map(o=>o.type)}});
ok('provider on, not signed in: the shell is asked to log in, nothing to confirm',!r.pay&&!r.conf&&r.out.includes('need-login'),JSON.stringify(r));
// 3. signed in: Buy goes to checkout through the shell and grants nothing locally
r=await p.evaluate(async()=>{OUT.length=0;SHELL({enabled:true,mode:'test',signed:true,ids:[],orders:[]});await TICK();const it=CATBY['c2.ball.gold'];MK.conf=null;startBuy(it);const conf=!!MK.conf;const t0=[Object.keys(S.ent).length,Object.keys(S.testEnt).length,S.ledger.length];confirmBuy(it);await TICK();
 return{pay:PAY.enabled,mode:PAY.mode,tag:payTag9(),conf,buy:OUT.filter(o=>o.type==='buy').map(o=>o.product),after:[Object.keys(S.ent).length,Object.keys(S.testEnt).length,S.ledger.length],t0,owns:owns(it.id)}});
ok('signed in: Buy asks the shell for checkout and grants nothing locally',r.pay&&r.conf&&r.buy.length===1&&r.buy[0]==='c2.ball.gold'&&JSON.stringify(r.t0)===JSON.stringify(r.after)&&!r.owns&&/STRIPE TEST MODE/.test(r.tag),JSON.stringify(r));
// 4. the server's list replaces what the save claims (doctored save, refund)
r=await p.evaluate(async()=>{S.ent={'c2.ball.gold':'FAKE','c2.cap.navy':'x'};S.ap.ball='c2.ball.gold';S.ap.cap='c2.cap.navy';OUT.length=0;
 SHELL({enabled:true,mode:'test',signed:true,ids:['c2.cap.navy','c2.nope','c2.ball.pro'],orders:[{id:7,product_id:'c2.cap.navy',price:5,status:'paid',mode:'test'},{id:8,product_id:'c2.ball.gold',price:9,status:'refunded',mode:'test'}]});await TICK();
 return{ent:Object.keys(S.ent).sort(),ball:S.ap.ball,cap:S.ap.cap,ledger:S.ledger.map(l=>l.id+':'+l.p),owns:[owns('c2.ball.gold'),owns('c2.cap.navy')]}});
ok('the server list replaces owned items: doctored/refunded items are gone and unequipped, unknown ids ignored',JSON.stringify(r.ent)==='["c2.ball.pro","c2.cap.navy"]'&&!r.ball&&r.cap==='c2.cap.navy'&&JSON.stringify(r.ledger)==='["ORD-7:c2.cap.navy"]'&&!r.owns[0]&&r.owns[1],JSON.stringify(r));
// 5. a bundle bought for real is owned item by item, and the market still draws
r=await p.evaluate(async()=>{const b=CATBY['c2.bundle.emerald'];SHELL({enabled:true,mode:'live',signed:true,ids:b.contents,orders:[]});await TICK();openMarket();let drew=true;try{for(let c=0;c<CATS.length;c++){MK.c=c;MK.i=0;drawMarket()}}catch(e){drew=String(e)}scr=null;return{owned:bundleOwned(b),drew,tag:payTag9()}});
ok('a paid bundle counts as owned; every market tab draws; live mode shows the secure-checkout tag',r.owned&&r.drew===true&&/SECURE CHECKOUT/.test(r.tag),JSON.stringify(r));
// 6. server turns payments off (or the user signs out): back to TEST MODE rules, and the local test items are untouched
r=await p.evaluate(async()=>{S.testEnt={'c2.ball.match':'TEST-1'};SHELL({enabled:true,mode:'test',signed:false});await TICK();const off=!PAY.enabled;SHELL({enabled:false,signed:true,ids:[]});await TICK();return{off,still:!PAY.enabled,testKept:!!S.testEnt['c2.ball.match']}});
ok('signed out or payments off: provider mode ends, local TEST items untouched',r.off&&r.still&&r.testKept,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close();srv.kill();process.exit(R.some(x=>x.startsWith('FAIL'))||errs.length?1:0)})();
