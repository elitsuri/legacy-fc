// ===================== v8 · 2D VISUAL REVOLUTION: world model (160x120) =====================
// Tile codes: 0 road · 8 grass · 34 sidewalk · 30 plaza · 31 path · 32 pitch · 33 track · 35 sand · 36 boardwalk
//             43 tarmac · 44 parking · 46 gate (open by day) · 2 tall grass   [walkable]
//             3 building · 4 door · 7 water · 37 fence · 38 hedge · 40 stadium · 42 rails · 45 woodland edge [solid]
var BLD=[],OBJ=[],OBJG=null,ZN=null,ZV=null,GATES=[],INTS=[],RAILX=[],COLLECT=[],W8B=0,OLDFAC=null,T8=32,CH8=8,
 DIS8=[['trn',0,0],['fb',1,0],['stad',2,0],['acad',3,0],['park',0,1],['down',1,1],['com',2,1],['prem',3,1],['comm',0,2],['res',1,2],['tr',2,2],['wf',3,2]];
function noop8(){}
// neutralise the legacy whole-map painters (the v8 renderer paints the world in cached chunks instead)
function tile(){}function upgradeMap(){}function upgradeMap2(){}function buildRoads(){}function buildDistricts(){}
function inb(x,y){return x>=0&&y>=0&&x<MW&&y<MH}
function setT(x,y,t){if(inb(x,y))M[y][x]=t}
function fillT(x0,y0,x1,y1,t,only){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(inb(x,y)&&(only==null||only.includes(M[y][x])))M[y][x]=t}
function road8(x0,y0,x1,y1){fillT(x0,y0,x1,y1,0)}
function fenceRect(x0,y0,x1,y1,gates){for(let x=x0;x<=x1;x++){setT(x,y0,37);setT(x,y1,37)}for(let y=y0;y<=y1;y++){setT(x0,y,37);setT(x1,y,37)}(gates||[]).forEach(([x,y])=>{setT(x,y,46);GATES.push({x,y,open:1,t:0})})}
function isWalkT(t,x,y){if(t===46){const gt=gateAt(x,y);return !gt||gt.open}return t===0||t===8||t===2||t===30||t===31||t===32||t===33||t===34||t===35||t===36||t===43||t===44}
function gateAt(x,y){for(const q of GATES)if(q.x===x&&q.y===y)return q;return null}
// ---------- buildings ----------
function bld8(x,y,w,h,type,o){o=o||{};const b={x,y,w,h,type,name:o.name||'',kind:o.kind||'deco',col:o.col||'#8a8f9a',dx:o.dx!=null?o.dx:Math.floor((w-1)/2),hp:Math.round((o.hp||52)*(['clocktower','tower','ctower','lighthouse'].includes(type)?1:1.3)),v:o.v!=null?o.v:H(x,y,9),i:BLD.length,o,spr:null};
 for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(M[yy][xx]!==8&&M[yy][xx]!==45)console.warn('v8 overlap',type,xx,yy,M[yy][xx]);M[yy][xx]=3;BI[yy][xx]=b.i}
 b.door={x:x+b.dx,y:y+h-1};if(b.kind!=='deco'){M[b.door.y][b.door.x]=4;DR[b.door.y*MW+b.door.x]=b.kind;FAC.push([b.door.x-1,b.door.y-2,b.name,b.col,b.kind,b]);b.fi=FAC.length-1;
  // paved apron + walkway from the door to the nearest pavement
  const fy=b.door.y+1;for(let k=-1;k<=1;k++)if(inb(b.door.x+k,fy)&&M[fy][b.door.x+k]===8)M[fy][b.door.x+k]=30;
}
 BLD.push(b);return b}
