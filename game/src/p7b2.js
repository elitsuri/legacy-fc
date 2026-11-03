// ===================== VISUAL REBIRTH: buildings, stadium, landmarks, paint orchestration =====================
var BST={hq:['brick','#a03f2c',12],tr:['metal','#2e8b57',6],shop:['store','#ece0c6',8],ag:['glass','#6a5aa0',24],gym:['metal','#c76b1a',6],car:['showroom','#dfe3ea',4],home:['plaster','#f1e3c6',12],cafe:['wood','#d9b48c',4],cl:['clinic','#f4f6f8',8],ac:['brick','#8a5a3a',10],air:['terminal','#d6dee8',10],market:['store','#f3dde2',8],barber:['store','#e3eef0',6],track:['metal','#b5452e',4],courts:['metal','#2e8b57',4],park:['pavilion','#e8e0c8',2],station:['terminal','#d3d8e0',8],vip:['dark','#1d1f26',18],street:['pavilion','#f0d8b0',2]};
function bStyle(f){if(f[4]=='deco'){const n=f[2];return n=='TOWER'?['glass','#5a7aa8',36]:n=='OFFICES'?['glass','#6b7d90',22]:['plaster',['#efe0c0','#ead0c6','#d8e4d2','#e6dccf','#dfe3ee'][H(f[0],f[1],3)%5],14]}if(f[2]=='PENTHOUSE')return['plaster','#f4ead7',28];if(f[2]=='MALL')return['store','#e4e9f0',16];if(f[2]=='RECOVERY')return['clinic','#eef6f6',6];return BST[f[4]]||['plaster','#efe3c6',8]}
function nlRect(x,y,w,h,col){if(!nl)return;nl.save();nl.shadowColor=col;nl.shadowBlur=5;nl.fillStyle=col;nl.fillRect(x/2,y/2,Math.max(1,w/2),Math.max(1,h/2));nl.restore()}
function nlGlow(x,y,r,col){if(!nl)return;const gr=nl.createRadialGradient(x/2,y/2,0,x/2,y/2,r/2);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');nl.fillStyle=gr;nl.fillRect(x/2-r/2,y/2-r/2,r,r)}
function winA(q,x,y,w,h,lit,frame='#3a3f4a'){Q(q,x-1,y-1,w+2,h+2,frame);const gr=q.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#c9ecff');gr.addColorStop(.5,'#8cc0e6');gr.addColorStop(1,'#4f7fae');q.fillStyle=gr;q.fillRect(x,y,w,h);q.fillStyle='rgba(255,255,255,.45)';q.beginPath();q.moveTo(x+w*.25,y);q.lineTo(x+w*.45,y);q.lineTo(x+w*.15,y+h);q.lineTo(x,y+h);q.lineTo(x,y+h*.6);q.closePath();q.fill();if(w>9)Q(q,x+(w>>1),y,1,h,frame);Q(q,x-1,y+h+1,w+2,1,'#e9e4d8');if(lit&&q===m)nlRect(x,y,w,h,'rgba(255,196,110,.95)')}
function roofKit(q,f,px,ry,mat){const s=H(f[0],f[1],5);
 if(f[2]=='TOWER'){q.fillStyle='#3b414d';q.beginPath();q.arc(px+48,ry+14,10,0,7);q.fill();q.strokeStyle='#e9e4d8';q.lineWidth=1.5;q.beginPath();q.arc(px+48,ry+14,8,0,7);q.stroke();Q(q,px+44,ry+9,1.6,10,'#f5c400');Q(q,px+50.4,ry+9,1.6,10,'#f5c400');Q(q,px+44,ry+13,8,1.6,'#f5c400');return}
 if(mat=='glass'||mat=='dark'||f[2]=='PENTHOUSE'){for(let i=0;i<3;i++){Q(q,px+10+i*14,ry+7,12,14,'#24375a');for(let r=0;r<3;r++)Q(q,px+10+i*14,ry+11+r*4,12,1,'#5b7fb5')}}
 if(mat=='plaster'&&s%3==0){Q(q,px+62,ry+6,18,16,'#4f9a4a');for(let i=0;i<6;i++){q.fillStyle=['#2f7a36','#64b25d','#ff8fb4'][i%3];q.beginPath();q.arc(px+65+(i%3)*6,ry+10+(i>2?6:0),2.6,0,7);q.fill()}}
 if((mat=='plaster'||mat=='brick')&&s%2==0){Q(q,px+16,ry+4,10,12,'#8b6a50');Q(q,px+16,ry+4,10,2,'#a8846a');Q(q,px+17,ry+16,1,5,'#55565e');Q(q,px+24,ry+16,1,5,'#55565e')}
 if(mat=='store'||f[2]=='MALL'){for(let i=0;i<2;i++){Q(q,px+30+i*22,ry+8,16,12,'#8fc9ef');Q(q,px+30+i*22,ry+8,16,2,'#c9ecff');Q(q,px+37+i*22,ry+8,1,12,'#55606f')}}
 if(mat!='terminal'){Q(q,px+70,ry+13,11,8,'#a3aab6');Q(q,px+70,ry+13,11,1,'#c8ced8');q.fillStyle='#3a3f4a';q.beginPath();q.arc(px+75.5,ry+17.5,2.6,0,7);q.fill()}
 if(s%4==1){Q(q,px+86,ry-10,1,14,'#55606f');Q(q,px+85,ry-11,3,2,'#d23');if(q===m)nlGlow(px+86,ry-10,10,'rgba(255,60,60,.9)')}}
function doorA(q,px,py,mat,c){const dx=px+36,dy=py+66;
 Q(q,px+32,py+60,32,5,shd(c,.62));Q(q,px+32,py+60,32,1,shd(c,.95));Q(q,px+33,py+65,30,2,'rgba(0,0,0,.25)');
 Q(q,dx-1,dy,26,30,'#2a2f38');
 if(['store','glass','clinic','terminal','showroom','dark'].includes(mat)){const gr=q.createLinearGradient(0,dy,0,dy+28);gr.addColorStop(0,'#bfe3ff');gr.addColorStop(1,'#3f6f9e');q.fillStyle=gr;q.fillRect(dx+1,dy+2,10,27);q.fillRect(dx+13,dy+2,10,27);Q(q,dx+10,dy+12,1,6,'#d7dde5');Q(q,dx+14,dy+12,1,6,'#d7dde5');q.fillStyle='rgba(255,255,255,.4)';q.fillRect(dx+2,dy+3,2,20);q.fillRect(dx+14,dy+3,2,20)}
 else if(mat=='metal'||mat=='pavilion'){Q(q,dx+1,dy+2,22,12,'#1a1d22');for(let r=0;r<6;r++)Q(q,dx+1,dy+14+r*2.5|0,22,2,r%2?'#9aa1ad':'#b9bfca');Q(q,dx+1,dy+13,22,1,'#5d636e')}
 else{Q(q,dx+1,dy+2,22,28,'#6b4423');Q(q,dx+12,dy+2,1,28,'#4f3119');for(const ox of [3,15]){Q(q,dx+ox,dy+5,6,9,'#7d5230');Q(q,dx+ox,dy+17,6,9,'#7d5230')}Q(q,dx+10,dy+16,1,2,'#ffd24a');Q(q,dx+14,dy+16,1,2,'#ffd24a')}
 Q(q,px+34,py+94,28,2,'#e2ddd1');Q(q,dx-4,dy+4,2,3,'#fff1b8');Q(q,dx+26,dy+4,2,3,'#fff1b8');if(q===m){nlGlow(dx-3,dy+5,22,'rgba(255,214,140,.9)');nlGlow(dx+27,dy+5,22,'rgba(255,214,140,.9)');nlGlow(px+48,py+104,70,'rgba(255,200,120,.35)')}}
function paintBuilding(q,f,i){const [x,y,nme,c,k]=f,px=x*T,py=y*T,[mat,wc,hh]=bStyle(f),fy=py+32-hh,ry=fy-28,gy=py+64,s=H(x,y,7);
 // roof top face
 const rc=shd(c,mat=='dark'?.35:.62);Q(q,px+1,ry,94,28,rc);for(let n=0;n<40;n++)Q(q,px+3+H(x+n,y,8)%90,ry+2+H(x,y+n,9)%24,1,1,n%2?shd(rc,1.12):shd(rc,.86));Q(q,px+1,ry,94,2,shd(c,.92));Q(q,px+1,ry,2,28,shd(c,.85));Q(q,px+93,ry,2,28,shd(c,.5));Q(q,px+3,ry+2,90,1,'rgba(0,0,0,.18)');
 roofKit(q,f,px,ry,mat);
 Q(q,px,fy-4,96,4,shd(c,.42));Q(q,px,fy-4,96,1,shd(c,.75));
 // facade material
 const fh=py+96-fy;
 if(mat=='brick'){Q(q,px,fy,96,fh,wc);for(let yy=fy;yy<py+96;yy+=4){Q(q,px,yy,96,1,shd(wc,1.22));const off=((yy-fy)/4)%2?4:0;for(let xx=px+off;xx<px+96;xx+=8){Q(q,xx,yy+1,1,3,shd(wc,1.18));if(H(xx,yy,3)<14)Q(q,xx+1,yy+1,7,3,shd(wc,.9))}}}
 else if(mat=='glass'||mat=='dark'){Q(q,px,fy,96,fh,mat=='dark'?'#16181e':'#2a3242');for(let yy=fy+2;yy<gy-2;yy+=9)for(let xx=px+2;xx<px+94;xx+=8){const v=vn((xx-px)/30+x,(yy-fy)/40+y,13);Q(q,xx,yy,7,7,mat=='dark'?mixC('#1d2230','#3a4256',v):mixC('#5d86b8','#a9d3f2',v));if(mat!='dark'&&((xx+yy)%5==0))Q(q,xx,yy,3,1,'#e3f4ff');if(q===m&&H(xx,yy,4)<(mat=='dark'?35:28))nlRect(xx,yy,7,7,'rgba(255,214,150,.9)')}if(mat=='dark')for(let yy=fy+1;yy<gy;yy+=9)Q(q,px,yy,96,1,'#b8902a')}
 else if(mat=='metal'){Q(q,px,fy,96,fh,wc);for(let xx=px;xx<px+96;xx+=4){Q(q,xx,fy,1,fh,shd(wc,1.18));Q(q,xx+2,fy,1,fh,shd(wc,.82))}Q(q,px,fy+8,96,10,'#1f2a33');for(let xx=px+4;xx<px+92;xx+=11){winA(q,xx,fy+10,9,6,H(xx,fy,2)<60,'#2a3540')}}
 else if(mat=='wood'){Q(q,px,fy,96,fh,wc);for(let yy=fy;yy<py+96;yy+=4){Q(q,px,yy,96,1,shd(wc,.72));if(H(x,yy,2)<30)Q(q,px+H(yy,x,3)%80,yy+1,10,3,shd(wc,.92))}}
 else if(mat=='clinic'){Q(q,px,fy,96,fh,wc);for(let yy=fy+16;yy<gy;yy+=18)Q(q,px,yy,96,2,'#3a7bd5');Q(q,px,fy,96,2,'#3a7bd5')}
 else if(mat=='terminal'||mat=='showroom'){Q(q,px,fy,96,fh,wc);const gr=q.createLinearGradient(0,fy,0,gy);gr.addColorStop(0,'#bfe3ff');gr.addColorStop(1,'#5a8fc0');q.fillStyle=gr;q.fillRect(px+4,fy+4,88,gy-fy-6);for(let xx=px+4;xx<px+92;xx+=11)Q(q,xx,fy+4,1,gy-fy-6,'#e9eef5');Q(q,px+4,fy+(gy-fy)/2|0,88,1,'#e9eef5');if(q===m)for(let xx=px+6;xx<px+90;xx+=11)if(H(xx,y,6)<50)nlRect(xx,fy+6,9,gy-fy-10,'rgba(255,225,170,.7)')}
 else{Q(q,px,fy,96,fh,wc);for(let n=0;n<60;n++)Q(q,px+H(x,n,4)%95,fy+H(n,y,5)%(fh-1),1,1,shd(wc,.94))}
 // upper floors windows (non-glass)
 if(!['glass','dark','terminal','showroom','metal'].includes(mat)){const nf=Math.max(1,Math.floor((gy-fy-4)/18));for(let k2=0;k2<nf;k2++){const wy=fy+5+k2*18;if(mat=='plaster'||mat=='clinic'){for(const wx of [px+8,px+30,px+52,px+74]){winA(q,wx,wy,14,10,H(wx,wy,6)<50);if(mat=='plaster'&&nme!='HOMES'&&k2<nf){Q(q,wx-2,wy+12,18,2,'#d9d4c8');Q(q,wx-2,wy+8,18,1,'#3a3f4a');for(let p=0;p<18;p+=3)Q(q,wx-2+p,wy+8,1,4,'#3a3f4a');if(H(wx,wy,8)<30){Q(q,wx+10,wy+6,4,2,'#2f7a36');Q(q,wx+11,wy+5,2,1,'#ff8fb4')}}}}else{for(const wx of [px+8,px+40,px+72]){if(mat=='brick')Q(q,wx-2,wy-2,20,2,'#e5d8c0');winA(q,wx,wy,16,11,H(wx,wy,6)<55)}}if(mat=='plaster'&&H(x,k2,9)<40){Q(q,px+86,wy+3,7,5,'#c3c8cf');Q(q,px+87,wy+4,5,3,'#9aa1ad')}}}
 if(mat=='glass'||mat=='dark')Q(q,px,gy-2,96,2,mat=='dark'?'#b8902a':'#d7dde5');
 // ground floor
 const store=['store','showroom'].includes(mat);Q(q,px,gy,96,32,mat=='glass'||mat=='dark'||mat=='terminal'?shd(wc,.92):wc);if(mat=='brick'){for(let yy=gy;yy<py+96;yy+=4)Q(q,px,yy,96,1,shd(wc,1.22))}
 if(store){for(const wx of [px+3,px+65]){const gr=q.createLinearGradient(0,gy+4,0,gy+28);gr.addColorStop(0,'#d4efff');gr.addColorStop(1,'#6c9cc8');q.fillStyle=gr;q.fillRect(wx,gy+6,28,22);Q(q,wx-1,gy+5,30,1,'#2a2f38');Q(q,wx-1,gy+28,30,2,'#2a2f38');
   if(mat=='showroom'){Q(q,wx+3,gy+18,22,7,s%2?'#d33':'#3a7bd5');Q(q,wx+7,gy+15,13,4,s%2?'#b22':'#2e5fb0');Q(q,wx+5,gy+24,4,3,'#111');Q(q,wx+19,gy+24,4,3,'#111')}
   else for(let j=0;j<3;j++){const ix=wx+4+j*8;if(nme=='BARBER'){Q(q,ix,gy+12,5,8,'#e9ecf0')}else{Q(q,ix,gy+10,6,7,['#c0392b','#1f9d55','#3a5bd9','#ffd24a','#7a4fb8'][(s+j)%5]);Q(q,ix+2,gy+9,2,1,'#55606f');Q(q,ix+1,gy+18,4,8,'#3d4250')}}
   q.fillStyle='rgba(255,255,255,.4)';q.fillRect(wx+2,gy+7,3,18);if(q===m)nlRect(wx,gy+6,28,22,'rgba(255,226,170,.85)')}
  for(let j=0;j<12;j++){const ax=px+j*8;Q(q,ax,gy-2,8,6,j%2?'#fafafa':c);Q(q,ax,gy+4,8,1,shd(j%2?'#fafafa':c,.75));q.fillStyle=j%2?'#fafafa':c;q.beginPath();q.arc(ax+4,gy+4,4,0,Math.PI);q.fill()}}
 else if(mat!='glass'&&mat!='dark'&&mat!='terminal'){for(const wx of [px+8,px+70])winA(q,wx,gy+8,18,14,H(wx,gy,6)<60)}
 else{for(const wx of [px+6,px+66]){Q(q,wx,gy+6,24,20,'#1d2533');const gr=q.createLinearGradient(0,gy+6,0,gy+26);gr.addColorStop(0,'#9fcbee');gr.addColorStop(1,'#406f9c');q.fillStyle=gr;q.fillRect(wx+1,gy+7,22,18);if(q===m)nlRect(wx+1,gy+7,22,18,'rgba(255,220,160,.8)')}}
 doorA(q,px,py,mat,c);
 Q(q,px,py+93,32,3,shd(wc,.62));Q(q,px+64,py+93,32,3,shd(wc,.62));Q(q,px+93,fy,3,fh,'rgba(0,0,0,.20)');Q(q,px,fy,1,fh,'rgba(255,255,255,.18)');
 // signature details
 if(q===m&&k!='deco')ico(k,px+48,fy+(hh>14?28:40)>gy-10?gy-12:fy+(hh>14?28:40));
 if(k=='hq'){const cc=clubCols();q.fillStyle='#1b1e25';q.beginPath();q.arc(px+48,fy+40,9,0,7);q.fill();q.fillStyle=cc[0];q.beginPath();q.arc(px+48,fy+40,7.5,0,7);q.fill();Q(q,px+46.5,fy+33,3,15,cc[1]);if(q===m)FLAGPOLES.push([px+90,ry-24,'hq'])}
 if(k=='ac'&&q===m)FLAGPOLES.push([px+8,ry-20,'ac']);
 if(k=='barber')for(let j=0;j<6;j++)Q(q,px+67,gy+4+j*4,4,4,j%2?'#fff':'#c0392b');
 if(k=='cl'){Q(q,px+40,fy+6,16,16,'#fff');Q(q,px+46,fy+8,4,12,'#e53935');Q(q,px+42,fy+12,12,4,'#e53935')}
 if(k=='station'){q.fillStyle='#f4f6f8';q.beginPath();q.arc(px+48,fy+14,8,0,7);q.fill();q.strokeStyle='#2a2f38';q.lineWidth=1.2;q.stroke();Q(q,px+47.5,fy+9,1,6,'#2a2f38');Q(q,px+48,fy+14,4,1,'#2a2f38')}
 if(k=='air'){Q(q,px+74,ry-30,12,34,'#c9d1dc');Q(q,px+72,ry-38,16,9,'#5d86b8');Q(q,px+72,ry-38,16,2,'#e9eef5');Q(q,px+71,ry-40,18,2,'#3d4a6b');if(q===m)nlRect(px+72,ry-36,16,6,'rgba(170,230,255,.9)')}
 if(k=='vip'){Q(q,px+38,py+94,20,2,'#a3162a');Q(q,px+30,fy-4,36,2,'#d4a72c')}
 if(k!='deco')SIGNS[i]={x:px+48,y:fy+(hh>14?16:14),w:70,label:nme};else SIGNS[i]=null;
 if(k!='deco'){Q(q,px+13,fy+(hh>14?6:4),70,14,'#14161b');Q(q,px+13,fy+(hh>14?6:4),70,1,shd(c,1.2));Q(q,px+13,fy+(hh>14?19:17),70,1,shd(c,.6));Q(q,px+13,fy+(hh>14?6:4),2,14,c);Q(q,px+81,fy+(hh>14?6:4),2,14,c);if(q===m)nlRect(px+15,fy+(hh>14?7:5),66,12,'rgba(255,240,210,.35)')}}
function clubCols(){try{const n=nm(mine().n);let h=7;for(const ch of n)h=(h*31+ch.charCodeAt(0)*17)>>>0;h=((h^h>>>13)*2654435761)>>>0;return[hsl2hex(h%360,.62,.42),hsl2hex((h>>>9)%360,.7,.62)]}catch(e){return['#1f9d9d','#ffffff']}}
function hsl2hex(hh,s,l){const k=n=>(n+hh/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}
// ---------- stadium landmark (Football District) ----------
function stadiumData(){for(let y=10;y<=12;y++)for(let x=9;x<=15;x++)M[y][x]=40;for(let x=9;x<=15;x++)if(x!=12)M[13][x]=30;M[13][12]=4;STADPOS={cx:400,cy:352,rx:106,ry:50}}
function paintStadium(q){const {cx,cy,rx,ry}=STADPOS,cc=clubCols(),wall=cy+20;
 q.save();q.fillStyle='#c4cad3';q.beginPath();q.ellipse(cx,wall,rx,ry,0,0,7);q.fill();q.fillRect(cx-rx,cy,rx*2,wall-cy);
 q.beginPath();q.ellipse(cx,wall,rx,ry,0,0,7);q.rect(cx-rx,cy,rx*2,wall-cy);q.clip();for(let xx=cx-rx;xx<cx+rx;xx+=6){Q(q,xx,cy,3,ry+24,cc[0]);Q(q,xx+3,cy,1,ry+24,shd(cc[0],1.3))}Q(q,cx-rx,wall+ry-14,rx*2,6,'#14161b');q.restore();
 q.fillStyle='#e9edf2';q.beginPath();q.ellipse(cx,cy,rx,ry,0,0,7);q.fill();q.strokeStyle='#b9c0ca';q.lineWidth=1;for(let a=0;a<Math.PI*2;a+=Math.PI/16){q.beginPath();q.moveTo(cx+Math.cos(a)*rx*.8,cy+Math.sin(a)*ry*.8);q.lineTo(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry);q.stroke()}
 q.fillStyle='#2b2f39';q.beginPath();q.ellipse(cx,cy+2,rx*.82,ry*.76,0,0,7);q.fill();
 const pal=[cc[0],cc[1],'#ffffff',shd(cc[0],1.3),'#c0392b','#e8e8e8','#ffd24a'];for(let r=.8;r>.5;r-=.045)for(let a=0;a<Math.PI*2;a+=.045){const px=cx+Math.cos(a)*rx*r,py=cy+2+Math.sin(a)*ry*r*.96;Q(q,px|0,py|0,2,1,pal[H(px|0,py|0,4)%pal.length])}
 q.fillStyle='#3a9a45';q.fillRect(cx-56,cy-17,112,38);for(let i=0;i<8;i++)Q(q,cx-56+i*14,cy-17,7,38,'#42a84d');q.strokeStyle='#f2f7ee';q.lineWidth=1;q.strokeRect(cx-54.5,cy-15.5,109,35);q.beginPath();q.moveTo(cx,cy-15.5);q.lineTo(cx,cy+19.5);q.stroke();q.beginPath();q.ellipse(cx,cy+2,8,6,0,0,7);q.stroke();q.strokeRect(cx-54.5,cy-6.5,12,17);q.strokeRect(cx+42.5,cy-6.5,12,17);Q(q,cx-57,cy-1,2,6,'#fff');Q(q,cx+55,cy-1,2,6,'#fff');
 for(const [tx,ty,front] of [[cx-rx+16,cy-ry+16,0],[cx+rx-16,cy-ry+16,0],[cx-rx+10,cy+ry-8,1],[cx+rx-10,cy+ry-8,1]]){const h0=front?44:38;Q(q,tx-1,ty-h0,3,h0,'#5d636e');for(let yy=ty-h0;yy<ty;yy+=4)Q(q,tx-2,yy,5,1,'#4a505b');Q(q,tx-8,ty-h0-8,17,9,'#2a2f38');for(let a=0;a<4;a++)for(let b=0;b<2;b++)Q(q,tx-7+a*4,ty-h0-7+b*4,3,3,'#fff6d0');if(q===m){nlGlow(tx,ty-h0-4,60,'rgba(255,250,220,.95)')}}
 if(q===m)nlGlow(cx,cy+2,180,'rgba(235,245,255,.35)');
 const gx=cx-12;Q(q,gx-4,wall+ry-30,32,30,'#14161b');q.fillStyle='#1a1d23';q.beginPath();q.arc(gx+12,wall+ry-30,16,Math.PI,0);q.fill();q.strokeStyle='#d4a72c';q.lineWidth=2;q.beginPath();q.arc(gx+12,wall+ry-30,16,Math.PI,0);q.stroke();for(let j=0;j<4;j++)Q(q,gx+j*7,cy+ry+42,2,10,'#8d96a8');Q(q,gx-2,cy+ry+42,28,1,'#b9c0ca');
 if(q===m)nlGlow(gx+12,wall+ry-20,70,'rgba(255,215,140,.8)');
 if(q===m)FLAGPOLES.push([cx-rx+4,wall+ry-18,'st'],[cx+rx-4,wall+ry-18,'st'])}
// ---------- big public screen (Downtown) ----------
function screenData(){for(let x=46;x<=49;x++)M[40][x]=41;SCREENPOS={x:1476,y:1254,w:120,h:40}}
function paintScreen(q){const s=SCREENPOS;Q(q,s.x+12,s.y+s.h,5,30,'#3a3f4a');Q(q,s.x+s.w-17,s.y+s.h,5,30,'#3a3f4a');Q(q,s.x-4,s.y-4,s.w+8,s.h+8,'#1b1e25');Q(q,s.x-4,s.y-4,s.w+8,2,'#4b515d');Q(q,s.x,s.y,s.w,s.h,'#0b0e14');Q(q,s.x+s.w/2-14,s.y+s.h+4,28,3,'#2a2f38')}
// ---------- orchestration ----------
function paintWorld(){stadiumData();screenData();
 FGc=document.createElement('canvas');FGc.width=MW*T;FGc.height=MH*T;fg=FGc.getContext('2d');NLc=document.createElement('canvas');NLc.width=MW*T/2;NLc.height=MH*T/2;nl=NLc.getContext('2d');
 SIGNS=[];FLAGPOLES=[];FOUNT=[];PITCHES=[];TALLV=[];WATERV=[];
 m.clearRect(0,0,MC.width,MC.height);
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x],px=x*T,py=y*T,g0=GRD[y*MW+x];
  if(t===0)gRoad(m,x,y,px,py);else if(t===7){gWater(m,x,y,px,py);WATERV.push([x,y])}else if(t===2){gTall(m,x,y,px,py);TALLV.push([x,y])}
  else if(t===30||t===21||g0===30||(t===4&&x===12&&y===13))gPlaza(m,x,y,px,py);else if(t===31||g0===31)gGravel(m,x,y,px,py);else if(t===32)gPitch(m,x,y,px,py);else if(t===33)gTrack(m,x,y,px,py);else gGrass(m,x,y,px,py)}
 // crosswalks at intersections and in front of doors
 for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){if(!isRd(x,y))continue;const n=[isRd(x,y-1),isRd(x,y+1),isRd(x-1,y),isRd(x+1,y)].filter(Boolean).length;if(n<3)continue;if(isRd(x-1,y))zebra(m,x-1,y,'r');if(isRd(x+1,y))zebra(m,x+1,y,'l');if(isRd(x,y-1))zebra(m,x,y-1,'d');if(isRd(x,y+1))zebra(m,x,y+1,'u')}
 FAC.forEach(f=>{if(f[4]=='deco'||f[4]=='st')return;const dx=f[0]+1,dy=f[1]+3;if(isRd(dx,dy))zebra(m,dx,dy,'c')});
 // pitch + track markings
 const seen={};for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]!==32||seen[y*MW+x])continue;let x1=x,y1=y;while(M[y][x1+1]===32)x1++;while(M[y1+1]&&M[y1+1][x]===32)y1++;for(let yy=y;yy<=y1;yy++)for(let xx=x;xx<=x1;xx++)seen[yy*MW+xx]=1;PITCHES.push([x,y,x1,y1]);const X0=x*T+3,Y0=y*T+3,W0=(x1-x+1)*T-6,H0=(y1-y+1)*T-6;m.strokeStyle='#f3f7ee';m.lineWidth=2;m.strokeRect(X0,Y0,W0,H0);m.beginPath();m.moveTo(X0,Y0+H0/2);m.lineTo(X0+W0,Y0+H0/2);m.stroke();m.beginPath();m.arc(X0+W0/2,Y0+H0/2,14,0,7);m.stroke();m.strokeRect(X0+W0/2-30,Y0,60,26);m.strokeRect(X0+W0/2-30,Y0+H0-26,60,26);for(const gy of [Y0-2,Y0+H0-3]){Q(m,X0+W0/2-14,gy,28,5,'rgba(255,255,255,.85)');for(let j=0;j<28;j+=3)Q(m,X0+W0/2-14+j,gy,1,5,'#c8ced6')}Q(m,X0+W0/2-1,Y0+H0/2-1,3,3,'#fff')}
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(M[y][x]===33&&M[y][x-1]!==33){Q(m,x*T+6,y*T,2,32,'#fff');if(H(x,y,3)<99)for(let r=0;r<4;r++){Q(m,x*T+10,y*T+r*8+3,3,2,'#f2e9e0')}}if(M[y][x]===33&&H(x,y,12)<16){Q(m,x*T+14,y*T+6,1,8,'#fff');Q(m,x*T+20,y*T+6,1,8,'#fff');Q(m,x*T+14,y*T+6,7,2,'#f5c400')}}
 // shadows (light from top-left)
 m.fillStyle='rgba(8,14,22,.22)';FAC.forEach(f=>{if(f[4]=='st')return;const px=f[0]*T,py=f[1]*T,[,,hh]=bStyle(f),fy=py+32-hh;m.beginPath();m.moveTo(px+96,fy-28);m.lineTo(px+110,fy-18);m.lineTo(px+110,py+102);m.lineTo(px+96,py+96);m.closePath();m.fill();m.fillRect(px+4,py+96,98,5)});
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x];if(t===1||t===20||t===22||t===23||t===25){m.beginPath();m.ellipse(x*T+19,y*T+29,t===1?13:11,4.5,0,0,7);m.fill()}}
 m.beginPath();m.ellipse(STADPOS.cx+12,STADPOS.cy+STADPOS.ry+18,STADPOS.rx,18,0,0,7);m.fill();
 // drawables in depth order
 const items=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x],px=x*T,py=y*T;if(t===1)items.push([y,x,q=>treeArt(q,x,y,px,py),py]);else if(t===20)items.push([y,x,q=>benchArt(q,px,py),py]);else if(t===24)items.push([y,x,q=>bedArt(q,px,py),py]);else if(t===22)items.push([y,x,q=>boardArt(q,px,py,x,y),py]);else if(t===23)items.push([y,x,q=>stopArt(q,px,py),py]);else if(t===25)items.push([y,x,q=>carTop(q,px,py,['#8d96a8','#16181d','#c0392b','#f4f4f4','#1b2a49','#2e6fb8','#c9a227'][H(x,y,4)%7]),py])}
 FAC.forEach((f,i)=>{if(f[4]=='st')return;items.push([f[1]+2,f[0],q=>paintBuilding(q,f,i),f[1]*T])});
 items.push([12,9,q=>paintStadium(q),10*T]);items.push([40,46,q=>paintScreen(q),40*T]);
 FO.forEach(([x,y])=>{FOUNT.push([(x+1)*T,(y+1)*T]);items.push([y+1,x,q=>{const cx=(x+1)*T,cy=(y+1)*T;q.fillStyle='#8a919c';q.beginPath();q.ellipse(cx,cy+3,29,25,0,0,7);q.fill();q.fillStyle='#c9ced6';q.beginPath();q.ellipse(cx,cy,28,23,0,0,7);q.fill();q.fillStyle='#3f8fd0';q.beginPath();q.ellipse(cx,cy,23,18,0,0,7);q.fill();q.fillStyle='#69b3ea';q.beginPath();q.ellipse(cx-5,cy-4,12,8,0,0,7);q.fill();q.fillStyle='#9aa1ad';q.beginPath();q.ellipse(cx,cy-2,6,4.5,0,0,7);q.fill();Q(q,cx-2,cy-14,4,12,'#b9c0ca');Q(q,cx-1,cy-14,1,12,'#dde2e8')},y*T])});
 LAMPS.forEach(l=>items.push([Math.round((l[1]+12)/T),l[0]/T,q=>lampArt(q,l[0],l[1]),l[1]+12]));
 for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)if(isRd(x,y)&&!isRd(x,y-1)&&isRd(x-1,y)&&isRd(x+1,y)&&H(x,y,88)<7&&!LAMPS.some(l=>Math.abs(l[0]-x*T-16)<20&&Math.abs(l[1]+12-y*T)<6)){const px=x*T,py=y*T;items.push([y,x,q=>binArt(q,px+4,py),py+5])}
 items.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 for(const [,,fn,clipTop] of items){fn(m);fg.save();fg.beginPath();fg.rect(0,0,FGc.width,clipTop);fg.clip();fn(fg);fg.restore()}
 for(const l of LAMPS)nlGlow(l[0]+5,l[1]-11,64,'rgba(255,214,140,.9)');
 // ducks on park pond
 DUCKS=[];const pond=WATERV.filter(([x,y])=>x<10&&y>28);for(let i=0;i<4&&pond.length;i++){const p=pond[(i*7+3)%pond.length];DUCKS.push({x:p[0]*T+16,y:p[1]*T+16,a:Math.random()*6.28,t:0})}
 paintMap()}
