// ===================== v9 PHONE LAYOUT: portrait touch panel, landscape fit =====================
// Portrait phones: the 480x320 game view spans the full screen width at the top; underneath, an HTML touch panel shows
// what the canvas would otherwise draw in tiny type - status, objective, the interaction button, menus, dialogs, list
// screens, notifications - with 16-17 px text and 48 px+ rows, in Hebrew (RTL) or English. The thumb-zone controls sit
// at the bottom. Every tap goes through the same game input path as the keyboard (key(), titleAct, menu.cb), so the
// panel never has its own game logic. Custom canvas screens (dashboard, market, wardrobe, drills, live match) stay on
// the canvas. Landscape phones: the canvas fills the height and the controls float over the sides.
var PP9=false,PL9=false,PH9=null;
const MQP9=matchMedia('(max-width: 640px) and (orientation: portrait)'),MQL9=matchMedia('(orientation: landscape) and (max-height: 520px)');
(function(){const st=document.createElement('style');st.textContent=`
body.pp9{min-height:100vh;min-height:100dvh;justify-content:flex-start}
body.pp9 canvas{width:100vw!important;max-width:100vw;margin-top:0;border-radius:0;border-left:0;border-right:0;box-shadow:none}
body.pp9 #hint,body.pl9 #hint{display:none}
#ph9{display:none;flex-direction:column;gap:8px;width:100%;box-sizing:border-box;padding:8px 12px 4px;font-family:Rubik,"Segoe UI",Arial,sans-serif;color:#e8ecf4;flex:1 1 auto;min-height:0;overflow:hidden;-webkit-user-select:none;user-select:none}
body.pp9 #ph9{display:flex}
#ph9 .card{background:linear-gradient(#1d2230,#121620);border:1px solid #3a4258;border-radius:14px;padding:10px 12px;box-shadow:0 6px 18px #0006}
#ph9 .scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex:1 1 auto}
#ph9 .top{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
#ph9 .name{font-weight:700;font-size:16px;color:#ffd96a}#ph9 .sub{font-size:13px;color:#aeb7cc}
#ph9 .money{font-weight:800;font-size:18px;color:#ffd96a;white-space:nowrap}
#ph9 .bars{display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center;font-size:13px;margin-top:8px}
#ph9 .bar{height:9px;border-radius:5px;background:#07090d;overflow:hidden}#ph9 .bar i{display:block;height:100%;border-radius:5px}
#ph9 .obj{font-size:15px;color:#cfe9ff;margin-top:8px;display:flex;justify-content:space-between;gap:10px}#ph9 .obj b{color:#ffd96a;font-weight:600}
#ph9 button{height:auto;min-height:48px;width:100%;font-size:16px;font-family:inherit;border-radius:12px;padding:10px 14px;text-align:start;background:#232a3a;border:1px solid #3a4258;color:#e8ecf4;box-shadow:none;line-height:1.3}
#ph9 button.sel{border-color:#d4a72c;background:#2e2a1a;color:#ffd96a}
#ph9 button.act{min-height:56px;font-size:17px;font-weight:700;text-align:center;background:linear-gradient(#d4a72c,#8a6a12);color:#1a1200;border:0}
#ph9 .row3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#ph9 .row3 button{text-align:center;font-size:15px}
#ph9 .title{font-weight:800;color:#ffd96a;font-size:17px;text-align:center;margin:2px 0 8px}
#ph9 .list{display:flex;flex-direction:column;gap:8px}
#ph9 .who{color:#ffd96a;font-weight:700;font-size:15px;margin-bottom:4px}#ph9 .tx{font-size:17px;line-height:1.5;white-space:pre-line}
#ph9 .lr{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:9px 2px;border-bottom:1px solid #2a3142;font-size:15px}
#ph9 .lr .v{color:#ffd96a;font-weight:600}#ph9 .lh{color:#ffd96a;font-weight:700;text-align:center;padding:10px 0 4px;font-size:14px}
#ph9 .lr .bar{grid-column:1/3;height:6px}
#ph9 .toast{background:#1d2230;border:1px solid #d4a72c88;border-radius:10px;padding:8px 12px;font-size:14px}
#ph9 .sb9 .sbr{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}#ph9 .sb9 .tm{font-size:15px;font-weight:700;text-align:center}#ph9 .sb9 .sc{font-size:28px;font-weight:800;color:#ffd96a;direction:ltr}#ph9 .sb9 .sub{font-size:14px;color:#aeb7cc;text-align:center;margin:6px 0}#ph9 .sb9 .row{display:flex;align-items:center;gap:10px;font-size:14px}#ph9 .sb9 .bar{flex:1;height:8px;background:#0b0e14;border-radius:4px;overflow:hidden}#ph9 .sb9 .bar i{display:block;height:100%}
#ph9 .hint{font-size:14px;color:#aeb7cc;text-align:center;padding:6px}
body.pp9 .ctl{width:100%;padding:4px 14px 12px;margin-top:auto;box-sizing:border-box}
body.pp9 .pad{grid-template-columns:repeat(3,62px);gap:8px}body.pp9 .pad button{height:62px;font-size:22px}
body.pp9 .ab{max-width:none;gap:10px}body.pp9 .ab button{width:80px;height:80px;font-size:22px}body.pp9 .ab .m{width:50px;height:50px;font-size:16px}
body.pp9.pm9{height:100vh;height:100dvh;min-height:0;overflow:hidden}body.pp9.pm9 .ctl{display:none}body.pp9.pm9 #ph9{padding-bottom:max(10px,env(safe-area-inset-bottom))}
body.pl9 canvas{width:auto!important;height:calc(100vh - 6px);height:calc(100dvh - 6px);max-width:100vw;margin-top:3px}
body.pl9 .ctl{position:fixed;left:0;right:0;bottom:8px;width:100%;padding:0 6px;box-sizing:border-box;pointer-events:none;justify-content:space-between;align-items:flex-end}
body.pl9 .ctl>*{pointer-events:auto;opacity:.85;margin:0}body.pl9 .pad{grid-template-columns:repeat(3,40px);gap:4px}body.pl9 .pad button{width:40px;height:44px;font-size:16px}
body.pl9 .ab{display:grid;grid-template-columns:repeat(2,58px);gap:8px;direction:ltr}body.pl9 .ab button{width:58px;height:58px;font-size:20px}body.pl9 .ab .m{width:44px;height:44px;font-size:14px;justify-self:center}`;document.head.appendChild(st);
 const root=document.createElement('div');root.id='ph9';C.insertAdjacentElement('afterend',root);PH9={root,sig:'',t:0};
 const upd=()=>{PP9=MQP9.matches;PL9=MQL9.matches&&!PP9;document.body.classList.toggle('pp9',PP9);document.body.classList.toggle('pl9',PL9);PH9.sig='';setTimeout(fitCanvas,0)};
 (MQP9.addEventListener?MQP9.addEventListener('change',upd):MQP9.addListener(upd));(MQL9.addEventListener?MQL9.addEventListener('change',upd):MQL9.addListener(upd));upd();
 const tickP=()=>{requestAnimationFrame(tickP);if(PP9)ph9Sync()};requestAnimationFrame(tickP)})();
