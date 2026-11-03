// ===================== v9 INTERIORS: walk-in rooms for the home, club HQ, gym, training centre and sports shop =====================
// A door of these buildings now opens a room instead of a bare menu. Inside, Eli walks around (furniture collides),
// and every hotspot runs the game's existing facility action (the same code the old menus ran), so nothing is faked.
// Rooms show real state: league table on the HQ board, trophies in the cabinets, owned kits on the rack, the home
// grows with the property Eli owns, windows follow the time of day and the weather.
var INT9=null;
const INTK9={hq:1,gym:1,tr:1,shop:1,home:1,st:1,ag:1,cl:1};
// run one entry of an existing facility menu exactly as if it had been picked
function fac9(k,i){F[k]();const m=menu;menu=null;if(m&&m.cb)m.cb(i)}
function eliLook9(){const a=pkx(S.ap),o=plOpts();Object.assign(o,{sh:solid(a[0]),hc:solid(a[4]||'#2b1a10'),bt:solid(a[5]||'#15161a'),pa:solid(a[6]||'#1b2240'),k:a[7],tier:tier8(),out:'kit'});o.sk=solid(o.sk||'#f1c27d');o.c2=solid(o.c2||'#ffffff');return o}
function once9(key){if(!S.nl[key]||S.nl[key]!==S.day){S.nl[key]=S.day;return true}return false}
// ---------- room definitions: furniture footprints (feet level) + hotspot actions ----------
// item: {k: drawer, x,y,w,h: footprint, solid (default true), hot:[label en, label he, fn], ...extra}
function room9(kind){const t=S.home|0;
 if(kind==='home'){const lux=t>=3,big=t>=2,it=[];
  it.push({k:'bed',x:34,y:106,w:72,h:48,dbl:big,hot:['Sleep (new day)','שינה (יום חדש)',()=>rest(S.home)]});
  it.push({k:'wardrobe',x:118,y:94,w:46,h:22,hot:['Wardrobe','ארון בגדים',()=>wardrobe()]});
  it.push({k:'tv',x:226,y:94,w:76,h:16,big:big,hot:['Watch the news','צפייה בחדשות',()=>scr0(scrList(L('NEWS','חדשות'),(S.news||[]).slice(0,14).map(n=>L('Day ','יום ')+n.d+' · '+nm(n.t))))]});
  it.push({k:'desk',x:322,y:96,w:58,h:20,hot:['Career journal','יומן קריירה',()=>scr0(scrList(L('CAREER JOURNAL','יומן קריירה'),(S.hist.tl||[]).slice(-14).reverse().map(a=>L('Day ','יום ')+a[0]+' · '+L(a[1],a[2]))))]});
  if(big)it.push({k:'sofa',x:230,y:166,w:70,h:24});
  if(big)it.push({k:'cabinet',x:398,y:94,w:54,h:20,club:0,hot:['Trophy cabinet','ויטרינת גביעים',()=>scr0(scrList(L('MY TROPHIES','הגביעים שלי'),[...S.hist.tro.map(a=>'★ '+nm(a)),...S.hist.aw.map(a=>'★ '+nm(a))].concat(S.hist.tro.length||S.hist.aw.length?[]:[L('No trophies yet - win the league!','עדיין אין גביעים - זכה בליגה!')])))]});
  else it.push({k:'kitchen',x:392,y:94,w:62,h:22,hot:['Healthy meal (+15 energy, daily)','ארוחה בריאה (+15 אנרגיה, יומי)',()=>{if(!once9('meal9')){say(L('You already ate at home today.','כבר אכלת בבית היום.'));return}S.en=Math.min(100,S.en+15);sfx('ok');save();say(L('A good home-cooked meal. Energy +15.','ארוחה ביתית טובה. אנרגיה +15.'))}]});
  if(lux)it.push({k:'homegym',x:46,y:236,w:64,h:26,hot:['Home workout (E10, daily)','אימון ביתי (אנרגיה 10, יומי)',()=>{if(tired(10))return;if(!once9('hgym9')){say(L('Enough home training for today.','מספיק אימון ביתי להיום.'));return}S.en-=10;train(['strength','stamina'],.25);sfx('lvl');save();say(L('Good session. Strength and stamina up a little.','אימון טוב. כוח וסיבולת עלו מעט.'))}]});
  if(t>=4)it.push({k:'piano',x:150,y:240,w:56,h:26});
  if(S.hist.g>0)it.push({k:'photo',x:176,y:93,w:34,h:4,solid:false,hot:['Photo: my first goal','תמונה: הגול הראשון שלי',()=>say(L(`My first goal. ${S.hist.g} career goals since then.`,`הגול הראשון שלי. מאז ${S.hist.g} שערים בקריירה.`))]});
  if(S.tro>0)it.push({k:'shirt',x:338,y:93,w:30,h:4,solid:false});
  it.push({k:'plant',x:22,y:262,w:16,h:12},{k:'plant',x:442,y:262,w:16,h:12});
  it.push({k:'rug',x:180,y:196,w:120,h:56,solid:false});
  it.push({k:'phone',x:372,y:252,w:34,h:18,hot:['Property agent (upgrade home)','סוכן נדל"ן (שדרוג בית)',()=>F.home()]});
  return{name:[nm(HOMES[Math.max(0,t-1)]||['Home','בית']),''],wallMat:t>=3?'plaster2':'plaster',floor:t>=3?'marble':t>=2?'wood':'boards',wall:t>=4?'#e9e2d2':t>=3?'#dfe6ea':t>=2?'#d9cdb8':'#c9b79c',accent:t>=3?'#c9a227':'#8a5a3a',items:it,windows:t>=3?[[40,180],[300,150]]:[[300,90]],npc:null}}
 if(kind==='hq')return{name:[L('Club HQ','מטה המועדון'),''],floor:'tile',wallMat:'wainscot',wall:'#ece6dc',accent:solid(clubCols()[0]),windows:[[200,80]],items:[
  {k:'board',x:36,y:94,w:84,h:10,table:1,hot:['League table','טבלת ליגה',()=>scr0(scrTable())]},
  {k:'board',x:130,y:94,w:58,h:10,cal:1,hot:['Team calendar','לוח משחקים',()=>scr0(scrList(L('TEAM CALENDAR','לוח משחקים'),rowsNext()))]},
  {k:'cabinet',x:362,y:94,w:90,h:20,club:1,hot:['Trophy room','חדר גביעים',()=>fac9('hq',4)]},
  {k:'reception',x:186,y:128,w:108,h:26,hot:['Reception (all club services)','קבלה (כל שירותי המועדון)',()=>F.hq()]},
  {k:'lockers',x:26,y:176,w:26,h:96,hot:['Dressing room','חדר הלבשה',()=>wardrobe()]},
  {k:'dining',x:150,y:220,w:112,h:34,hot:['Team dinner $40 (chemistry)','ארוחת צוות $40 (כימיה)',()=>fac9('hq',6)]},
  {k:'mdesk',x:356,y:196,w:76,h:28,hot:['Manager: squad & roles','המאמן: סגל ותפקידים',()=>scr0(scrTeam())]},
  {k:'sofa',x:292,y:258,w:62,h:22,hot:['Rest & save (new day)','מנוחה ושמירה (יום חדש)',()=>rest(0)]},
  {k:'plant',x:442,y:262,w:16,h:12},{k:'rug',x:150,y:160,w:180,h:40,solid:false,crest:1}],
  npc:[{x:240,y:126,look:'recep',dir:'d'},{x:394,y:194,look:'coach',dir:'d'}]};
 if(kind==='gym')return{name:[L('Gym','חדר כושר'),''],floor:'rubber',wallMat:'brick',wall:'#3a3f4c',accent:'#c76b1a',windows:[[134,40]],dark:1,items:[
  {k:'treadmill',x:36,y:104,w:38,h:52,hot:['Cardio +3 stamina','קרדיו +3 סיבולת',()=>fac9('gym',1)]},{k:'treadmill',x:84,y:104,w:38,h:52,hot:['Cardio +3 stamina','קרדיו +3 סיבולת',()=>fac9('gym',1)]},
  {k:'rack',x:180,y:94,w:96,h:16},{k:'bench',x:196,y:150,w:66,h:28,hot:['Strength +1 attack','כוח +1 התקפה',()=>fac9('gym',0)]},
  {k:'mirror',x:330,y:92,w:84,h:8,solid:false,hot:['Mirror: change your look','מראה: שינוי מראה',()=>wardrobe()]},{k:'bag',x:410,y:170,w:24,h:24},{k:'balls',x:330,y:236,w:60,h:22},{k:'cooler',x:424,y:104,w:22,h:20},
  {k:'mat',x:60,y:220,w:120,h:50,solid:false}],npc:[{x:300,y:170,look:'trainer',dir:'l'}]};
 if(kind==='tr')return{name:[L('Training Centre','מרכז האימונים'),''],floor:'turf',wallMat:'pad',wall:'#2f6e45',accent:'#ffffff',windows:[[110,70],[330,70]],items:[
  {k:'goal',x:196,y:96,w:88,h:14,hot:['Shooting drill','תרגיל בעיטה',()=>mini(0)]},
  {k:'dummies',x:56,y:150,w:70,h:20,hot:['Defence drill','תרגיל הגנה',()=>mini(1)]},
  {k:'ladder',x:286,y:226,w:130,h:16,solid:false,hot:['Fitness drill','תרגיל כושר',()=>mini(2)]},
  {k:'rebound',x:380,y:96,w:70,h:12,hot:['Passing drill','תרגיל מסירות',()=>mini(3)]},
  {k:'tboard',x:40,y:94,w:70,h:10,hot:['Coach\'s advice','עצת המאמן',()=>coachTip9()]},{k:'cones',x:160,y:200,w:90,h:10,solid:false}],
  npc:[{x:330,y:168,look:'coach',dir:'l'}]};
 if(kind==='shop')return{name:[L('Sports Shop','חנות ספורט'),''],floor:'tile2',wallMat:'slat',wall:'#f2efe8',accent:'#2e6fb8',windows:[[284,100]],items:[
  {k:'kitrack',x:34,y:100,w:110,h:28,hot:['Kits','תלבושות',()=>fac9('shop',0)]},
  {k:'bootwall',x:164,y:92,w:96,h:14,hot:['Boots','נעליים',()=>fac9('shop',2)]},
  {k:'ballbin',x:280,y:150,w:44,h:30,hot:['Balls','כדורים',()=>fac9('shop',1)]},
  {k:'fridge',x:416,y:94,w:38,h:24,hot:['Energy drink $30','משקה אנרגיה $30',()=>fac9('shop',3)]},
  {k:'counter',x:300,y:206,w:110,h:26,hot:['Career Market','שוק הקריירה',()=>openMarket()]},
  {k:'manq',x:80,y:200,w:24,h:16},{k:'plant',x:22,y:262,w:16,h:12},{k:'plant',x:442,y:262,w:16,h:12}],
  npc:[{x:356,y:204,look:'clerk',dir:'d'}]};
 if(kind==='st')return{name:[L('Stadium · Changing room','אצטדיון · חדר הלבשה'),''],floor:'tile3',wallMat:'concrete',wall:'#d9dde3',accent:solid(clubCols()[0]),windows:[],items:[
  {k:'teamlockers',x:30,y:92,w:300,h:16,hot:['Your locker (wardrobe)','הלוקר שלך (ארון)',()=>wardrobe()]},
  {k:'tunnel',x:350,y:92,w:96,h:14,hot:['Walk out: league match','יציאה למגרש: משחק ליגה',()=>fac9('st',0)]},
  {k:'tboard',x:40,y:150,w:70,h:10,hot:['Tactics','טקטיקה',()=>fac9('st',2)]},
  {k:'board',x:130,y:150,w:70,h:10,table:1,hot:['League table','טבלת ליגה',()=>scr0(scrTable())]},
  {k:'cupboard',x:220,y:150,w:62,h:10,hot:['Cup match','משחק גביע',()=>fac9('st',1)]},
  {k:'lbench',x:60,y:226,w:200,h:16},{k:'lbench',x:300,y:226,w:130,h:16},{k:'hamper',x:420,y:180,w:30,h:22}],npc:[{x:396,y:150,look:'coach',dir:'l'}]};
 if(kind==='ag')return{name:[L("Agent's office",'משרד הסוכן'),''],floor:'carpet',wallMat:'woodpanel',wall:'#c9b79c',accent:'#c9a227',windows:[[330,110]],items:[
  {k:'exdesk',x:170,y:150,w:140,h:30,hot:['Ask the agent for advice','ייעוץ מהסוכן',()=>fac9('ag',3)]},
  {k:'files',x:40,y:94,w:56,h:20,hot:[`Offers & contract (${(S.offers||[]).length})`,`הצעות וחוזה (${(S.offers||[]).length})`,()=>fac9('ag',1)]},
  {k:'sponsorwall',x:110,y:93,w:190,h:6,solid:false,hot:['Sponsors','חסויות',()=>fac9('ag',0)]},
  {k:'cardstand',x:410,y:206,w:30,h:16,hot:['Change agent','החלפת סוכן',()=>fac9('ag',2)]},
  {k:'sofa',x:40,y:236,w:90,h:24},{k:'plant',x:442,y:262,w:16,h:12},{k:'plant',x:22,y:150,w:16,h:12},{k:'rug',x:150,y:200,w:180,h:60,solid:false}],npc:[{x:240,y:146,look:'agent',dir:'d'}]};
 if(kind==='cl')return{name:[L('Medical centre','מרכז רפואי'),''],floor:'vinyl',wallMat:'tile',wall:'#eef3f6',accent:'#2e8b8b',windows:[[300,120]],items:[
  {k:'medbed',x:40,y:130,w:90,h:34,hot:['Full treatment $15','טיפול מלא $15',()=>fac9('cl',0)]},
  {k:'physio',x:190,y:170,w:100,h:30,hot:['Physio (injury -3 days) $25','פיזיותרפיה (פציעה -3 ימים) $25',()=>fac9('cl',1)]},
  {k:'medcab',x:150,y:94,w:60,h:20},{k:'curtain',x:136,y:120,w:6,h:70},{k:'cooler',x:430,y:104,w:22,h:20},{k:'plant',x:442,y:262,w:16,h:12}],npc:[{x:330,y:180,look:'doctor',dir:'l'}]};
 return null}
