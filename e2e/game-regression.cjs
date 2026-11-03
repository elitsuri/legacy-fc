const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const mkp=async()=>{const p=await b.newPage();await p.setViewport({width:800,height:720});p.on('pageerror',e=>errs.push(e.message));return p};
// 1. v6 save migration: craft v4-format save from current defaults
let p=await mkp();await p.goto('file://'+FILE);await wait(800);
const v6=await p.evaluate(()=>{initPlayer('Finisher','Showman');S.money=777;S.lvl=9;S.v=4;S.x=7;S.y=9;S.disc={fb:1};delete S.hc;delete S.num;S.ap.br=undefined;const j=JSON.stringify(S);localStorage.clear();localStorage.setItem('fl_save4',j);return j.length});
await p.reload();await wait(1000);
let r=await p.evaluate(()=>({v:S.v,money:S.money,lvl:S.lvl,pre:!!localStorage.getItem('fl_pre_rebirth'),hc:S.hc,num:S.num,cont:typeof titleItems=='function'?JSON.stringify(titleItems()):''}));
ok('v6→v7 migration keeps career',r.money==777&&r.lvl==9,JSON.stringify(r));ok('pre-rebirth backup written',r.pre);ok('Continue shown with valid save',/Continue|המשך/.test(r.cont),r.cont);
// 2. corrupt save
await p.evaluate(()=>{localStorage.setItem('fl_save4','{broken');});await p.reload();await wait(1000);
r=await p.evaluate(()=>({t:title,money:S.money,err:typeof S}));ok('corrupt save recovers from backup (no crash)',r.err=='object',JSON.stringify(r));
// 3. no save -> no Continue
await p.evaluate(()=>{NOFLUSH=1;localStorage.clear()});await p.reload();await wait(1000);
r=await p.evaluate(()=>JSON.stringify(titleItems()));ok('no Continue without save',!/Continue|המשך קריירה/.test(r),r);
// 4. legacy fl_save3
await p.evaluate(()=>{initPlayer('Finisher','Showman');S.money=4321;S.x=7;S.y=9;S.disc={fb:1};delete S.v;S.v=2;const j=JSON.stringify(S);localStorage.clear();localStorage.setItem('fl_save3',j)});await p.reload();await wait(1000);
r=await p.evaluate(()=>S.money);ok('legacy fl_save3 migrated',r==4321,String(r));
// 5. market safeguards
r=await p.evaluate(()=>{title=false;S.test=false;const it=CAT.find(i=>!i.free&&i.cat!='bund');const before=JSON.stringify(S.ent)+JSON.stringify(S.testEnt);openMarket();mkAct(it);const after=JSON.stringify(S.ent)+JSON.stringify(S.testEnt);const m1=MK.msg,conf=!!MK.conf;
 S.test=true;MK.conf=null;mkAct(it);const conf2=!!MK.conf;mkKey('x');const cancelOwn=owns(it.id);mkAct(it);mkKey('enter');const testOwn=!!S.testEnt[it.id],prodOwn=!!S.ent[it.id];
 const dup=grantEntitlement({id:S.ledger[S.ledger.length-1].id,product:it.id,verified:true,test:true});const unv=grantEntitlement({id:'X1',product:it.id,verified:false});
 S.test=false;const ownOff=owns(it.id);const prices=CAT.filter(i=>!i.free).map(i=>i.p);scr=null;
 return {same:before==after,m1,conf,conf2,cancelOwn,testOwn,prodOwn,dup,unv,ownOff,pmin:Math.min(...prices),pmax:Math.max(...prices),pay:PAY.enabled,led:S.ledger.length,ltest:S.ledger.every(l=>l.test)}});
ok('no purchase when payments not connected',r.same&&!r.conf,r.m1);ok('TEST mode shows confirmation',r.conf2);ok('cancel grants nothing',!r.cancelOwn);ok('TEST purchase → test entitlement only',r.testOwn&&!r.prodOwn);
ok('duplicate tx rejected',r.dup===false);ok('unverified tx rejected',r.unv===false);ok('test items not owned when TEST off',!r.ownOff);ok('prices ₪3–₪15',r.pmin>=3&&r.pmax<=15,r.pmin+'–'+r.pmax);ok('real payments disabled',r.pay===false);ok('ledger entries labelled test',r.ltest,String(r.led));
// 6. wardrobe apply/discard
r=await p.evaluate(()=>{const orig=JSON.stringify(S.ap);const sl=WSL[0][0];const alt=CAT.find(i=>i.slot==sl&&i.id!=S.ap[sl]);wardrobe();WD.tmp[sl]=alt.id;wdExit();const m=menu;m.cb(1);const afterDiscard=JSON.stringify(S.ap);menu=null;
 wardrobe();WD.tmp[sl]=alt.id;wdExit();menu.cb(0);menu=null;return {d:afterDiscard==orig,a:S.ap[sl]==alt.id,keys:sl}});
ok('wardrobe discard restores look',r.d,JSON.stringify(r.keys));ok('wardrobe apply saves look',r.a);
// 7. language switch preserves state
r=await p.evaluate(()=>{const m=S.money,x=S.x;setLang('en',1);const a=S.lang;setLang('he',1);return {ok:S.money==m&&S.x==x,a,b:S.lang}});ok('language switch preserves state',r.ok&&r.a=='en'&&r.b=='he',JSON.stringify(r));
// 9. 40 auto matches stability + heap (classic turn-based engine; the live engine has its own test: game-livematch.cjs)
const h0=await p.evaluate(()=>performance.memory?performance.memory.usedJSHeapSize:0);let played=0;
for(let i=0;i<40;i++){await p.evaluate(i=>{S.lmode='classic';scr=null;dlg=null;menu=null;B=null;const oc=cb(S.ord[i%S.ord.length]);const o=enemyOf(3+i%5,nm(oc.n));o.trainer=1;o.lg=1;o.home=i%2==0;battle(o,'Go',null)},i);
 for(let k=0;k<300;k++){const st=await p.evaluate(()=>({ft:!!(scr&&String(scr.draw).includes('drawFT')),B:!!B}));if(st.ft){played++;break}await p.keyboard.press('Enter');await wait(25)}}
const h1=await p.evaluate(()=>{scr=null;return performance.memory?performance.memory.usedJSHeapSize:0});
r=await p.evaluate(()=>({m:S.hist.m,rts:S.hist.rts.length}));ok('40 consecutive official matches complete',played==40,`played ${played}, hist.m ${r.m}`);
console.log('heap MB before/after 40 matches',(h0/1e6).toFixed(1),(h1/1e6).toFixed(1));
// 10. new career + restore previous
r=await p.evaluate(()=>{save();const m=S.money;return m});
await p.evaluate(()=>{startNewCareer()});await wait(1500);
r=await p.evaluate(()=>({prev:!!localStorage.getItem('fl_prev_career'),cur:S.hist.m,arch:S.arch,money:S.money,prevm:JSON.parse(localStorage.getItem('fl_prev_career')).hist.m}));ok('new career starts fresh + keeps previous career backup',r.prev&&r.cur==0&&r.prevm==40,JSON.stringify(r));
console.log(R.join('\n'));console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