// in portrait the canvas skips what the panel shows (menus, dialogs, list screens); custom screens stay on the canvas
var drawUI9=drawUI;drawUI=function(){if(!PP9)return drawUI9();
 if(scr&&scr.draw){scr.draw();if(!menu&&!dlg)return}else if(scr){g.save();g.fillStyle='rgba(4,6,10,.45)';g.fillRect(0,0,480,320);g.restore();if(!menu&&!dlg)return}
 if(mg){drawMini();return}if(banner)drawBanner();if(DOORFX>0){g.fillStyle=`rgba(255,250,235,${DOORFX/14*.5})`;g.fillRect(0,0,480,320)}};
// the panel shows the status, objective, prompt and notifications: the canvas keeps only the world and the guide arrow
var drawHUD9=drawHUD,drawObj9=drawObj,prompt89=prompt8,drawToasts9=drawToasts;drawHUD=function(o){if(!PP9)drawHUD9(o)};drawObj=function(o){if(!PP9)drawObj9(o)};prompt8=function(a,b,c){if(!PP9)prompt89(a,b,c)};drawToasts=function(){if(!PP9)drawToasts9()};
// ---------- the panel ----------
function el9(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function btn9(label,fn,cls){const b=el9('button',cls,label);b.addEventListener('pointerdown',e=>{e.preventDefault();try{initA()}catch(err){}fn()});return b}
function bar9(v,col){const b=el9('div','bar'),i=el9('i');i.style.width=Math.round(clamp(v,0,1)*100)+'%';i.style.background=col;b.appendChild(i);return b}
function ph9Mode(){if(title)return 'title';if(dlg)return 'dlg';if(menu&&!(menu.grid&&B))return 'menu';if(scr&&!scr.draw)return 'list';if(B||mg||(scr&&scr.draw)||(typeof DR9!=='undefined'&&DR9))return 'busy';return 'world'}
function ph9Sync(){const P=PH9;P.t++;const mode=ph9Mode(),he=S.lang==='he';let sig=mode+'|'+S.lang;
 // notifications: keep their life ticking while the canvas HUD is hidden
 if(TQ&&TQ.length&&mode==='world'){for(const q of TQ.slice(0,2))q.f++;TQ=TQ.filter(q=>q.f<240)}
 if(mode==='title')sig+='|'+JSON.stringify(titleItems())+'|'+TTm.i;
 else if(mode==='dlg')sig+='|'+dlg.i+'|'+dlg.l[dlg.i];
 else if(mode==='menu')sig+='|'+(menu.title||'')+'|'+menu.items.join('¦')+'|'+menu.i;
 else if(mode==='list')sig+='|'+scr.t+'|'+scr.l.length+'|'+JSON.stringify(scr.l).length;
 else if(mode==='busy'){sig+='|'+(B?'b':'')+(mg?'m':'')+(scr&&scr.draw?'s':'');if(typeof LM!=='undefined'&&LM&&B&&B.live){if(P.t%15)return;sig+='|'+B.gf+'-'+B.ga+'|'+Math.floor(LM.min)+'|'+LM.half+'|'+(LM.eli?Math.round(LM.eli.stam*20):0)+'|'+LM.state}}
 else{if(P.t%10)return;const o=obj(),near=typeof INT9!=='undefined'&&INT9?INT9.near:INTR8;sig+=['|',S.lvl,S.money,Math.round(S.en),Math.round(S.hp),S.xp,S.t,S.day,S.fol,o&&o[0],o&&Math.round(Math.hypot(o[1]-S.x,o[2]-S.y)),near&&(near.label||(near.hot&&near.hot[0])),TQ.map(q=>q.t[0]).join('~'),typeof INT9!=='undefined'&&INT9?INT9.kind:''].join('|')}
 if(sig===P.sig)return;P.sig=sig;document.body.classList.toggle('pm9',mode==='menu'||mode==='list');const R=P.root;R.dir=he?'rtl':'ltr';R.textContent='';
 if(mode==='title'){const c=el9('div','card list');c.appendChild(el9('div','title','LEGACY FC'));titleItems().forEach(([k,lab],i)=>c.appendChild(btn9(lab,()=>{TTm.i=i;titleAct(k);P.sig=''},i===TTm.i?'sel':'')));R.appendChild(c);return}
 if(mode==='dlg'){let Ls=dlg.l[dlg.i],who=null;const mt=/^([^:0-9$!?"]{2,22}): (.*)$/s.exec(Ls);if(mt){who=mt[1];Ls=mt[2]}const c=el9('div','card scroll');if(who)c.appendChild(el9('div','who',who));c.appendChild(el9('div','tx',Ls));R.appendChild(c);
  R.appendChild(btn9(dlg.i<dlg.l.length-1?L('Next ▸','הבא ◂'):L('Continue','המשך'),()=>{if(!dlg)return;dlg.t=1e9;dlg.len=null;key('enter');P.sig=''},'act'));return}
 if(mode==='menu'){const c=el9('div','card scroll');if(menu.title)c.appendChild(el9('div','title',menu.title));const lst=el9('div','list');menu.items.forEach((s,i)=>lst.appendChild(btn9(s,()=>{if(!menu)return;menu.i=i;key('enter');P.sig=''},i===menu.i?'sel':'')));c.appendChild(lst);R.appendChild(c);
  R.appendChild(btn9(L('Back','חזרה'),()=>{key('x');P.sig=''},'act'));const s0=lst.children[menu.i];if(s0&&s0.scrollIntoView)s0.scrollIntoView({block:'nearest'});return}
 if(mode==='list'){const c=el9('div','card scroll');c.appendChild(el9('div','title',tr(String(scr.t||''))));for(const r of scr.l){if(typeof r==='string'){if(/^—/.test(r))c.appendChild(el9('div','lh',tr(r)));else{const d=el9('div','lr');d.appendChild(el9('span','',tr(r)));c.appendChild(d)}continue}
   const d=el9('div','lr');d.appendChild(el9('span','',tr(String(r.a))));d.appendChild(el9('span','v',r.b!=null?tr(String(r.b)):''));if(r.bar!=null)d.appendChild(bar9(r.bar/100,r.bar>70?'#4caf50':r.bar>45?'#ffc93c':'#ff8a50'));c.appendChild(d)}
  R.appendChild(c);R.appendChild(btn9(L('Close','סגירה'),()=>{key('x');P.sig=''},'act'));return}
 if(mode==='busy'&&typeof LM!=='undefined'&&LM&&B&&B.live){const us=nm(mine().n),them=lmOppName(),c=el9('div','card sb9'),row=el9('div','sbr');c.onclick=()=>{if(LM&&!menu&&!dlg){lmPause();P.sig=''}};row.appendChild(el9('div','tm',us));row.appendChild(el9('div','sc',`${B.gf} - ${B.ga}`));row.appendChild(el9('div','tm',them));c.appendChild(row);
  const ps=LM.stats.pos,tot=ps[0]+ps[1];c.appendChild(el9('div','sub',`${lmClockTxt()} · ${LM.half==1?L('1st half','מחצית 1'):LM.half==2?L('2nd half','מחצית 2'):L('Extra time','הארכה')}${tot>120?' · '+L('possession','החזקה')+' '+Math.round(ps[0]/tot*100)+'%':''}`));
  if(LM.eli){const st=el9('div','row');st.appendChild(el9('span','',L('Stamina','כושר')));const bw=el9('div','bar');const bi=el9('i','');bi.style.width=Math.round(LM.eli.stam*100)+'%';bi.style.background=LM.eli.stam>.5?'#4caf50':LM.eli.stam>.25?'#ffc93c':'#ef5350';bw.appendChild(bi);st.appendChild(bw);c.appendChild(st)}R.appendChild(c)}
 if(mode==='busy'){const tip=B&&B.live?L('A: pass / tackle · B: hold to shoot · RUN: sprint · tap the scoreboard to pause','A: מסירה / תיקול · B: החזק לבעיטה · RUN: ספרינט · הקש על לוח התוצאה להשהיה'):mg?L('Tap A when the ball is in the green zone','הקש A כשהכדור באזור הירוק'):L('Use the arrows and A / B. Turn the phone sideways for a bigger view.','השתמש בחצים וב-A / B. סובב את הטלפון לתצוגה גדולה יותר.');R.appendChild(el9('div','hint',tip));
  if(scr&&scr.draw&&!(typeof DR9!=='undefined'&&DR9))R.appendChild(btn9(L('Close','סגירה'),()=>{key('x');P.sig=''},'act'));return}
 // world / interior: status, objective, interaction, quick actions, notifications
 for(const q of TQ.slice(0,2))R.appendChild(el9('div','toast',nm(q.t)));
 const c=el9('div','card'),top=el9('div','top'),nmB=el9('div');nmB.appendChild(el9('div','name',`${L('Eli','אלי')} · ${L('Lv ','רמה ')}${S.lvl} · ${tr(stage())}`));const sub=[S.arch?nm(mine().n):L('No club yet','עדיין בלי מועדון'),[L('Morning','בוקר'),L('Afternoon','צהריים'),L('Evening','ערב'),L('Night','לילה')][S.t]+' · '+L('Day ','יום ')+S.day].join(' · ');nmB.appendChild(el9('div','sub',sub));
 top.appendChild(nmB);top.appendChild(el9('div','money','$'+fmt(S.money)));c.appendChild(top);
 const bars=el9('div','bars');for(const [lab,v,col,tx] of [[L('Energy','אנרגיה'),S.en/100,'#ffc93c',Math.round(S.en)],[L('Health','בריאות'),S.hp/S.mhp,'#ef5350',`${Math.ceil(S.hp)}/${S.mhp}`],[L('XP','ניסיון'),S.xp/(S.lvl*20),'#4aa3ff',`${S.xp}/${S.lvl*20}`]]){bars.appendChild(el9('span','',lab));bars.appendChild(bar9(v,col));bars.appendChild(el9('span','',String(tx)))}c.appendChild(bars);
 const o=obj();if(o){const ob=el9('div','obj');ob.appendChild(el9('b','',tr(o[0])));if(!(typeof INT9!=='undefined'&&INT9))ob.appendChild(el9('span','',Math.round(Math.hypot(o[1]-S.x,o[2]-S.y))+L(' m',' מ׳')));c.appendChild(ob)}R.appendChild(c);
 const inR=typeof INT9!=='undefined'&&INT9,near=inR?INT9.near:INTR8,lab=near?(near.hot?L(near.hot[0],near.hot[1]):near.label):null;
 if(lab)R.appendChild(btn9('E · '+tr(lab),()=>{key('enter');P.sig=''},'act'));
 const q3=el9('div','row3');q3.appendChild(btn9(L('Menu','תפריט'),()=>{key('escape');P.sig=''}));q3.appendChild(btn9(inR?L('Leave room','יציאה'):L('Map','מפה'),()=>{if(inR)leaveInt9();else if(typeof openMap==='function')openMap();P.sig=''}));q3.appendChild(btn9(S.mute?L('Sound off','צליל כבוי'):L('Sound on','צליל פעיל'),()=>{key('m');P.sig=''}));R.appendChild(q3)}
window.LFC_PHONE=()=>({portrait:PP9,landscape:PL9,mode:ph9Mode(),buttons:[...PH9.root.querySelectorAll('button')].map(b=>b.textContent),canvasW:Math.round(C.getBoundingClientRect().width)});