function coachTip9(){const keys=(KEY[S.arch]||KEY.Finisher).slice().sort((a,b)=>S.att[a]-S.att[b]),k=keys[0];say(L(`Coach: Your weakest key skill is ${aname(k)} (${att(k)}). The drills here train it - pick the right station.`,`המאמן: הכישור החלש שלך הוא ${aname(k)} (${att(k)}). התרגילים כאן מאמנים אותו - בחר את התחנה הנכונה.`))}
// ---------- enter / leave ----------
function enterInt9(kind,b){const R=room9(kind);if(!R)return false;held.length=0;sfx('door');
 Tr={f:0,cb:()=>{INT9={kind,b,R,x:240,y:286,vx:0,vy:0,dir:'u',st:'idle',f:0,ph:0,near:null,t:0,npcL:{}};S.dest=S.dest||null}};return true}
function leaveInt9(){if(!INT9)return;held.length=0;sfx('door');Tr={f:0,cb:()=>{INT9=null;PL8.dir='d';S.dir='d';PL8.vx=PL8.vy=0;CAM8.init=0}}}
// ---------- per-step update ----------
const IB9={x0:24,x1:456,y0:100,y1:296};
function hit9(x,y){if(x<IB9.x0||x>IB9.x1||y<IB9.y0)return true;if(y>IB9.y1&&Math.abs(x-240)>22)return true;for(const it of INT9.R.items){if(it.solid===false)continue;if(x+6>it.x&&x-6<it.x+it.w&&y+3>it.y&&y-3<it.y+it.h)return true}
 for(const n of INT9.R.npc||[])if(Math.abs(x-n.x)<12&&Math.abs(y-n.y)<6)return true;return false}
function int9Step(){const I=INT9;I.t++;if(Tr||dlg||menu||scr||mg||B){I.vx=I.vy=0;I.st='idle';return}
 const inp=moveInput8(),m=Math.hypot(inp.x,inp.y),sp=(SHIFT8||RUNLOCK8?3.1:2.1);if(inp.face)I.dir=inp.face;
 const tx=m?inp.x/m*sp:0,ty=m?inp.y/m*sp:0;I.vx+=(tx-I.vx)*.3;I.vy+=(ty-I.vy)*.3;const ox=I.x,oy=I.y;
 if(!hit9(I.x+I.vx,I.y))I.x+=I.vx;else I.vx=0;if(!hit9(I.x,I.y+I.vy))I.y+=I.vy;else I.vy=0;const d=Math.hypot(I.x-ox,I.y-oy);
 if(PL8.act&&PL8.act.t>0){PL8.act.t--;I.st=PL8.act.st;I.f=0;if(PL8.act.t<=0)PL8.act=null}else if(d>.3){I.ph+=d/(sp>2.5?6.5:5.5);I.st=sp>2.5?'run':'walk';I.f=Math.floor(I.ph*2)&7}else{I.st='idle';I.f=(tick>>5)&1}
 if(I.y>300){leaveInt9();return}
 // nearest hotspot in front of Eli
 const [fx,fy]=dirVec(I.dir),ax=I.x+fx*14,ay=I.y+fy*10;let best=null,bd=40;for(const it of I.R.items){if(!it.hot)continue;const cx=clamp(ax,it.x,it.x+it.w),cy=clamp(ay,it.y,it.y+it.h),dd=Math.hypot(ax-cx,ay-cy);if(dd<bd){bd=dd;best=it}}
 if(!best&&I.y>270&&Math.abs(I.x-240)<40)best={exit:1,hot:['Leave','יציאה',leaveInt9]};I.near=best}