function obj8(k,x,y,o){const q=Object.assign({k,x,y,v:H(x|0,y|0,17)},o||{});if(q.c){q.c=[x+q.c[0],y+q.c[1],x+q.c[2],y+q.c[3]]}q.sy=q.sy!=null?q.sy:y;OBJ.push(q);return q}
function tc(x){return x*T8+16}
// ---------- the city ----------
function buildWorld8(){if(W8B)return;W8B=1;
 OLDFAC=FAC.map(f=>[f[0]+1,f[1]+2,f[4],f[2]]);
 for(const k in DR)delete DR[k];FAC.length=0;BLD=[];OBJ=[];GATES=[];COLLECT=[];
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){M[y][x]=8;BI[y][x]=null}
 ZN=new Uint8Array(MW*MH);ZV=new Uint8Array(MW*MH);
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){ZN[y*MW+x]=Math.min(3,Math.floor(x/40))+4*Math.min(2,Math.floor(y/40))}
 // woodland edge
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>MW-3||y>MH-3)M[y][x]=45;
 // ---- arterial avenues + district streets (all two-lane) ----
 road8(0,38,MW-1,39);road8(0,78,MW-1,79);road8(38,0,39,MH-1);road8(78,0,79,MH-1);road8(118,0,119,MH-1);
 road8(0,18,79,19);road8(40,58,MW-1,59);road8(0,98,117,99);road8(120,94,MW-1,95);
 road8(58,40,59,MH-1);road8(98,40,99,MH-1);road8(138,0,139,77);road8(18,80,19,MH-1);
 // ---- sea & beach (Waterfront) ----
 for(let x=118;x<MW;x++){const cy=105+Math.round(1.6*Math.sin(x*.3)+1.2*Math.sin(x*.11+2));for(let y=96;y<MH;y++){if(M[y][x]===0)continue;if(y>=cy)M[y][x]=7;else if(y>=99)M[y][x]=35;else if(y>=97)M[y][x]=36}}
 // ---- park lake ----
 for(let y=44;y<76;y++)for(let x=2;x<37;x++){const a=((x-17)/9.5)**2+((y-59)/7.5)**2,b=((x-26)/5)**2+((y-66)/4)**2,isl=((x-15)/2.4)**2+((y-58)/1.9)**2;if((a<1||b<1)&&isl>=1)M[y][x]=7;
  const r=Math.min(a,b*1.1);if(r>=1.15&&r<1.45&&M[y][x]===8)M[y][x]=31}
 for(let x=6;x<=12;x++)M[58][x]=36;
 // ================= TRAINING DISTRICT =================
 fenceRect(2,2,16,14,[[16,10]]);fillT(3,3,15,13,32);fenceRect(22,2,36,14,[[22,10]]);fillT(23,3,35,13,32);
 bld8(17,3,5,5,'clubhouse',{name:'TRAINING',kind:'tr',col:'#2e8b57',hp:58});fillT(17,8,21,16,30,[8]);
 for(let y=21;y<=35;y++)for(let x=3;x<=20;x++){const d=((x-11.5)/8.6)**2+((y-28)/7.4)**2;if(d<1)M[y][x]=d>.62?33:32}
 bld8(22,22,3,3,'pavilion',{name:'TRACK',kind:'track',col:'#c0392b',hp:40,dx:1});
 bld8(26,22,4,3,'office',{name:'COURTS',kind:'courts',col:'#2e8b57',hp:44,dx:1});
 bld8(31,21,6,4,'gym',{name:'GYM',kind:'gym',col:'#c76b1a',hp:56,dx:2});
 fillT(22,25,36,25,30,[8]);
 fenceRect(22,27,36,35,[[25,27],[33,27]]);for(let y=28;y<=34;y++)setT(29,y,37);fillT(23,28,28,34,32);fillT(30,28,35,34,32);
 for(let y=28;y<=34;y++)for(let x=23;x<=35;x++)if(M[y][x]===32)ZV[y*MW+x]=2;
 // ================= FOOTBALL DISTRICT =================
 bld8(49,4,9,5,'hq',{name:'CLUB HQ',kind:'hq',col:'#b83a2c',hp:66,dx:4});fillT(44,9,62,16,30,[8]);
 bld8(66,5,4,5,'glass',{name:'AGENT',kind:'ag',col:'#6a5aa0',hp:92,dx:1});
 bld8(41,3,6,5,'officeBlk',{hp:70});bld8(71,4,6,5,'flats',{hp:76});
 fillT(41,27,76,29,30,[8]);
 bld8(42,23,6,4,'shop',{name:'SHOP',kind:'shop',col:'#2e6fb8',hp:52,dx:2});
 bld8(50,23,5,4,'cafe',{name:'CAFE',kind:'cafe',col:'#8a5a2b',hp:46,dx:2});
 bld8(57,22,6,5,'clinic',{name:'CLINIC',kind:'cl',col:'#d04a4a',hp:60,dx:2});
 bld8(65,22,6,5,'flats',{hp:70});bld8(72,23,5,4,'smallshop',{hp:48,v:3});
 bld8(41,32,5,4,'townhouse',{hp:50});bld8(47,32,6,4,'restaurant',{hp:46});bld8(55,32,5,4,'townhouse',{hp:54,v:2});bld8(62,32,6,4,'smallshop',{hp:48,v:1});bld8(70,32,6,4,'townhouse',{hp:52,v:5});
 // ================= STADIUM & SPORTS COMPLEX =================
 const ST={cx:97.5,cy:11.2,rx:12.2,ry:8.6};for(let y=2;y<=20;y++)for(let x=84;x<=111;x++){if(((x+.5-ST.cx)/ST.rx)**2+((y+.5-ST.cy)/ST.ry)**2<1){M[y][x]=40}}
 {const b={x:85,y:3,w:25,h:17,type:'stadium',name:'STADIUM',kind:'st',col:'#1f9d9d',dx:12,hp:0,v:0,i:BLD.length,o:{},spr:null,el:ST};b.door={x:97,y:19};M[19][97]=4;DR[19*MW+97]='st';FAC.push([96,17,'STADIUM','#1f9d9d','st',b]);b.fi=FAC.length-1;BLD.push(b)}
 fillT(81,20,116,32,30,[8]);fillT(96,19,98,19,30,[8]);
 bld8(82,33,6,4,'gym',{name:'GYM',kind:'gym',col:'#c76b1a',hp:54,dx:2,v:1});
 fillT(104,33,116,36,44,[8]);
 fenceRect(111,4,117,16,[[114,16]]);fillT(112,5,116,15,32);
 // ================= ACADEMY & YOUTH CAMPUS =================
 bld8(121,4,9,5,'campus',{name:'ACADEMY',kind:'ac',col:'#3a7bd5',hp:62,dx:4});
 bld8(131,4,6,4,'school',{hp:56});fillT(121,9,136,11,30,[8]);
 fenceRect(121,13,136,24,[[128,13]]);fillT(122,14,135,23,32);fenceRect(121,26,136,36,[[128,26]]);fillT(122,27,135,35,32);
 bld8(141,3,7,5,'dorm',{hp:66});bld8(150,3,7,5,'school',{hp:58,v:2});fillT(141,8,156,9,30,[8]);
 fenceRect(141,12,156,22,[[149,12]]);fillT(142,13,155,21,32);fillT(141,25,156,28,44,[8]);
 // ================= PARK =================
 bld8(28,43,5,3,'parkPav',{name:'PARK',kind:'park',col:'#2e8b57',hp:44,dx:2});
 bld8(3,43,5,3,'cafe',{name:'CAFE',kind:'cafe',col:'#8a5a2b',hp:44,dx:2,v:2});
 for(let y=69;y<=76;y++)for(let x=2;x<=8;x++)if(M[y][x]===8)M[y][x]=2;for(let y=49;y<=55;y++)for(let x=32;x<=36;x++)if(M[y][x]===8)M[y][x]=2;
 fillT(27,69,35,75,35,[8,2]);
 for(let x=2;x<=36;x++)if(M[42][x]===8)M[42][x]=31;for(let y=46;y<=76;y++)if(M[y][30]===8)M[y][30]=31;for(let y=46;y<=52;y++)if(M[y][5]===8)M[y][5]=31;
 // ================= CITY CENTER =================
 fillT(41,41,56,56,30,[8]);bld8(42,42,2,2,'clocktower',{hp:150,dx:0});
 fillT(60,48,77,49,30,[8]);
 bld8(61,41,6,6,'tower',{hp:190});bld8(70,41,7,6,'tower',{hp:230,v:4});
 bld8(62,50,5,4,'glass',{name:'AGENT',kind:'ag',col:'#6a5aa0',hp:80,dx:2,v:2});bld8(69,50,7,5,'officeBlk',{hp:84,v:3});
 bld8(42,61,5,4,'cafe',{name:'CAFE',kind:'cafe',col:'#8a5a2b',hp:46,dx:2,v:1});bld8(48,61,8,5,'cinema',{hp:62});fillT(41,65,56,67,30,[8]);
 bld8(41,70,6,6,'flats',{hp:80,v:2});bld8(49,70,7,6,'hotel',{hp:110});
 bld8(61,61,7,5,'officeBlk',{hp:74,v:1});bld8(70,61,7,6,'flats',{hp:84,v:4});
 // ================= COMMERCIAL =================
 bld8(82,42,14,7,'mall',{name:'MALL',kind:'shop',col:'#2e6fb8',hp:74,dx:6});fillT(82,49,96,55,44,[8]);
 bld8(101,42,6,4,'boutique',{name:'BOUTIQUE',kind:'market',col:'#a8326e',hp:56,dx:2});
 bld8(109,42,4,4,'barber',{name:'BARBER',kind:'barber',col:'#2e8b8b',hp:50,dx:1});bld8(114,42,3,4,'smallshop',{hp:50,v:4});
 fillT(100,46,117,48,30,[8]);
 bld8(101,50,5,4,'smallshop',{hp:48,v:5});bld8(107,50,5,4,'smallshop',{hp:52,v:6});bld8(113,50,4,4,'smallshop',{hp:46,v:7});
 fillT(81,61,96,71,30,[8]);bld8(82,72,8,5,'warehouse',{hp:58});bld8(91,72,6,5,'smallshop',{hp:50,v:8});
 bld8(101,61,7,6,'officeBlk',{hp:78,v:2});bld8(110,61,7,7,'hotel',{hp:104,v:1});
 // ================= LUXURY =================
 bld8(122,43,7,4,'lounge',{name:'VIP',kind:'vip',col:'#c9a227',hp:56,dx:3});bld8(130,42,7,5,'villa',{hp:52});
 fillT(121,47,136,49,30,[8]);
 bld8(141,41,6,5,'penthouse',{name:'PENTHOUSE',kind:'home',col:'#7a4fb8',hp:150,dx:2});
 bld8(149,42,8,4,'showroom',{name:'CAR DEALER',kind:'car',col:'#555a6b',hp:54,dx:3});fillT(148,47,157,55,44,[8]);
 for(const vx of [121,130,141,150]){bld8(vx,61,7,5,'villa',{hp:50,v:vx});fillT(vx+1,67,vx+5,68,7,[8]);fillT(vx,66,vx+6,66,30,[8]);fillT(vx,69,vx+6,69,30,[8])}
 // ================= COMMUNITY =================
 bld8(3,82,4,3,'kiosk',{name:'STREET',kind:'street',col:'#e67e22',hp:44,dx:1});
 fenceRect(2,87,16,96,[[9,87]]);fillT(3,88,15,95,32);for(let y=88;y<=95;y++)for(let x=3;x<=15;x++)ZV[y*MW+x]=3;
 bld8(21,82,6,4,'campus',{name:'ACADEMY',kind:'ac',col:'#3a7bd5',hp:54,dx:2,v:1});
 fillT(28,82,36,89,30,[8]);for(let y=83;y<=88;y++)for(let x=29;x<=35;x++)ZV[y*MW+x]=4;
 bld8(2,101,7,6,'flats',{hp:82,v:1});bld8(10,101,7,6,'flats',{hp:76,v:3});bld8(21,101,7,6,'flats',{hp:88,v:5});bld8(30,101,7,6,'flats',{hp:70,v:6});
 fillT(3,110,16,116,35,[8]);
 // ================= RESIDENTIAL =================
 bld8(42,82,5,4,'agency',{name:'HOMES',kind:'home',col:'#a8326e',hp:50,dx:2});
 const houses=(x0,x1,ys)=>{for(const hy of ys){for(let hx=x0;hx+3<=x1;hx+=6){if(M[hy][hx]!==8||M[hy+2][hx+3]!==8)continue;bld8(hx,hy,4,3,'house',{hp:44,v:H(hx,hy,3)});fillT(hx,hy+4,hx+5,hy+4,31,[8]);if(H(hx,hy,5)<55)for(let yy=hy;yy<=hy+3;yy++)setT(hx+4,yy,38)}}};
 houses(48,57,[82,89]);houses(60,77,[82,89]);houses(41,57,[101,108]);houses(60,77,[101,108]);
 // ================= TRANSPORT =================
 bld8(82,81,9,4,'station',{name:'STATION',kind:'station',col:'#555a6b',hp:60,dx:4});fillT(80,85,117,86,30,[8]);
 for(let x=80;x<=117;x++){if(M[87][x]===0||M[88][x]===0){RAILX.push(x);continue}M[87][x]=42;M[88][x]=42}
 fillT(101,81,116,84,44,[8]);
 bld8(101,101,11,5,'terminal',{name:'AIRPORT',kind:'air',col:'#3d4a6b',hp:64,dx:5});bld8(113,100,2,2,'ctower',{hp:150,dx:0});
 bld8(84,101,6,4,'terminal',{name:'AIRPORT',kind:'air',col:'#3d4a6b',hp:52,dx:2,v:1});
 for(let x=100;x<=117;x++)setT(x,107,37);fillT(100,108,117,117,43,[8]);fillT(82,107,96,116,44,[8]);
 // ================= WATERFRONT =================
 bld8(122,82,7,4,'spa',{name:'RECOVERY',kind:'cl',col:'#2e8b8b',hp:50,dx:3});bld8(131,81,7,6,'hotel',{hp:120,v:3});
 bld8(141,83,6,4,'restaurant',{hp:46,v:2});bld8(149,83,6,4,'smallshop',{hp:46,v:9});fillT(121,87,157,92,30,[8]);
 for(let y=97;y<=114;y++){if(M[y][140]!==0){M[y][140]=36;M[y][141]=36}}
 for(let y=115;y<=116;y++)for(let x=139;x<=142;x++)M[y][x]=8;
 bld8(140,115,2,2,'lighthouse',{hp:120,dx:0});
 for(let x=123;x<=134;x++){for(let y=100;y<=112;y++){const t=M[y][x];if(t===7&&y<=108&&(x%4==0||y==Math.max(100,y)))if(x%4==0)M[y][x]=36}}
 // walkways from facility doors down to the nearest pavement (after every building exists)
 FAC.forEach(f=>{const b=f[5];if(!b||b.type==='stadium')return;let yy=b.door.y+2;const run=[];while(yy<MH-1&&M[yy][b.door.x]===8){run.push(yy);yy++}if(yy<MH&&[0,30,31,34,44].includes(M[yy][b.door.x])||run.length<4)run.forEach(r=>M[r][b.door.x]=30)});
 // sidewalks along every road
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]!==8)continue;let nr=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy)&&M[y+dy][x+dx]===0)nr=1;if(nr)M[y][x]=34}
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]!==45)continue;let nr=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy)&&M[y+dy][x+dx]===0)nr=1;if(nr)M[y][x]=34}
 // intersections (2x2 squares where two roads cross)
 INTS=[];for(let y=0;y<MH-1;y++)for(let x=0;x<MW-1;x++){if(!isRoadXY(x,y)||!isRoadXY(x+1,y)||!isRoadXY(x,y+1)||!isRoadXY(x+1,y+1))continue;const hz=isRoadXY(x-1,y)||isRoadXY(x+2,y),vt=isRoadXY(x,y-1)||isRoadXY(x,y+2);if(roadAxis(x,y)==='x'&&isRoadXY(x,y-1)||roadAxis(x,y)==='y'&&isRoadXY(x-1,y)||(hz&&vt&&isRoadXY(x-1,y)&&isRoadXY(x,y-1)))INTS.push({x,y,ph:H(x,y,2)%2})}
 INTS=INTS.filter((q,i,a)=>!a.some((r,j)=>j<i&&Math.abs(r.x-q.x)<2&&Math.abs(r.y-q.y)<2));
 placeObjects8();placeFences8();placeNPCs8();placeCollect8();
 // walkability list used by legacy helpers (fixPos etc.)
 WALK.length=0;[0,8,2,30,31,32,33,34,35,36,43,44,46].forEach(t=>WALK.push(t));
 buildObjGrid8();
 // districts
 const names={trn:['Training District','רובע האימונים'],fb:['Football District','רובע הכדורגל'],stad:['Stadium Complex','מתחם האצטדיון'],acad:['Academy Campus','קמפוס האקדמיה'],park:['Park District','רובע הפארק'],down:['City Center','מרכז העיר'],com:['Commercial District','רובע המסחר'],prem:['Luxury District','הרובע היוקרתי'],comm:['Community District','רובע הקהילה'],res:['Residential District','רובע המגורים'],tr:['Transport District','רובע התחבורה'],wf:['Waterfront','חוף הים']},cols={trn:'#2e8b57',fb:'#b83a2c',stad:'#1f9d9d',acad:'#3a7bd5',park:'#3c9a3c',down:'#3a7bd5',com:'#a8326e',prem:'#c9a227',comm:'#e67e22',res:'#c77d4a',tr:'#8d96a8',wf:'#2fa6c9'};
 DIS.length=0;DIS8.forEach(([k,cx,cy])=>DIS.push({k,n:names[k],r:[cx*40,cy*40,cx*40+39,cy*40+39],c:cols[k]}));
 // fast-travel arrival points: in front of the main facility of each district
 const ftk={trn:'tr',fb:'hq',stad:'st',acad:'ac',park:'park',down:'ag',com:'market',prem:'vip',comm:'street',res:'home',tr:'station',wf:'cl'};
 for(const k in FT)delete FT[k];DIS.forEach(d=>{let f=FAC.find(f=>f[4]==ftk[d.k]&&distOf(f[0]+1,f[1]+2)===d);if(!f)f=FAC.find(f=>distOf(f[0]+1,f[1]+2)===d);FT[d.k]=f?[f[0]+1,f[1]+3]:[d.r[0]+20,d.r[1]+20]});
 def.x=53;def.y=10;
 }
