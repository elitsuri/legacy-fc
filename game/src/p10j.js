// ===================== v9 character animations (p10j): drawing and animation state only, no change to match results =====================
// New poses: keeper dive (stretched, straining), falling + lying + getting up (fouled players, keepers after a dive, slide tacklers),
// throw-in (ball over the head, release), keeper holding the ball at the chest, jumping jacks and a stretch for room staff.
// Walking arms swing more. Room staff turn towards Eli when he comes close and glance around now and then.
// ANIM10.off is the kill switch: any error here turns the layer off and the old drawing carries on.
var ANIM10={off:0,err:''};
function anim10Fail(e){ANIM10.off=1;ANIM10.err=String(e&&e.message||e)}
(function(){const P0=pose8,D=()=>({bob:0,lean:0,jump:0,lA:0,rA:0,lL:0,rL:0,lK:0,rK:0,lUp:0,rUp:0,face:'n',arms:'side'});
 pose8=function(st,f,side){let P;
  if(st==='dive'){P=D();P.arms='stretch';P.face='s';P.lL=f?-8:-3;P.rL=f?10:5;P.lK=f?14:6;P.rK=f?20:8;P.jump=f?1.5:0}
  else if(st==='fall'){P=D();P.arms=f?'out':'up';P.face='s';P.lL=-10;P.rL=16;P.lK=f?26:12;P.rK=f?8:20}
  else if(st==='getup'){P=D();if(f===0){P.kneel=1;P.lean=8;P.bob=4.4}else{P.bob=2;P.lL=-16;P.rL=-12;P.lK=34;P.rK=30;P.lean=6;P.arms='out'}}
  else if(st==='throw'){P=D();P.arms=f?'stretch':'hold';P.lean=f?7:-8;P.lL=f?6:-4;P.rL=f?-6:8;P.rK=f?6:14;P.bob=f?-.3:.4}
  else if(st==='catch'){P=D();P.arms='chest';P.bob=(f&1)?-.3:0}
  else if(st==='jack'){P=D();P.arms=f?'side':'up';P.jump=f?0:1.6;P.face=f?'n':'h'}
  else if(st==='stretch10'){P=D();P.arms='stretch';P.lean=f?9:-9;P.bob=-.3}
  else{P=P0(st,f,side);if(st==='walk'){P.lA*=1.45;P.rA*=1.45}}
  return P};
 Object.assign(ACT8N,{dive:2,fall:2,getup:2,throw:2,catch:2,jack:2,stretch10:2})})();
// ---------- room staff: face Eli when he is near, glance around, the gym trainer warms up ----------
npcPose9=function(n){const I=INT9;if(ANIM10.off||!I)return[n.dir,'idle',(tick+n.x)>>5&1];
 const dx=I.x-n.x,dy=I.y-n.y,near=dx*dx+dy*dy<72*72,ph=(tick+n.x*7)%720;
 if(near)return[Math.abs(dx)>Math.abs(dy)*1.2?(dx>0?'r':'l'):(dy>0?'d':'u'),'idle',(tick+n.x)>>5&1];
 if(n.look==='trainer'){if(ph<300)return['d','jack',(tick>>3)&1];if(ph<420)return['d','stretch10',(ph>>5)&1]}
 if(ph>600&&ph<660)return[ph<630?'l':'r','idle',0];
 return[n.dir,'idle',(tick+n.x)>>5&1]};
// ---------- live match: animation state after the usual movement update ----------
// fall10 = {t, n, s, rot}: t counts up to n. Phases: falling (rotating, first 8 frames unless it starts lying), lying, getting up (last 12).
function fallPh10(F){return F.t<F.n-12?(F.t<8&&!F.lie?'falling':'lying'):'getup'}
function anim10Match(){const b=LM.ball,rs=LM.rs;
 for(const p of LM.P){if(p.off)continue;const sp=Math.hypot(p.vx,p.vy);
  // keeper: when the dive ends he lies for a moment, then gets up
  if(p.dv10&&!p.dive)p.fall10={t:0,n:32,s:p.dv10,lie:1};p.dv10=p.dive?(p.dive.s>0?1:-1)*(p.dir==='l'?-1:1):0;
  // a slide tackle ends: get up
  if(p.sl10&&!(p.sl>0)&&!p.fall10)p.fall10={t:0,n:12,s:p.vx>=0?1:-1,lie:1};p.sl10=p.sl>0;
  const F=p.fall10;if(F){F.t++;if(fallPh10(F)==='lying'&&sp>1.1)F.t=Math.max(F.t,F.n-12);if(F.t>=F.n||p.dive||p.sl>0)p.fall10=null;
   else if(fallPh10(F)==='getup'){p.st='getup';p.f=F.t<F.n-6?0:1}}
  // throw-in: the taker holds the ball over his head while he waits
  if(rs&&rs.kind==='throw'&&rs.taker===p&&Math.hypot(p.x-rs.x,p.y-rs.y)<8&&!p.fall10){p.st='throw';p.f=0;p.dir=rs.y<LMP.W/2?'d':'u'}
  // keeper with the ball in his hands, standing in his box
  else if(b.own===p&&p.grp=='GK'&&sp<.6&&!p.act&&!p.fall10&&lmInBox(p)){p.st='catch';p.f=(LM.f>>4)&1}}}