function int9Use(it){if(!it||!it.hot)return;PL8.act={st:'int',t:10,t0:10};sfx('menu');it.hot[2]()}
// ---------- drawing ----------
// staff pose in a room: [facing, state, frame] (p10j adds activities and turning towards Eli)
function npcPose9(n){return[n.dir,'idle',(tick+n.x)>>5&1]}
function drawInt9(){const I=INT9,R=I.R;smooth(1);
 // back wall, floor, side walls
 g.drawImage(shell9(I),0,0,480,320);
 for(const [wx,ww] of R.windows)window9(wx,30,ww,48);
 if(I.kind==='hq'||I.kind==='tr')crest(240,50,13,nm(mine().n));
 lightIn9(R);door9(I);
 // furniture and people, depth sorted by their feet
 const ents=[];for(const it of R.items)ents.push([it.solid===false?-1:it.y+it.h,()=>furn9(it)]);
 for(const n of R.npc||[]){const look=I.npcL[n.look]||(I.npcL[n.look]=npcLook9(n.look));ents.push([n.y,()=>{const q=npcPose9(n);drawActor(n.x,n.y,look,1.5,q[0],q[1],q[2])}])}
 ents.push([I.y,()=>drawActor(I.x,I.y,eliLook9(),1.5,I.dir,I.st,I.f)]);ents.sort((a,b)=>a[0]-b[0]);for(const e of ents)e[1]();
 // light: warm lamps at night, cool daylight otherwise
 if(S.t>=2){g.save();g.globalCompositeOperation='multiply';g.fillStyle=S.t==3?'rgb(150,140,170)':'rgb(240,215,190)';g.fillRect(0,0,480,320);g.restore();g.save();g.globalCompositeOperation='lighter';for(const lx of [120,360]){const gr=g.createRadialGradient(lx,140,6,lx,140,170);gr.addColorStop(0,'rgba(255,220,160,.22)');gr.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=gr;g.fillRect(0,0,480,320)}g.restore()}
 // top bar: room, money, energy, time
 panel(6,4,468,18,.92,0);txt(R.name[0],he9()?466:14,16.5,9,'#ffd96a','#000a',he9()?'right':'left');icon('coin',he9()?14:350,7,11,'#ffc93c');txt('$'+fmt(S.money),he9()?30:366,16.5,8,'#ffd96a','#000a','left');icon('bolt',he9()?90:420,7,11,'#ffc93c');txt(String(Math.round(S.en)),he9()?104:434,16.5,8,'#ffffff','#000a','left');
 txt([L('Morning','בוקר'),L('Afternoon','צהריים'),L('Evening','ערב'),L('Night','לילה')][S.t]+' · '+L('Day ','יום ')+S.day,240,16.5,8,'#cfe9ff','#000a','center');
 HIT.push({x:214,y:296,w:52,h:24,fn:()=>{if(!dlg&&!menu&&!scr)leaveInt9()}});
 // hotspots are clickable too
 for(const it of R.items)if(it.hot)HIT.push({x:it.x,y:it.y-24,w:it.w,h:it.h+24,fn:()=>{if(!dlg&&!menu&&!scr&&!mg&&!Tr)int9Use(it)}});
 // interaction prompt
 if(I.near&&!dlg&&!menu&&!scr&&!mg){const lab=L(I.near.hot[0],I.near.hot[1]);pbub(I.x,I.y-74,'E',lab)}
 drawToasts()}
function he9(){return S.lang==='he'}
function npcLook9(r){const o=npcLook8('int9'+r,r==='coach'?'coach':r==='trainer'?'track':r==='recep'||r==='agent'?'suit':'casual');if(r==='doctor'){o.out='coach';o.sh='#f4f4f4';o.c2='#2e8b8b';o.pa='#3b3f48'}if(r==='clerk'){o.out='casual';o.sh='#2e6fb8';o.c2='#ffffff';o.cas=1}if(r==='trainer'){o.sh='#c76b1a';o.pa='#1d1f26'}return o}
function window9(x,y,w,h){const sky=[['#ffd2a6','#bfe4ff'],['#6fb8ee','#cfe9ff'],['#e8805a','#ffcf9c'],['#070b1f','#1b2350']][S.t|0],gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,sky[0]);gr.addColorStop(1,sky[1]);
 g.fillStyle='#3a3f4c';g.fillRect(x-3,y-3,w+6,h+6);g.fillStyle=gr;g.fillRect(x,y,w,h);
 // skyline outside
 g.fillStyle=S.t==3?'#141a33':'rgba(90,110,140,.55)';for(let i=0;i<w;i+=11){const bh=10+H(x+i,3,2)%18;g.fillRect(x+i,y+h-bh,9,bh);if(S.t>=2){g.fillStyle='rgba(255,230,150,.8)';g.fillRect(x+i+3,y+h-bh+3,2,2);g.fillStyle=S.t==3?'#141a33':'rgba(90,110,140,.55)'}}
 if(wxNow()==='Rain'&&!S.rm){g.strokeStyle='rgba(220,235,255,.5)';g.lineWidth=.8;g.beginPath();for(let i=0;i<10;i++){const rx=x+((H(i,x,4)*3+tick*1.5)%w),ry=y+((H(i,9,5)*2+tick*4)%h);g.moveTo(rx,ry);g.lineTo(rx-1.5,ry+5)}g.stroke()}
 g.fillStyle='#e8ecf2';g.fillRect(x+w/2-1,y,2,h);g.fillRect(x,y+h/2-1,w,2);g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(x+4,y+h);g.lineTo(x+16,y);g.lineTo(x+24,y);g.lineTo(x+12,y+h);g.closePath();g.fill();
 if(S.t===3){g.fillStyle='rgba(255,220,160,.10)';g.fillRect(x,y,w,h)}g.fillStyle='#f4f1ea';g.fillRect(x-5,y+h+2,w+10,4);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-5,y+h+6,w+10,2);g.strokeStyle='#2a2d35';g.lineWidth=1;g.strokeRect(x-3.5,y-3.5,w+7,h+7)}
function floor9old(type,x,y,w,h){const P={boards:['#9a6a42','#8a5d38'],wood:['#b7854f','#a8784a'],marble:['#ece8e0','#dcd6cc'],tile:['#d6d2c8','#c8c3b8'],tile2:['#e6e2da','#d8d3c9'],rubber:['#2f333c','#292d35'],turf:['#3f9a4a','#47a852']}[type]||['#999','#888'];
 g.fillStyle=P[0];g.fillRect(x,y,w,h);
 if(type==='boards'||type==='wood'){for(let yy=y;yy<y+h;yy+=12){g.fillStyle=P[1];g.fillRect(x,yy,w,1);for(let xx=x+((yy/12)%2)*40;xx<x+w;xx+=80)g.fillRect(xx,yy,1,12)}}
 else if(type==='turf'){for(let i=0;i<8;i++){g.fillStyle=i%2?P[1]:P[0];g.fillRect(x+i*w/8,y,w/8,h)}g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.5;g.strokeRect(x+20,y+16,w-40,h-30);g.beginPath();g.arc(x+w/2,y+h-14,30,Math.PI,0);g.stroke()}
 else if(type==='rubber'){for(let yy=y;yy<y+h;yy+=26)for(let xx=x;xx<x+w;xx+=26){g.fillStyle=((xx+yy)/26)%2?P[1]:P[0];g.fillRect(xx,yy,26,26)}}
 else{for(let yy=y;yy<y+h;yy+=24)for(let xx=x;xx<x+w;xx+=24){g.fillStyle=((xx+yy)/24)%2?P[1]:P[0];g.fillRect(xx,yy,24,24)}if(type==='marble'){g.strokeStyle='rgba(150,140,130,.16)';g.lineWidth=.6;for(let i=0;i<14;i++){const vx=x+H(i,1,3)*4.4,vy=y+H(i,4,3)*2;g.beginPath();g.moveTo(vx,vy);g.quadraticCurveTo(vx+12,vy+10,vx+26-H(i,2,3)*.2,vy+18);g.stroke()}g.strokeStyle='rgba(201,162,39,.35)';g.lineWidth=1;for(let yy=y+24;yy<y+h;yy+=48){g.beginPath();g.moveTo(x,yy);g.lineTo(x+w,yy);g.stroke()}}}
 const sh=g.createLinearGradient(0,y,0,y+28);sh.addColorStop(0,'rgba(0,0,0,.28)');sh.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sh;g.fillRect(x,y,w,28)}
