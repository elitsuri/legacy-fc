// ===================== v10 atmosphere (p10n): running dust and night fireflies =====================
// Cosmetic only (drawn after the world, never read by the game logic): small dust puffs kick up behind Eli when he runs (earthy on grass,
// pale on paving), and on warm nights a few fireflies drift around the park. `FX10.off` switches both off if either ever throws.
var FX10={off:false,err:null,dust:[],fly:0};
(function(){const dw=drawWorld;
 drawWorld=function(){dw();if(FX10.off||INT9||title||B||LM)return;try{fx10()}catch(e){FX10.off=true;FX10.err=String(e&&e.message||e);FX10.dust.length=0}};
 function fx10(){const cx=Math.round(CAM8.x*SCv)/SCv,cy=Math.round(CAM8.y*SCv)/SCv,D=FX10.dust;
  if(PL8.st==='run'&&PL8.moved>.3&&tick%3===0&&!PL8.sit){const [fx,fy]=dirVec(PL8.dir),tx=Math.floor(PL8.x/T8),ty=Math.floor((PL8.y+8)/T8),t=M[ty]&&M[ty][tx],grass=t===1||t===2||t===8||t===32;
   D.push({x:PL8.x-fx*7+(Math.random()-.5)*4,y:PL8.y+9-fy*3,vx:-fx*.12+(Math.random()-.5)*.2,vy:-.12-Math.random()*.1,b:tick,l:20+Math.random()*10,r:1.3+Math.random()*1.2,c:grass?'#a9d98a':'#eadfc4'});if(D.length>40)D.shift()}
  g.save();for(let i=D.length-1;i>=0;i--){const p=D[i],a=(tick-p.b)/p.l;if(a>=1){D.splice(i,1);continue}p.x+=p.vx;p.y+=p.vy;g.globalAlpha=(1-a)*.4;g.fillStyle=p.c;g.beginPath();g.arc(p.x-cx,p.y-cy,p.r*(1+a*1.8),0,7);g.fill()}
  // fireflies: warm nights in the park area only
  FX10.fly=0;if(S.t===3&&WXD()!=='Rain'&&area10()==='park'){const t=tick/60;g.globalCompositeOperation='lighter';
   for(let i=0;i<12;i++){const bx=((i*97)%480),by=40+((i*53)%200),x=bx+Math.sin(t*.7+i*1.9)*18+Math.sin(t*.31+i)*10,y=by+Math.cos(t*.5+i*2.3)*12,tw=.45+.55*Math.sin(t*2.2+i*3.1);if(tw<.15)continue;FX10.fly++;
    const gr=g.createRadialGradient(x,y,0,x,y,5);gr.addColorStop(0,'rgba(255,240,150,'+(.75*tw)+')');gr.addColorStop(1,'rgba(255,240,150,0)');g.fillStyle=gr;g.fillRect(x-5,y-5,10,10)}}
  g.restore()}
})();
