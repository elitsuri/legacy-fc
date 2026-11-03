// ===================== v9 CAREER: performance-driven offers, visible playing-time trade-off =====================
// The transfer window already scouts Eli from real state (overall vs club reputation, football reputation, agent
// connections). This layer adds the one missing input - how he actually plays (average match rating of his last
// official matches, recorded by every match) - and shows each offer's expected playing time, computed with the same
// formula the manager uses to pick the line-up (startP), so "regular football at a smaller club vs a fight for a place
// at a bigger one" is a real, visible decision.
function recentRating9(){const r=(S.hist&&S.hist.rts)||[];if(!r.length)return null;const k=r.slice(-6);return k.reduce((a,v)=>a+v,0)/k.length}
// expected share of matches started at club c with role, using the line-up formula (trust resets to 45 after a move)
function startShare9(c,role,trust){const r=c.id===S.club?rankAt(c):sq(c.id).filter(x=>x.ovr>ovr()).length+1;return clamp(.3+((trust==null?45:trust)-50)/110+(8-r)/18+(role-3)*.05-(S.en<25?.2:0),.05,.97)}
function tWindow(){const my=mine(),ag=AG[S.agent],rr=recentRating9(),perf=rr==null?0:(rr-6.3);
 S.W.clubs.forEach(c=>{if(c.id==S.club)return;if(ovr()>=c.rep-14-Math.max(0,perf*4)&&(c.rep>=my.rep-6||S.req)&&Math.random()<.3+S.rep.fb/220+ag.conn/400+(S.req?.3:0)+perf*.12){const l=S.int[c.id]=(S.int[c.id]||0)+1;
  const why=rr!=null&&rr>=7?L(` (average rating ${rr.toFixed(1)})`,` (דירוג ממוצע ${rr.toFixed(1)})`):'';
  if(l==1)news(`Scouts from ${c.n[0]} are watching Eli${why}`,`סקאוטים מ${c.n[1]} עוקבים אחרי אלי${why}`);else if(l==2)news(`${c.n[0]} show informal interest in Eli`,`${c.n[1]} מביעה עניין לא רשמי באלי`);
  else{S.int[c.id]=0;const boost=(1+Math.random()*.25)*(1+clamp(perf,-1,1.5)*.06);S.offers.push({club:c.id,fee:Math.round(mval()*(.9+Math.random()*.4)),ct:mkCt(c,boost),exp:S.day+20,rr:rr==null?null:+rr.toFixed(2)});news(`${c.n[0]} make an official offer for Eli!`,`${c.n[1]} מגישה הצעה רשמית לאלי!`);post('transfer',`Offer from ${c.n[0]}!`,`הצעה מ${c.n[1]}!`)}}})}
var offerAdvice9=offerAdvice;offerAdvice=function(o){const out=offerAdvice9(o),c=cb(o.club),now=S.ct?startShare9(mine(),S.ct.role,S.trust):null,then=startShare9(c,o.ct.role,45);
 out.splice(1,0,L(`Playing time: about ${Math.round(then*100)}% of matches as a starter there${now!=null?` (now ${Math.round(now*100)}%)`:''}.`,`זמן משחק: בערך ${Math.round(then*100)}% מהמשחקים בהרכב שם${now!=null?` (עכשיו ${Math.round(now*100)}%)`:''}.`));
 if(now!=null&&then<now-.2&&c.rep>mine().rep)out.push(L('Bigger club, less football: you would have to fight for a place.','מועדון גדול יותר, פחות משחקים: תצטרך להילחם על מקום.'));
 else if(now!=null&&then>now+.2&&c.rep<mine().rep)out.push(L('Smaller club, regular football: good for your development.','מועדון קטן יותר, משחקים קבועים: טוב להתפתחות שלך.'));return out};
var offerMenu9=offerMenu;offerMenu=function(o){const c=cb(o.club),then=startShare9(c,o.ct.role,45),now=S.ct&&!o.ren?startShare9(mine(),S.ct.role,S.trust):null;
 const lines=[L(`${c.n[0]} (reputation ${c.rep}) · expected to start ${Math.round(then*100)}% of matches${now!=null?` · now ${Math.round(now*100)}%`:''}.`,`${c.n[1]} (מוניטין ${c.rep}) · צפוי לפתוח ב-${Math.round(then*100)}% מהמשחקים${now!=null?` · עכשיו ${Math.round(now*100)}%`:''}.`)];
 if(o.rr!=null)lines.push(L(`Your recent average rating when they decided: ${o.rr.toFixed(1)}.`,`הדירוג הממוצע שלך כשהחליטו: ${o.rr.toFixed(1)}.`));say(lines,()=>offerMenu9(o))};
// an offer can be taken only once and only while it is still on the table (no duplicate transfers from repeated clicks)
var doTransfer9=doTransfer;doTransfer=function(o){if(!o||!S.offers.includes(o)){say(L('That offer is no longer available.','ההצעה הזו כבר לא זמינה.'));return}doTransfer9(o)};
