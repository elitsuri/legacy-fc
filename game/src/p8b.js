// ===================== v8 art kit: ground, roads, water, decals, static shadows (chunk-cached, 2x) =====================
var RS8=2,CHK=new Map(),PITCH8=[],GRASSP=[['#6fbf4a','#5ca93e'],['#74c050','#61ac43'],['#6cbb4b','#58a63e'],['#7ac556','#66b048'],['#6cc04c','#57a93c'],['#7cc25a','#68ad4a'],['#7abf58','#66aa48'],['#86cd5e','#71b84e'],['#88ba56','#74a548'],['#8bc35a','#76ad4a'],['#86b65a','#72a14b'],['#8fca60','#7ab450']];
function oc8(c){return shd(c,.42)}
function walkSet8(t){return t===30||t===31||t===34||t===36||t===35||t===43||t===44}
function tAt(x,y){return inb(x,y)?M[y][x]:45}
function grassCol(x,y){const z=ZN[y*MW+x]||0,p=GRASSP[z];return mixC(p[0],p[1],clamp(vn(x/5.3,y/5.3,11)*1.25-.12,0,1))}
// ----- base materials -----
function gGrass8(q,x,y,px,py,dark){const c=dark?shd(grassCol(x,y),.78):grassCol(x,y);q.fillStyle=c;q.fillRect(px,py,T8,T8);
 for(let i=0;i<3;i++){const h=H(x,y,i+40);q.fillStyle=h%2?'rgba(255,255,210,.07)':'rgba(20,60,20,.08)';q.beginPath();q.ellipse(px+h%30,py+H(x,y,i+50)%30,6+h%7,3+h%4,0,0,7);q.fill()}
 q.strokeStyle=shd(c,.78);q.lineWidth=.9;q.beginPath();for(let i=0;i<5;i++){const a=px+3+H(x,y,i+60)%26,b=py+5+H(x,y,i+70)%24;q.moveTo(a-1.6,b+1.5);q.lineTo(a,b-2);q.lineTo(a+1.6,b+1.5)}q.stroke();
 q.strokeStyle=shd(c,1.18);q.beginPath();for(let i=0;i<3;i++){const a=px+3+H(x,y,i+80)%26,b=py+5+H(x,y,i+90)%24;q.moveTo(a-1.2,b+1);q.lineTo(a,b-1.8)}q.stroke();
 if(!dark&&H(x,y,9)<9){const fx=px+6+H(x,y,1)%20,fy=py+6+H(x,y,2)%20,fc=['#ffffff','#ffe066','#ff8fb4','#c9a0ff'][H(x,y,3)%4];for(let i=0;i<4;i++){const ax=fx+(i%2)*4-(i>1?2:0),ay=fy+(i>1?3:0);q.fillStyle=fc;q.beginPath();q.arc(ax,ay,1.5,0,7);q.fill();q.fillStyle='#f5c400';q.fillRect(ax-.5,ay-.5,1,1)}}}
function gTall8(q,x,y,px,py){gGrass8(q,x,y,px,py,1);for(let i=0;i<14;i++){const a=px+1+H(x,y,i)%30,b=py+8+H(x,y,i+20)%24;q.strokeStyle=i%3?'#2f7a2a':'#4f9c3a';q.lineWidth=1.4;q.beginPath();q.moveTo(a,b);q.quadraticCurveTo(a+1,b-6,a+(i%2?3:-2),b-11);q.stroke()}}
function gSidewalk8(q,x,y,px,py){const base=ZN[y*MW+x]==7?'#e5e0d4':'#d9d3c6';q.fillStyle=base;q.fillRect(px,py,T8,T8);
 for(let j=0;j<4;j++)for(let i=0;i<4;i++){const h=H(x*4+i,y*4+j,3);if(h<22){q.fillStyle=h<11?'rgba(0,0,0,.05)':'rgba(255,255,255,.18)';q.fillRect(px+i*8,py+j*8,8,8)}}
 q.fillStyle='rgba(90,84,72,.22)';for(let i=0;i<=4;i++){q.fillRect(px+i*8-.25,py,.5,T8);q.fillRect(px,py+i*8-.25,T8,.5)}
 edgeBlend8(q,x,y,px,py,base)}
