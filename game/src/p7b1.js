// ===================== VISUAL REBIRTH: world painter (ground, objects, trees) =====================
var FGc=null,fg=null,NLc=null,nl=null,MAPC=null,SIGNS=[],DUCKS=[],FLAGPOLES=[],FOUNT=[],PEDS=[],CARS2=[],BIRDS=[],LEAVES=[],SPLASH=[],SCREENPOS=null,STADPOS=null,PITCHES=[],TALLV=[],WATERV=[];
function Q(q,x,y,w,h,c){q.fillStyle=c;q.fillRect(x,y,w,h)}
function vn(x,y,s){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sm=t=>t*t*(3-2*t),a=H(ix,iy,s)/99,b=H(ix+1,iy,s)/99,c=H(ix,iy+1,s)/99,d=H(ix+1,iy+1,s)/99,u=sm(fx),v=sm(fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const isRd=(x,y)=>!!(M[y]&&M[y][x]===0),isW=(x,y)=>!!(M[y]&&M[y][x]===7);
function gGrass(q,x,y,px,py,dark){const A=dark?'#3e9644':'#4aa84e',B2=dark?'#4caa50':'#5fbf5e';
 for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const n=vn((x*4+bx)/9,(y*4+by)/9,3)*.65+vn((x*4+bx)/2.5,(y*4+by)/2.5,5)*.35;Q(q,px+bx*8,py+by*8,8,8,mixC(A,B2,n))}
 for(let i=0;i<10;i++){const a=H(x,y,i+40)%31,b=H(x,y,i+60)%29;Q(q,px+a,py+b,1,2,shd(A,.8))}
 for(let i=0;i<6;i++){const a=H(x,y,i+80)%31,b=H(x,y,i+90)%31;Q(q,px+a,py+b,1,1,'#93de8a')}
 if(!dark&&H(x,y,9)<8){for(let i=0;i<3;i++){const a=px+4+H(x,y,i+11)%22,b=py+4+H(x,y,i+21)%22,fc=['#ff8fb4','#ffe066','#ffffff','#c9a0ff','#ff9a5c'][H(x,y,i+31)%5];Q(q,a,b-1,1,1,fc);Q(q,a-1,b,3,1,fc);Q(q,a,b+1,1,1,fc);Q(q,a,b,1,1,'#f5c400')}}
 if(!dark&&H(x,y,13)<4){Q(q,px+H(x,y,14)%24+3,py+H(x,y,15)%24+3,3,2,'#9aa0a8');Q(q,px+H(x,y,14)%24+3,py+H(x,y,15)%24+3,2,1,'#c3c8cf')}}
function gTall(q,x,y,px,py){gGrass(q,x,y,px,py,1);Q(q,px,py+26,32,6,'rgba(20,60,25,.25)');
 for(let i=0;i<18;i++){const bx=px+1+(i%9)*3.4+(H(x,y,i)%2)|0,bh=7+H(x,y,i+20)%6,byy=py+3+Math.floor(i/9)*14+H(x,y,i+40)%3;Q(q,bx,byy+bh-3,2,3,'#2a7531');Q(q,bx,byy+2,1,bh-4,'#3c9443');Q(q,bx+1,byy+1,1,bh-3,'#55b65a');Q(q,bx+1,byy,1,2,'#a3eb98')}}
function sideW(q,sx,sy,w,h,hor){Q(q,sx,sy,w,h,'#c9c3b5');for(let i=0;i<(hor?w:h);i+=8){if(hor)Q(q,sx+i,sy,1,h,'#aea798');else Q(q,sx,sy+i,w,1,'#aea798')}Q(q,sx,sy,hor?w:1,hor?1:h,'#d9d4c8')}
function gRoad(q,x,y,px,py){
 for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const n=vn((x*4+bx)/5,(y*4+by)/5,7);Q(q,px+bx*8,py+by*8,8,8,mixC('#444954','#535966',n))}
 for(let i=0;i<24;i++){const a=H(x,y,i+100)%32,b=H(x,y,i+130)%32;Q(q,px+a,py+b,1,1,i%2?'#626876':'#393d46')}
 const U=isRd(x,y-1),D=isRd(x,y+1),Lf=isRd(x-1,y),Rt=isRd(x+1,y),hz=Lf&&Rt&&!U&&!D,vt=U&&D&&!Lf&&!Rt;
 if(hz){Q(q,px,py+10,32,3,'rgba(0,0,0,.09)');Q(q,px,py+20,32,3,'rgba(0,0,0,.09)')}if(vt){Q(q,px+10,py,3,32,'rgba(0,0,0,.09)');Q(q,px+20,py,3,32,'rgba(0,0,0,.09)')}
 if(H(x,y,57)<5){Q(q,px+H(x,y,58)%18+4,py+H(x,y,59)%14+8,10,6,'rgba(30,32,38,.45)')}
 if(H(x,y,61)<4){q.strokeStyle='rgba(25,27,32,.7)';q.lineWidth=1;q.beginPath();let cx0=px+6+H(x,y,62)%20,cy0=py+8+H(x,y,63)%14;q.moveTo(cx0,cy0);for(let k=0;k<4;k++){cx0+=3-H(x,y,64+k)%6;cy0+=2+H(x,y,70+k)%3;q.lineTo(cx0,cy0)}q.stroke()}
 if(!U){sideW(q,px,py,32,6,1);Q(q,px,py+6,32,1,'#e8e3d6');Q(q,px,py+7,32,1,'#2c2f36')}
 if(!D){sideW(q,px,py+26,32,6,1);Q(q,px,py+25,32,1,'#8e8a80');Q(q,px,py+24,32,1,'#2c2f36')}
 if(!Lf){sideW(q,px,py,6,32,0);Q(q,px+6,py,1,32,'#e8e3d6');Q(q,px+7,py,1,32,'#2c2f36')}
 if(!Rt){sideW(q,px+26,py,6,32,0);Q(q,px+25,py,1,32,'#8e8a80');Q(q,px+24,py,1,32,'#2c2f36')}
 if(U&&Lf&&!isRd(x-1,y-1))sideW(q,px,py,6,6,1);if(U&&Rt&&!isRd(x+1,y-1))sideW(q,px+26,py,6,6,1);if(D&&Lf&&!isRd(x-1,y+1))sideW(q,px,py+26,6,6,1);if(D&&Rt&&!isRd(x+1,y+1))sideW(q,px+26,py+26,6,6,1);
 if(hz)for(let i=3;i<32;i+=16)Q(q,px+i,py+15,9,2,'#e8dda4');if(vt)for(let i=3;i<32;i+=16)Q(q,px+15,py+i,2,9,'#e8dda4');
 if((hz||vt)&&H(x,y,55)<5){q.fillStyle='#2c3038';q.beginPath();q.arc(px+(hz?24:9),py+(hz?9:24),4,0,7);q.fill();q.fillStyle='#5a606c';q.fillRect(px+(hz?21:6),py+(hz?8:23),7,1);q.fillRect(px+(hz?21:6),py+(hz?10:25),7,1)}
 if(hz&&!U&&H(x,y,66)<9){Q(q,px+12,py+8,7,3,'#22252c');for(let i=0;i<3;i++)Q(q,px+13+i*2,py+8,1,3,'#5d636e')}
 if(hz&&!U&&H(x,y,67)<4&&H(x,y,66)>=9){Q(q,px+20,py+1,4,5,'#c0392b');Q(q,px+19,py+2,6,1,'#9e2b20');Q(q,px+21,py,2,1,'#e05a48')}
}
function zebra(q,x,y,side){const px=x*T,py=y*T,Uu=isRd(x,y-1),Dd=isRd(x,y+1),hz=!Uu&&!Dd;
 if(hz){const x0=side=='l'?px+1:side=='r'?px+20:px+10;for(let k=0;k<5;k++)Q(q,x0,py+8+k*3.4|0,11,2,'#e9e6dc')}
 else{const y0=side=='u'?py+1:side=='d'?py+20:py+10;for(let k=0;k<5;k++)Q(q,px+8+k*3.4|0,y0,2,11,'#e9e6dc')}}
