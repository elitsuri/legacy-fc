// Renders character sprite sheets (animation cycles, action poses, career stages) of a built game file to PNG.
// usage: CHROME_PATH=... node game-sheet.cjs /abs/path/to/index.html out-prefix
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],PRE=process.argv[3]||'sheet';const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(900);
await p.evaluate(()=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;window.logicStep=()=>{};
 window.LOOK=(lv)=>{const a=pkx(S.ap),o=Object.assign(plOpts(),{sh:solid(a[0]),hc:solid(a[4]||'#2b1a10'),bt:solid(a[5]||'#15161a'),pa:solid(a[6]||'#1b2240'),out:'kit',tier:0,num:'10'});o.sk=solid(o.sk);o.c2=solid(o.c2||'#1b2a49');if(lv!=null)o.lv=lv;return o};
 window.GRID=(cells,title,sc)=>{g.setTransform(SCv,0,0,SCv,0,0);const gr=g.createLinearGradient(0,0,0,320);gr.addColorStop(0,'#4f8a46');gr.addColorStop(1,'#3d7537');g.fillStyle=gr;g.fillRect(0,0,480,320);txt(title,240,16,10,'#ffd96a','#000','center');
  const cols=Math.min(8,cells.length),rows=Math.ceil(cells.length/cols);cells.forEach((c,i)=>{const x=30+(i%cols)*(420/(cols-1||1)),y=(rows===1?190:rows===2?140+Math.floor(i/cols)*140:118+Math.floor(i/cols)*100);drawActor(x,y,c.o,sc||2,c.d,c.st,c.f);txt(c.l,x,y+16,7,'#fff','#000','center')})};
 window.drawWorld=()=>{};drawUI=()=>{};});
const shot=async n=>{await p.evaluate(()=>{window.drawWorld=window._D||(()=>{})});await wait(150);await (await p.$('canvas')).screenshot({path:path.join(OUT,PRE+'-'+n+'.png')});console.log('saved',PRE+'-'+n)};
const scene=async(fn)=>{await p.evaluate(`window._D=()=>{${fn}};`);};
await scene(`const o=LOOK(2);GRID([0,1,2,3,4,5,6,7].map(f=>({o,d:'r',st:'walk',f,l:'walk '+f})).concat([0,1,2,3,4,5,6,7].map(f=>({o,d:'r',st:'run',f,l:'run '+f}))),'WALK + RUN CYCLES (side)',1.9)`);await shot('cycles-side');
await scene(`const o=LOOK(2);GRID([0,1,2,3,4,5,6,7].map(f=>({o,d:'d',st:'walk',f,l:'walk '+f})).concat([0,1,2,3,4,5,6,7].map(f=>({o,d:'r',st:'sprint',f,l:'sprint '+f}))),'WALK (front) + SPRINT (side)',1.9)`);await shot('cycles-front');
await scene(`const o=LOOK(2);GRID([['r','pass',1],['r','shoot',0],['r','shoot',2],['r','shoot',3],['r','tackle',0],['r','slide',0],['r','head',0],['r','drib',2],['d','react',0],['d','cel',1],['r','celw',1],['d','celf',1],['r','kneel',0],['d','award',1],['d','idle',0],['u','walk',2]].map(([d,st,f])=>({o,d,st,f,l:st+' '+f})),'ACTION POSES',1.9)`);await shot('poses');
await scene(`GRID([0,1,2,3,4,5].map(lv=>({o:LOOK(lv),d:'d',st:'idle',f:0,l:['Unknown','Amateur','Professional','Star','Superstar','Legend'][lv]})).concat([0,1,2,3,4,5].map(lv=>({o:LOOK(lv),d:'u',st:'idle',f:0,l:'back'}))),'CAREER STAGES (same kit)',2.3)`);await shot('career');
await scene(`const o=LOOK(2);GRID([['d','dive',0],['d','dive',1],['d','fall',0],['d','fall',1],['r','getup',0],['r','getup',1],['d','getup',0],['d','getup',1],['u','throw',0],['r','throw',0],['r','throw',1],['d','catch',0],['r','catch',0],['d','jack',0],['d','jack',1],['d','stretch10',1]].map(([d,st,f])=>({o,d,st,f,l:st+' '+f})),'v9 ANIMATIONS (p10j)',1.9)`);await shot('anim');
console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