function gPlaza8(q,x,y,px,py){const z=ZN[y*MW+x],v=ZV[y*MW+x];if(v==4){q.fillStyle='#c0603c';q.fillRect(px,py,T8,T8);return}
 const st=z==5||z==6?'granite':z==7?'marble':z==2||z==10?'concrete':z==11?'deck':'slab';
 if(st==='slab'){const base=z==0?'#e3d7bf':z==1?'#e7d6b8':'#e6dcc6';for(let r=0;r<2;r++){const off=((y*2+r)%2)?16:0;for(let i=-1;i<2;i++){const sx=px+i*32+off,h=H(x*2+i,y*2+r,5);q.fillStyle=shd(base,.955+h%9*.01);q.fillRect(sx,py+r*16,32,16);q.fillStyle='rgba(120,98,66,.26)';q.fillRect(sx,py+r*16,.7,16)}q.fillStyle='rgba(120,98,66,.22)';q.fillRect(px,py+r*16,T8,.7)}
  if(H(x,y,6)<8){q.fillStyle='rgba(90,80,60,.10)';q.beginPath();q.ellipse(px+8+H(x,y,7)%16,py+8+H(x,y,8)%16,5,3,0,0,7);q.fill()}}
 else if(st==='granite'){for(let j=0;j<2;j++)for(let i=0;i<2;i++){const h=H(x*2+i,y*2+j,3);q.fillStyle=shd('#d6dce3',.96+h%8*.012);q.fillRect(px+i*16,py+j*16,16,16)}q.fillStyle='rgba(70,82,98,.2)';q.fillRect(px,py,T8,.6);q.fillRect(px,py+16,T8,.6);q.fillRect(px,py,.6,T8);q.fillRect(px+16,py,.6,T8);for(let i=0;i<5;i++){q.fillStyle='rgba(255,255,255,.35)';q.fillRect(px+H(x,y,i+20)%31,py+H(x,y,i+25)%31,.8,.8)}}
 else if(st==='marble'){q.fillStyle=shd('#f3efe6',.985+H(x,y,2)%4*.006);q.fillRect(px,py,T8,T8);q.strokeStyle='rgba(170,160,145,.22)';q.lineWidth=.7;q.beginPath();const a0=H(x,y,3)%30;q.moveTo(px,py+a0);q.bezierCurveTo(px+10,py+a0-8,px+20,py+a0+6,px+32,py+(a0+9)%32);q.stroke();q.fillStyle='rgba(201,162,39,.45)';if(x%2==0)q.fillRect(px,py,.8,T8);if(y%2==0)q.fillRect(px,py,T8,.8)}
 else if(st==='concrete'){q.fillStyle=shd('#d7d3cb',.97+H(x,y,2)%5*.01);q.fillRect(px,py,T8,T8);for(let i=0;i<10;i++){q.fillStyle=i%2?'rgba(0,0,0,.05)':'rgba(255,255,255,.2)';q.fillRect(px+H(x,y,i+30)%31,py+H(x,y,i+40)%31,1,1)}q.fillStyle='rgba(80,80,80,.22)';q.fillRect(px,py,T8,.7);q.fillRect(px,py,.7,T8)}
 else{q.fillStyle=shd('#efe5d0',.97+H(x,y,2)%5*.01);q.fillRect(px,py,T8,T8);q.fillStyle='rgba(160,130,90,.25)';for(let i=0;i<4;i++)q.fillRect(px,py+i*8,T8,.6)}
 edgeBlend8(q,x,y,px,py,'#e2d5bb')}
function gPath8(q,x,y,px,py){const c=mixC('#d8c495','#c9b182',vn(x/3,y/3,5));q.fillStyle=c;q.fillRect(px,py,T8,T8);for(let i=0;i<10;i++){const h=H(x,y,i+5);q.fillStyle=h%3?'rgba(110,90,60,.28)':'rgba(255,250,235,.45)';q.beginPath();q.arc(px+h%31,py+H(x,y,i+15)%31,.6+h%3*.4,0,7);q.fill()}roundCorners8(q,x,y,px,py,t=>t===31||t===36||t===30||t===34||t===4)}
function gSand8(q,x,y,px,py){q.fillStyle=mixC('#efd9a0','#e5cb8a',vn(x/4,y/4,7));q.fillRect(px,py,T8,T8);q.strokeStyle='rgba(190,150,90,.25)';q.lineWidth=.8;for(let i=0;i<2;i++){const yy=py+8+i*14+H(x,y,i)%5;q.beginPath();q.moveTo(px,yy);q.quadraticCurveTo(px+16,yy-3,px+32,yy);q.stroke()}if(H(x,y,4)<6){q.fillStyle='#fff3e6';q.beginPath();q.arc(px+H(x,y,5)%28+2,py+H(x,y,6)%28+2,1.5,0,7);q.fill()}}
function gBoard8(q,x,y,px,py){const vt=tAt(x,y-1)===36&&tAt(x,y+1)===36&&tAt(x-1,y)!==36&&tAt(x+1,y)!==36;q.fillStyle='#6b4a2a';q.fillRect(px,py,T8,T8);
 for(let i=0;i<5;i++){const c=['#c9a06a','#bf9560','#d2a873','#c49a64','#b98e59'][(i+H(x,y,1))%5];q.fillStyle=c;if(vt)q.fillRect(px+i*6.4+.4,py,5.6,T8);else q.fillRect(px,py+i*6.4+.4,T8,5.6)}
 q.fillStyle='rgba(255,255,255,.14)';for(let i=0;i<5;i++){if(vt)q.fillRect(px+i*6.4+.4,py,1,T8);else q.fillRect(px,py+i*6.4+.4,T8,1)}
 q.fillStyle='rgba(70,45,20,.55)';for(let i=0;i<5;i++){const o=(H(x,y,i)%3)*10+4;if(vt){q.fillRect(px+i*6.4+1.4,py+o,1,1);q.fillRect(px+i*6.4+4,py+o,1,1)}else{q.fillRect(px+o,py+i*6.4+1.4,1,1);q.fillRect(px+o,py+i*6.4+4,1,1)}}
 [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const t=tAt(x+dx,y+dy);if(t===36)return;q.fillStyle='#5a3c20';if(dy)q.fillRect(px,dy<0?py:py+T8-2,T8,2);else q.fillRect(dx<0?px:px+T8-2,py,2,T8);if(t===7){q.fillStyle='rgba(20,40,60,.35)';if(dy>0)q.fillRect(px,py+T8,T8,4);if(dx>0)q.fillRect(px+T8,py,4,T8)}})}
