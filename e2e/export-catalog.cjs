// Exports the in-game store catalog to backend/app/catalog.json: the server holds the real prices and never trusts the client.
// `check` mode (used by tests) fails if the committed file differs from what the game currently sells.
// usage: CHROME_PATH=... node export-catalog.cjs /abs/path/to/frontend/public/game/index.html [check]
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');const wait=ms=>new Promise(r=>setTimeout(r,ms));
const FILE=process.argv[2],CHECK=process.argv[3]==='check',OUT=path.join(__dirname,'..','backend','app','catalog.json');
(async()=>{const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
const p=await b.newPage();await p.goto('file://'+FILE);await wait(900);
const items=await p.evaluate(()=>CAT.filter(i=>!i.free).map(i=>({id:i.id,cat:i.cat,price:i.p,name:i.n[0],contents:i.contents||null})).sort((a,b)=>a.id<b.id?-1:1));
await b.close();
const bad=items.filter(i=>!(Number.isInteger(i.price)&&i.price>=2&&i.price<=500));if(bad.length){console.error('bad prices',bad.slice(0,3));process.exit(1)}
const doc={currency:'ils',unit:'whole shekels (the game shows ₪ + price); Stripe amounts are price*100 agorot',items};const txt=JSON.stringify(doc,null,1)+'\n';
if(CHECK){const cur=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8'):'';if(cur!==txt){console.error('catalog.json is out of date: run node export-catalog.cjs <game>');process.exit(1)}console.log('catalog.json matches the game ('+items.length+' items)')}
else{fs.writeFileSync(OUT,txt);console.log('wrote',OUT,items.length,'items')}})();