function isRoadXY(x,y){return inb(x,y)&&M[y][x]===0}
function roadAxis(x,y){const h=isRoadXY(x-1,y)||isRoadXY(x+1,y),v=isRoadXY(x,y-1)||isRoadXY(x,y+1);return h&&!v?'x':v&&!h?'y':'xy'}
// ---------- props, landmarks, street furniture ----------
function placeObjects8(){
 const free=(x,y)=>inb(x,y)&&(M[y][x]===8||M[y][x]===34||M[y][x]===30||M[y][x]===31||M[y][x]===35||M[y][x]===2||M[y][x]===44);
 const taken=new Set(),tk=(x,y)=>taken.add(x+','+y),isTk=(x,y)=>taken.has(x+','+y);
 const doorFront=new Set();FAC.forEach(f=>{const b=f[5];if(!b)return;for(let k=-1;k<=1;k++)for(let d=1;d<=2;d++)doorFront.add((b.door.x+k)+','+(b.door.y+d))});
 const okT=(x,y)=>free(x,y)&&!isTk(x,y)&&!doorFront.has(x+','+y);
 const tree=(x,y,kind)=>{if(!okT(x,y))return;tk(x,y);obj8('tree',tc(x)+(H(x,y,3)%9-4),y*T8+26,{kind,c:[-5,-3,5,2],v:H(x,y,5)})};
 const tz=(x0,y0,x1,y1,dens,kinds,salt)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(M[y][x]!==8)continue;if(H(x,y,salt||31)<dens)tree(x,y,kinds[H(x,y,7)%kinds.length])}};
 // woodland ring
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(M[y][x]===45&&H(x,y,4)<70)obj8('tree',tc(x)+(H(x,y,3)%9-4),y*T8+26,{kind:H(x,y,6)%3?'pine':'oak',v:H(x,y,5),edge:1});
 // district planting
 tz(2,15,37,17,30,['oak','birch']);tz(2,20,37,37,10,['oak','pine']);
 tz(40,2,77,17,8,['oak','round']);tz(40,30,77,37,12,['round','birch']);
 tz(80,2,117,19,28,['oak','pine','round']);tz(80,20,117,37,6,['round']);
 tz(120,2,157,37,12,['oak','birch','round']);
 tz(2,40,37,77,30,['oak','cherry','birch','pine','round','cherry'],29);
 tz(40,40,77,77,6,['round','birch']);tz(80,40,117,77,5,['round']);
 tz(120,40,157,77,14,['palm','cypress','palm','round']);
 tz(2,80,37,117,12,['oak','round','birch']);tz(40,80,77,117,20,['autumn','oak','round','birch','autumn']);
 tz(80,80,117,117,7,['round','pine']);tz(120,80,157,93,10,['palm','round']);
 for(let x=121;x<158;x+=3)if(M[96][x]===34||M[97][x]===36){const y=M[96][x]===34?96:97;if(okT(x,y)){tk(x,y);obj8('tree',tc(x),y*T8+26,{kind:'palm',c:[-4,-3,4,2],v:H(x,y,5)})}}
 // street lamps + bins + hydrants along sidewalks
 for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){if(M[y][x]!==34||isTk(x,y)||doorFront.has(x+','+y))continue;const nearRoadV=isRoadXY(x,y+1)||isRoadXY(x,y-1),nearRoadH=isRoadXY(x+1,y)||isRoadXY(x-1,y);
  if(nearRoadV&&!nearRoadH&&x%7==3){tk(x,y);obj8('lamp',tc(x),y*T8+(isRoadXY(x,y+1)?28:10),{c:[-3,-2,3,2],side:isRoadXY(x,y+1)?1:-1})}
  else if(nearRoadH&&!nearRoadV&&y%7==3){tk(x,y);obj8('lamp',tc(x)+(isRoadXY(x+1,y)?11:-11),y*T8+20,{c:[-3,-2,3,2],side:0})}
  else if(nearRoadV&&!nearRoadH&&x%13==9&&H(x,y,2)<60){tk(x,y);obj8('bin',tc(x),y*T8+(isRoadXY(x,y+1)?26:14),{c:[-4,-3,4,1]})}
  else if(nearRoadV&&!nearRoadH&&x%17==12&&H(x,y,8)<50){tk(x,y);obj8('hydrant',tc(x)+6,y*T8+(isRoadXY(x,y+1)?27:12),{c:[-3,-2,3,1]})}}
 // traffic lights at intersections
 INTS.forEach(q=>{[[q.x-1,q.y-1,'nw'],[q.x+2,q.y+2,'se']].forEach(([x,y,c])=>{if(inb(x,y)&&M[y][x]===34){tk(x,y);obj8('tlight',tc(x)+(c=='nw'?8:-8),y*T8+(c=='nw'?26:10),{q,corner:c,c:[-2,-2,2,1]})}})});
 // ---- landmarks ----
 const C=(x,y)=>[tc(x),y*T8+16];
 obj8('statue',tc(47),12*T8+28,{c:[-14,-8,14,4],name:'legend'});tk(47,12);tk(46,12);tk(48,12);
 [[49,9],[57,9]].forEach(([x,y])=>{tk(x,y);obj8('flag',tc(x),y*T8+24,{c:[-2,-2,2,1],club:1})});
 obj8('crest',tc(53)+0,14*T8+16,{flat:1});
 obj8('fountain',tc(48)+16,48*T8+40,{c:[-58,-36,58,12],big:1});for(let y=46;y<=50;y++)for(let x=46;x<=51;x++)tk(x,y);
 obj8('screen',tc(53)+16,43*T8+10,{c:[-52,-3,-46,2],c2:[46,-3,52,2]});
 for(const [x,y] of [[45,45],[52,45],[45,53],[52,53]]){tk(x,y);obj8('bench',tc(x),y*T8+22,{c:[-12,-3,12,3],face:'d'})}
 for(const [x,y] of [[44,50],[54,50],[49,44],[49,55]]){tk(x,y);obj8('planter',tc(x),y*T8+24,{c:[-10,-6,10,3]})}
 // stadium plaza: stalls, ticket booths, flags, crest
 for(const [x,y,k] of [[84,23,'food'],[88,23,'merch'],[106,23,'merch'],[110,23,'food']]){for(let d=-1;d<=1;d++)tk(x+d,y);obj8('stall',tc(x),y*T8+22,{kind:k,c:[-22,-8,22,4]})}
 for(const x of [83,90,105,112]){tk(x,29);obj8('flag',tc(x),29*T8+24,{c:[-2,-2,2,1],club:1})}
 obj8('crest',tc(97)+0,26*T8+16,{flat:1,big:1});
 for(const [x,y] of [[93,21],[101,21]]){tk(x,y);obj8('booth',tc(x),y*T8+26,{c:[-10,-6,10,3]})}
 // parked vehicles
 const park=(x,y,dir,kind)=>{tk(x,y);if(dir=='h')tk(x+1,y);else tk(x,y+1);obj8('pcar',dir=='h'?(x+1)*T8:tc(x),dir=='h'?y*T8+24:(y+1)*T8+14,{dir,kind:kind||'car',col:['#c0392b','#2e6fb8','#f4f4f4','#16181d','#8d96a8','#f5b700','#1f9d55','#7a4fb8'][H(x,y,4)%8],c:dir=='h'?[-26,-10,26,4]:[-11,-24,11,14]})};
 for(let x=105;x<=115;x+=3)park(x,34,'v');park(105,33,'v','bus');
 for(let x=83;x<=95;x+=3){if(x!=88)park(x,50,'v');if(x!=88&&H(x,1,1)<70)park(x,53,'v')}
 for(let x=148;x<=156;x+=3){park(x,48,'v','sport');park(x,52,'v','sport')}
 for(let x=142;x<=154;x+=4)park(x,26,'h','van');
 for(let x=102;x<=114;x+=4)park(x,82,'h','bus');
 for(let x=83;x<=95;x+=3){park(x,108,'v');if(H(x,2,2)<60)park(x,112,'v')}
 for(let x=101;x<=115;x+=7)obj8('plane',x*T8+40,113*T8,{v:x});
 // pitches: goals, cones, mannequins
 const goals=(x0,y0,x1,y1)=>{const cy=(y0+y1+1)/2*T8;obj8('goal',x0*T8+10,cy+30,{side:'l',c:[-4,-30,4,30]});obj8('goal',(x1+1)*T8-10,cy+30,{side:'r',c:[-4,-30,4,30]})};
 goals(3,3,15,13);goals(23,3,35,13);goals(122,14,135,23);goals(122,27,135,35);goals(142,13,155,21);goals(3,88,15,95);goals(112,5,116,15);goals(145,100,156,104);
 for(let i=0;i<6;i++)obj8('cone',(25+i*1.6)*T8,11*T8+8,{});for(let i=0;i<4;i++)obj8('dummy',(6+i*2)*T8,10*T8,{c:[-4,-2,4,2]});
 obj8('hurdles',13*T8,24*T8,{});
 // park furniture
 for(const [x,y] of [[10,47],[22,48],[6,62],[28,57],[12,70],[24,74],[20,43],[34,63]]){if(okT(x,y)){tk(x,y);obj8('bench',tc(x),y*T8+22,{c:[-12,-3,12,3],face:'d'})}}
 for(const [x,y] of [[13,45],[25,46],[33,60],[8,68],[18,72]]){if(okT(x,y)){tk(x,y);obj8('flowerbed',tc(x),y*T8+22,{c:[-12,-5,12,3]})}}
 obj8('gazebo',tc(15),58*T8+26,{c:[-20,-8,20,4]});tk(15,58);
 for(const [x,y,k] of [[29,70,'swing'],[33,70,'slide'],[29,74,'seesaw'],[33,73,'sandbox']])obj8('play',tc(x),y*T8+24,{kind:k,c:k=='sandbox'?null:[-14,-4,14,3]});
 for(let i=0;i<5;i++){const a=i*1.3;obj8('duck',(17+Math.cos(a)*5)*T8,(60+Math.sin(a)*3)*T8,{phase:a,dyn:1})}
 // community / commercial / luxury details
 for(const [x,y] of [[2,86],[16,86]])obj8('mural',tc(x),y*T8+30,{});
 for(let y=90;y<=95;y+=2)for(let x=22;x<=36;x+=4){if(okT(x,y)){tk(x,y);obj8('flowerbed',tc(x),y*T8+22,{c:[-12,-5,12,3],veg:1})}}
 obj8('hoop',tc(32),82*T8+28,{c:[-4,-3,4,2]});obj8('hoop',tc(32),89*T8+20,{c:[-4,-3,4,2],flip:1});
 for(let y=62;y<=70;y+=4)for(let x=83;x<=95;x+=4){tk(x,y);tk(x+1,y);obj8('mstall',(x+1)*T8,y*T8+24,{c:[-24,-8,24,4],v:H(x,y,3)})}
 for(const vx of [121,130,141,150]){obj8('lounger',(vx+1)*T8+8,66*T8+22,{});obj8('lounger',(vx+5)*T8,66*T8+22,{})}
 for(let x=121;x<=157;x+=2)if(M[76][x]===8||M[76][x]===34)if(M[76][x]===8)M[76][x]=38;
 // waterfront details
 for(let x=122;x<=156;x+=5){const y=101+H(x,3,3)%3;if(M[y][x]===35){obj8('umbrella',tc(x),y*T8+20,{col:['#e74c3c','#f5b700','#2e6fb8','#1f9d55'][H(x,y,2)%4],c:[-2,-2,2,1]})}}
 obj8('kiosk',tc(134),97*T8+28,{c:[-16,-8,16,4]});
 for(let i=0;i<5;i++)obj8('boat',(124+i*7)*T8,(112+(i%2)*3)*T8,{dyn:1,phase:i,col:['#f4f4f4','#e74c3c','#2e6fb8','#f5b700','#f4f4f4'][i]});
 // residential mailboxes + garden trees already; bus stops
 for(const [x,y] of [[60,41],[100,61],[44,77],[86,97],[120,96],[20,37],[124,77]]){if(inb(x,y)&&M[y][x]===34&&!isTk(x,y)){tk(x,y);obj8('busstop',tc(x),y*T8+26,{c:[-14,-4,14,2]})}}
 // terrace tables in front of cafes
 FAC.forEach(f=>{const b=f[5];if(!b||b.kind!=='cafe')return;for(const k of [-2,2]){const x=b.door.x+k,y=b.door.y+1;if(inb(x,y)&&(M[y][x]===30||M[y][x]===34||M[y][x]===8)&&!isTk(x,y)){tk(x,y);obj8('table',tc(x),y*T8+22,{c:[-7,-3,7,3]})}}});
 // training ball at each training pitch (kickable)
 BALLS8=[{x:tc(9),y:8*T8,vx:0,vy:0,home:[tc(9),8*T8],gx:[3,15],gy:[3,13],goals:0},{x:tc(29),y:8*T8,vx:0,vy:0,home:[tc(29),8*T8],gx:[23,35],gy:[3,13],goals:0},{x:tc(9),y:91*T8,vx:0,vy:0,home:[tc(9),91*T8],gx:[3,15],gy:[88,95],goals:0}]}
