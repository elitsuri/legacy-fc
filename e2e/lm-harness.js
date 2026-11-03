// In-page helpers for testing the live match without relying on requestAnimationFrame
// (the page may be in a hidden/background tab). Injected by the e2e scripts or pasted into a console.
window.ADV=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);logicStep();if(Tr){Tr.f++;if(Tr.f>34){const c=Tr.cb;Tr=null;c()}}}
 HIT=[];g.setTransform(SCv,0,0,SCv,0,0);g.clearRect(0,0,480,320);if(title){drawTitle();drawUI()}else{B?drawBattle():drawWorld();drawUI();drawTr()}};
window.LMSETUP=(opts)=>{opts=opts||{};NOFLUSH=1;initPlayer(opts.arch||'Finisher','Professional');if(!S.W)S.W=genWorld(S.region||1);if(S.club==null){S.club=opts.club||0;S.ct=mkCt(S.W.clubs[S.club],1)}
 if(!S.tb||!Object.keys(S.tb).length)mkTable();title=false;S.en=100;S.lmTut=opts.tut?0:1;S.trust=100;window.startP=()=>1;dlg=null;menu=null;scr=null;B=null;LM=null;
 if(opts.cup){playCup()}else playLeague();if(scr&&scr.go){const q=scr;scr=null;q.go()}ADV(40);return !!(LM&&B&&B.live)};
// play AI-only (Eli idle) until the full-time whistle; returns the honest match record
window.LMRUN=(maxSteps)=>{const t0=performance.now();let n=0;while(LM&&LM.state!=='ft'&&n<(maxSteps||40000)){if(LM.state==='intro'||LM.state==='ht'||LM.state==='et'){LM.stT=99;lmDown('pass')}if(LM.state==='kick'&&LM.kicker&&LM.kicker.me)lmDown('pass');if(LM.state==='goal'&&LM.stT>80)lmAfterGoal();ADV(1);n++}
 return{steps:n,ms:Math.round(performance.now()-t0),state:LM&&LM.state,min:LM&&LM.min,score:[B.gf,B.ga],stats:LM&&JSON.parse(JSON.stringify(LM.stats)),ev:B.ev.slice()}};