// ---------- furniture (vector, drawn at the footprint; height rises above it) ----------
// furniture block: soft contact shadow, shaded front and top faces, lit top edge, darker side away from the windows
function box9(x,y,w,h,top,front,ht){g.save();const sg=g.createLinearGradient(0,y+h-3,0,y+h+8);sg.addColorStop(0,'rgba(10,8,14,.34)');sg.addColorStop(1,'rgba(10,8,14,0)');g.fillStyle=sg;g.beginPath();g.roundRect(x-2,y+h-3,w+7,11,5);g.fill();
 const fg=g.createLinearGradient(0,y+h-ht,0,y+h);fg.addColorStop(0,shd(front,1.06));fg.addColorStop(1,shd(front,.82));g.fillStyle=fg;g.beginPath();g.roundRect(x,y+h-ht,w,ht,[0,0,2.5,2.5]);g.fill();
 const tg=g.createLinearGradient(0,y-ht,0,y+h-ht);tg.addColorStop(0,shd(top,1.07));tg.addColorStop(1,shd(top,.93));g.fillStyle=tg;g.beginPath();g.roundRect(x,y-ht,w,h,[2.5,2.5,0,0]);g.fill();
 g.fillStyle='rgba(255,255,255,.30)';g.fillRect(x+1.5,y+h-ht-1.2,w-3,1.2);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(x+1,y+h-ht,w-2,1);g.fillStyle='rgba(0,0,0,.10)';g.fillRect(x+w-3.5,y-ht+2,2.5,h+ht-4);
 g.strokeStyle='rgba(28,22,34,.5)';g.lineWidth=.9;g.beginPath();g.roundRect(x+.5,y-ht+.5,w-1,h+ht-1,2.5);g.stroke();g.restore()}
// ---------- room shell (walls, skirting, floor, ambient occlusion), cached per room / time / resolution ----------
var SHELL9={},WCTX9=null; // WCTX9: off-screen target for the shell painters (the main context g is a const)
function shell9(I){const R=I.R,k=I.kind+'|'+(S.home|0)+'|'+(S.t|0)+'|'+SCv+'|'+R.floor;if(SHELL9.k===k)return SHELL9.c;const c=document.createElement('canvas');c.width=Math.round(480*SCv);c.height=Math.round(320*SCv);const q=c.getContext('2d');q.scale(SCv,SCv);
 WCTX9=q;try{q.fillStyle='#0b0d12';q.fillRect(0,0,480,320);wall9(R.wallMat||'plaster',R.wall,R.accent,14,24,452,72);floor9(R.floor,14,96,452,208);
  for(const [x0,dir] of [[0,1],[466,-1]]){const gr=q.createLinearGradient(x0,0,x0+14,0);gr.addColorStop(dir>0?0:1,shd(R.wall,.42));gr.addColorStop(dir>0?1:0,shd(R.wall,.62));q.fillStyle=gr;q.fillRect(x0,24,14,296)}
  q.fillStyle=shd(R.wall,.4);q.fillRect(0,300,206,20);q.fillRect(274,300,206,20);q.fillStyle=shd(R.wall,.55);q.fillRect(0,300,206,2);q.fillRect(274,300,206,2);
  const ao=(x,y,w,h,horiz,flip)=>{const gr=horiz?q.createLinearGradient(x,0,x+w,0):q.createLinearGradient(0,y,0,y+h);gr.addColorStop(flip?1:0,'rgba(8,6,12,.30)');gr.addColorStop(flip?0:1,'rgba(8,6,12,0)');q.fillStyle=gr;q.fillRect(x,y,w,h)};
  ao(14,97,452,26,0,0);ao(14,97,18,203,1,0);ao(448,97,18,203,1,1);ao(14,282,452,18,0,1);
  q.fillStyle='rgba(0,0,0,.35)';q.fillRect(14,24,452,3)}finally{WCTX9=null}
 SHELL9={k,c};return c}
