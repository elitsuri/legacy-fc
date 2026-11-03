// City reference screenshots: teleports Eli to landmark spots, lets the world simulate, captures the canvas.
// usage: CHROME_PATH=... node game-city.cjs /abs/path/to/index.html prefix [stage]
// stage (optional) fakes a career level for the career-reaction views: 0 new player, 1 established pro, 2 superstar
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],PRE=process.argv[3]||'city',STAGE=+(process.argv[4]||0);const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+FILE);await wait(900);
await p.evaluate(st=>{localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;setLang('en',1);S.disc={};['trn','fb','stad','acad','park','down','com','prem','comm','res','tr','wf'].forEach(k=>S.disc[k]=1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();
 if(st>=1){S.lvl=st>=2?18:8;S.fol=st>=2?42000:2600;S.hist.g=st>=2?140:24;S.tro=st>=2?3:0;S.sp=st>=2?9:2;S.rep.fan=st>=2?80:35;S.lastRes={d:S.day,r:1,gf:3,ga:1,opp:S.W.clubs[4].n[0],myG:st>=2?2:0}}
 window.GO=(x,y,t,wx)=>{dlg=null;menu=null;scr=null;banner=null;TQ.length=0;S.t=t;if(wx)window.wxNow=()=>wx;S.x=x;S.y=y;PL8.tx=-1;held.length=0;PEDS8.length=0;for(let i=0;i<1500;i++)logicStep()};},STAGE);
const shot=async(n,x,y,t,wx)=>{await p.evaluate((x,y,t,wx)=>GO(x,y,t,wx),x,y,t||0,wx||null);await wait(250);await (await p.$('canvas')).screenshot({path:path.join(OUT,PRE+'-'+n+'.png')});console.log('saved',PRE+'-'+n)};
await shot('football-hq',53,12,1);await shot('city-center',50,51,1);await shot('commercial',95,57,1);await shot('stadium-plaza',97,25,1);
await shot('park',27,66,0);await shot('residential',58,87,2);await shot('waterfront',134,95,1);await shot('downtown-night',66,58,3);
console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
