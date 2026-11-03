// Average number of pedestrians visible on screen at a few spots (afternoon), for comparing builds.
const puppeteer=require('puppeteer-core');(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH,headless:true});const p=await b.newPage();await p.goto('file://'+process.argv[2]);await new Promise(r=>setTimeout(r,800));
const r=await p.evaluate(()=>{const out={};for(const [n,x,y] of [['hq',53,12],['center',50,51],['commercial',95,57],['park',20,50],['residential',58,87]]){localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;S.t=1;PEDS8.length=0;S.x=x;S.y=y;PL8.tx=-1;
 let sum=0,k=0;for(let i=0;i<4800;i++){logicStep();if(i>1200&&i%60===0){k++;sum+=PEDS8.filter(q=>{const sx=q.x-CAM8.x,sy=q.y-CAM8.y;return sx>0&&sx<480&&sy>0&&sy<320}).length}}out[n]=+(sum/k).toFixed(1)}return out});
console.log(JSON.stringify(r));await b.close()})();