function wall9(mat,col,acc,x,y,w,h){const q=WCTX9||g,base=q.createLinearGradient(0,y,0,y+h);base.addColorStop(0,shd(col,.84));base.addColorStop(1,col);q.fillStyle=base;q.fillRect(x,y,w,h);
 if(mat==='wainscot'){q.fillStyle=shd(acc,.78);q.fillRect(x,y+40,w,26);for(let i=x+6;i<x+w;i+=38){q.strokeStyle='rgba(255,255,255,.22)';q.strokeRect(i+.5,y+44.5,32,17);q.strokeStyle='rgba(0,0,0,.25)';q.strokeRect(i+1.5,y+45.5,32,17)}q.fillStyle='#c9a227';q.fillRect(x,y+39,w,2);
  for(let i=x;i<x+w;i+=9){q.fillStyle='rgba(0,0,0,.035)';q.fillRect(i,y,4,39)}}
 else if(mat==='brick'){for(let r=0;r<9;r++)for(let i=-((r%2)*12);i<w;i+=24){const v=H(i+40,r,7)%12-6;q.fillStyle=shd(col,1+v/100);q.fillRect(x+Math.max(0,i)+1,y+r*8+1,22-(i<0?-i:0),6.5)}q.fillStyle='rgba(0,0,0,.25)';for(let r=0;r<9;r++)q.fillRect(x,y+r*8,w,1)}
 else if(mat==='pad'){for(let i=x;i<x+w;i+=32){const gr=q.createLinearGradient(i,0,i+32,0);gr.addColorStop(0,shd(col,1.12));gr.addColorStop(.5,col);gr.addColorStop(1,shd(col,.82));q.fillStyle=gr;q.fillRect(i+1,y+6,30,h-14)}q.fillStyle='rgba(255,255,255,.9)';q.fillRect(x,y+h-12,w,2)}
 else if(mat==='slat'){for(let r=y+4;r<y+h-8;r+=7){q.fillStyle='rgba(0,0,0,.10)';q.fillRect(x,r,w,2);q.fillStyle='rgba(255,255,255,.35)';q.fillRect(x,r+2,w,1)}}
 else if(mat==='tile'){for(let r=y;r<y+h-8;r+=12)for(let i=x;i<x+w;i+=12){q.fillStyle=shd(col,1-(H(i,r,3)%4)/100);q.fillRect(i+.6,r+.6,11,11)}}
 else if(mat==='concrete'){for(let r=0;r<6;r++)for(let i=0;i<w;i+=40){q.fillStyle=shd(col,1-(H(i,r,9)%6)/100);q.fillRect(x+i+1,y+r*12+1,38,10.5)}q.fillStyle=acc;q.fillRect(x,y+h-26,w,10)}
 else if(mat==='woodpanel'){for(let i=x;i<x+w;i+=22){const v=H(i,1,5)%10-5;q.fillStyle=shd('#6b4a2f',1+v/80);q.fillRect(i,y+8,21,h-16);q.fillStyle='rgba(255,255,255,.08)';q.fillRect(i+2,y+8,1,h-16)}}
 else if(mat==='plaster2'){q.fillStyle='rgba(201,162,39,.55)';q.fillRect(x,y+30,w,1.5);for(let i=x+10;i<x+w;i+=56){q.strokeStyle='rgba(120,100,70,.18)';q.strokeRect(i+.5,y+36.5,46,26)}}
 else{for(let i=0;i<220;i++){q.fillStyle=H(i,2,5)%2?'rgba(255,255,255,.05)':'rgba(0,0,0,.035)';q.fillRect(x+H(i,1,3)*4.5,y+H(i,3,4)*.7,2,2)}}
 const sk=q.createLinearGradient(0,y+h-7,0,y+h+1);sk.addColorStop(0,'#f4f1ea');sk.addColorStop(1,'#c9c2b4');q.fillStyle=mat==='brick'||mat==='pad'?'#2a2d35':sk;q.fillRect(x,y+h-7,w,8);q.fillStyle='rgba(0,0,0,.25)';q.fillRect(x,y+h+.5,w,1);
 const cs=q.createLinearGradient(0,y,0,y+16);cs.addColorStop(0,'rgba(0,0,0,.28)');cs.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=cs;q.fillRect(x,y,w,16);
 for(const [cx,dir] of [[x,1],[x+w,-1]]){const gr=q.createLinearGradient(cx,0,cx+dir*22,0);gr.addColorStop(0,'rgba(0,0,0,.22)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(Math.min(cx,cx+dir*22),y,22,h)}}
function floor9(type,x,y,w,h){const q=WCTX9||g,J=(i,j,a)=>((H(i+50,j+50,13)%21)-10)/100*a;
 const P={boards:'#93643d',wood:'#b7854f',marble:'#e9e5dc',tile:'#d3cfc5',tile2:'#e4e0d7',tile3:'#b8c2cc',rubber:'#2c3038',turf:'#3f9a4a',carpet:'#5b2a33',vinyl:'#dfe7ea'}[type]||'#999999';
 q.fillStyle=P;q.fillRect(x,y,w,h);
 if(type==='boards'||type==='wood'){const ph=type==='wood'?11:13;for(let r=0,yy=y;yy<y+h;r++,yy+=ph){let xx=x-(H(r,3,5)%60);while(xx<x+w){const len=60+H(xx+200,r,7)%70,x0=Math.max(x,xx),ww=Math.min(xx+len,x+w)-x0;q.fillStyle=shd(P,1+J(xx,r,1));q.fillRect(x0,yy,ww-1,ph-1);
    q.fillStyle='rgba(60,35,15,.16)';for(let k=0;k<2;k++)q.fillRect(x0+4,yy+3+k*4,Math.max(0,ww-10),.6);q.fillStyle='rgba(0,0,0,.28)';q.fillRect(xx+len-1,yy,1,ph);xx+=len}q.fillStyle='rgba(0,0,0,.22)';q.fillRect(x,yy+ph-1,w,1)}}
 else if(type==='marble'){for(let r=0;r*48<h;r++)for(let i=0;i*48<w;i++){q.fillStyle=shd(P,1+J(i,r,.6));q.fillRect(x+i*48+.5,y+r*48+.5,47,47);q.strokeStyle='rgba(150,140,128,.18)';q.lineWidth=.6;q.beginPath();const vx=x+i*48+H(i+9,r,3)%40,vy=y+r*48+4;q.moveTo(vx,vy);q.quadraticCurveTo(vx+14,vy+18,vx+6+H(i,r+9,5)%20,vy+40);q.stroke()}
  q.strokeStyle='rgba(201,162,39,.4)';q.lineWidth=1;for(let r=1;r*48<h;r++){q.beginPath();q.moveTo(x,y+r*48);q.lineTo(x+w,y+r*48);q.stroke()}}
 else if(type==='turf'){for(let i=0;i<8;i++){q.fillStyle=i%2?'#47a852':'#3f9a4a';q.fillRect(x+i*w/8,y,w/8,h)}for(let i=0;i<900;i++){q.fillStyle=H(i,1,2)%2?'rgba(20,60,25,.12)':'rgba(190,240,170,.08)';q.fillRect(x+H(i,3,4)*4.5,y+H(i,5,6)*2.08,1.2,1.2)}
  q.strokeStyle='rgba(255,255,255,.8)';q.lineWidth=1.5;q.strokeRect(x+20,y+16,w-40,h-30);q.beginPath();q.arc(x+w/2,y+h-14,30,Math.PI,0);q.stroke()}
 else if(type==='rubber'||type==='carpet'||type==='vinyl'){for(let i=0;i<1400;i++){q.fillStyle=type==='rubber'?(H(i,1,2)%3?'rgba(255,255,255,.05)':'rgba(120,140,200,.08)'):type==='carpet'?'rgba(255,255,255,.035)':'rgba(40,60,70,.06)';q.fillRect(x+H(i,7,4)*4.5,y+H(i,9,6)*2.08,1.3,1.3)}
  if(type==='rubber')for(let yy=y;yy<y+h;yy+=52){q.fillStyle='rgba(0,0,0,.25)';q.fillRect(x,yy,w,1)}if(type==='carpet'){q.strokeStyle='rgba(201,162,39,.25)';q.lineWidth=2;q.strokeRect(x+12,y+12,w-24,h-24)}}
 else{const tz=type==='tile3'?28:24;for(let r=0;r*tz<h;r++)for(let i=0;i*tz<w;i++){q.fillStyle=shd(P,1+J(i,r,.5));q.fillRect(x+i*tz+1,y+r*tz+1,tz-1.5,tz-1.5);q.fillStyle='rgba(255,255,255,.10)';q.fillRect(x+i*tz+2,y+r*tz+2,tz-6,1)}}
 const sh=q.createLinearGradient(x,y,x+w,y+h);sh.addColorStop(0,'rgba(255,255,255,.05)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.08)');q.fillStyle=sh;q.fillRect(x,y,w,h)}
// sun shafts through the windows (day) and soft ceiling-light pools (stronger in the evening)
function lightIn9(R){const t=S.t|0,sun=t===3?null:t===2?'255,170,110':t===0?'255,230,190':'255,248,230';g.save();g.globalCompositeOperation='lighter';
 if(sun&&wxNow()!=='Rain')for(const [wx,ww] of R.windows){const a=(t===2?.05:.032)*(R.dark?1.6:1),gr=g.createLinearGradient(0,96,0,230);gr.addColorStop(0,`rgba(${sun},${a})`);gr.addColorStop(1,`rgba(${sun},0)`);g.fillStyle=gr;g.beginPath();g.moveTo(wx+4,96);g.lineTo(wx+ww-4,96);g.lineTo(wx+ww+40,230);g.lineTo(wx+48,230);g.closePath();g.fill()}
 const k=t>=2?.16:.06;for(const lx of [130,350]){const gr=g.createRadialGradient(lx,170,4,lx,170,120);gr.addColorStop(0,`rgba(255,226,170,${k})`);gr.addColorStop(1,'rgba(255,226,170,0)');g.fillStyle=gr;g.fillRect(lx-120,50,240,240)}g.restore()}
// the doorway: double doors swing open when Eli comes in or walks up to leave
function door9(I){const near=I.y>250&&Math.abs(I.x-240)<46;I.dop=clamp((I.dop==null?1:I.dop)+(near||I.t<40?.08:-.05),0,1);const o=I.dop;
 g.fillStyle='#16181d';g.fillRect(206,300,68,20);const gr=g.createLinearGradient(0,300,0,320);gr.addColorStop(0,'rgba(255,240,200,.35)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(208,300,64,20);
 for(const s2 of [-1,1]){const w=32*(1-o*.82),x0=s2<0?208:272-w;g.fillStyle='#7a5232';g.fillRect(x0,300,w,20);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x0+2,302,Math.max(0,w-4),1);if(w>8){g.fillStyle='#ffd96a';g.fillRect(s2<0?x0+w-4:x0+2,309,2,3)}}
 g.fillStyle='#4a4f5c';g.fillRect(204,298,4,22);g.fillRect(272,298,4,22);g.fillStyle='#3a3f4c';g.fillRect(204,296,72,3);txt(L('EXIT','יציאה'),240,314,7,'#ffd96a','#000a','center')}
function furn9(it){const x=it.x,y=it.y,w=it.w,h=it.h;g.save();
 switch(it.k){
 case 'bed':{const hb=g.createLinearGradient(0,y-26,0,y-8);hb.addColorStop(0,'#7a5232');hb.addColorStop(1,'#4a2f17');g.fillStyle=hb;g.beginPath();g.roundRect(x-2,y-26,w+4,20,[6,6,0,0]);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+2,y-24,w,2);
  box9(x,y,w,h,'#f4f1ea','#6b4a2f',10);const qc=['#2e6fb8','#2e6fb8','#1f8a8a','#1b2a49','#7a1d2e'][S.home|0],qg=g.createLinearGradient(0,y+4,0,y+h-6);qg.addColorStop(0,shd(qc,1.15));qg.addColorStop(1,shd(qc,.85));g.fillStyle=qg;g.beginPath();g.roundRect(x-1,y+4,w+2,h-8,[3,3,6,6]);g.fill();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=.7;for(let i=1;i<4;i++){g.beginPath();g.moveTo(x+2,y+4+i*(h-10)/4);g.lineTo(x+w-2,y+4+i*(h-10)/4);g.stroke()}g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y+4,w,4);
  for(const px of it.dbl?[x+5,x+38]:[x+6]){const pw=it.dbl?28:w-12,pg=g.createLinearGradient(0,y-8,0,y+4);pg.addColorStop(0,'#ffffff');pg.addColorStop(1,'#d9dde3');g.fillStyle=pg;g.beginPath();g.roundRect(px,y-8,pw,12,5);g.fill();g.strokeStyle='rgba(0,0,0,.12)';g.stroke()}break}
 case 'wardrobe':{box9(x,y,w,h,'#8a5d38','#a8784a',56);for(const dx of [x+3,x+w/2+1]){g.strokeStyle='rgba(60,35,15,.45)';g.lineWidth=1;g.strokeRect(dx+.5,y-50.5,w/2-5,48);g.strokeStyle='rgba(255,255,255,.18)';g.strokeRect(dx+2.5,y-48.5,w/2-9,44)}g.fillStyle='#5d3b1c';g.fillRect(x+w/2-.5,y-52,1,54);g.fillStyle='#ffd96a';g.fillRect(x+w/2-4,y-26,2,7);g.fillRect(x+w/2+2,y-26,2,7);g.fillStyle='#4a2f17';g.fillRect(x-2,y-58,w+4,4);break}
 case 'tv':{box9(x,y,w,h,'#3b3f48','#2a2d35',12);const tw2=it.big?66:48,th=it.big?36:28,tx2=x+w/2-tw2/2,ty2=y-12-th;g.fillStyle='#14161b';g.fillRect(tx2,ty2,tw2,th);const gr=g.createLinearGradient(tx2,ty2,tx2+tw2,ty2+th);gr.addColorStop(0,'#1f4f8a');gr.addColorStop(1,'#0b1a33');g.fillStyle=gr;g.fillRect(tx2+2,ty2+2,tw2-4,th-4);
  const n=S.news&&S.news[0]?nm(S.news[0].t):'LEGACY FC TV';g.save();g.beginPath();g.rect(tx2+2,ty2+2,tw2-4,th-4);g.clip();txt(n,tx2+tw2-2-((tick*.5)%(tw2*3))+tw2*1.5,ty2+th-6,6,'#ffffff','#0000','right');g.fillStyle='#ff3b3b';g.fillRect(tx2+4,ty2+4,10,5);g.restore();break}
 case 'desk':{box9(x,y,w,h,'#a8784a','#8a5d38',16);g.fillStyle='#2a2d35';g.fillRect(x+14,y-30,28,16);g.fillStyle='#4aa3ff';g.fillRect(x+16,y-28,24,12);g.fillStyle='#c9ced6';g.fillRect(x+12,y-14,32,3);break}
 case 'sofa':{const c0='#4a6fa5';g.fillStyle=shd(c0,.8);g.beginPath();g.roundRect(x,y-24,w,16,[7,7,2,2]);g.fill();box9(x,y,w,h,c0,shd(c0,.85),10);const n=w>80?3:2,cw=(w-12)/n;for(let i=0;i<n;i++){const cg=g.createLinearGradient(0,y-12,0,y);cg.addColorStop(0,shd(c0,1.25));cg.addColorStop(1,shd(c0,1.02));g.fillStyle=cg;g.beginPath();g.roundRect(x+6+i*cw,y-12,cw-2,12,4);g.fill();g.strokeStyle='rgba(0,0,0,.15)';g.lineWidth=.7;g.stroke()}
  for(const ax of [x-3,x+w-7]){g.fillStyle=shd(c0,.92);g.beginPath();g.roundRect(ax,y-16,10,h+8,4);g.fill();g.fillStyle='rgba(255,255,255,.15)';g.fillRect(ax+2,y-15,6,2)}break}
 case 'cabinet':{box9(x,y,w,h,'#c9ced6','#5d3b1c',50);const gl=g.createLinearGradient(x,y-46,x+w,y-6);gl.addColorStop(0,'rgba(190,225,250,.45)');gl.addColorStop(1,'rgba(120,160,200,.28)');g.fillStyle=gl;g.fillRect(x+3,y-46,w-6,40);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x+3,y-28,w-6,1.5);g.fillRect(x+3,y-10,w-6,1.5);
  g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.moveTo(x+6,y-6);g.lineTo(x+16,y-46);g.lineTo(x+22,y-46);g.lineTo(x+12,y-6);g.closePath();g.fill();g.fillStyle='rgba(255,236,170,.25)';g.fillRect(x+3,y-46,w-6,3);
  const n=it.club?(S.tro|0):((S.hist.tro||[]).length+(S.hist.aw||[]).length);for(let i=0;i<Math.min(n,8);i++){const cx2=x+8+(i%4)*(w-16)/3,cy2=y-(i<4?34:16);cup9(cx2,cy2,i%3==2)}if(!n)txt(L('empty','ריק'),x+w/2,y-24,6,'#5a6270','#0000','center');break}
 case 'kitchen':{box9(x,y,w,h,'#d9dde3','#a8adb6',22);g.fillStyle='#ffffff';g.fillRect(x+w-18,y-48,16,30);g.strokeStyle='#8d96a8';g.strokeRect(x+w-18,y-48,16,30);g.fillStyle='#3a3f4c';g.beginPath();g.arc(x+12,y-20,4,0,7);g.arc(x+26,y-20,4,0,7);g.fill();break}
 case 'homegym':{box9(x,y,w,h,'#2a2d35','#1d1f26',8);g.fillStyle='#8d96a8';g.fillRect(x+4,y-16,w-8,3);g.fillStyle='#1d1f26';g.fillRect(x+2,y-20,6,11);g.fillRect(x+w-8,y-20,6,11);break}
 case 'piano':{box9(x,y,w,h,'#16181d','#0b0d12',20);g.fillStyle='#f4f4f4';g.fillRect(x+4,y-10,w-8,6);g.fillStyle='#16181d';for(let i=x+6;i<x+w-6;i+=5)g.fillRect(i,y-10,2,4);break}
 case 'plant':{g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(x+w/2+2,y+h,12,4,0,0,7);g.fill();const pg=g.createLinearGradient(x,0,x+w,0);pg.addColorStop(0,'#b07a4c');pg.addColorStop(1,'#7a4f2c');g.fillStyle=pg;g.beginPath();g.moveTo(x,y-8);g.lineTo(x+w,y-8);g.lineTo(x+w-2,y+h);g.lineTo(x+2,y+h);g.closePath();g.fill();g.fillStyle='#5d3b1c';g.fillRect(x-1,y-10,w+2,3);
  const sw=S.rm?0:Math.sin(tick/50+x)*1.2;for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.42,l=12+(i%3)*3;g.fillStyle=i%2?'#2f8a3c':'#46a852';g.beginPath();g.ellipse(x+w/2+Math.cos(a)*l*.55+sw*(i/6),y-12+Math.sin(a)*l*.7,3.6,8,a+Math.PI/2,0,7);g.fill()}break}
 case 'rug':{const rc=it.crest?solid(clubCols()[0]):S.home>=3?'#7a1d2e':'#8a3b3b';g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.roundRect(x+2,y+3,w,h,6);g.fill();g.fillStyle=rc;g.beginPath();g.roundRect(x,y,w,h,6);g.fill();g.strokeStyle=it.crest?solid(clubCols()[1]):'#e8c07a';g.lineWidth=3;g.beginPath();g.roundRect(x+6,y+6,w-12,h-12,4);g.stroke();g.lineWidth=1;g.beginPath();g.roundRect(x+11,y+11,w-22,h-22,3);g.stroke();
  if(!it.crest){g.fillStyle='rgba(232,192,122,.45)';g.beginPath();g.moveTo(x+w/2,y+h/2-14);g.lineTo(x+w/2+16,y+h/2);g.lineTo(x+w/2,y+h/2+14);g.lineTo(x+w/2-16,y+h/2);g.closePath();g.fill()}g.fillStyle='rgba(255,255,255,.5)';for(let i=x+4;i<x+w-2;i+=4){g.fillRect(i,y-2,1,2);g.fillRect(i,y+h,1,2)}if(it.crest)crest(x+w/2,y+h/2,12,nm(mine().n));break}
 case 'photo':{g.fillStyle='#c9a227';g.fillRect(x-2,y-56,w+4,30);g.fillStyle='#8fc4ee';g.fillRect(x,y-54,w,26);g.fillStyle='#46a852';g.fillRect(x,y-36,w,8);drawActor(x+w/2,y-30,eliLook9(),.62,'d','cel',1,1);break}
 case 'shirt':{g.fillStyle='#c9a227';g.fillRect(x-2,y-58,w+4,34);g.fillStyle='#1b1e25';g.fillRect(x,y-56,w,30);const a=pkx(S.ap),sh=solid(a[0]);g.fillStyle=sh;g.beginPath();g.moveTo(x+8,y-52);g.lineTo(x+22,y-52);g.lineTo(x+26,y-44);g.lineTo(x+21,y-43);g.lineTo(x+21,y-30);g.lineTo(x+9,y-30);g.lineTo(x+9,y-43);g.lineTo(x+4,y-44);g.closePath();g.fill();txt(String(S.num||10),x+15,y-36,7,lum(sh)>.5?'#1b2240':'#ffffff','#0000','center');break}
 case 'phone':{box9(x,y,w,h,'#a8784a','#8a5d38',14);g.fillStyle='#1b1e25';g.fillRect(x+10,y-20,14,8);g.fillStyle='#ffd96a';g.fillRect(x+12,y-18,3,2);break}
 case 'board':{g.fillStyle='#5d3b1c';g.fillRect(x-2,y-58,w+4,52);g.fillStyle='#f4f1ea';g.fillRect(x,y-56,w,48);
  if(it.table){const pos=Object.keys(S.tb||{}).map(Number).sort((a,b)=>S.tb[b].pt-S.tb[a].pt).slice(0,5);txt(L('TABLE','טבלה'),x+w/2,y-48,6,'#1b2240','#0000','center');pos.forEach((id,i)=>{const me=id===S.club;txt(`${i+1}. ${ell(nm(cb(id).n).split(' ')[0],40,5)}`,x+4,y-39+i*7,5,me?'#c0392b':'#1b2240','#0000','left');txt(String(S.tb[id].pt),x+w-4,y-39+i*7,5,me?'#c0392b':'#1b2240','#0000','right')})}
  else if(it.cal){txt(L('NEXT','הבא'),x+w/2,y-48,6,'#1b2240','#0000','center');const r=rowsNext().slice(0,4);r.forEach((ln,i)=>txt(ell(typeof ln==='string'?ln:ln.a,w-6,5),x+3,y-39+i*7,5,'#1b2240','#0000','left'))}
  break}
 case 'reception':{box9(x,y,w,h,'#f4f1ea',solid(clubCols()[0]),22);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y-22,w,3);crest(x+w/2,y-8,7,nm(mine().n));break}
 case 'lockers':{for(let i=0;i<4;i++){box9(x,y+i*24,w,22,'#5a6270',solid(clubCols()[0]),4);g.fillStyle='rgba(0,0,0,.25)';for(let v=0;v<3;v++)g.fillRect(x+4,y+i*24+3+v*3,8,1.2);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x+w-6,y+i*24+8,2,6);txt(String(i+(i>1?8:2)),x+w/2+2,y+i*24+17,5,'#ffffff','#0000','center')}break}
 case 'dining':{box9(x,y,w,h,'#f4f1ea','#8a5d38',12);for(let i=0;i<4;i++){g.fillStyle='#ffffff';g.beginPath();g.ellipse(x+16+i*26,y+6,7,4,0,0,7);g.fill()}g.fillStyle='#8a5d38';for(let i=0;i<4;i++){g.fillRect(x+10+i*26,y-18,12,6);g.fillRect(x+10+i*26,y+h+2,12,6)}break}
 case 'mdesk':{box9(x,y,w,h,'#5d3b1c','#4a2f17',16);g.fillStyle='#f4f1ea';g.fillRect(x+8,y-12,18,10);g.fillStyle='#2a2d35';g.fillRect(x+w-30,y-30,22,14);break}
 case 'treadmill':{box9(x,y,w,h,'#3b3f48','#22252c',6);g.fillStyle='#16181d';g.fillRect(x+5,y+4,w-10,h-10);g.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<5;i++)g.fillRect(x+6,y+6+((i*9+tick*.6)%(h-12)),w-12,1);g.fillStyle='#5a6270';g.fillRect(x+2,y-24,4,20);g.fillRect(x+w-6,y-24,4,20);g.fillStyle='#1b1e25';g.fillRect(x+4,y-28,w-8,8);g.fillStyle='#ff6b4a';g.fillRect(x+8,y-26,8,3);break}
 case 'rack':{g.fillStyle='#22252c';g.fillRect(x,y-30,w,4);g.fillRect(x,y-8,w,4);for(let i=0;i<8;i++){g.fillStyle=['#c0392b','#2e6fb8','#16181d','#f5b700'][i%4];g.beginPath();g.arc(x+8+i*11,y-12,4,0,7);g.fill();g.beginPath();g.arc(x+8+i*11,y-34,4,0,7);g.fill()}break}
 case 'bench':{box9(x+16,y+6,w-32,h-12,'#c0392b','#8a2a20',10);g.fillStyle='#8d96a8';g.fillRect(x,y-18,w,3);g.fillStyle='#16181d';g.fillRect(x,y-24,8,14);g.fillRect(x+w-8,y-24,8,14);break}
 case 'mirror':{g.fillStyle='rgba(200,220,240,.55)';g.fillRect(x,y-62,w,56);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x+10,y-62);g.lineTo(x+30,y-62);g.lineTo(x+14,y-6);g.lineTo(x,y-6);g.closePath();g.fill();g.strokeStyle='#8d96a8';g.lineWidth=2;g.strokeRect(x,y-62,w,56);break}
 case 'bag':{g.fillStyle='#22252c';g.fillRect(x+w/2-1,y-60,2,22);g.fillStyle='#c0392b';g.beginPath();g.roundRect(x,y-40,w,38,8);g.fill();g.strokeStyle='rgba(30,24,38,.55)';g.stroke();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x+4,y-36,4,30);break}
 case 'balls':{for(let i=0;i<5;i++){g.fillStyle=['#c0392b','#2e6fb8','#1f9d55','#f5b700','#7a4fb8'][i];g.beginPath();g.arc(x+8+i*11,y+6-(i%2)*6,7,0,7);g.fill()}break}
 case 'cooler':{box9(x,y,w,h,'#d9dde3','#a8adb6',34);g.fillStyle='rgba(120,190,255,.7)';g.fillRect(x+4,y-48,w-8,14);break}
 case 'mat':{g.fillStyle='#1f6fb8';g.globalAlpha=.8;g.fillRect(x,y,w,h);g.globalAlpha=1;g.strokeStyle='rgba(255,255,255,.4)';g.strokeRect(x+3,y+3,w-6,h-6);break}
 case 'goal':{g.strokeStyle='#f4f6f8';g.lineWidth=3;g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y-34);g.lineTo(x+w,y-34);g.lineTo(x+w,y+h);g.stroke();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.6;for(let i=x+6;i<x+w;i+=6){g.beginPath();g.moveTo(i,y-34);g.lineTo(i,y+h);g.stroke()}for(let j=y-30;j<y+h;j+=6){g.beginPath();g.moveTo(x,j);g.lineTo(x+w,j);g.stroke()}break}
 case 'dummies':{for(let i=0;i<3;i++){const dx=x+10+i*25;g.fillStyle='#f5b700';g.beginPath();g.roundRect(dx-6,y-34,12,30,4);g.fill();g.fillStyle='#22252c';g.fillRect(dx-1,y-4,2,8);g.beginPath();g.arc(dx,y-38,5,0,7);g.fillStyle='#f5b700';g.fill()}break}
 case 'ladder':{g.strokeStyle='#ffd24a';g.lineWidth=2;g.strokeRect(x,y,w,h);for(let i=x;i<x+w;i+=13){g.beginPath();g.moveTo(i,y);g.lineTo(i,y+h);g.stroke()}break}
 case 'cones':{for(let i=0;i<5;i++){g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(x+i*20,y+8);g.lineTo(x+i*20+5,y-4);g.lineTo(x+i*20+10,y+8);g.closePath();g.fill()}break}
 case 'rebound':{g.fillStyle='#3b414d';g.fillRect(x,y-36,w,32);g.strokeStyle='#ffffff';g.lineWidth=1.5;g.strokeRect(x+6,y-30,w-12,20);g.beginPath();g.arc(x+w/2,y-20,6,0,7);g.stroke();break}
 case 'tboard':{g.fillStyle='#22252c';g.fillRect(x-2,y-58,w+4,52);g.fillStyle='#2f8a3c';g.fillRect(x,y-56,w,48);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.strokeRect(x+4,y-52,w-8,40);g.beginPath();g.moveTo(x+w/2,y-52);g.lineTo(x+w/2,y-12);g.stroke();g.fillStyle='#ffd24a';[[.3,.4],[.6,.3],[.7,.7],[.4,.75]].forEach(([a,b])=>{g.beginPath();g.arc(x+4+a*(w-8),y-52+b*40,2.5,0,7);g.fill()});break}
 case 'kitrack':{g.fillStyle='#8d96a8';g.fillRect(x,y-44,w,3);g.fillRect(x,y-4,3,6);g.fillRect(x+w-3,y-4,3,6);KITS.forEach((k,i)=>{const kx=x+8+i*((w-16)/Math.max(1,KITS.length-1))-8;g.fillStyle=k[1];g.beginPath();g.moveTo(kx,y-40);g.lineTo(kx+16,y-40);g.lineTo(kx+19,y-30);g.lineTo(kx+15,y-29);g.lineTo(kx+15,y-14);g.lineTo(kx+1,y-14);g.lineTo(kx+1,y-29);g.lineTo(kx-3,y-30);g.closePath();g.fill();g.strokeStyle='rgba(30,24,38,.6)';g.lineWidth=.8;g.stroke();
  if(S.kits&&S.kits.includes(i)){g.fillStyle='#1f9d55';g.fillRect(kx,y-12,16,6);txt('✓',kx+8,y-7,5,'#ffffff','#0000','center')}});box9(x,y,w,h,'#d9dde3','#a8adb6',6);break}
 case 'bootwall':{g.fillStyle='#e8e2d4';g.fillRect(x,y-60,w,54);for(let r2=0;r2<2;r2++)for(let i=0;i<5;i++){const bx=x+8+i*18,by=y-50+r2*24;g.fillStyle='#8d96a8';g.fillRect(bx-2,by+8,16,2);g.fillStyle=['#16181d','#f4f4f4','#c0392b','#f5b700','#2e6fb8'][(i+r2*2)%5];g.beginPath();g.ellipse(bx+6,by+4,7,3.4,0,0,7);g.fill()}break}
 case 'ballbin':{g.fillStyle='#22252c';g.beginPath();g.roundRect(x,y-18,w,h+18,6);g.fill();for(let i=0;i<6;i++){g.fillStyle='#f4f4f4';g.beginPath();g.arc(x+8+(i%3)*14,y-18-(i>2?6:0)+4,7,0,7);g.fill();g.fillStyle='#16181d';g.beginPath();g.arc(x+8+(i%3)*14,y-18-(i>2?6:0)+4,2.4,0,7);g.fill()}break}
 case 'fridge':{box9(x,y,w,h,'#d9dde3','#a8adb6',58);g.fillStyle='rgba(150,210,255,.45)';g.fillRect(x+3,y-54,w-6,48);for(let r2=0;r2<3;r2++)for(let i=0;i<4;i++){g.fillStyle=['#f5b700','#1f9d55','#c0392b'][r2];g.fillRect(x+5+i*8,y-50+r2*15,5,10)}break}
 case 'counter':{box9(x,y,w,h,'#f4f1ea','#2e6fb8',22);g.fillStyle='#1b1e25';g.fillRect(x+w-36,y-36,26,16);g.fillStyle='#4aa3ff';g.fillRect(x+w-34,y-34,22,12);txt('LFC',x+w-23,y-25,6,'#ffffff','#0000','center');break}
 case 'teamlockers':{const cc=clubCols(),sh=solid(cc[0]),me=String(S.num||10);for(let i=0;i<9;i++){const lx=x+i*(w/9);box9(lx+1,y,w/9-2,h,'#5a6270',shd(sh,.8),6);g.fillStyle='#2a2d35';g.fillRect(lx+3,y-60,w/9-6,54);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(lx+4,y-59,2,52);
   const num=i===4?me:String([2,3,4,5,0,7,8,9,11][i]),sx=lx+w/18-9;g.fillStyle=sh;g.beginPath();g.moveTo(sx,y-50);g.lineTo(sx+18,y-50);g.lineTo(sx+21,y-42);g.lineTo(sx+17,y-41);g.lineTo(sx+17,y-26);g.lineTo(sx+1,y-26);g.lineTo(sx+1,y-41);g.lineTo(sx-3,y-42);g.closePath();g.fill();
   txt(num,lx+w/18,y-32,7,lum(sh)>.5?'#1b2240':'#ffffff','#0000','center');g.fillStyle=i===4?'#ffd24a':'#c9ced6';g.fillRect(lx+5,y-58,w/9-10,5);if(i===4)txt(L('ELI','אלי'),lx+w/18,y-54,4,'#1b2240','#0000','center')}break}
 case 'tunnel':{const gr=g.createLinearGradient(0,y-62,0,y);gr.addColorStop(0,'#0b0d12');gr.addColorStop(1,'#2a2f38');g.fillStyle=gr;g.beginPath();g.roundRect(x,y-62,w,62,[24,24,0,0]);g.fill();g.fillStyle='rgba(120,200,110,.35)';g.beginPath();g.roundRect(x+18,y-46,w-36,40,[16,16,0,0]);g.fill();
   g.fillStyle='rgba(255,250,220,.35)';for(let i=0;i<4;i++)g.fillRect(x+22+i*16,y-44,8,3);txt(L('PITCH','מגרש'),x+w/2,y-50,6,'#ffd96a','#000a','center');g.strokeStyle='#c9a227';g.lineWidth=2;g.beginPath();g.roundRect(x,y-62,w,62,[24,24,0,0]);g.stroke();break}
 case 'cupboard':{g.fillStyle='#5d3b1c';g.fillRect(x-2,y-58,w+4,52);g.fillStyle='#1b2240';g.fillRect(x,y-56,w,48);cup9(x+w/2,y-28);txt(L('CUP','גביע'),x+w/2,y-14,6,'#ffd96a','#0000','center');const c=S.cup;txt(c?(c.out?L('out','הודחנו'):L('round ','סיבוב ')+(c.r+1)):L('not started','טרם החל'),x+w/2,y-46,5,'#cfe9ff','#0000','center');break}
 case 'lbench':{box9(x,y,w,h,'#a8784a','#7a5232',8);for(let i=x+10;i<x+w-10;i+=40){g.fillStyle='#f4f4f4';g.beginPath();g.roundRect(i,y-12,16,6,2);g.fill()}break}
 case 'hamper':{box9(x,y,w,h,'#8a7a5a','#6b5a3a',22);g.fillStyle=solid(clubCols()[0]);g.beginPath();g.roundRect(x+4,y-26,w-8,6,3);g.fill();break}
 case 'exdesk':{box9(x,y,w,h,'#5d3b1c','#3d2410',18);g.fillStyle='#2a2d35';g.fillRect(x+w-40,y-36,30,18);g.fillStyle='#4aa3ff';g.fillRect(x+w-38,y-34,26,14);g.fillStyle='#f4f1ea';g.fillRect(x+12,y-16,26,12);g.fillStyle='#c9a227';g.fillRect(x+44,y-18,12,6);txt(String((S.offers||[]).length),x+50,y-13,5,'#1b2240','#0000','center');break}
 case 'files':{box9(x,y,w,h,'#8d96a8','#6b7385',46);for(let i=0;i<3;i++){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+4,y-40+i*14,w-8,1);g.fillStyle='#c9ced6';g.fillRect(x+w/2-6,y-34+i*14,12,2.5)}break}
 case 'sponsorwall':{g.fillStyle='#1b1e25';g.fillRect(x,y-62,w,52);SP.slice(0,8).forEach((s2,i)=>{const bw=(w-20)/4,cx=x+10+(i%4)*bw,cy=y-56+Math.floor(i/4)*24,own=S.sp===i;g.fillStyle=own?'#c9a227':'#2a2d35';g.beginPath();g.roundRect(cx,cy,bw-6,20,3);g.fill();txt(ell(tr(s2[0]),bw-10,5),cx+(bw-6)/2,cy+12,5,own?'#1b2240':'#cfd6ee','#0000','center')});break}
 case 'cardstand':{box9(x,y,w,h,'#5d3b1c','#3d2410',16);g.fillStyle='#ffffff';g.fillRect(x+6,y-24,w-12,8);g.fillStyle='#c9a227';g.fillRect(x+8,y-22,8,1.5);break}
 case 'medbed':{box9(x,y,w,h,'#e8f0f4','#8d96a8',16);g.fillStyle='#bfe3ea';g.beginPath();g.roundRect(x+3,y-14,w-6,h-4,3);g.fill();g.fillStyle='#ffffff';g.beginPath();g.roundRect(x+4,y-14,24,10,4);g.fill();g.fillStyle='#5a6270';g.fillRect(x+w-6,y-44,2,30);g.fillStyle='#d04a4a';g.fillRect(x+w-12,y-46,14,8);break}
 case 'physio':{box9(x,y,w,h,'#2e8b8b','#1f6b6b',14);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x+4,y-12,w-8,2);g.fillStyle='#f4f4f4';g.beginPath();g.roundRect(x+6,y-14,18,8,3);g.fill();break}
 case 'medcab':{box9(x,y,w,h,'#f4f4f4','#d9dde3',50);g.fillStyle='rgba(150,200,230,.4)';g.fillRect(x+4,y-46,w-8,30);g.fillStyle='#d04a4a';g.fillRect(x+w/2-6,y-12,12,3);g.fillRect(x+w/2-1.5,y-16.5,3,12);break}
 case 'curtain':{g.fillStyle='#8d96a8';g.fillRect(x-2,y-62,10,2);for(let i=0;i<4;i++){g.fillStyle=i%2?'#9fd3e0':'#86c2d2';g.fillRect(x,y-60+i*((h+60)/4),w,(h+60)/4)}g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+w-2,y-60,2,h+60);break}
 case 'manq':{const best=KITS[Math.max(0,...(S.kits||[0]))]||KITS[0];drawActor(x+12,y+10,{sk:'#d9d3c8',hc:'#d9d3c8',hs:3,out:'kit',sh:solid(best[1]),c2:solid(best[2]||'#ffffff'),pa:'#1b2240',so:solid(best[1]),bt:'#16181d'},1.4,'d','idle',0,1);break}
 }
 g.restore()}
