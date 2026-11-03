const puppeteer=require('puppeteer-core');const wait=ms=>new Promise(r=>setTimeout(r,ms));const FILE=process.argv[2];
const R=[];const ok=(n,c,x)=>R.push((c?'PASS ':'FAIL ')+n+(x!=null?' — '+x:''));
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});const p=await b.newPage();await p.setViewport({width:800,height:720});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',async m=>{if(m.type()=='error'&&!m.text().includes('ERR_TUNNEL')){let t=m.text();try{t=await m.args()[0].evaluate(e=>e&&e.stack?e.stack.split('\n').slice(0,2).join('|'):String(e))}catch(e){}errs.push(t.slice(0,200))}});
await p.goto('file://'+FILE);await wait(900);await p.click('canvas');
await p.evaluate(()=>{title=false;dlg=null;menu=null;scr=null;initPlayer('Finisher','Showman');S.ct=mkCt(mine(),.8);S.en=100;S.t=1;S.day=2;S.x=53;S.y=12;PL8.tx=-1});await wait(300);
const pos=()=>p.evaluate(()=>({x:PL8.x,y:PL8.y,st:PL8.st,dir:PL8.dir,tx:S.x,ty:S.y}));
const hold=async(keys,ms)=>{for(const k of keys)await p.keyboard.down(k);await wait(ms);for(const k of keys)await p.keyboard.up(k);await wait(250)};
// speed measure: logic steps based
const meas=async(keys,steps)=>p.evaluate(async(keys,steps)=>{held.length=0;keys.forEach(k=>held.push(k));PL8.vx=PL8.vy=0;const x0=PL8.x,y0=PL8.y;for(let i=0;i<steps;i++)logicStep();const d=Math.hypot(PL8.x-x0,PL8.y-y0);held.length=0;for(let i=0;i<30;i++)logicStep();return d},keys,steps);
await p.evaluate(()=>{S.x=50;S.y=13;PL8.tx=-1;logicStep()});
let d=await meas(['r'],120);ok('walk speed px/s (old grid walk = 240)',d/2<240*0.76&&d/2>240*0.6,(d/2).toFixed(1));
await p.evaluate(()=>{S.x=50;S.y=13;PL8.tx=-1;logicStep();SHIFT8=1});d=await meas(['r'],120);await p.evaluate(()=>SHIFT8=0);ok('run faster than walk',d/2>200,(d/2).toFixed(1));
await p.evaluate(()=>{S.x=50;S.y=13;PL8.tx=-1;logicStep()});const dx=await meas(['r'],60);await p.evaluate(()=>{S.x=50;S.y=13;PL8.tx=-1;logicStep()});const dd=await meas(['r','d'],60);ok('diagonal normalized',Math.abs(dd-dx)<dx*0.06,dx.toFixed(1)+' vs '+dd.toFixed(1));
// real keys
for(const [k,ax,sg,nm] of [['w','y',-1,'W up'],['s','y',1,'S down'],['a','x',-1,'A left'],['d','x',1,'D right'],['ArrowUp','y',-1,'Arrow up'],['ArrowRight','x',1,'Arrow right']]){await p.evaluate(()=>{S.x=53;S.y=13;PL8.tx=-1;logicStep()});const a=await pos();await hold([k],400);const c=await pos();ok(nm+' key moves',(c[ax]-a[ax])*sg>15,((c[ax]-a[ax])).toFixed(1))}
await p.evaluate(()=>{S.x=53;S.y=13;PL8.tx=-1;logicStep()});{const a=await pos();await hold(['w','d'],400);const c=await pos();ok('W+D diagonal',c.x-a.x>10&&a.y-c.y>10,`${(c.x-a.x).toFixed(1)},${(c.y-a.y).toFixed(1)}`)}
// stops on release
{await p.keyboard.down('d');await wait(300);await p.keyboard.up('d');await wait(300);const a=await pos();await wait(300);const c=await pos();ok('stops when released',Math.abs(c.x-a.x)<0.5,(c.x-a.x).toFixed(2))}
// blur clears keys
{await p.keyboard.down('d');await wait(200);await p.evaluate(()=>dispatchEvent(new Event('blur')));await wait(200);const a=await pos();await wait(300);const c=await pos();await p.keyboard.up('d');ok('focus loss stops movement',Math.abs(c.x-a.x)<0.5,(c.x-a.x).toFixed(2))}
// modal blocks
{await p.evaluate(()=>say('test'));const a=await pos();await hold(['d'],400);const c=await pos();await p.evaluate(()=>{dlg=null});ok('dialog blocks movement',Math.abs(c.x-a.x)<0.5)}
// collision: walk up into HQ wall
{await p.evaluate(()=>{S.x=51;S.y=10;PL8.tx=-1;logicStep()});await hold(['w'],1500);const c=await pos();ok('cannot enter building wall (HQ)',c.y>=9*32,c.y.toFixed(1))}
// wall sliding: walk up+right against HQ facade
{await p.evaluate(()=>{S.x=50;S.y=9;PL8.tx=-1;logicStep()});const a=await pos();await hold(['w','d'],700);const c=await pos();ok('slides along wall',c.x-a.x>20,(c.x-a.x).toFixed(1))}
// tree collision
{const t=await p.evaluate(()=>{const o=OBJ.find(o=>o.k=='tree'&&!o.edge&&o.x>40*32&&o.y<16*32);return [o.x,o.y]});await p.evaluate(t=>{PL8.x=t[0];PL8.y=t[1]+14;S.x=Math.floor(PL8.x/32);S.y=Math.floor(PL8.y/32);PL8.tx=S.x;PL8.ty=S.y;CAM8.init=0},t);await hold(['w'],600);const c=await pos();ok('trees block (trunk collider)',c.y>t[1]+2,`${c.y.toFixed(1)} vs trunk ${t[1]}`)}
// door interaction via E
{await p.evaluate(()=>{const f=FAC.find(f=>f[4]=='hq');S.x=f[0]+1;S.y=f[1]+3;PL8.tx=-1;logicStep();PL8.dir='u'});await wait(200);await p.keyboard.press('e');await wait(1000);const m=await p.evaluate(()=>{const i=typeof LFC_INT=='function'&&LFC_INT();return i?'room:'+i.kind:menu&&menu.title});ok('E at HQ door opens the HQ (walk-in room since v9)',!!m,m);await p.evaluate(()=>{menu=null;Tr=null;INT9=null})}
{await p.evaluate(()=>{const f=FAC.find(f=>f[4]=='cafe');S.x=f[0]+1;S.y=f[1]+3;PL8.tx=-1;logicStep();PL8.dir='u'});await wait(200);await p.keyboard.press('e');await wait(300);const m=await p.evaluate(()=>menu&&menu.title);ok('E at a menu door (cafe) opens its menu',!!m,m);await p.evaluate(()=>{menu=null})}
// all doors reachable: BFS from start on walkable
{const r=await p.evaluate(()=>{const seen=new Uint8Array(MW*MH),q=[[53,13]];seen[13*MW+53]=1;while(q.length){const [x,y]=q.pop();for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(!inb(nx,ny)||seen[ny*MW+nx])continue;if(isWalkT(M[ny][nx],nx,ny)){seen[ny*MW+nx]=1;q.push([nx,ny])}}}let n=0,bad=[];FAC.forEach(f=>{const b=f[5];n++;if(!seen[(b.door.y+1)*MW+b.door.x])bad.push(b.name)});return {n,bad,coll:COLLECT.filter(c=>!seen[Math.floor(c.y/32)*MW+Math.floor(c.x/32)]).map(c=>c.id),npc:NPCS.filter(n=>!seen[(n.y+1)*MW+n.x]&&!seen[n.y*MW+n.x-1]&&!seen[n.y*MW+n.x+1]&&!seen[(n.y-1)*MW+n.x]).map(n=>n.id)}});ok('entrances reachable',r.bad.length==0&&r.n>=29,r.n+' '+JSON.stringify(r.bad));ok('collectibles reachable',r.coll.length==0,JSON.stringify(r.coll));ok('NPCs reachable',r.npc.length==0,JSON.stringify(r.npc))}
// trapped check: spawn positions valid
ok('map size 160x120',await p.evaluate(()=>MW==160&&MH==120));
// talk to coach via E
{await p.evaluate(()=>{S.arch=null;const n=NPCS[0];PL8.x=n.x*32+16;PL8.y=n.y*32+24+22;S.x=Math.floor(PL8.x/32);S.y=Math.floor(PL8.y/32);PL8.tx=S.x;PL8.ty=S.y;PL8.dir='u'});await wait(200);await p.keyboard.press('e');await wait(200);ok('talk to coach',await p.evaluate(()=>!!dlg));await p.evaluate(()=>{dlg=null;initPlayer('Finisher','Showman')})}
// bench sit
{const r=await p.evaluate(()=>{const o=OBJ.find(o=>o.k=='bench'&&o.x>41*32&&o.x<57*32&&o.y>41*32);PL8.x=o.x;PL8.y=o.y+14;S.x=Math.floor(PL8.x/32);S.y=Math.floor(PL8.y/32);PL8.tx=S.x;PL8.ty=S.y;PL8.dir='u';S.en=50;for(let i=0;i<3;i++)logicStep();interact();const sit=!!PL8.sit;for(let i=0;i<600;i++)logicStep();return {sit,en:S.en}});ok('bench sit restores energy',r.sit&&r.en>50,JSON.stringify(r));await hold(['s'],200)}
// collectible
{const r=await p.evaluate(()=>{const c=COLLECT[0];S.col8={};PL8.x=c.x;PL8.y=c.y;S.x=Math.floor(c.x/32);S.y=Math.floor(c.y/32);PL8.tx=S.x;PL8.ty=S.y;const m0=S.money;for(let i=0;i<3;i++)logicStep();const got=!!S.col8[c.id],m1=S.money;for(let i=0;i<3;i++)logicStep();return {got,m:m1-m0,m2:S.money-m1}});ok('collectible once',r.got&&r.m==25&&r.m2==0,JSON.stringify(r))}
// cars stop for player
{const r=await p.evaluate(()=>{CARS8.length=0;const y=18,x=30;CARS8.push({x:20*32+16,y:19*32+16,tx:20,ty:19,dir:'E',ang:0,spd:1.2,v:1.2,col:'#c00',kind:'car',wait:0,turn:null,honk:0});PL8.x=24*32+16;PL8.y=19*32+20;S.x=24;S.y=19;PL8.tx=24;PL8.ty=19;for(let i=0;i<400;i++)car8Step();const c=CARS8[0];return {cx:c?c.x:null,px:PL8.x}});ok('car stops before player',r.cx!=null&&r.cx<r.px-20,JSON.stringify(r))}
// gate closes at night
{const r=await p.evaluate(()=>{S.t=3;PL8.x=60*32;PL8.y=60*32;for(let i=0;i<3;i++)gates8Step();const closed=GATES.every(q=>!q.open);S.t=1;for(let i=0;i<3;i++)gates8Step();return {closed,open:GATES.every(q=>q.open)}});ok('gates close at night/open by day',r.closed&&r.open,JSON.stringify(r))}
console.log(R.join('\n'));console.log('errs',JSON.stringify(errs.slice(0,6)));await b.close()})();
