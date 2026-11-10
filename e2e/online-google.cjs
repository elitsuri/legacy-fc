// "Continue with Google" end to end, with a local stand-in for GOOGLE'S SERVERS ONLY:
//  - the Google button script is answered by a stub (so no internet and no real Google account is needed),
//  - Google's key set (JWKS) is served by a local mock; the real server code fetches it, checks the RS256 signature, issuer, audience
//    and expiry, and creates / reuses the player.
// A real Google OAuth client ID and a real Google sign-in are NOT exercised here (only the owner of the Google account can do that).
// usage: CHROME_PATH=... node online-google.cjs   (needs backend/.venv with requirements installed, and `npm run build` in frontend/)
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto'),{spawn}=require('child_process');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ROOT=path.join(__dirname,'..'),BACK=path.join(ROOT,'backend'),PORT=8768,MOCK=8767,BASE=`http://localhost:${PORT}`,CLIENT='1234567890-e2e.apps.googleusercontent.com';
const PY=process.platform==='win32'?path.join(BACK,'.venv','Scripts','python.exe'):path.join(BACK,'.venv','bin','python');
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
const good=crypto.generateKeyPairSync('rsa',{modulusLength:2048}),evil=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const jwk=Object.assign(good.publicKey.export({format:'jwk'}),{kid:'e2e-key',use:'sig',alg:'RS256'});let jwksHits=0;
const mock=http.createServer((req,res)=>{if(req.url==='/jwks'){jwksHits++;res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({keys:[jwk]}))}res.writeHead(404);res.end()});
const b64=o=>Buffer.from(typeof o==='string'?o:JSON.stringify(o)).toString('base64url');
function token(claims,key=good.privateKey,kid='e2e-key'){const now=Math.floor(Date.now()/1000),h=b64({alg:'RS256',typ:'JWT',kid}),
 p=b64(Object.assign({iss:'https://accounts.google.com',aud:CLIENT,sub:'g-1001',email:'eli.google@example.com',email_verified:true,name:'Eli Google',iat:now,exp:now+600},claims)),
 sig=crypto.createSign('RSA-SHA256').update(h+'.'+p).sign(key).toString('base64url');return h+'.'+p+'.'+sig}
