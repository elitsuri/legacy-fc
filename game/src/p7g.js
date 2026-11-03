// ===================== VISUAL REBIRTH: wiring, migration, start-up =====================
function applyUI(){C.style.width=`min(100%,${Math.round(760*S.ui)}px)`;setTimeout(fitCanvas,0)}
function setLang(l,q){S.lang=l;TC.clear();const h=document.getElementById('hint');if(h){h.textContent=l=='he'?'חצים/WASD תנועה · Z/Enter = A · X/Esc = תפריט · M מוזיקה · L שפה · עכבר ומגע נתמכים':'Arrows/WASD move · Z/Enter = A · X/Esc = menu · M music · L language · mouse & touch supported';h.dir=l=='he'?'rtl':'ltr'}document.title=l=='he'?'LEGACY FC - קריירת כדורגל':'LEGACY FC';if(!q)save()}
(function(){
 // save migration v4 -> v5 (backup first, never overwrite a career)
 if((S.v||0)<5){Store.write('fl_pre_rebirth',S);S.v=5}def.v=5;
 if(S.hc==null)S.hc=0;if(S.num==null)S.num=10;S.ap=S.ap||defAp();if(S.ap.br==null)S.ap.br=0;if(S.ap.bd==null)S.ap.bd=1;if(!S.hist.rts)S.hist.rts=[];if(S.hist.rc==null)S.hist.rc=0;
 paintWorld();fixPos();initLife2();chkFree();pkx();
 try{if(document.fonts&&document.fonts.load){document.fonts.load(`700 12px Rubik`).then(()=>{TC.clear()}).catch(()=>{})}}catch(e){}
 fitCanvas();addEventListener('resize',()=>fitCanvas());
 C.addEventListener('pointerdown',onPointer);C.addEventListener('pointermove',onHover);
 setLang(S.lang,1);applyUI();save()})();
var NOFLUSH=0;
function flush(f){if(NOFLUSH)return;if(sv||f){sv=0;S.last=Date.now();Store.write('fl_save4',S)}}