function paintMap(){MAPC=document.createElement('canvas');MAPC.width=MW*6;MAPC.height=MH*6;const q=MAPC.getContext('2d');
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=M[y][x],g0=GRD[y*MW+x];let c=t===0?'#6b7280':t===1?'#2f8a3c':t===2?'#2f7a36':t===7?'#3d8fd6':t===30||g0===30||t===21||t===41?'#d6cfbf':t===31||g0===31?'#dccd9f':t===32?'#3fa34d':t===33?'#c0503a':t===40?'#c4cad3':(t===3||t===11||t===4)?'#9aa1ad':'#5cb85f';Q(q,x*6,y*6,6,6,c);if(t===1){q.fillStyle='#1f6b2e';q.beginPath();q.arc(x*6+3,y*6+3,2.4,0,7);q.fill()}if(t===0){if(!isRd(x,y-1)&&!isRd(x,y+1))Q(q,x*6+1,y*6+2.6,4,.8,'#9aa1ad');if(!isRd(x-1,y)&&!isRd(x+1,y))Q(q,x*6+2.6,y*6+1,.8,4,'#9aa1ad')}}
 FAC.forEach(f=>{if(f[4]=='st')return;const x=f[0]*6,y=f[1]*6;q.fillStyle='#1b1e25';q.fillRect(x+.5,y+.5,18,18);q.fillStyle=f[4]=='deco'?shd(f[3],.8):f[3];q.fillRect(x+1.5,y+1.5,16,16);q.fillStyle='rgba(255,255,255,.25)';q.fillRect(x+1.5,y+1.5,16,3)});
 q.fillStyle='#e9edf2';q.beginPath();q.ellipse(12.5*6,11.4*6,20,11,0,0,7);q.fill();q.fillStyle='#3a9a45';q.fillRect(12.5*6-10,11.4*6-4.5,20,9);
 q.fillStyle='#14161b';q.fillRect(46*6,40*6,24,6);
 // keep the legacy minimap canvas in sync for any old callers
 const mq=MMC.getContext('2d');mq.clearRect(0,0,MMC.width,MMC.height);mq.imageSmoothingEnabled=true;mq.drawImage(MAPC,0,0,MMC.width,MMC.height)}
function fixPos(){if(WALK.includes(M[S.y]&&M[S.y][S.x]))return;const seen=new Set([S.x+','+S.y]),q=[[S.x,S.y]];while(q.length){const [x,y]=q.shift();if(M[y]&&WALK.includes(M[y][x])&&!NPCS.some(n=>n.x==x&&n.y==y)){S.x=x;S.y=y;return}for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+a)+','+(y+b);if(!seen.has(k)&&x+a>=0&&y+b>=0&&x+a<MW&&y+b<MH){seen.add(k);q.push([x+a,y+b])}}}}