const STUB="window.google={accounts:{id:{initialize(o){window.__gsi={cid:o.client_id,cb:o.callback}},renderButton(el,o){const b=document.createElement('button');b.id='fakeg';b.textContent='Continue with Google';b.onclick=()=>window.__gsi.cb({credential:window.__CRED});el.appendChild(b);window.__btn=o}}}};";
(async()=>{
 mock.listen(MOCK);try{fs.rmSync(path.join(BACK,'data','e2e-g.db'),{force:true})}catch(e){}
 const env=Object.assign({},process.env,{APP_ENV:'development',SECRET_KEY:'e2e-'+'x'.repeat(40),DATABASE_URL:'sqlite:///./data/e2e-g.db',STATIC_DIR:path.join(ROOT,'frontend','dist'),
  GOOGLE_CLIENT_ID:CLIENT,GOOGLE_JWKS_URL:`http://localhost:${MOCK}/jwks`,AUTH_RATE_PER_MINUTE:'1000',RUN_MIGRATIONS:'1'});
 const srv=spawn(PY,['-m','uvicorn','app.main:app','--port',String(PORT),'--log-level','warning'],{cwd:BACK,env,stdio:['ignore','pipe','pipe']});let srvLog='';srv.stderr.on('data',d=>srvLog+=d);srv.stdout.on('data',d=>srvLog+=d);
 for(let i=0;i<60;i++){try{if((await fetch(BASE+'/api/health')).ok)break}catch(e){}await wait(500)}
 const cfg=await (await fetch(BASE+'/api/config')).json();ok('server up with Google configured; the config tells the page the client id',cfg.google&&cfg.google.enabled&&cfg.google.client_id===CLIENT,JSON.stringify(cfg.google));
 const csp=(await fetch(BASE+'/')).headers.get('content-security-policy')||'';
 ok('the shell CSP allows exactly Google\'s button script, frame and style',/script-src 'self' https:\/\/accounts\.google\.com\/gsi\/client/.test(csp)&&/frame-src 'self' https:\/\/accounts\.google\.com\/gsi\//.test(csp)&&/style-src [^;]*https:\/\/accounts\.google\.com\/gsi\/style/.test(csp));
 const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
 const errs=[];const p=await b.newPage();await p.setViewport({width:1000,height:760});p.on('pageerror',e=>errs.push(e.message));const cspv=[];p.on('console',m=>{if(/Content Security Policy|Refused to/i.test(m.text()))cspv.push(m.text().slice(0,160))});
 await p.setRequestInterception(true);let gsiAsked=0;p.on('request',r=>{if(/accounts\.google\.com\/gsi\/client/.test(r.url())){gsiAsked++;return r.respond({status:200,contentType:'text/javascript',body:STUB})}r.continue()});
 await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('lfc_lang','en')}catch(e){}});
 const openAuth=async()=>{await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});await wait(600);await p.evaluate(()=>{const b=[...document.querySelectorAll('button.primary')].find(x=>/Sign in/i.test(x.innerText));b&&b.click()});await p.waitForSelector('#fakeg',{timeout:8000}).catch(()=>null)};
 const who=()=>p.evaluate(()=>{const a=document.querySelector('button.acct');return a?a.innerText:null});
 // 1. the button appears only because the server says so, and is set up with the client id from the server
 await openAuth();let st=await p.evaluate(()=>({btn:!!document.querySelector('#fakeg'),cid:window.__gsi&&window.__gsi.cid,opt:window.__btn,legal:/Terms of Use/.test(document.body.innerText)}));
 ok('the Google button is shown in the sign-in panel, with the server\'s client id and legal links',st.btn&&st.cid===CLIENT&&gsiAsked===1&&st.legal,JSON.stringify(st));
 // 2. a valid credential signs the player in (server fetched Google\'s keys and verified the signature)
 await p.evaluate(t=>{window.__CRED=t},token({}));await p.click('#fakeg');await wait(1500);
 const me1=await p.evaluate(async()=>{const t=localStorage.getItem('lfc_token');const r=await fetch('/api/me',{headers:{authorization:'Bearer '+t}});return{s:r.status,j:await r.json()}});
 ok('a valid Google credential signs in; the page shows the player',(await who())==='Eli Google'&&me1.s===200&&/^eli\.google/.test(me1.j.username),JSON.stringify({who:await who(),me:me1.j}));
 ok('the server fetched Google\'s signing keys and verified the signature itself',jwksHits>=1,'jwks hits '+jwksHits);
 // 3. still signed in after a reload; the same Google account is the same player next time
 await p.reload({waitUntil:'domcontentloaded'});await wait(1200);const after=await who();
 ok('still signed in after a reload',after==='Eli Google',after);
 await p.evaluate(()=>localStorage.removeItem('lfc_token'));await openAuth();await p.evaluate(t=>{window.__CRED=t},token({}));await p.click('#fakeg');await wait(1500);
 const me2=await p.evaluate(async()=>{const t=localStorage.getItem('lfc_token');const r=await fetch('/api/me',{headers:{authorization:'Bearer '+t}});return r.json()});
 ok('signing in again with the same Google account gives the same player (no duplicate)',me2.id===me1.j.id,JSON.stringify({a:me1.j.id,b:me2.id}));
 // 4. forged and wrong credentials are refused in the UI, nobody is signed in
 const tryBad=async(cred)=>{await p.evaluate(()=>localStorage.removeItem('lfc_token'));await openAuth();await p.evaluate(t=>{window.__CRED=t},cred);await p.click('#fakeg');await wait(1200);
  return p.evaluate(()=>({err:(document.querySelector('.err')||{}).innerText||null,acct:!!document.querySelector('button.acct'),tok:localStorage.getItem('lfc_token')}))};
 let bad=await tryBad(token({sub:'g-evil'},evil.privateKey));ok('a credential signed with another key is refused',bad.err&&!bad.acct&&!bad.tok,JSON.stringify(bad));
 bad=await tryBad(token({aud:'999-other.apps.googleusercontent.com',sub:'g-aud'}));ok('a credential made for another app is refused',bad.err&&!bad.acct&&!bad.tok,JSON.stringify(bad));
 bad=await tryBad(token({exp:Math.floor(Date.now()/1000)-3600,iat:Math.floor(Date.now()/1000)-7200,sub:'g-old'}));ok('an expired credential is refused',bad.err&&!bad.acct&&!bad.tok,JSON.stringify(bad));
 // 5. quiet console
 ok('no page errors and no Content-Security-Policy violations',errs.length===0&&cspv.length===0,JSON.stringify({errs:errs.slice(0,3),cspv:cspv.slice(0,3)}));
 await b.close();mock.close();srv.kill();await new Promise(r=>{srv.once('exit',r);setTimeout(r,4000)});try{fs.rmSync(path.join(BACK,'data','e2e-g.db'),{force:true})}catch(e){}
 if(R.some(x=>x.startsWith('FAIL')))console.log(srvLog.split('\n').slice(-25).join('\n'));
 console.log(R.join('\n'));console.log(R.some(x=>x.startsWith('FAIL'))?'SOME FAILED':'ALL PASSED ('+R.length+')');process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})().catch(e=>{console.error('ERR',e);process.exit(1)});
