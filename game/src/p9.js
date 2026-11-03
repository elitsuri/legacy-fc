// ===================== v8.1 production layer: graphics quality, online bridge, build stamp =====================
var LFC_VERSION='8.1.0',BRIDGE9={embedded:false,lastPost:0,pending:null};
// ---------- graphics quality (High = 2x ground detail, Low = 1x + calmer streets) ----------
function applyGfx9(){const lo=S.gfx==='low';const want=lo?1:2;if(RS8!==want){RS8=want;CHK.clear();BSPR.clear()}}
function pedTarget8(){let n=S.t===3?7:S.t===2?18:24;if(wxNow()==='Rain')n=Math.round(n*.6);if(S.gfx==='low')n=Math.round(n*.55);return n}
function settings(){mk([L('Language: English / עברית','שפה: עברית / English'),L('Sound & music','צליל ומוזיקה'),L('Graphics: ','גרפיקה: ')+(S.gfx==='low'?L('Performance','ביצועים'):L('High quality','איכות גבוהה')),L('Reduced motion: ','הפחתת תנועה: ')+(S.rm?L('ON','פעיל'):L('OFF','כבוי')),L('Display size: ','גודל תצוגה: ')+Math.round(S.ui*100)+'%',L('High contrast: ','ניגודיות גבוהה: ')+(S.hc?L('ON','פעיל'):L('OFF','כבוי')),L('Season length','אורך עונה'),L('Payments: ','תשלומים: ')+(S.test?'TEST MODE':L('not connected','לא מחוברים')),L('Back','חזרה')],i=>{
 if(i==0){setLang(S.lang=='he'?'en':'he');settings()}if(i==1)volMenu();if(i==2){S.gfx=S.gfx==='low'?'high':'low';applyGfx9();save();settings()}if(i==3){S.rm=S.rm?0:1;save();settings()}if(i==4){S.ui=S.ui>=1.25?.75:S.ui+.25;applyUI();save();settings()}if(i==5){S.hc=S.hc?0:1;save();settings()}if(i==6)F.hq();
 if(i==7)say(S.test?L('Turn TEST MODE off? Test items will stop counting as owned.','לכבות TEST MODE? פריטי בדיקה יפסיקו להיחשב כבעלות.'):L('TEST MODE gives free test purchases, clearly labelled TEST. It never charges real money and is not real ownership. Turn it on?','TEST MODE נותן רכישות בדיקה חינם, מסומנות TEST. הוא אף פעם לא מחייב כסף אמיתי ואינו בעלות אמיתית. להפעיל?'),()=>mk([L('Yes','כן'),L('No','לא')],j=>{if(j==0){S.test=S.test?0:1;save();say(S.test?L('TEST MODE is ON.','TEST MODE פעיל.'):L('TEST MODE is OFF.','TEST MODE כבוי.'))}}))},L('SETTINGS','הגדרות'))}
// ---------- online bridge: the React shell talks to the game through postMessage (same origin only) ----------
function meta9(){return{version:LFC_VERSION,hasCareer:!!S.arch,lvl:S.lvl,ovr:S.arch?ovr():0,goals:(S.hist&&S.hist.g)||0,trophies:S.tro||0,fans:S.fol||0,day:S.day,season:S.season,club:S.W&&S.club!=null&&S.W.clubs[S.club]?S.W.clubs[S.club].n[0]:'',last:S.last||0,lang:S.lang,cards:Object.keys(S.col8||{}).length}}
function post9(type,payload){if(!BRIDGE9.embedded)return;try{parent.postMessage(Object.assign({src:'lfc-game',type},payload||{}),location.origin)}catch(e){}}
function validSave9(d){return d&&typeof d==='object'&&!Array.isArray(d)&&typeof d.lvl==='number'&&d.lvl>=1&&typeof d.v==='number'&&typeof d.money==='number'}
function flush(f){if(NOFLUSH)return;if(sv||f){sv=0;S.last=Date.now();Store.write('fl_save4',S);const now=Date.now();if(now-BRIDGE9.lastPost>4000){BRIDGE9.lastPost=now;post9('saved',{meta:meta9()})}else if(!BRIDGE9.pending){BRIDGE9.pending=setTimeout(()=>{BRIDGE9.pending=null;BRIDGE9.lastPost=Date.now();post9('saved',{meta:meta9()})},4000)}}}
(function(){applyGfx9();BRIDGE9.embedded=window.parent!==window;
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==window.parent)return;const m=e.data;if(!m||m.src!=='lfc-shell')return;
  if(m.type==='export'){flush(1);post9('save',{rid:m.rid,data:JSON.parse(JSON.stringify(S)),meta:meta9()})}
  else if(m.type==='meta')post9('meta',{rid:m.rid,meta:meta9()});
  else if(m.type==='import'){if(!validSave9(m.data)){post9('error',{rid:m.rid,message:'invalid save'});return}
   Store.write('fl_pre_cloud',S);NOFLUSH=1;Store.write('fl_save4',m.data);Store.write('fl_bak',m.data);post9('imported',{rid:m.rid});setTimeout(()=>location.reload(),60)}
  else if(m.type==='lang'&&(m.lang==='he'||m.lang==='en')){if(S.lang!==m.lang)setLang(m.lang)}
  else if(m.type==='focus'){try{C.focus()}catch(err){}}});
 if(BRIDGE9.embedded){C.tabIndex=0;post9('ready',{meta:meta9()})}
 window.LFC={version:LFC_VERSION,meta:meta9}})();
