// ===================== v9 LIVING CITY: destinations, daily routines, recognition, career reactions =====================
// Pedestrians pick a destination that fits their role and the time of day, walk a real path there (BFS over the
// pedestrian grid), then do something: go inside, sit on a bench, browse a stall, look at a landmark. The city also
// reacts to the career: people recognise Eli as he becomes famous, talk about his real last result, fans celebrate a
// win on match day, and a billboard shows Eli once he is a Star. Everything shown is derived from the save (S).
var WALK9=[],POI9=null,BFS9=null,CITY9={bb:null},OFX9=null,OFY9=null;
// pedestrian grid: big objects (benches, stalls, cars) block their tiles; small street furniture (lamps, bins, hydrants,
// signals, tree trunks) does not cut the one-tile sidewalks any more - walkers step round it (OFX9/OFY9 side-step)
function pedGrid8(){PW8=new Uint8Array(MW*MH);OCC8=new Uint8Array(MW*MH);OFX9=new Int8Array(MW*MH);OFY9=new Int8Array(MW*MH);
 OBJ.forEach(o=>{for(const c of [o.c,o.c2&&[o.x+o.c2[0],o.y+o.c2[1],o.x+o.c2[2],o.y+o.c2[3]]]){if(!c)continue;const w=c[2]-c[0],h=c[3]-c[1],small=w<=10&&h<=8;
  for(let y=Math.floor(c[1]/T8);y<=Math.floor(c[3]/T8);y++)for(let x=Math.floor(c[0]/T8);x<=Math.floor(c[2]/T8);x++){if(!inb(x,y))continue;const k=y*MW+x;
   if(!small){OCC8[k]=1;continue}const ox=(c[0]+c[2])/2-(x*T8+16),oy=(c[1]+c[3])/2-(y*T8+20);OFX9[k]=ox>2?-9:ox<-2?9:(OFX9[k]||9);OFY9[k]=oy>2?-8:oy<-2?8:(OFY9[k]||8)}}});
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x];let ok=t===34||t===30||t===31||t===36;if(t===0){for(const s of INTS){if(((y===s.y||y===s.y+1)&&(x===s.x-1||x===s.x+2))||((x===s.x||x===s.x+1)&&(y===s.y-1||y===s.y+2))){ok=true;break}}}if(t===35&&ZN[y*MW+x]===11)ok=true;if(ok&&!OCC8[y*MW+x])PW8[y*MW+x]=t===0?2:1}}
function tgt9(p){const k=p.ty*MW+p.tx;let ox=0,oy=0;if(OFX9&&(OFX9[k]||OFY9[k])){const hz=p.dir==='l'||p.dir==='r';if(hz)oy=OFY9[k];else ox=OFX9[k]}return[p.tx*T8+16+ox,p.ty*T8+20+oy]}
const POICAT9={shop:'shop',market:'shop',barber:'shop',car:'shop',cafe:'cafe',hq:'football',st:'football',tr:'sport',gym:'sport',track:'sport',courts:'sport',street:'sport',ac:'school',park:'park',station:'travel',air:'travel',home:'home',cl:'clinic',vip:'vip',ag:'office'};
const DECOCAT9={officeBlk:'office',tower:'office',glass:'office',warehouse:'office',flats:'home',house:'home',townhouse:'home',villa:'home',dorm:'home',hotel:'hotel',restaurant:'cafe',cinema:'fun',smallshop:'shop',school:'school',campus:'school'};
// routine weights per role for morning / afternoon / evening / night
const RT9={casual:[{shop:3,cafe:2,park:2,bench:2,sight:2,plaza:3,home:1},{shop:4,cafe:2,park:3,bench:2,sight:2,plaza:4,stall:1,fun:1},{cafe:4,fun:2,home:3,sight:1,bench:1},{home:5,hotel:1,cafe:1}],
 suit:[{office:6,cafe:2,travel:1},{office:3,cafe:3,shop:1,plaza:2},{home:3,cafe:3,hotel:1,fun:1},{home:4,hotel:2}],dress:[{shop:3,cafe:2,sight:1},{shop:4,cafe:2,sight:1,plaza:3},{cafe:3,fun:2,home:2},{home:4,vip:1}],
 kid:[{school:5,park:2},{park:4,school:2,stall:1,sport:1},{home:4,park:1},{home:6}],old:[{park:3,bench:4,cafe:1},{bench:3,park:3,shop:1,clinic:1,plaza:2},{home:4,bench:1},{home:6}],
 hoodie:[{sport:2,shop:2,park:2},{shop:2,sport:2,stall:2,park:1},{fun:2,cafe:2,home:2},{home:3,fun:1}],track:[{sport:4,park:3},{sport:3,park:2},{sport:2,home:2},{home:4}],
 player:[{sport:5,football:2},{sport:4,football:2},{home:3,cafe:1},{home:4}],coach:[{sport:4,football:3},{sport:3,football:3},{football:2,home:2},{home:4}],
 work:[{office:3,shop:2,travel:1},{office:2,shop:2},{home:3},{home:4}],traveler:[{travel:5,hotel:2},{travel:4,hotel:2},{hotel:3,travel:2},{hotel:4}],
 beach:[{sight:2,cafe:1,bench:1},{sight:3,stall:2,cafe:1},{cafe:3,home:2},{home:3,hotel:1}],fan:[{football:4,cafe:2,sight:1},{football:6,stall:3,cafe:1,plaza:2},{football:5,cafe:2},{home:3,cafe:2}]};