function gPlaza(q,x,y,px,py){for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const v=H(x*4+bx,y*4+by,61)%4;Q(q,px+bx*8,py+by*8,8,8,['#d3ccbd','#c9c2b2','#dbd5c7','#cec6b5'][v]);Q(q,px+bx*8,py+by*8+7,8,1,'#b4ac9a');Q(q,px+bx*8+7,py+by*8,1,8,'#bdb5a3')}
 const P0=(a,b)=>{const t=M[b]&&M[b][a];return t===30||t===20||t===21||t===24||t===4||t===40||t===41||(GRD[b*MW+a]===30)};if(!P0(x,y-1))Q(q,px,py,32,2,'#a0988a');if(!P0(x,y+1))Q(q,px,py+30,32,2,'#a0988a');if(!P0(x-1,y))Q(q,px,py,2,32,'#a0988a');if(!P0(x+1,y))Q(q,px+30,py,2,32,'#a0988a')}
function gGravel(q,x,y,px,py){Q(q,px,py,32,32,'#d4c49a');for(let i=0;i<26;i++){const a=H(x,y,i+5)%31,b=H(x,y,i+35)%31;Q(q,px+a,py+b,i%3?1:2,1,['#c2b085','#e4d8b4','#b39f72'][i%3])}
 const G0=(a,b)=>{const t=M[b]&&M[b][a];return t===31||(GRD[b*MW+a]===31)};for(const [dx,dy,ex,ey,w,h] of [[0,-1,0,0,32,2],[0,1,0,30,32,2],[-1,0,0,0,2,32],[1,0,30,0,2,32]])if(!G0(x+dx,y+dy)&&!isRd(x+dx,y+dy))for(let i=0;i<(w>h?w:h);i+=2)Q(q,px+ex+(w>h?i:H(x,y,i)%2),py+ey+(w>h?H(x,y,i)%2:i),1,2,'#4caa50')}
