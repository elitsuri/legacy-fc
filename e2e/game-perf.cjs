const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});const p=await b.newPage();await p.setViewport({width:800,height:720});
await p.goto('file://'+process.argv[2]);await wait(1000);
await p.evaluate(()=>{title=false;initPlayer('Finisher','Showman');S.ct=mkCt(mine(),.8);S.t=1;S.day=2;Object.keys(FT).forEach(k=>S.disc[k]=1)});
const meas=async(name,setup)=>{await p.evaluate(setup);await wait(2500);const r=await p.evaluate(()=>new Promise(res=>{PERFS.length=0;const d=[];let last=performance.now(),n=0;function f(t){d.push(t-last);last=t;if(++n<300)requestAnimationFrame(f);else{const w=PERFS.slice().sort((a,b)=>a-b),dd=d.slice(1).sort((a,b)=>a-b);res({fps:(1000/(dd.reduce((a,v)=>a+v,0)/dd.length)).toFixed(1),p95frame:dd[Math.floor(dd.length*.95)].toFixed(1),work:(w.reduce((a,v)=>a+v,0)/w.length).toFixed(2),workP95:w[Math.floor(w.length*.95)].toFixed(2),max:w[w.length-1].toFixed(1),peds:PEDS8.length,cars:CARS8.length,chunks:CHK.size,bspr:BSPR.size,actc:ACTC.size})}}requestAnimationFrame(f)}));console.log(name.padEnd(22),JSON.stringify(r))};
await meas('quiet: park',()=>{S.x=20;S.y=50;PL8.tx=-1});
await meas('busy: stadium plaza',()=>{S.x=97;S.y=25;PL8.tx=-1;S.md=0});
await meas('busy: city center',()=>{S.x=52;S.y=57;PL8.tx=-1});
await meas('night + rain downtown',()=>{S.t=3;S.day=0;while(wxNow()!='Rain')S.day++;S.x=52;S.y=57;PL8.tx=-1});
await meas('walking across city',()=>{S.t=1;S.day=2;S.x=42;S.y=60;PL8.tx=-1;held.length=0;held.push('r');SHIFT8=1});
// walk-in rooms (illustrated interiors): enter through the real door, then measure while standing inside
const room=kind=>new Function(`held.length=0;SHIFT8=0;INT9=null;S.money=1e5;S.home=4;dlg=null;menu=null;scr=null;const f=FAC.find(f=>f[4]==='${kind}'&&f[5]),b2=f[5];S.x=b2.door.x;S.y=b2.door.y+1;PL8.tx=-1;for(let i=0;i<5;i++)logicStep();PL8.dir='u';PL8.x=b2.door.x*T8+16;PL8.y=(b2.door.y+1)*T8+6;PL8.lastInt=-99;for(let i=0;i<2;i++)logicStep();dlg=null;menu=null;interact();for(let i=0;i<3;i++){logicStep();if(Tr){const c=Tr.cb;Tr=null;c()}}dlg=null;menu=null;TQ.length=0;if(!INT9)console.warn('perf: room not entered ${kind}')`);
await meas('room: club HQ',room('hq'));await meas('room: changing room',room('st'));await meas('room: gym',room('gym'));await p.evaluate(()=>{S.t=3});await meas('room: mansion at night',room('home'));await p.evaluate(()=>{INT9=null;S.t=1});
const h=await p.evaluate(()=>performance.memory.usedJSHeapSize/1e6);console.log('heap MB',h.toFixed(1));
await p.evaluate(()=>{held.length=0;SHIFT8=0});await b.close()})();