function nearWalk9(x,y,r){for(let k=0;k<=(r||5);k++)for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){const a=x+dx,b=y+dy;if(pedOK8(a,b)&&PW8[b*MW+a]===1)return[a,b]}return null}
function buildPOI9(){POI9=[];
 for(const b of BLD){const cat=b.type==='stadium'?'football':b.kind!=='deco'?POICAT9[b.kind]:DECOCAT9[b.type];if(!cat)continue;const dx=b.door?b.door.x:b.x+(b.w>>1),dy=(b.door?b.door.y:b.y+b.h-1)+1,t=nearWalk9(dx,dy,4);if(t)POI9.push({cat,x:t[0],y:t[1],b,inside:1})}
 for(const o of OBJ){const tx=Math.floor(o.x/T8),ty=Math.floor(o.y/T8);
  if(o.k==='bench'){if(pedOK8(tx,ty+1))POI9.push({cat:'bench',x:tx,y:ty+1,o})}
  else if(['stall','mstall','kiosk'].includes(o.k)){const t=nearWalk9(tx,ty+1,3);if(t)POI9.push({cat:'stall',x:t[0],y:t[1],o})}
  else if(['fountain','screen','statue','gazebo','umbrella','mural','play'].includes(o.k)){const t=nearWalk9(tx,ty+2,3);if(t)POI9.push({cat:o.k==='play'?'park':'sight',x:t[0],y:t[1],o})}}
 // open plazas: places to meet, wait and look around
 for(let y=2;y<MH-2;y+=3)for(let x=2;x<MW-2;x+=3)if(M[y][x]===30&&PW8[y*MW+x]===1&&M[y-1][x]===30&&M[y+1][x]===30)POI9.push({cat:'plaza',x,y});
 WALK9=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(PW8[y*MW+x]===1)WALK9.push(y*MW+x);
 // park paths double as "park" destinations
 for(let y=40;y<78;y+=4)for(let x=2;x<38;x+=4){const t=nearWalk9(x,y,2);if(t&&M[t[1]][t[0]]===31)POI9.push({cat:'park',x:t[0],y:t[1]})}}