function gPitch(q,x,y,px,py){for(let i=0;i<2;i++)Q(q,px+i*16,py,16,32,((x*2+i)%2)?'#44a64d':'#3b9845');for(let i=0;i<10;i++)Q(q,px+H(x,y,i)%31,py+H(x,y,i+20)%31,1,1,'#58b860')}
function gTrack(q,x,y,px,py){Q(q,px,py,32,32,'#b04530');for(let i=0;i<30;i++)Q(q,px+H(x,y,i)%31,py+H(x,y,i+30)%31,1,1,i%2?'#c05038':'#9a3a27');for(let r=0;r<32;r+=8)Q(q,px,py+r,32,1,'#f1e6dc')}
function gWater(q,x,y,px,py){
 for(let by=0;by<4;by++)for(let bx=0;bx<4;bx++){const ex=Math.min(bx,3-bx),ey=Math.min(by,3-by);let d=3;if(!isW(x-1,y))d=Math.min(d,bx);if(!isW(x+1,y))d=Math.min(d,3-bx);if(!isW(x,y-1))d=Math.min(d,by);if(!isW(x,y+1))d=Math.min(d,3-by);Q(q,px+bx*8,py+by*8,8,8,mixC('#5fb6ea','#2a72c2',Math.min(1,d/2.2)*.8+vn((x*4+bx)/4,(y*4+by)/4,9)*.2))}
 const ed=[[!isW(x,y-1),px,py,32,3],[!isW(x,y+1),px,py+29,32,3],[!isW(x-1,y),px,py,3,32],[!isW(x+1,y),px+29,py,3,32]];
 for(const [on,a,b,w,h] of ed)if(on){Q(q,a,b,w,h,'#8a7a5a');Q(q,a+(w>h?0:(a==px?3:-1)),b+(w>h?(b==py?3:-1):0),w>h?w:1,w>h?1:h,'#e6f6ff')}
 for(let i=0;i<3;i++)Q(q,px+4+H(x,y,i+3)%22,py+5+H(x,y,i+6)%22,3,1,'#a9dcff');
 if(x<10&&y>28&&H(x,y,8)<30){const a=px+6+H(x,y,9)%18,b=py+6+H(x,y,10)%18;q.fillStyle='#3d8f3a';q.beginPath();q.arc(a,b,3.5,0.4,6.0);q.lineTo(a,b);q.fill();if(H(x,y,11)<40){Q(q,a-1,b-1,2,2,'#ff9ec4');Q(q,a,b,1,1,'#fff3a0')}}}