var BALLS8=[];
function buildObjGrid8(){OBJG=new Map();OBJ.forEach(o=>{const cx=Math.floor(o.x/(T8*4)),cy=Math.floor(o.y/(T8*4)),k=cx+','+cy;if(!OBJG.has(k))OBJG.set(k,[]);OBJG.get(k).push(o)})}
function objsNear(px,py,r){const out=[];const x0=Math.floor((px-r)/(T8*4)),x1=Math.floor((px+r)/(T8*4)),y0=Math.floor((py-r)/(T8*4)),y1=Math.floor((py+r)/(T8*4));for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const a=OBJG.get(cx+','+cy);if(a)for(const o of a)out.push(o)}return out}
// ---------- NPC placement (trainers, locals, coach) ----------
function placeNPCs8(){const P={coach:[56,13],t1:[60,15],t2:[20,12],t3:[91,25],t4:[54,46],fan:[47,15],loc1:[104,47],loc2:[22,26],loc3:[21,45],loc4:[89,85],loc5:[127,48],loc6:[12,85]};NPCS.forEach(n=>{const p=P[n.id];if(p){n.x=p[0];n.y=p[1]}})}
// ---------- collectibles: 24 "Legacy Cards" hidden around the city ----------
function placeCollect8(){const L8=[[5,4,'trn'],[34,12,'trn'],[4,34,'trn'],[44,4,'fb'],[76,31,'fb'],[86,4,'stad'],[116,30,'stad'],[157,10,'acad'],[136,35,'acad'],[15,58,'park'],[3,76,'park'],[36,44,'park'],[45,44,'down'],[76,76,'down'],[96,70,'com'],[117,48,'com'],[136,46,'prem'],[156,72,'prem'],[3,96,'comm'],[36,116,'comm'],[73,116,'res'],[116,96,'tr'],[141,113,'wf'],[157,100,'wf']];
 COLLECT=L8.map(([x,y,d],i)=>{let tx=x,ty=y;if(!isWalkT(M[ty][tx],tx,ty)){outer:for(let r=1;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const a=x+dx,b=y+dy;if(inb(a,b)&&isWalkT(M[b][a],a,b)&&M[b][a]!==0){tx=a;ty=b;break outer}}}return{id:'card'+i,x:tc(tx),y:ty*T8+22,d}})}

function placeFences8(){for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x];if(t!==37&&t!==38&&t!==46)continue;const f=v=>v===37||v===46,h=v=>v===38;const same=t===38?h:f;const m=(same(tAt(x+1,y))?1:0)|(same(tAt(x-1,y))?2:0)|(same(tAt(x,y-1))?4:0)|(same(tAt(x,y+1))?8:0);
 if(t===46){const gt=gateAt(x,y);obj8('gatep',tc(x),y*T8+30,{g:gt,m})}else obj8(t===38?'hedge':'fence',tc(x),y*T8+30,{m})}}
// district discovery: only meaningful once the v8 world (and its district rectangles) exists
function dcheck(){if(!W8B)return;const d=distOf(S.x,S.y);if(d&&!S.disc[d.k]){S.disc[d.k]=S.day;if(d.k=='fb')return;const r=40+Object.keys(S.disc).length*10;S.money+=r;S.fx.i+=r;addXP(15,[]);banner={t:150,s:L('DISCOVERED','התגלה'),s2:nm(d.n)};sfx('ach');news('Eli discovers '+d.n[0],'אלי מגלה את '+d.n[1]);S.hist.tl.push([S.day,'Discovered '+d.n[0],'גילוי: '+d.n[1]]);inc('explore')}}
