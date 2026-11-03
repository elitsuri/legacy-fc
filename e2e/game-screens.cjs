// Career / menu screens captured through the real pause-menu callbacks, desktop (EN + HE) and a phone-width layout.
// usage: CHROME_PATH=... node game-screens.cjs /abs/path/to/frontend/public/game/index.html
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2];const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const SETUP=`localStorage.clear();NOFLUSH=1;initPlayer('Finisher','Professional');title=false;if(!S.W)S.W=genWorld(1);S.club=3;S.ct=mkCt(S.W.clubs[3],1);mkTable();S.lvl=9;S.money=4200;S.fol=2600;S.hist.g=24;S.hist.a=9;S.hist.m=30;S.hist.rts=[7.1,6.8,7.6,7.9,6.4,7.2];
 window.OPEN=i=>{dlg=null;menu=null;scr=null;banner=null;TQ.length=0;pause();const m=menu;menu=null;m.cb(i);for(let k=0;k<4;k++)logicStep()};`;
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const errs=[];const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));
const cap=async(name,vp)=>{await wait(200);if(vp==='phone')await p.screenshot({path:path.join(OUT,'screen-'+name+'.png')});else await (await p.$('canvas')).screenshot({path:path.join(OUT,'screen-'+name+'.png')});console.log('saved screen-'+name)};
for(const [lang,vp] of [['en','desk'],['he','desk'],['he','phone']]){
 if(vp==='phone')await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});else await p.setViewport({width:960,height:820,deviceScaleFactor:1.5});
 await p.goto('file://'+FILE);await wait(900);await p.evaluate(SETUP);await p.evaluate(l=>setLang(l,1),lang);
 const items=['Career dashboard','Profile','Attributes','CAREER MARKET','Wardrobe','World map'];const idx=[0,1,2,15,16,13];
 for(let k=0;k<idx.length;k++){if(vp==='phone'&&k>2)break;await p.evaluate(i=>OPEN(i),idx[k]);await cap(`${items[k].toLowerCase().replace(/ /g,'-')}-${lang}-${vp}`,vp)}
 await p.evaluate(()=>{scr=null;menu=null;dlg=null;pause()});await cap(`pause-menu-${lang}-${vp}`,vp);await p.evaluate(()=>{menu=null})}
console.log('page errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