function gPitch8(q,x,y,px,py){const v=ZV[y*MW+x];if(v==2){q.fillStyle='#3d7fb3';q.fillRect(px,py,T8,T8);return}if(v==3){q.fillStyle=(x%2)?'#3e8e45':'#43974a';q.fillRect(px,py,T8,T8);return}
 const z=ZN[y*MW+x];q.fillStyle=(Math.floor(x/2)%2)?(z==3?'#56b04c':'#4fa84a'):(z==3?'#62bc57':'#5bb453');q.fillRect(px,py,T8,T8);q.fillStyle='rgba(255,255,255,.04)';q.fillRect(px,py,T8,16)}
function gTrack8(q,x,y,px,py){gPitch8(q,x,y,px,py);return;q.fillStyle='#c4583f';q.fillRect(px,py,T8,T8);for(let i=0;i<6;i++){q.fillStyle='rgba(255,255,255,.08)';q.fillRect(px+H(x,y,i)%30,py+H(x,y,i+9)%30,1,1)}}
function gTarmac8(q,x,y,px,py){q.fillStyle=mixC('#5a5f6a','#525763',vn(x/4,y/4,3));q.fillRect(px,py,T8,T8);q.fillStyle='rgba(255,255,255,.05)';q.fillRect(px,py,T8,.6)}
function gParking8(q,x,y,px,py){q.fillStyle=mixC('#5b6170','#555b69',vn(x/3,y/3,9));q.fillRect(px,py,T8,T8);for(let i=0;i<5;i++){q.fillStyle='rgba(255,255,255,.06)';q.fillRect(px+H(x,y,i)%30,py+H(x,y,i+4)%30,1.5,1.5)}
 q.fillStyle='rgba(245,245,240,.75)';if(x%3==0)q.fillRect(px,py+2,1.2,T8-4)}
function gForest8(q,x,y,px,py){q.fillStyle=mixC('#3f7f38','#356f30',vn(x/3,y/3,2));q.fillRect(px,py,T8,T8);for(let i=0;i<4;i++){q.fillStyle='rgba(20,40,15,.25)';q.beginPath();q.arc(px+H(x,y,i)%30,py+H(x,y,i+8)%30,4,0,7);q.fill()}}
function gRail8(q,x,y,px,py){q.fillStyle='#8f8578';q.fillRect(px,py,T8,T8);for(let i=0;i<12;i++){q.fillStyle=i%2?'#7d7468':'#a39a8c';q.fillRect(px+H(x,y,i)%30,py+H(x,y,i+3)%30,2,2)}
 const top=tAt(x,y-1)!==42;for(let i=0;i<4;i++){q.fillStyle='#5c4630';q.fillRect(px+i*8+1,py+(top?6:0),5,top?26:22)}q.fillStyle='#9aa1ad';if(top)q.fillRect(px,py+12,T8,2.2);else q.fillRect(px,py+8,T8,2.2);q.fillStyle='#d9dde3';if(top)q.fillRect(px,py+12,T8,.8);else q.fillRect(px,py+8,T8,.8)}
// ----- roads: asphalt, lane lines, curbs, crosswalks -----
function inInt8(x,y){for(const q of INTS)if(x>=q.x&&x<=q.x+1&&y>=q.y&&y<=q.y+1)return q;return null}
function gRoad8(q,x,y,px,py){q.fillStyle=mixC('#4d5462','#454b58',vn(x/2.5,y/2.5,4));q.fillRect(px,py,T8,T8);
 for(let i=0;i<9;i++){const h=H(x,y,i+30);q.fillStyle=h%2?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)';q.fillRect(px+h%31,py+H(x,y,i+40)%31,1,1)}
 if(H(x,y,7)<5){q.fillStyle='rgba(0,0,0,.12)';q.beginPath();q.ellipse(px+H(x,y,8)%20+6,py+H(x,y,9)%20+6,5,3,0,0,7);q.fill()}
 const it=inInt8(x,y);if(it)return;
 const R=(a,b)=>isRoadXY(a,b),ax=roadAxis(x,y);
 if(ax==='x'||(R(x-1,y)&&R(x+1,y))){ // horizontal lanes
  if(R(x,y+1)&&!R(x,y-1)){q.fillStyle='rgba(245,240,220,.85)';for(let i=0;i<2;i++)q.fillRect(px+2+i*16,py+T8-1,9,2)}
  if(H(x,y,3)<4&&R(x,y-1)){q.fillStyle='#3b404b';q.beginPath();q.arc(px+16,py+16,5.5,0,7);q.fill();q.strokeStyle='#626976';q.lineWidth=1;q.stroke()}}
 else if(ax==='y'||(R(x,y-1)&&R(x,y+1))){if(R(x+1,y)&&!R(x-1,y)){q.fillStyle='rgba(245,240,220,.85)';for(let i=0;i<2;i++)q.fillRect(px+T8-1,py+2+i*16,2,9)}}
 // crosswalk on the two road tiles right next to an intersection
 for(const s of INTS){const hz=(y===s.y||y===s.y+1),vt=(x===s.x||x===s.x+1);if(hz&&(x===s.x-1||x===s.x+2)){q.fillStyle='rgba(250,250,245,.9)';for(let i=0;i<4;i++)q.fillRect(px+5,py+2+i*8,22,4.5);q.fillStyle='rgba(250,250,245,.8)';q.fillRect(x===s.x-1?px+1:px+T8-2.5,py,1.5,T8)}
  if(vt&&(y===s.y-1||y===s.y+2)){q.fillStyle='rgba(250,250,245,.9)';for(let i=0;i<4;i++)q.fillRect(px+2+i*8,py+5,4.5,22);q.fillStyle='rgba(250,250,245,.8)';q.fillRect(px,y===s.y-1?py+1:py+T8-2.5,T8,1.5)}}}