// shortest walkable path (4-neighbour BFS on the pedestrian grid), bounded so it stays cheap
function path9(sx,sy,gx,gy){const N=MW*MH;if(!BFS9)BFS9={prev:new Int32Array(N),seen:new Uint32Array(N),stamp:0,q:new Int32Array(N)};const B9=BFS9;B9.stamp++;const st=B9.stamp;
 const s=sy*MW+sx,goal=gy*MW+gx;let h=0,t=0;B9.q[t++]=s;B9.seen[s]=st;B9.prev[s]=-1;let found=false,n=0;
 while(h<t&&n<12000){const c=B9.q[h++];n++;if(c===goal){found=true;break}const cx=c%MW,cy=(c/MW)|0;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=cx+dx,y=cy+dy;if(!pedOK8(x,y))continue;const k=y*MW+x;if(B9.seen[k]===st)continue;B9.seen[k]=st;B9.prev[k]=c;B9.q[t++]=k}}
 if(!found)return null;const out=[];for(let c=goal;c!==-1&&c!==s;c=B9.prev[c])out.push([c%MW,(c/MW)|0]);return out.reverse()}
function pickCat9(role){const tb=(RT9[role]||RT9.casual)[S.t|0]||RT9.casual[1];let tot=0;for(const k in tb)tot+=tb[k];let r=Math.random()*tot;for(const k in tb){r-=tb[k];if(r<=0)return k}return 'home'}
function pickDest9(p){if(!POI9)return null;for(let tries=0;tries<4;tries++){const cat=pickCat9(p.role);let c=POI9.filter(q=>q.cat===cat&&q!==p.dest);if(!c.length)continue;
  const tx=p.tx,ty=p.ty;c=c.map(q=>[q,Math.hypot(q.x-tx,q.y-ty)]).filter(a=>a[1]>3&&a[1]<55).sort((a,b)=>a[1]-b[1]).slice(0,6);if(!c.length)continue;const q=c[Math.floor(Math.random()*c.length)][0];
  const path=path9(tx,ty,q.x,q.y);if(path&&path.length){p.dest=q;p.path=path;return q}}return null}
function pedTarget8(){let n=S.t===3?9:S.t===2?24:S.t===1?34:30;if(wxNow()==='Rain')n=Math.round(n*.6);if(S.gfx==='low')n=Math.round(n*.55);return n}
// people step out of buildings (fading in) or come round the corner off-screen
function spawnPed8(fan){if(!POI9&&PW8)buildPOI9();
 for(let k=0;k<160;k++){let x,y,from=null;
  if(fan){x=81+Math.floor(Math.random()*36);y=20+Math.floor(Math.random()*13)}
  else if(POI9&&Math.random()<.55){const near=POI9.filter(q=>q.inside&&Math.abs(q.x-PL8.x/T8)<22&&Math.abs(q.y-PL8.y/T8)<16);if(!near.length)continue;from=near[Math.floor(Math.random()*near.length)];x=from.x;y=from.y}
  else if(WALK9.length){const k=WALK9[Math.floor(Math.random()*WALK9.length)];x=k%MW;y=(k/MW)|0;const dd=Math.hypot(x-PL8.x/T8,(y-PL8.y/T8)*1.2);if(dd<9||dd>21)continue}
  else{const a=Math.random()*6.283,r=11+Math.random()*9;x=Math.floor(PL8.x/T8+Math.cos(a)*r);y=Math.floor(PL8.y/T8+Math.sin(a)*r*.8)}
  if(!pedOK8(x,y)||PW8[y*MW+x]===2)continue;const sx=x*T8+16-CAM8.x,sy=y*T8+16-CAM8.y;if(!from&&sx>-40&&sx<520&&sy>-60&&sy<360)continue;
  if(PEDS8.some(o=>Math.abs(o.x-(x*T8+16))<10&&Math.abs(o.y-(y*T8+20))<10))continue;
  const dk=distOf(x,y),jog=dk&&dk.k==='park'&&S.t===0&&Math.random()<.45,fanShare=Math.min(.35,(S.fol||0)/6000+(S.tro?.08:0)),role=fan?'fan':jog?'track':(S.arch&&Math.random()<fanShare?'fan':roleFor8(x,y)),look=npcLook8('p'+Math.floor(Math.random()*1e9),role);
  if(wxNow()==='Rain'&&role!=='fan'&&Math.random()<.7){look.acc='umbrella';look.uc=['#2e6fb8','#c0392b','#1b1e25','#f5b700','#7a4fb8'][Math.floor(Math.random()*5)]}
  const p={x:x*T8+16,y:y*T8+20,tx:x,ty:y,dir:'d',spd:(role==='old'?.42:role==='kid'?.72:role==='track'?1.05:.55+Math.random()*.25)*(fan?.8:1),look,pause:0,ph:0,fan:!!fan,idle:0,sit:null,role,path:null,dest:null,fade:from?0:1,act:null,seen:0,rec:null};
  if(from&&from.b)from.b.dopen=Math.max(from.b.dopen||0,.8);PEDS8.push(p);pickDest9(p);return p}return null}
