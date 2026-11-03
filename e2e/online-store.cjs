// Full-stack check of purchases and friends: the real backend (uvicorn + database), the built React shell and the built game in a real
// browser. Only Stripe itself is replaced by a small local mock that speaks its API shape and signs webhooks with the real scheme,
// so this proves OUR side end to end; it does not prove the live Stripe account, keys or dashboard settings.
// usage: CHROME_PATH=... node online-store.cjs   (needs backend/.venv with requirements installed, and `npm run build` in frontend/)
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto'),{spawn}=require('child_process');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ROOT=path.join(__dirname,'..'),BACK=path.join(ROOT,'backend'),PORT=8765,MOCK=8766,BASE=`http://localhost:${PORT}`,WHSEC='whsec_e2e_mock';
const PY=process.platform==='win32'?path.join(BACK,'.venv','Scripts','python.exe'):path.join(BACK,'.venv','bin','python');
const R=[];const ok=(n,c,x)=>{R.push((c?'PASS ':'FAIL ')+n+(x?' — '+x:''))};
// ---------- the Stripe mock ----------
const sessions=new Map();let nSess=0,nEvt=0;
const mock=http.createServer((req,res)=>{let body='';req.on('data',d=>body+=d);req.on('end',()=>{
 const send=(o,c=200)=>{res.writeHead(c,{'content-type':'application/json'});res.end(JSON.stringify(o))};
 if(req.method==='POST'&&req.url==='/v1/checkout/sessions'){const q=new URLSearchParams(body),id='cs_test_mock_'+(++nSess);
  const s={id,object:'checkout.session',url:`http://localhost:${MOCK}/pay/${id}`,payment_status:'unpaid',status:'open',amount_total:+q.get('line_items[0][price_data][unit_amount]'),
   currency:q.get('line_items[0][price_data][currency]'),livemode:false,payment_intent:null,metadata:{order_id:q.get('metadata[order_id]'),user_id:q.get('metadata[user_id]'),product_id:q.get('metadata[product_id]')},
   success_url:q.get('success_url'),cancel_url:q.get('cancel_url'),created:Math.floor(Date.now()/1000)};sessions.set(id,s);return send(s)}
 let m=req.url.match(/^\/v1\/checkout\/sessions\/([\w]+)$/);if(req.method==='GET'&&m){const s=sessions.get(m[1]);return s?send(s):send({error:{message:'no such session'}},404)}
 m=req.url.match(/^\/__pay\/([\w]+)$/);if(m){const s=sessions.get(m[1]);if(!s)return send({},404);s.payment_status='paid';s.status='complete';s.payment_intent='pi_mock_'+m[1];return send(s)}
 if(req.url.startsWith('/pay/')){res.writeHead(200,{'content-type':'text/html'});return res.end('<h1>Mock Stripe Checkout</h1>')}
 send({error:{message:'not found '+req.url}},404)})});
async function webhook(type,obj){const ev={id:'evt_mock_'+(++nEvt),object:'event',type,data:{object:obj}},payload=JSON.stringify(ev),t=Math.floor(Date.now()/1000);
 const sig=crypto.createHmac('sha256',WHSEC).update(`${t}.${payload}`).digest('hex');
 const r=await fetch(`${BASE}/api/stripe/webhook`,{method:'POST',headers:{'content-type':'application/json','stripe-signature':`t=${t},v1=${sig}`},body:payload});return r.status}