function curbs8(q,x,y,px,py){const t=M[y][x];if(t===0||t===42)return;[[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{if(!isRoadXY(x+dx,y+dy))return;q.fillStyle='#b9b4a8';if(dy)q.fillRect(px,dy<0?py:py+T8-3.5,T8,3.5);else q.fillRect(dx<0?px:px+T8-3.5,py,3.5,T8);q.fillStyle='#f1ede4';if(dy)q.fillRect(px,dy<0?py:py+T8-3.5,T8,1);else q.fillRect(dx<0?px:px+T8-3.5,py,1,T8);q.fillStyle='rgba(0,0,0,.25)';if(dy)q.fillRect(px,dy<0?py-1.2:py+T8,T8,1.2);else q.fillRect(dx<0?px-1.2:px+T8,py,1.2,T8)});
 if(t===34&&H(x,y,12)<6&&(isRoadXY(x,y+1)||isRoadXY(x,y-1))){const yy=isRoadXY(x,y+1)?py+T8-9:py+5;q.fillStyle='#4a4f59';q.fillRect(px+10,yy,12,4);q.fillStyle='#2a2e35';for(let i=0;i<5;i++)q.fillRect(px+11+i*2.2,yy+.6,1,2.8)}}
// ----- water with shore + foam -----
function gWater8(q,x,y,px,py){const sea=x>=118,n=[tAt(x,y-1),tAt(x,y+1),tAt(x-1,y),tAt(x+1,y)],land=n.map(t=>t!==7);let deep=0;for(let r=1;r<4;r++)if([tAt(x,y-r),tAt(x,y+r),tAt(x-r,y),tAt(x+r,y)].every(t=>t===7))deep++;
 q.fillStyle=sea?['#3aa6d4','#2f95c8','#2785bc','#2177ad'][deep]:['#4cb1d8','#3e9fcc','#3592c2','#2f86b6'][deep];q.fillRect(px,py,T8,T8);
 for(let i=0;i<2;i++){const h=H(x,y,i+3);q.fillStyle='rgba(255,255,255,.08)';q.beginPath();q.ellipse(px+h%28+2,py+H(x,y,i+7)%28+2,6,1.6,0,0,7);q.fill()}
 const shoreC=sea?'#e8d29a':'#9a8a5c',foam='rgba(255,255,255,.75)';
 n.forEach((t,i)=>{if(t===7||t===36)return;const s=t===35?'#e8d29a':shoreC;q.fillStyle=s;const W=t===35?7:5;if(i==0)q.fillRect(px,py,T8,W);if(i==1)q.fillRect(px,py+T8-W,T8,W);if(i==2)q.fillRect(px,py,W,T8);if(i==3)q.fillRect(px+T8-W,py,W,T8);q.fillStyle=foam;if(i==0)q.fillRect(px,py+W,T8,1.4);if(i==1)q.fillRect(px,py+T8-W-1.4,T8,1.4);if(i==2)q.fillRect(px+W,py,1.4,T8);if(i==3)q.fillRect(px+T8-W-1.4,py,1.4,T8)});
 cornerFill8(q,x,y,px,py,t=>t===7||t===36,t=>t===35?'#efd9a0':t===8||t===2?null:t===34?'#d9d3c6':t===30?'#e2d5bb':shoreC)}
function cornerFill8(q,x,y,px,py,same,colOf){const C=[[0,0,-1,-1],[T8,0,1,-1],[0,T8,-1,1],[T8,T8,1,1]];for(const [ox,oy,ax,ay] of C){const a=tAt(x+ax,y),b=tAt(x,y+ay);if(same(a)||same(b))continue;let c=colOf(a);if(c==null)c=grassCol(x+ax,y);const cx=px+ox,cy=py+oy,r=12;q.fillStyle=c;q.beginPath();q.moveTo(cx,cy);q.lineTo(cx-ax*r,cy);q.quadraticCurveTo(cx,cy,cx,cy-ay*r);q.closePath();q.fill()}}
function roundCorners8(q,x,y,px,py,same){cornerFill8(q,x,y,px,py,same,t=>t===8||t===2||t===45?null:t===35?'#efd9a0':'#cfc9bb')}
function edgeBlend8(q,x,y,px,py,base){[[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const t=tAt(x+dx,y+dy);if(t!==8&&t!==2)return;q.fillStyle='rgba(60,90,40,.22)';if(dy)q.fillRect(px,dy<0?py:py+T8-1.5,T8,1.5);else q.fillRect(dx<0?px:px+T8-1.5,py,1.5,T8)})}
// ----- per-tile dispatcher -----
function gTile8(q,x,y){const t=M[y][x],px=x*T8,py=y*T8;
 switch(t){case 0:gRoad8(q,x,y,px,py);break;case 34:gSidewalk8(q,x,y,px,py);break;case 30:gPlaza8(q,x,y,px,py);break;case 31:gGrass8(q,x,y,px,py,0);break;case 32:gPitch8(q,x,y,px,py);break;case 33:gTrack8(q,x,y,px,py);break;
  case 35:gGrass8(q,x,y,px,py,0);break;case 36:break;case 7:if(x>=118){q.fillStyle='#e8d29a';q.fillRect(px,py,T8,T8)}else gGrass8(q,x,y,px,py,0);break;case 2:gTall8(q,x,y,px,py);break;case 43:gTarmac8(q,x,y,px,py);break;case 44:gParking8(q,x,y,px,py);break;case 45:gForest8(q,x,y,px,py);break;case 42:gRail8(q,x,y,px,py);break;
  case 37:case 46:{const u=[tAt(x,y-1),tAt(x,y+1),tAt(x-1,y),tAt(x+1,y)];const inner=u.find(v=>v===32||v===35);if(inner===32)gPitch8(q,x,y,px,py);else if(u.includes(30))gPlaza8(q,x,y,px,py);else gGrass8(q,x,y,px,py);break}
  case 3:case 4:case 40:{const b=BLD[BI[y][x]];if(t===40||(b&&b.type==='stadium')){gPlaza8(q,x,y,px,py)}else{q.fillStyle='#8f8a80';q.fillRect(px,py,T8,T8)}break}
  default:gGrass8(q,x,y,px,py)}
 if(t!==0)curbs8(q,x,y,px,py)}
// ----- decals painted on top of the ground (world coordinates) -----
function decals8(q,X0,Y0,X1,Y1){
 const hit=(a,b,c,d)=>a<X1&&c>X0&&b<Y1&&d>Y0;
 // football pitches: lines, boxes, centre circle, penalty spots
 for(const p of PITCH8){const [x0,y0,x1,y1,kind]=p,A=x0*T8+4,B=y0*T8+4,W=(x1-x0+1)*T8-8,Hh=(y1-y0+1)*T8-8;if(!hit(A-10,B-10,A+W+10,B+Hh+10))continue;
  q.strokeStyle=kind==2?'rgba(255,255,255,.85)':'rgba(255,255,255,.88)';q.lineWidth=1.6;q.strokeRect(A,B,W,Hh);
  if(kind==2){q.beginPath();q.moveTo(A+W/2,B);q.lineTo(A+W/2,B+Hh);q.stroke();q.strokeRect(A+W*.15,B+Hh*.3,W*.7,Hh*.4);continue}
  q.beginPath();q.moveTo(A+W/2,B);q.lineTo(A+W/2,B+Hh);q.stroke();const r=Math.min(W,Hh)*.16;q.beginPath();q.arc(A+W/2,B+Hh/2,r,0,7);q.stroke();q.fillStyle='#fff';q.beginPath();q.arc(A+W/2,B+Hh/2,1.6,0,7);q.fill();
  const bw=Math.min(W*.16,70),bh=Hh*.56,sw=bw*.42,sh=Hh*.3;q.strokeRect(A,B+(Hh-bh)/2,bw,bh);q.strokeRect(A+W-bw,B+(Hh-bh)/2,bw,bh);q.strokeRect(A,B+(Hh-sh)/2,sw,sh);q.strokeRect(A+W-sw,B+(Hh-sh)/2,sw,sh);
  q.beginPath();q.arc(A+bw,B+Hh/2,r*.62,-1.1,1.1);q.stroke();q.beginPath();q.arc(A+W-bw,B+Hh/2,r*.62,Math.PI-1.1,Math.PI+1.1);q.stroke();
  q.beginPath();q.arc(A+bw*.7,B+Hh/2,1.4,0,7);q.arc(A+W-bw*.7,B+Hh/2,1.4,0,7);q.fill();
  for(const [cx,cy,a0] of [[A,B,0],[A+W,B,Math.PI/2],[A+W,B+Hh,Math.PI],[A,B+Hh,-Math.PI/2]]){q.beginPath();q.arc(cx,cy,4,a0,a0+Math.PI/2);q.stroke()}}
 // running track oval: lanes + start line
 if(hit(2*T8,20*T8,22*T8,37*T8)){const cx=12*T8,cy=28.5*T8,RX=8.6*T8,RY=7.4*T8,k=.79;q.fillStyle='rgba(60,25,15,.35)';q.beginPath();q.ellipse(cx,cy,RX+2,RY+2,0,0,7);q.fill();q.fillStyle='#c4583f';q.beginPath();q.ellipse(cx,cy,RX,RY,0,0,7);q.fill();q.fillStyle='#f4f1ea';q.beginPath();q.ellipse(cx,cy,RX*k,RY*k,0,0,7);q.fill();q.save();q.beginPath();q.ellipse(cx,cy,RX*k-2,RY*k-2,0,0,7);q.clip();for(let x=2;x<22;x++){q.fillStyle=(Math.floor(x/2)%2)?'#4fa84a':'#5bb453';q.fillRect(x*T8,20*T8,T8,17*T8)}q.restore();q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=1;for(let i=1;i<5;i++){const f=k+(1-k)*i/5;q.beginPath();q.ellipse(cx,cy,RX*f,RY*f,0,0,7);q.stroke()}q.fillStyle='#fff';q.fillRect(cx-1,cy+RY*k,2,RY*(1-k));for(let i=0;i<5;i++)txtQ8(q,String(i+1),cx+8,cy+RY*k+5+i*(RY*(1-k)/5),5)}
 // club crests on plazas
 OBJ.forEach(o=>{if(o.k!=='crest'||!hit(o.x-60,o.y-60,o.x+60,o.y+60))return;const r=o.big?44:30,cc=clubCols();q.save();q.translate(o.x,o.y);q.fillStyle='rgba(0,0,0,.08)';q.beginPath();q.arc(0,2,r+3,0,7);q.fill();q.fillStyle=shd(cc[0],1.05);q.beginPath();q.arc(0,0,r,0,7);q.fill();q.fillStyle='#f3efe6';q.beginPath();q.arc(0,0,r*.82,0,7);q.fill();q.fillStyle=cc[0];q.beginPath();q.moveTo(0,-r*.62);q.lineTo(r*.5,-r*.36);q.lineTo(r*.42,r*.22);q.quadraticCurveTo(0,r*.72,-r*.42,r*.22);q.lineTo(-r*.5,-r*.36);q.closePath();q.fill();q.fillStyle=cc[1];q.fillRect(-r*.1,-r*.55,r*.2,r*.95);q.strokeStyle='rgba(212,167,44,.9)';q.lineWidth=2;q.beginPath();q.arc(0,0,r*.91,0,7);q.stroke();q.restore()});
 // fountain plaza rings (City Center)
 if(hit(41*T8,41*T8,57*T8,57*T8)){q.strokeStyle='rgba(120,130,150,.35)';q.lineWidth=3;for(const r of [70,96,122]){q.beginPath();q.arc(48.5*T8+16,48.5*T8+8,r,0,7);q.stroke()}q.strokeStyle='rgba(255,255,255,.35)';q.lineWidth=1;for(const r of [70,96,122]){q.beginPath();q.arc(48.5*T8+16,48.5*T8+7,r,0,7);q.stroke()}}
 // runway / taxiway markings
 if(hit(100*T8,108*T8,118*T8,118*T8)){q.fillStyle='rgba(245,200,40,.9)';q.fillRect(100*T8,112.5*T8,18*T8,2);for(let x=100;x<118;x+=2)q.fillRect(x*T8,116*T8,T8,3);q.fillStyle='rgba(255,255,255,.85)';for(let x=100;x<118;x+=1.5)q.fillRect(x*T8,117.3*T8,T8*.7,2.5)}
 // level crossings: rails across the road
 for(const x of RAILX){const px=x*T8;if(!hit(px,87*T8,px+T8,89*T8))continue;q.fillStyle='#3d424c';q.fillRect(px,87*T8+10,T8,2.4);q.fillRect(px,88*T8+8,T8,2.4);q.fillStyle='#b9bec6';q.fillRect(px,87*T8+10,T8,.8);q.fillRect(px,88*T8+8,T8,.8);q.fillStyle='rgba(255,255,255,.75)';q.fillRect(px,86*T8+24,T8,2);q.fillRect(px,89*T8+6,T8,2)}
 // beach pitch lines + helipad-ish markers + basketball court
 if(hit(145*T8,100*T8,157*T8,105*T8)){q.strokeStyle='rgba(255,255,255,.8)';q.lineWidth=1.4;q.strokeRect(145*T8+6,100*T8+6,12*T8-12,5*T8-12);q.beginPath();q.moveTo(151*T8,100*T8+6);q.lineTo(151*T8,105*T8-6);q.stroke()}
 if(hit(28*T8,82*T8,37*T8,90*T8)){q.strokeStyle='rgba(255,255,255,.8)';q.lineWidth=1.4;q.strokeRect(29*T8,83*T8,7*T8,6*T8);q.beginPath();q.moveTo(29*T8,86*T8);q.lineTo(36*T8,86*T8);q.stroke();q.beginPath();q.arc(32.5*T8,86*T8,26,0,7);q.stroke();q.beginPath();q.arc(32.5*T8,83*T8,40,0,Math.PI);q.stroke();q.beginPath();q.arc(32.5*T8,89*T8,40,Math.PI,0);q.stroke()}
 // villa pools tiling edges
 BLD.forEach(b=>{if(b.type!=='villa'||b.y<60)return;const A=(b.x+1)*T8,B=67*T8;if(!hit(A-4,B-4,A+5*T8+4,B+2*T8+4))return;q.strokeStyle='#f4f1ea';q.lineWidth=4;q.strokeRect(A-2,B-2,5*T8+4,2*T8+4);q.strokeStyle='rgba(255,255,255,.45)';q.lineWidth=1;for(let i=0;i<3;i++){q.beginPath();q.moveTo(A+10+i*40,B+18);q.quadraticCurveTo(A+25+i*40,B+12,A+40+i*40,B+18);q.stroke()}})}
// ----- static contact shadows (light from the top-left) -----
function shadows8(q,X0,Y0,X1,Y1){q.fillStyle='rgba(20,32,44,.24)';
 for(const b of BLD){if(b.type==='stadium')continue;const G=bGeo8(b),A=G.A,Bb=G.yb,W=G.W,hp=b.hp,top=G.rt,sx=Math.min(30,hp*.24);if(A>X1+40||A+W+sx<X0||top>Y1||Bb+8<Y0)continue;
  q.beginPath();q.moveTo(A+W,top+8);q.lineTo(A+W+sx,top+8+sx*.7);q.lineTo(A+W+sx,Bb+sx*.35);q.lineTo(A+W,Bb);q.closePath();q.fill();q.fillRect(A+3,Bb,W,4);
  q.fillStyle='rgba(20,32,44,.12)';q.fillRect(A-2,Bb,W+4,7);q.fillStyle='rgba(20,32,44,.24)'}
 const st=BLD.find(b=>b.type==='stadium');if(st&&X1>80*T8&&X0<118*T8&&Y0<24*T8){const e=st.el;q.beginPath();q.ellipse(e.cx*T8+14,e.cy*T8+20,e.rx*T8+6,e.ry*T8+10,0,0,7);q.fill()}
 for(const o of objsNear((X0+X1)/2,(Y0+Y1)/2,260)){if(o.x<X0-60||o.x>X1+60||o.y<Y0-40||o.y>Y1+40)continue;const k=o.k;
  if(k==='tree'){const r=o.kind==='pine'||o.kind==='cypress'?9:o.kind==='palm'?10:14;q.beginPath();q.ellipse(o.x+7,o.y-1,r,r*.42,0,0,7);q.fill()}
  else if(k==='lamp'||k==='tlight'||k==='flag'){q.save();q.translate(o.x,o.y);q.transform(1,0,.9,.35,0,0);q.fillRect(0,-38,2.5,38);q.restore()}
  else if(k==='pcar'){q.fillRect(o.x+(o.dir=='h'?-24:-9)+4,o.y+(o.dir=='h'?-8:-22)+4,o.dir=='h'?52:22,o.dir=='h'?16:42)}
  else if(k==='bench'||k==='planter'||k==='stall'||k==='booth'||k==='busstop'||k==='kiosk'||k==='mstall'){const w=k==='stall'||k==='mstall'?44:k==='busstop'?30:24;q.fillRect(o.x-w/2+4,o.y-2,w,5)}
  else if(k==='fountain'){q.beginPath();q.ellipse(o.x+6,o.y-6,46,24,0,0,7);q.fill()}
  else if(k==='statue'){q.beginPath();q.ellipse(o.x+10,o.y-2,20,8,0,0,7);q.fill()}}}
// ----- chunk cache -----
function buildPitchList8(){PITCH8=[];const seen=new Uint8Array(MW*MH);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]!==32||seen[y*MW+x])continue;let x1=x,y1=y;while(x1+1<MW&&M[y][x1+1]===32)x1++;while(y1+1<MH&&M[y1+1][x]===32)y1++;for(let yy=y;yy<=y1;yy++)for(let xx=x;xx<=x1;xx++)seen[yy*MW+xx]=1;if(x1-x<4||y1-y<4)continue;const inTrack=x<22&&y>20&&y<37;if(inTrack)continue;PITCH8.push([x,y,x1,y1,ZV[y*MW+x]==2?2:ZV[y*MW+x]==4?4:0])}}
function tblob8(q,x0,y0,x1,y1,test,R,col){q.fillStyle=col;q.beginPath();for(let y=y0-1;y<=y1+1;y++)for(let x=x0-1;x<=x1+1;x++){if(!test(x,y))continue;const cx=x*T8+16,cy=y*T8+16;q.moveTo(cx+R,cy);q.arc(cx,cy,R,0,Math.PI*2);if(test(x+1,y))q.rect(cx,cy-R,T8,R*2);if(test(x,y+1))q.rect(cx-R,cy,R*2,T8);if(test(x+1,y)&&test(x,y+1)&&test(x+1,y+1))q.rect(cx,cy,T8,T8)}q.fill('nonzero')}
function terrain8(q,tx0,ty0,tx1,ty1){const W8=(x,y)=>{const t=tAt(x,y);return t===7||(t===36&&(tAt(x-1,y)===7||tAt(x+1,y)===7||tAt(x,y-1)===7||tAt(x,y+1)===7||tAt(x,y-1)===36&&tAt(x,y+1)===36&&(tAt(x-1,y)===7||tAt(x+1,y)===7)))},sand=(x,y)=>tAt(x,y)===35||(tAt(x,y)===7&&x>=118)||(tAt(x,y)===36&&x>=118&&y>=97),path=(x,y)=>tAt(x,y)===31;
 const deep=(x,y,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(!W8(x+dx,y+dy))return false;return true};
 tblob8(q,tx0,ty0,tx1,ty1,sand,18.5,'#d8bf80');tblob8(q,tx0,ty0,tx1,ty1,sand,16.5,'#efd9a0');
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++)if(tAt(x,y)===35){q.strokeStyle='rgba(190,150,90,.22)';q.lineWidth=.8;for(let i=0;i<2;i++){const yy=y*T8+8+i*14+H(x,y,i)%5;q.beginPath();q.moveTo(x*T8,yy);q.quadraticCurveTo(x*T8+16,yy-3,x*T8+32,yy);q.stroke()}if(H(x,y,4)<6){q.fillStyle='#fff3e6';q.beginPath();q.arc(x*T8+H(x,y,5)%28+2,y*T8+H(x,y,6)%28+2,1.5,0,7);q.fill()}}
 tblob8(q,tx0,ty0,tx1,ty1,path,19,'#b39c6d');tblob8(q,tx0,ty0,tx1,ty1,path,17,'#d6c193');
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++)if(path(x,y))for(let i=0;i<8;i++){const h=H(x,y,i+5);q.fillStyle=h%3?'rgba(110,90,60,.26)':'rgba(255,250,235,.45)';q.beginPath();q.arc(x*T8+4+h%24,y*T8+4+H(x,y,i+15)%24,.6+h%3*.35,0,7);q.fill()}
 const lake=(x,y)=>W8(x,y)&&x<118,sea=(x,y)=>W8(x,y)&&x>=118;
 tblob8(q,tx0,ty0,tx1,ty1,lake,21,'#8f7d52');tblob8(q,tx0,ty0,tx1,ty1,lake,18.6,'rgba(255,255,255,.85)');tblob8(q,tx0,ty0,tx1,ty1,lake,17.4,'#55b6dc');tblob8(q,tx0,ty0,tx1,ty1,(x,y)=>lake(x,y)&&deep(x,y,1),15,'#3f9fcf');tblob8(q,tx0,ty0,tx1,ty1,(x,y)=>lake(x,y)&&deep(x,y,2),13,'#3590c3');
 tblob8(q,tx0,ty0,tx1,ty1,sea,19.6,'rgba(255,255,255,.9)');tblob8(q,tx0,ty0,tx1,ty1,sea,17,'#4bb4d8');tblob8(q,tx0,ty0,tx1,ty1,(x,y)=>sea(x,y)&&deep(x,y,1),15.5,'#3a9fcf');tblob8(q,tx0,ty0,tx1,ty1,(x,y)=>sea(x,y)&&deep(x,y,2),14,'#2f8cc2');tblob8(q,tx0,ty0,tx1,ty1,(x,y)=>sea(x,y)&&deep(x,y,3),12,'#2679b2');
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++)if(W8(x,y)&&tAt(x,y)===7)for(let i=0;i<2;i++){const h=H(x,y,i+3);q.fillStyle='rgba(255,255,255,.10)';q.beginPath();q.ellipse(x*T8+h%26+3,y*T8+H(x,y,i+7)%26+3,6,1.4,0,0,7);q.fill()}
 for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++)if(tAt(x,y)===36)gBoard8(q,x,y,x*T8,y*T8)}