function ped8Step(){if(!PW8)return;if(!POI9)buildPOI9();const want=pedTarget8(),md=S.arch&&S.md<S.cfg.len&&(S.t===1||S.t===2),fans=PEDS8.filter(p=>p.fan).length,wantFans=md?14:3;
 if(PEDS8.length-fans<want&&tick%9===0)spawnPed8(0);if(fans<wantFans&&tick%13===0&&Math.abs(PL8.x/T8-98)<40&&Math.abs(PL8.y/T8-26)<30)spawnPed8(1);
 const fame=fame9(),won=lastWin9();
 for(let i=PEDS8.length-1;i>=0;i--){const p=PEDS8[i],dist=Math.hypot(p.x-PL8.x,p.y-PL8.y);const sx=p.x-CAM8.x,sy=p.y-CAM8.y,off=sx<-60||sx>540||sy<-80||sy>380;
  if(p.fade<1&&!p.leaving)p.fade=Math.min(1,p.fade+.04);
  if(p.leaving){p.fade-=.05;if(p.fade<=0){PEDS8.splice(i,1)}continue}
  if(off&&(dist>30*T8||(PEDS8.length>want+(md?14:3)+2&&!p.fan))){PEDS8.splice(i,1);continue}
  if(dist>36*T8)continue;
  // recognition: famous Eli gets noticed; what people say comes from the real last result / career stage
  if(!p.seen&&dist<110&&!off&&!PL8.sit&&!B&&!p.sit){p.seen=1;if(Math.random()<fame*(p.role==='fan'?1.6:1)){p.rec={t:420,line:recLine9(p),signed:0};p.act=won&&p.role==='fan'?'celf':null;
    // walk over to Eli (stop a step away); fans come closer than passers-by
    const ex=Math.floor(PL8.x/T8),ey=Math.floor(PL8.y/T8),t=nearWalk9(ex+(p.x<PL8.x?-1:1),ey,2);if(dist>44&&t){const pa=path9(p.tx,p.ty,t[0],t[1]);if(pa&&pa.length<14){p.path=pa;p.dest={cat:'eli'};p.pause=0;p.act=null}else p.pause=Math.max(p.pause,220)}else p.pause=Math.max(p.pause,220)}}
  if(p.rec){p.rec.t--;if(p.rec.t<=0)p.rec=null;else{const dx=PL8.x-p.x,dy=PL8.y-p.y;p.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u')}}
  if(p.pause>0){p.pause--;if(p.pause===0){p.act=null;if(p.sit){p.y=p.sit.y0;p.x=p.sit.x0;p.sit=null}if(!p.path)pickDest9(p)}else if(p.pause%70===0&&!p.sit&&!p.rec&&!p.act)p.dir=['d','l','r','u'][Math.floor(Math.random()*4)];continue}
  const [gx,gy]=tgt9(p),dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy);
  if(d<.8){p.x=gx;p.y=gy;
   if(p.path&&p.path.length){const nx=p.path[0];if(!pedOK8(nx[0],nx[1])){p.path=null;continue}p.path.shift();const ddx=nx[0]-p.tx,ddy=nx[1]-p.ty;p.tx=nx[0];p.ty=nx[1];p.dir=ddx>0?'r':ddx<0?'l':ddy>0?'d':'u';continue}
   if(p.path&&!p.path.length){arrive9(p);continue}
   // no destination: wander as before, try again soon
   if(Math.random()<.05&&pickDest9(p))continue;
   const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=p.tx+a,ny=p.ty+b;if(!pedOK8(nx,ny))return false;if(p.fan&&(nx<81||nx>116||ny<20||ny>33))return false;return true});
   if(!opts.length){p.pause=30;continue}const cur=dirVec(p.dir),str=opts.find(o=>o[0]===cur[0]&&o[1]===cur[1]),back=opts.filter(o=>!(o[0]===-cur[0]&&o[1]===-cur[1]));let ch=str&&Math.random()<.78?str:(back.length?back[Math.floor(Math.random()*back.length)]:opts[0]);
   p.tx+=ch[0];p.ty+=ch[1];p.dir=ch[0]>0?'r':ch[0]<0?'l':ch[1]>0?'d':'u';continue}
  // yield to the player and to each other
  const [fx,fy]=dirVec(p.dir);if(Math.hypot(p.x+fx*12-PL8.x,p.y+fy*10-PL8.y)<12){p.idle++;if(p.idle>40){p.path=null;p.tx=Math.round((p.x-16)/T8);p.ty=Math.round((p.y-20)/T8);p.pause=20;p.idle=0}continue}
  if(PW8[p.ty*MW+p.tx]===2&&CARS8.some(c=>Math.hypot(c.x-gx,c.y-gy)<60)){continue}
  let blk=0;for(const o of PEDS8){if(o!==p&&!o.leaving&&Math.abs(o.x-(p.x+fx*10))<7&&Math.abs(o.y-(p.y+fy*8))<6){blk=1;break}}if(blk){p.idle++;if(p.idle>50){p.pause=20;p.idle=0;p.path=null;p.tx=Math.round((p.x-16)/T8);p.ty=Math.round((p.y-20)/T8)}continue}
  p.idle=0;const sp=p.role==='track'&&!p.rec?p.spd:p.spd,s=Math.min(d,sp);p.x+=dx/d*s;p.y+=dy/d*s;p.ph+=s/(p.role==='track'?6.5:10)}}