function treeKind(x,y){const h=H(x,y,71);if(x>=56&&y>=22&&y<=39)return h<45?'palm':h<70?'pine':'round';if(y>=22&&y<=55&&x<=31)return h<40?'pine':h<52?'autumn':'round';return h<10?'autumn':h<28?'bush':'round'}
function treeArt(q,x,y,px,py){const k=treeKind(x,y),j=H(x,y,72)%5-2;
 if(k=='pine'){Q(q,px+14,py+22,4,9,'#5a3d22');for(const [w,ty,c] of [[26,6,'#1d5c33'],[20,-2,'#22693a'],[13,-9,'#2a7843']]){q.fillStyle=c;q.beginPath();q.moveTo(px+16+j,py+ty-6);q.lineTo(px+16+j+w/2,py+ty+12);q.lineTo(px+16+j-w/2,py+ty+12);q.closePath();q.fill();q.fillStyle='rgba(255,255,255,.12)';q.beginPath();q.moveTo(px+16+j,py+ty-5);q.lineTo(px+16+j-w/2+2,py+ty+11);q.lineTo(px+16+j-w/4,py+ty+11);q.closePath();q.fill()}return}
 if(k=='palm'){q.strokeStyle='#8a6a42';q.lineWidth=4;q.beginPath();q.moveTo(px+15,py+31);q.quadraticCurveTo(px+11,py+14,px+17+j,py-2);q.stroke();for(let i=0;i<6;i++){Q(q,px+12+(i>2?1:0),py+28-i*5,5,1,'#6e5232')}const cx0=px+17+j,cy0=py-3;for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6+.1;q.strokeStyle=i%2?'#2f8f3e':'#3fa34d';q.lineWidth=3;q.beginPath();q.moveTo(cx0,cy0);q.quadraticCurveTo(cx0+Math.cos(a)*9,cy0+Math.sin(a)*9-4,cx0+Math.cos(a)*15,cy0+Math.sin(a)*12+3);q.stroke()}Q(q,cx0-2,cy0,4,3,'#6b4a2a');return}
 Q(q,px+14,py+18,5,13,'#6b4a2a');Q(q,px+17,py+18,2,13,'#4f3620');Q(q,px+12,py+29,9,2,'#5a3d22');
 const pal=k=='autumn'?['#a2441d','#d06a2a','#eb9a3f','#ffd27a']:k=='bush'?['#1f6430','#2d8240','#47a457','#86cf7f']:['#1e6830','#2c8a3d','#45a650','#82d07c'];
 const cx0=px+16+j,cy0=py+7;
 if(k=='bush'){for(const [dx,dy,r] of [[-6,3,10],[6,2,10],[0,-3,10]]){q.fillStyle=pal[0];q.beginPath();q.arc(cx0+dx,cy0+dy+1,r,0,7);q.fill()}for(const [dx,dy,r] of [[-7,1,7],[5,0,7],[-1,-5,7]]){q.fillStyle=pal[1];q.beginPath();q.arc(cx0+dx,cy0+dy,r,0,7);q.fill()}}
 else{q.fillStyle=pal[0];q.beginPath();q.arc(cx0,cy0+2,14,0,7);q.fill();q.fillStyle=pal[1];q.beginPath();q.arc(cx0-1,cy0,12,0,7);q.fill()}
 q.fillStyle=pal[2];q.beginPath();q.arc(cx0-3,cy0-3,8,0,7);q.fill();q.fillStyle=pal[3];q.beginPath();q.arc(cx0-6,cy0-6,3.5,0,7);q.fill();
 for(let i=0;i<14;i++){const a=H(x,y,i+73)/99*6.28,r=H(x,y,i+93)%11;Q(q,cx0+Math.cos(a)*r|0,cy0+Math.sin(a)*r|0,1,1,i%3?pal[0]:pal[3])}}