function paintChunk8(cx,cy){const S0=CH8*T8,cv=document.createElement('canvas');cv.width=cv.height=S0*RS8;const q=cv.getContext('2d'),X0=cx*S0,Y0=cy*S0;
 q.setTransform(RS8,0,0,RS8,-X0*RS8,-Y0*RS8);q.save();q.beginPath();q.rect(X0,Y0,S0,S0);q.clip();
 const tx0=cx*CH8,ty0=cy*CH8;for(let y=ty0;y<ty0+CH8;y++)for(let x=tx0;x<tx0+CH8;x++)if(inb(x,y))gTile8(q,x,y);
 terrain8(q,tx0,ty0,tx0+CH8-1,ty0+CH8-1);decals8(q,X0,Y0,X0+S0,Y0+S0);shadows8(q,X0,Y0,X0+S0,Y0+S0);q.restore();return cv}
function chunk8(cx,cy){const k=cx+','+cy;let e=CHK.get(k);if(e){e.u=tick;return e.cv}e={cv:paintChunk8(cx,cy),u:tick};CHK.set(k,e);if(CHK.size>54){let ok=null,ou=1e12;for(const [kk,v] of CHK)if(v.u<ou){ou=v.u;ok=kk}CHK.delete(ok)}return e.cv}

function txtQ8(q,s,x,y,sz){q.fillStyle='rgba(255,255,255,.85)';q.font=`700 ${sz}px Rubik,Arial`;q.textAlign='center';q.fillText(s,x,y+sz*.4)}