// what happens at the destination
function arrive9(p){const q=p.dest;p.path=null;if(!q){p.pause=40;return}if(q.cat==='eli'){p.dest=null;p.pause=p.rec?Math.max(60,p.rec.t-20):40;return}
 if(q.inside&&(q.cat!=='football'||p.fan||Math.random()<.5)&&q.cat!=='park'){p.leaving=1;if(q.b)q.b.dopen=Math.max(q.b.dopen||0,.8);p.dir='u';return}
 if(q.cat==='bench'&&q.o&&!PEDS8.some(o=>o!==p&&o.sit&&o.sit.o===q.o)&&!(PL8.sit===q.o)){p.sit={o:q.o,x0:p.x,y0:p.y};p.x=q.o.x;p.y=q.o.y+3;p.dir='d';p.pause=360+Math.floor(Math.random()*720);return}
 if(q.cat==='stall'){p.act='int';p.pause=120+Math.floor(Math.random()*120);if(Math.random()<.5&&!p.look.acc){p.look=Object.assign({},p.look,{acc:'bag'})}if(q.o){const dx=q.o.x-p.x;p.dir=Math.abs(dx)>10?(dx>0?'r':'l'):'u'}return}
 if(q.o){const dx=q.o.x-p.x,dy=q.o.y-p.y;p.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u')}p.pause=(q.cat==='plaza'||q.cat==='park'?300:150)+Math.floor(Math.random()*300)}
// ---------- fame and what people say ----------
function fame9(){if(!S.arch||careerLv8()<1)return 0; /* nobody knows an Unknown player */ return clamp(careerLv8()*.13+Math.min(.3,(S.fol||0)/20000)+((S.rep&&S.rep.fan)||0)/500,0,.85)}
function lastRes9(){const r=S.lastRes;return r&&S.day-r.d<=1?r:null}
function lastWin9(){const r=lastRes9();return !!(r&&r.r>0&&S.day===r.d)}
function recLine9(p){const r=lastRes9(),lv=careerLv8(),o=r?r.opp:'';
 if(r&&r.myG>0&&r.r>=0)return L(`That goal against ${o}!`,`איזה גול נגד ${o}!`);
 if(r&&r.r>0)return p.role==='fan'?L(`What a win against ${o}!`,`איזה ניצחון נגד ${o}!`):L(`Congrats on the win!`,`מזל טוב על הניצחון!`);
 if(r&&r.r===0)return L(`A draw with ${o}. Next time!`,`תיקו עם ${o}. בפעם הבאה!`);
 if(r&&r.r<0)return L(`Tough loss. Keep going, Eli!`,`הפסד קשה. תמשיך, אלי!`);
 if(S.tro>0&&Math.random()<.4)return L('Champion!','אלוף!');
 return [L('Hey, the academy kid!','היי, הילד מהאקדמיה!'),L('Aren\'t you Eli?','אתה לא אלי?'),L('Eli! Good luck this week!','אלי! בהצלחה השבוע!'),L('Eli! Can I get a photo?','אלי! אפשר תמונה?'),L('It\'s ELI! No way!','זה אלי! לא יאמן!'),L('A real legend!','אגדה אמיתית!')][Math.min(5,lv)]}
// record the last official result for the city (set by every league / cup match, live or classic)
var endOfficial9=endOfficial;endOfficial=function(r,pens){const b=B,rec=b&&b.e?{d:S.day,r:Math.sign(r),gf:b.gf,ga:b.ga,opp:b.e.n,myG:b.myG|0,cup:!!b.e.cup}:null;endOfficial9(r,pens);if(rec){S.lastRes=rec;save()}};
// ---------- autographs: a real, capped interaction with recognising fans ----------
var findTarget80=findTarget8,interact0=interact;
findTarget8=function(){const base=findTarget80();if(Tr||dlg||menu||B||mg||scr||title||PL8.sit)return base;const [fx,fy]=dirVec(PL8.dir),ax=PL8.x+fx*12,ay=PL8.y+fy*8;let best=null,bd=26;
 for(const p of PEDS8){if(!p.rec||p.rec.signed||p.leaving)continue;const d=Math.hypot(p.x-ax,p.y-ay);if(d<bd){bd=d;best=p}}
 if(best&&(!base||bd<base.d))return{kind:'ped',obj:best,label:L('Sign an autograph','חתימה למעריץ'),d:bd};return base};
interact=function(){const t=findTarget8()||INTR8;if(t&&t.kind==='ped'){if(tick-PL8.lastInt<10)return;PL8.lastInt=tick;const p=t.obj;if(!S.nl.ag||S.nl.ag.d!==S.day)S.nl.ag={d:S.day,n:0};
  p.rec.signed=1;p.rec.t=Math.max(p.rec.t,120);p.act='celf';p.pause=Math.max(p.pause,120);actAnim8('int',12,{f:0});
  if(S.nl.ag.n<6){S.nl.ag.n++;const g=1+careerLv8();S.fol+=g;S.rep.fan=clamp((S.rep.fan||0)+.2,0,100);p.rec.line=L('Thank you so much!','תודה רבה!');sfx('coin');toast(L(`Autograph signed · +${g} fans (${S.nl.ag.n}/6 today)`,`חתימה · +${g} אוהדים (${S.nl.ag.n}/6 היום)`),null,'heart');save()}
  else{p.rec.line=L('Thanks anyway!','תודה בכל זאת!');toast('Enough autographs for today','מספיק חתימות להיום','heart')}return}interact0()};
// ---------- drawing: pedestrians with poses, fade in/out, speech bubbles ----------
function pedDraw9(p,x,y,moving){const st=p.sit?'sit':p.act?p.act:moving?(p.role==='track'?'run':'walk'):'idle',f=p.act==='celf'?(tick>>3)&1:moving?Math.floor(p.ph*2)&7:((tick+p.x)>>5)&1;
 drawActor(x,y,p.look,1.08,p.sit?'d':p.dir,st,f,0,p.fade<1?Math.max(0,p.fade):null);
 if(p.rec&&p.rec.line&&p.fade>=1){const a=Math.min(1,p.rec.t/20),w=Math.min(150,tw(p.rec.line,7)+14),bx=x-w/2,by=y-58;
  // one bubble per spot: skip a bubble that would overlap one already drawn this frame
  if(CITY9.bt!==tick){CITY9.bt=tick;CITY9.bub=[]}if(CITY9.bub.some(r=>Math.abs(r[0]-x)<(r[2]+w)/2&&Math.abs(r[1]-by)<20))return;CITY9.bub.push([x,by,w]);g.save();g.globalAlpha=a;smooth(1);g.fillStyle='rgba(255,255,255,.95)';rr(bx,by,w,15,6);g.fill();g.strokeStyle='rgba(30,24,38,.6)';g.lineWidth=.8;g.stroke();g.beginPath();g.moveTo(x-3,by+15);g.lineTo(x+1,by+20);g.lineTo(x+4,by+15);g.closePath();g.fill();txt(p.rec.line,x,by+10.6,7,'#1b2240','#0000','center');g.restore()}}
// ---------- district identity: banners on street lamps in the district's colour (club colours around the club) ----------
var lamp80=lamp8;lamp8=function(o,sx,sy){lamp80(o,sx,sy);if(o.side===0)return;const tx=Math.floor(o.x/T8),ty=Math.floor(o.y/T8),d=distOf(tx,ty);if(!d)return;
 const club=d.k==='fb'||d.k==='stad',cc=club?clubCols():[d.c,'#ffffff'],c1=solid(cc[0]),wv=S.rm?0:Math.sin(tick/22+tx)*.6,bx=sx+2.6,by=sy-35;
 g.save();g.fillStyle='rgba(20,22,28,.85)';g.fillRect(bx-.4,by-.6,6.4,.9);g.fillStyle=c1;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+6,by);g.lineTo(bx+6+wv,by+11);g.lineTo(bx+3+wv,by+9.2);g.lineTo(bx+wv,by+11);g.closePath();g.fill();
 g.fillStyle=solid(cc[1]);g.fillRect(bx+.4+wv*.3,by+3.2,5.2,1.2);g.restore()};
// ---------- the billboard: club advert, replaced by Eli's own campaign once he is a Star ----------
function placeBillboard9(){if(CITY9.bb||!OBJ.length)return;CITY9.bbTry=1;const cand=[];for(let y=6;y<=37;y++)for(let x=41;x<=77;x++)cand.push([x,y,Math.hypot(x-60,y-15)]);cand.sort((a,b)=>a[2]-b[2]);
 for(const [x,y] of cand){let ok=true;for(let k=-1;k<=1;k++)if(!inb(x+k,y)||![8,30].includes(M[y][x+k])||!inb(x+k,y+1)||![8,30,34].includes(M[y+1][x+k]))ok=false;if(!ok)continue;if(objsNear(tc(x),y*T8+20,52).some(o=>Math.hypot(o.x-tc(x),o.y-(y*T8+26))<52))continue;if(FAC.some(f=>f[5]&&Math.abs(f[5].door.x-x)<3&&f[5].door.y+3>=y&&f[5].door.y<=y))continue;
  CITY9.bb=obj8('billboard9',tc(x),y*T8+26,{c:[-34,-3,-30,1],c2:[30,-3,34,1]});buildObjGrid8();if(typeof pedGrid8==='function')pedGrid8();POI9=null;return}}
var drawProp80=drawProp8;drawProp8=function(o,sx,sy){if(o.k==='billboard9'){billboard9(sx,sy);return}drawProp80(o,sx,sy)};
function billboard9(sx,sy){const W=74,Hh=38,x0=sx-W/2,y0=sy-Hh-34,lv=S.arch?careerLv8():0,star=lv>=3;
 g.save();smooth(1);g.fillStyle='rgba(12,18,26,.28)';g.beginPath();g.ellipse(sx,sy+1,40,4,0,0,7);g.fill();
 for(const px of [-32,30]){g.fillStyle='#2a2f38';g.fillRect(sx+px,sy-36,3,37);g.fillStyle='#4a515e';g.fillRect(sx+px,sy-36,1,37)}
 g.fillStyle='#14161b';rr(x0-3,y0-3,W+6,Hh+6,3);g.fill();const cc=clubCols(),gr=g.createLinearGradient(x0,y0,x0+W,y0+Hh);
 if(star){gr.addColorStop(0,'#1b1e27');gr.addColorStop(1,shd(solid(cc[0]),.55))}else{gr.addColorStop(0,shd(solid(cc[0]),.8));gr.addColorStop(1,'#0e1118')}g.fillStyle=gr;g.fillRect(x0,y0,W,Hh);
 g.save();g.beginPath();g.rect(x0,y0,W,Hh);g.clip();
 if(star){const a=pkx(S.ap),o=Object.assign(plOpts(),{sh:solid(a[0]),hc:solid(a[4]||'#2b1a10'),bt:solid(a[5]||'#15161a'),pa:solid(a[6]||'#1b2240'),out:'kit'});o.sk=solid(o.sk);o.c2=solid(o.c2||'#ffffff');
  drawActor(x0+18,y0+Hh+16,o,1.25,'d','celf',1,1);const sp=S.sp>=0&&SP[S.sp]?SP[S.sp][0]:nm(mine().n);
  txt('ELI #'+(S.num||10),x0+W-4,y0+12,8,'#ffd96a','#000a','right');txt(ell(tr(sp),40,6),x0+W-4,y0+22,6,'#ffffff','#000a','right');txt(tr(stage()),x0+W-4,y0+32,5,'#cfe9ff','#000a','right')}
 else{crest(x0+14,y0+Hh/2,10,nm(mine().n));txt(ell(nm(mine().n),48,7),x0+W-4,y0+14,7,'#ffffff','#000a','right');txt(L(`Season ${S.season} · Matchday ${Math.min(S.md+1,S.cfg.len)}`,`עונה ${S.season} · מחזור ${Math.min(S.md+1,S.cfg.len)}`),x0+W-4,y0+25,5,'#ffd96a','#000a','right');txt(L('Tickets at the stadium','כרטיסים באצטדיון'),x0+W-4,y0+33,5,'#cfe9ff','#000a','right')}
 g.restore();if(S.t>=2){g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,240,200,.10)';g.fillRect(x0,y0,W,Hh);g.restore()}g.restore()}
// ---------- match-day and post-win atmosphere around the club ----------
var world8Step0=world8Step;world8Step=function(){world8Step0();if(!CITY9.bbTry&&W8B)placeBillboard9();
 // after a win today, fans near the football district and the city centre celebrate (real result, same day only)
 if(lastWin9()&&tick%40===0){for(const p of PEDS8){if(p.role!=='fan'||p.sit||p.leaving||p.act)continue;const d=distOf(p.tx,p.ty);if(d&&(d.k==='fb'||d.k==='down'||d.k==='stad')&&Math.random()<.25){p.act='celf';p.pause=Math.max(p.pause,90);if(!p.rec)p.rec={t:90,line:lastRes9().cup?L('Into the next round!','עולים לשלב הבא!'):L('We won! Come on!','ניצחנו! קדימה!'),signed:1}}}}};

// the start-up already built the pedestrian grid before this module's variables existed: rebuild it with side-steps
if(typeof PW8!=='undefined'&&PW8&&W8B)pedGrid8();