function benchArt(q,px,py){Q(q,px+4,py+19,24,3,'#8a6240');Q(q,px+4,py+23,24,3,'#7a5534');Q(q,px+4,py+12,24,3,'#946a45');Q(q,px+4,py+15,24,1,'#6b4a2e');for(const lx of [6,24]){Q(q,px+lx,py+15,2,13,'#30333a')}Q(q,px+4,py+12,24,1,'#b08a60')}
function bedArt(q,px,py){Q(q,px+4,py+16,24,12,'#9b9080');Q(q,px+4,py+16,24,2,'#b9ae9d');Q(q,px+6,py+18,20,8,'#5a3b22');for(let i=0;i<7;i++){const a=px+7+i*3,b=py+12+(i%2)*3;Q(q,a,b+4,1,4,'#2f7a36');q.fillStyle=['#ff7aa8','#ffe066','#ffffff','#ff9a3c','#c77dff','#ff5a5a','#7cc7ff'][i];q.beginPath();q.arc(a+.5,b+3,2.2,0,7);q.fill();Q(q,a,b+3,1,1,'#fff3a0')}}
function boardArt(q,px,py,x,y){Q(q,px+7,py+10,2,21,'#3d424d');Q(q,px+23,py+10,2,21,'#3d424d');Q(q,px+1,py-6,30,18,'#1b1e25');const c=['#c0392b','#1f9d55','#3a5bd9','#c9a227','#7a4fb8'][H(x,y,2)%5],gr=q.createLinearGradient(0,py-4,0,py+10);gr.addColorStop(0,shd(c,1.25));gr.addColorStop(1,shd(c,.8));q.fillStyle=gr;q.fillRect(px+3,py-4,26,14);Q(q,px+6,py-1,12,2,'#fff');Q(q,px+6,py+3,8,2,'#ffe9a0');q.fillStyle='#fff';q.beginPath();q.arc(px+23,py+3,4,0,7);q.fill();Q(q,px+22,py+2,2,2,'#222');Q(q,px+1,py+11,30,1,'#0d0f13')}
function stopArt(q,px,py){Q(q,px+3,py+5,26,3,'#3d4a6b');Q(q,px+3,py+8,26,1,'#26304a');Q(q,px+4,py+9,1,18,'#8a93a5');Q(q,px+27,py+9,1,18,'#8a93a5');Q(q,px+5,py+9,22,12,'rgba(170,215,255,.35)');Q(q,px+8,py+20,16,3,'#7a5534');Q(q,px+30,py+2,1,26,'#55606f');q.fillStyle='#2e6fb8';q.beginPath();q.arc(px+30.5,py+3,3,0,7);q.fill();Q(q,px+30,py+2,1,2,'#fff')}
function carTop(q,px,py,c,dir){const body=c,dark=shd(c,.7),lite=shd(c,1.3);Q(q,px+3,py+10,26,13,body);Q(q,px+2,py+12,28,9,body);Q(q,px+3,py+21,26,2,dark);Q(q,px+9,py+11,13,11,shd(c,.85));Q(q,px+21,py+12,4,9,'#8fc9ef');Q(q,px+6,py+12,3,9,'#6f9fc4');Q(q,px+10,py+10,11,1,lite);Q(q,px+4,py+9,5,2,'#15161a');Q(q,px+22,py+9,5,2,'#15161a');Q(q,px+4,py+23,5,2,'#15161a');Q(q,px+22,py+23,5,2,'#15161a');Q(q,px+29,py+13,1,2,'#fff6c8');Q(q,px+29,py+18,1,2,'#fff6c8');Q(q,px+2,py+13,1,2,'#d23');Q(q,px+2,py+18,1,2,'#d23')}
function lampArt(q,lx,ly){const bx=lx,by0=ly+12;Q(q,bx-2,by0-3,4,3,'#2a2d34');Q(q,bx-1,by0-24,2,22,'#363a43');Q(q,bx,by0-24,1,22,'#4b505b');Q(q,bx-1,by0-25,7,2,'#363a43');Q(q,bx+3,by0-24,5,3,'#2a2d34');Q(q,bx+4,by0-22,3,1,'#fff1b8')}
function binArt(q,px,py){Q(q,px,py,5,7,'#2e6b3e');Q(q,px,py,5,1,'#4a8a5a');Q(q,px-1,py-1,7,1,'#24563a')}