(function(){
 const mv0=lmMoveAll;lmMoveAll=function(){const r=mv0.apply(this,arguments);if(!ANIM10.off&&LM)try{anim10Match()}catch(e){anim10Fail(e)}return r};
 // a foul knocks the fouled player down (visual only: the free kick logic is untouched)
 const tk0=lmTackle;lmTackle=function(d,c,slide){const f0=LM&&LM.stats?LM.stats.fo[d.team]:0,r=tk0.apply(this,arguments);
  try{if(!ANIM10.off&&LM&&c&&!c.off&&LM.stats.fo[d.team]>f0)c.fall10={t:0,n:48,s:c.x>=d.x?1:-1}}catch(e){anim10Fail(e)}return r};
 // throw-in: the taker releases the ball with both hands
 const rs0=lmTakeRestart;lmTakeRestart=function(a){const r=LM&&LM.rs,tk=r&&r.taker,kind=r&&r.kind,y=r&&r.y,res=rs0.apply(this,arguments);
  try{if(!ANIM10.off&&kind==='throw'&&tk&&!tk.off){tk.act={st:'throw',t:14,t0:14,n:2,fd:3};tk.dir=y<LMP.W/2?'d':'u'}}catch(e){anim10Fail(e)}return res};
 // drawing: dive and fall are the same posed sprites, rotated about the feet
 const dp0=lmDrawPlayer;lmDrawPlayer=function(p){if(ANIM10.off)return dp0(p);try{const sc=LMP.SC;
  if(p.dive){const s=p.dv10||1;shadow10(p.x+s*10*sc,p.y,sc);rot10(p.x,p.y-5,s*1.3,p.look,sc,'dive',p.dive.t<14?1:0);return}
  const F=p.fall10,ph=F&&fallPh10(F);if(ph==='falling'||ph==='lying'){const k=ph==='falling'?F.t/8:1;shadow10(p.x+F.s*12*sc*k,p.y,sc);rot10(p.x,p.y-1.5*k,F.s*1.45*k,p.look,sc,'fall',ph==='lying'?1:0);return}
  return dp0(p)}catch(e){anim10Fail(e);return dp0(p)}};
 // the ball sits in the hands of a throw-in taker or a keeper holding it
 const db0=lmDrawBall;lmDrawBall=function(){if(ANIM10.off)return db0();try{const h=ballHolder10();if(!h)return db0();const b=LM.ball,s=.68,sc=LMP.SC,
  side=h.dir==='l'?-1:h.dir==='r'?1:0,over=h.st==='throw',x=h.x+(over?-side*1.4:side*3.4)*sc,y=h.y-(over?34:19.5)*sc;
  g.save();g.fillStyle='rgba(10,16,12,.3)';g.beginPath();g.ellipse(h.x,h.y+1.5,3.2,1.3,0,0,7);g.fill();smooth(1);g.drawImage(ballSpr(ballCol(),Math.floor(b.rot/5)&3),x-6*s,y-6*s,12*s,12*s);g.restore()}catch(e){anim10Fail(e);db0()}}})();
function ballHolder10(){const b=LM.ball,rs=LM.rs;if(rs&&rs.kind==='throw'&&rs.taker&&rs.taker.st==='throw'&&!b.own&&b.z<1)return rs.taker;
 if(b.own&&b.own.st==='catch')return b.own;return null}
function rot10(x,y,ang,o,sc,st,f){g.save();g.translate(x,y);g.rotate(ang);drawActor(0,0,o,sc,'d',st,f,1);g.restore()}
function shadow10(x,y,sc){g.save();g.fillStyle='rgba(12,18,26,.28)';g.beginPath();g.ellipse(x,y+.6*sc,17*sc,3*sc,0,0,7);g.fill();g.restore()}