const api=async(method,p,tok,body)=>{const r=await fetch(`${BASE}/api${p}`,{method,headers:Object.assign({'content-type':'application/json'},tok?{authorization:'Bearer '+tok}:{}),body:body?JSON.stringify(body):undefined});const t=await r.text();let j=null;try{j=JSON.parse(t)}catch(e){}return{s:r.status,j}};
(async()=>{
 mock.listen(MOCK);try{fs.rmSync(path.join(BACK,'data','e2e.db'),{force:true})}catch(e){}
 const env=Object.assign({},process.env,{APP_ENV:'development',SECRET_KEY:'e2e-'+'x'.repeat(40),DATABASE_URL:'sqlite:///./data/e2e.db',STATIC_DIR:path.join(ROOT,'frontend','dist'),
  STRIPE_SECRET_KEY:'sk_test_e2e_mock',STRIPE_WEBHOOK_SECRET:WHSEC,STRIPE_API_BASE:`http://localhost:${MOCK}`,PUBLIC_BASE_URL:BASE,AUTH_RATE_PER_MINUTE:'1000',RUN_MIGRATIONS:'1'});
 const srv=spawn(PY,['-m','uvicorn','app.main:app','--port',String(PORT),'--log-level','warning'],{cwd:BACK,env,stdio:['ignore','pipe','pipe']});let srvLog='';srv.stderr.on('data',d=>srvLog+=d);srv.stdout.on('data',d=>srvLog+=d);
 for(let i=0;i<60;i++){try{if((await fetch(BASE+'/api/health')).ok)break}catch(e){}await wait(500)}
 const cfg=(await api('GET','/config')).j;ok('server up with Stripe configured (TEST mode), migrations applied',cfg&&cfg.payments.enabled&&cfg.payments.mode==='test'&&cfg.payments.provider==='stripe',JSON.stringify(cfg&&cfg.payments));
 const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox'],headless:true});
 const errs=[];const p=await b.newPage();await p.setViewport({width:1100,height:800});p.on('pageerror',e=>errs.push(e.message));const csp=[];p.on('console',m=>{if(/Content Security Policy|Refused to/i.test(m.text()))csp.push(m.text().slice(0,160))});await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('lfc_lang','en')}catch(e){}});
 const A=(await api('POST','/auth/register',null,{username:'e2e_alice',password:'correct horse',display_name:'Alice'})).j,B=(await api('POST','/auth/register',null,{username:'e2e_bob',password:'correct horse',display_name:'Bob Builder'})).j;
 const frame=()=>p.frames().find(f=>/\/game\//.test(f.url()));
 const openShell=async tok=>{await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});await p.evaluate(t=>localStorage.setItem('lfc_token',t),tok);await p.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  for(let i=0;i<60;i++){const f=frame();if(f&&await f.evaluate(()=>typeof PAYX!=='undefined'&&typeof S!=='undefined').catch(()=>false))break;await wait(250)}await wait(900)};
 await openShell(A.token);
 // 1. the shell tells the game what the server offers
 let st=await frame().evaluate(()=>({on:PAYX.on,signed:PAYX.signed,pay:PAY.enabled,mode:PAY.mode,tag:payTag9()}));
 ok('game learns from the server: provider on, signed in, Stripe TEST mode',st.on&&st.signed&&st.pay&&st.mode==='test'&&/STRIPE TEST MODE/.test(st.tag),JSON.stringify(st));
 const testbar=await p.evaluate(()=>!!document.querySelector('.testbar'));ok('shell shows the TEST-mode banner',testbar);
 // 2. Buy in the game -> checkout through the server -> browser leaves for the payment page
 await frame().evaluate(()=>{initPlayer('Finisher','Professional');title=false;dlg=null;menu=null;scr=null;S.money=500;openMarket();const it=CATBY['c2.ball.gold'];startBuy(it);if(!MK.conf)throw new Error('no confirm dialog');confirmBuy(it)});
 for(let i=0;i<40&&!p.url().startsWith(`http://localhost:${MOCK}`);i++)await wait(250);
 ok('Buy in the game sends the browser to the payment page',p.url().startsWith(`http://localhost:${MOCK}/pay/`),p.url());
 const sid=p.url().split('/pay/')[1],sess=sessions.get(sid);
 ok('the server asked Stripe for the catalog price, not a client price',sess&&sess.amount_total===900&&sess.currency==='ils'&&sess.metadata.product_id==='c2.ball.gold'&&sess.metadata.user_id==String(A.user.id),JSON.stringify(sess&&{a:sess.amount_total,c:sess.currency,m:sess.metadata}));
 let ent=(await api('GET','/store/entitlements',A.token)).j;ok('nothing is owned before payment',ent.ids.length===0&&ent.orders[0].status==='pending',JSON.stringify(ent.ids));
 // 3. the customer pays; Stripe tells the server by webhook; the customer returns
 const paid=(await (await fetch(`http://localhost:${MOCK}/__pay/${sid}`)).json());
 ok('an unsigned/forged webhook is rejected',(await fetch(`${BASE}/api/stripe/webhook`,{method:'POST',headers:{'content-type':'application/json','stripe-signature':'t=1,v1=00'},body:JSON.stringify({id:'evt_x',type:'checkout.session.completed',data:{object:paid}})})).status===400);
 ok('a correctly signed webhook is accepted',(await webhook('checkout.session.completed',paid))===200);
 ent=(await api('GET','/store/entitlements',A.token)).j;ok('the server now lists the item and a paid order',ent.ids.join()==='c2.ball.gold'&&ent.orders[0].status==='paid'&&ent.orders[0].price===9,JSON.stringify(ent.orders[0]));
 await p.goto(paid.success_url.replace('{CHECKOUT_SESSION_ID}',sid),{waitUntil:'domcontentloaded'});
 for(let i=0;i<60;i++){const f=frame();if(f&&await f.evaluate(()=>typeof PAYX!=='undefined'&&owns('c2.ball.gold')).catch(()=>false))break;await wait(250)}
 const own=await frame().evaluate(()=>({own:owns('c2.ball.gold'),ent:S.ent['c2.ball.gold'],ledger:S.ledger.map(l=>l.id+':'+l.p+':'+l.price)}));
 ok('after returning from the payment page the game owns the item (granted by the server list)',own.own&&own.ent==='srv'&&own.ledger.length===1&&/^ORD-/.test(own.ledger[0]),JSON.stringify(own));
 ok('the success address is cleaned from the browser bar',!/checkout=/.test(p.url()),p.url());
 // 4. a doctored save cannot keep unpaid items
 await frame().evaluate(()=>{S.ent['c2.cap.navy']='FAKE';S.ap.cap='c2.cap.navy';save()});await openShell(A.token);
 const dd=await frame().evaluate(()=>({cap:owns('c2.cap.navy'),ball:owns('c2.ball.gold'),eq:S.ap.cap}));ok('a doctored save loses the unpaid item at the next sync; the paid one stays',!dd.cap&&dd.ball&&!dd.eq,JSON.stringify(dd));
 // 5. refund from Stripe takes the item back
 await webhook('charge.refunded',{payment_intent:paid.payment_intent,refunded:true});
 ent=(await api('GET','/store/entitlements',A.token)).j;ok('a full refund removes the item on the server',ent.ids.length===0&&ent.orders[0].status==='refunded',JSON.stringify(ent.orders[0]));
 await openShell(A.token);const rf=await frame().evaluate(()=>owns('c2.ball.gold'));ok('and in the game',!rf);
 // 6. cancelled checkout charges nothing
 await p.goto(BASE+'/?checkout=cancel',{waitUntil:'domcontentloaded'});await wait(1500);
 ok('cancelled checkout shows a "not charged" message',await p.evaluate(()=>/not charged/i.test(document.body.innerText)));
 // 7. friends: search -> request -> accept -> friends ranking, through the real UI
 await api('PUT','/saves/1',A.token,{data:{v:6,lvl:7,money:1,day:3,x:1,y:1,tro:1,fol:10,arch:'Finisher',hist:{g:4,m:5},att:{shooting:50},col8:{},season:1}});
 await api('PUT','/saves/1',B.token,{data:{v:6,lvl:12,money:1,day:3,x:1,y:1,tro:2,fol:10,arch:'Finisher',hist:{g:9,m:5},att:{shooting:50},col8:{},season:1}});
 await openShell(A.token);
 const clickText=async(sel,txt)=>{const h=await p.evaluateHandle((s,t)=>[...document.querySelectorAll(s)].find(e=>e.textContent.trim()===t),sel,txt);const el=h.asElement();if(!el)throw new Error('no '+sel+' "'+txt+'"');await el.click()};
 await clickText('nav button','Friends');await wait(500);await clickText('.tabs button','Find players');await p.type('.searchbar input','e2e_bo');await clickText('.searchbar button','Find players');await wait(800);
 const res=await p.evaluate(()=>[...document.querySelectorAll('.player')].map(e=>e.innerText.replace(/\s+/g,' ')));ok('searching by a prefix finds the other player (with an Add button)',res.length===1&&/Bob Builder/.test(res[0])&&/Add friend/.test(res[0]),JSON.stringify(res));
 await clickText('.player button','Add friend');await wait(800);
 let fr=(await api('GET','/friends',B.token)).j;ok('Bob sees the request',fr.incoming.length===1&&fr.incoming[0].username==='e2e_alice',JSON.stringify(fr.incoming.map(x=>x.username)));
 await api('POST',`/friends/requests/${fr.incoming[0].request_id}/accept`,B.token);
 await clickText('.tabs button','Friends');await wait(800);
 const lst=await p.evaluate(()=>[...document.querySelectorAll('.player')].map(e=>e.innerText.replace(/\s+/g,' ')));ok('Alice now sees Bob as a friend (not a pending request) with his stats',lst.length===1&&/Bob Builder/.test(lst[0])&&/Level 12/.test(lst[0])&&/Remove/.test(lst[0])&&!/Cancel/.test(lst[0]),JSON.stringify(lst));
 await clickText('.tabs button','Friends ranking');await wait(800);
 const rk=await p.evaluate(()=>[...document.querySelectorAll('.tablewrap tbody tr')].map(e=>e.innerText.replace(/\s+/g,' ')));ok('the friends ranking puts Bob (level 12) above Alice (level 7)',rk.length===2&&/Bob/.test(rk[0])&&/Alice/.test(rk[1]),JSON.stringify(rk));
 ok('no page errors in the browser',errs.length===0,JSON.stringify(errs.slice(0,3)));
 ok('the Content-Security-Policy blocks nothing the shell or the game needs',csp.length===0,JSON.stringify(csp.slice(0,3)));
 { const h=(await fetch(BASE+'/')).headers,g=(await fetch(BASE+'/game/index.html')).headers;ok('shell and game pages are served with a CSP (inline script only for the game page)',/script-src 'self'(?!.*unsafe)/.test(h.get('content-security-policy')||'')&&/script-src 'self' 'unsafe-inline'/.test(g.get('content-security-policy')||''),(h.get('content-security-policy')||'').slice(0,60)); }
 { const t=await (await fetch(BASE+'/legal/terms.html')).text();ok('legal pages are served (templates)',/Terms of Use/.test(t)); }
 await b.close();mock.close();srv.kill();await new Promise(r=>{srv.once('exit',r);setTimeout(r,4000)});try{fs.rmSync(path.join(BACK,'data','e2e.db'),{force:true})}catch(e){}
 if(R.some(x=>x.startsWith('FAIL')))console.log(srvLog.split('\n').slice(-25).join('\n'));
 console.log(R.join('\n'));process.exit(R.some(x=>x.startsWith('FAIL'))?1:0)})().catch(e=>{console.error('ERR',e);process.exit(1)});