function cup9(x,y,small){g.fillStyle='#d4a72c';g.beginPath();g.moveTo(x-4,y-8);g.lineTo(x+4,y-8);g.quadraticCurveTo(x+4,y-2,x+1,y-1);g.lineTo(x+1,y+2);g.lineTo(x+3,y+3);g.lineTo(x-3,y+3);g.lineTo(x-1,y+2);g.lineTo(x-1,y-1);g.quadraticCurveTo(x-4,y-2,x-4,y-8);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x-2.6,y-7,1,4)}
// ---------- wiring: doors, step, draw, interaction ----------
var interact9p=interact;interact=function(){if(INT9){if(Tr||tick-PL8.lastInt<10)return;PL8.lastInt=tick;const it=INT9.near;if(it){if(it.exit)leaveInt9();else int9Use(it)}return}
 const t=findTarget8()||INTR8;if(t&&t.kind==='door'&&INTK9[t.obj.kind]&&!(t.obj.kind==='home'&&!S.home)){if(tick-PL8.lastInt<10)return;PL8.lastInt=tick;const b=t.obj;PL8.dir='u';S.dir='u';b.dopen=Math.max(b.dopen||0,.6);inc('visit',b.kind);S.fvis[b.name+'|'+b.door.x+','+b.door.y]=S.day;enterInt9(b.kind,b);save();return}
 interact9p()};
var world8Step9=world8Step;world8Step=function(){if(INT9){int9Step();return}world8Step9()};
var drawWorld9=drawWorld;drawWorld=function(){if(INT9){drawInt9();return}drawWorld9()};
window.LFC_INT=()=>INT9?{kind:INT9.kind,x:Math.round(INT9.x),y:Math.round(INT9.y),near:INT9.near?(INT9.near.exit?'exit':INT9.near.hot[0]):null,items:INT9.R.items.filter(i=>i.hot).map(i=>i.hot[0])}:null;
