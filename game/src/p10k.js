// ===================== v9 real purchases (p10k): the game asks, the server decides =====================
// When the page runs inside the online shell and the server has Stripe configured, "Buy" opens Stripe Checkout through the shell.
// Nothing is granted by the game itself: the shell sends the server's own list of what this account owns, and the game replaces
// its owned items (S.ent) with exactly that list, so a doctored save cannot keep paid items. Offline / not signed in / no payment
// provider on the server: the old behaviour stays (TEST MODE with local, clearly labelled test items, never counted as paid).
// Items are cosmetic only; no purchase changes a stat or a match result.
var PAYX={on:false,signed:false,orders:0}; // on: the server has a payment provider; signed: this player is logged in to it
function payTag9(){return PAY.enabled?(PAY.mode==='live'?L('SECURE CHECKOUT · STRIPE','תשלום מאובטח · STRIPE'):L('STRIPE TEST MODE · NO REAL MONEY','STRIPE מצב בדיקה · ללא כסף אמיתי')):S.test?'TEST MODE · NO REAL MONEY':L('PAYMENTS NOT CONNECTED','תשלומים לא מחוברים')}
function payCol9(){return PAY.enabled?(PAY.mode==='live'?'#1d4a7a':'#7a4a1d'):S.test?'#7a1d1d':'#4a3b10'}
(function(){const sb0=startBuy,cb0=confirmBuy;
 startBuy=function(it){if(!PAYX.on||S.test&&!PAY.enabled)return sb0(it);  // no provider on the server (or local TEST MODE while signed out): the old rules
  if(!PAYX.signed){MK.msg=L('Sign in (top bar) to buy.','התחבר (בסרגל העליון) כדי לרכוש.');post9('need-login',{});sfx('err');return}
  MK.conf=it};
 confirmBuy=function(it){if(!PAY.enabled)return cb0(it);
  post9('buy',{product:it.id});MK.msg=L('Opening secure checkout…','פותח תשלום מאובטח…');sfx('ach')};
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent)return;const m=e.data;if(!m||m.src!=='lfc-shell'||m.type!=='store')return;
  try{storeSync9(m)}catch(err){PAY.enabled=false;PAY.name='none'}})})();
function storeSync9(m){PAYX.on=!!m.enabled;PAYX.signed=!!m.signed;PAY.enabled=!!m.enabled&&!!m.signed;PAY.name=PAY.enabled?'stripe':'none';PAY.mode=PAY.enabled?(m.mode||'test'):null;
 if(PAY.enabled&&Array.isArray(m.ids)){const ent={};m.ids.forEach(id=>{if(typeof id==='string'&&CATBY[id])ent[id]='srv'});S.ent=ent;
  const paid=(Array.isArray(m.orders)?m.orders:[]).filter(o=>o&&o.status==='paid'&&CATBY[o.product_id]);PAYX.orders=paid.length;
  S.ledger=S.ledger.filter(l=>l.test&&String(l.id).startsWith('TEST-')).concat(paid.map(o=>({id:'ORD-'+o.id,p:o.product_id,price:o.price,d:S.day,test:o.mode==='test'})));
  // equipped items that are no longer owned (refund, doctored save) are taken off
  for(const s of Object.keys(S.ap||{})){const id=S.ap[s];if(id&&CATBY[id]&&!owns(id))S.ap[s]=null}
  save();pkx()}}
