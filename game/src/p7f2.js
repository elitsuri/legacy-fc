// ===================== VISUAL REBIRTH: audio engine (music bus, new themes, re-synthesised effects) =====================
var MUSB=null,SFXB=null,NOISEB=null,lastStep=0;
SONGS.title={dt:.24,lt:'triangle',l:[7,X,12,X,14,12,11,X,7,X,4,X,5,7,X,X,7,X,12,X,16,14,12,X,11,12,14,X,12,X,X,X],b:[-17,-17,-12,-12,-20,-20,-15,-15],dr:1};
SONGS.match={dt:.15,lt:'square',l:[12,X,12,14,16,X,14,12,11,X,11,12,14,X,12,11,9,X,9,11,12,X,14,16,19,X,16,X,14,X,12,X],b:[-12,-12,-15,-15,-19,-19,-17,-17],dr:2};
function initA(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();mg0=AC.createGain();mg0.gain.value=S.mute?0:S.vol.m*.55;const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;mg0.connect(comp);comp.connect(AC.destination);
 MUSB=AC.createBiquadFilter();MUSB.type='lowpass';MUSB.frequency.value=2300;MUSB.Q.value=.4;const dl=AC.createDelay(1),fb=AC.createGain(),wet=AC.createGain();dl.delayTime.value=.21;fb.gain.value=.24;wet.gain.value=.28;MUSB.connect(mg0);MUSB.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(mg0);
 SFXB=AC.createGain();SFXB.gain.value=1;SFXB.connect(mg0);const n=AC.sampleRate;NOISEB=AC.createBuffer(1,n,n);const d=NOISEB.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;nt=AC.currentTime;setInterval(sched,40);initAmb()}catch(e){AC=null}}
function tone(f,t,d,ty,v,mu){if(!AC)return;v*=mu?S.vol.mu:S.vol.s;if(v<=0)return;const o=AC.createOscillator(),e=AC.createGain();o.type=ty;o.frequency.value=f;e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(v,t+Math.min(.012,d*.2));e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);e.connect(mu?(MUSB||mg0):(SFXB||mg0));o.start(t);o.stop(t+d+.03)}
function sweep(f0,f1,t,d,ty,v){if(!AC)return;v*=S.vol.s;const o=AC.createOscillator(),e=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);e.connect(SFXB||mg0);o.start(t);o.stop(t+d+.03)}
function noiseB(t,d,v,type,f,q,f2){if(!AC||!NOISEB)return;v*=S.vol.s;const s=AC.createBufferSource();s.buffer=NOISEB;const fl=AC.createBiquadFilter(),e=AC.createGain();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q||1;e.gain.setValueAtTime(.0001,t);e.gain.linearRampToValueAtTime(v,t+Math.min(.05,d*.3));e.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(e);e.connect(SFXB||mg0);s.start(t,Math.random()*.5);s.stop(t+d+.05)}
function sched(){if(!AC||S.mute)return;if(nt<AC.currentTime-.5)nt=AC.currentTime;const s=SONGS[song]||SONGS.world;while(nt<AC.currentTime+.2){const n=s.l[st%s.l.length];if(n>X)tone(fq(n),nt,s.dt*1.7,s.lt,.03,1);if(st%4==0)tone(fq(s.b[(st>>2)%s.b.length]),nt,s.dt*3.6,'triangle',.11,1);
 if(s.dr==2){if(st%4==0)noiseB(nt,.07,.05*S.vol.mu/Math.max(.01,S.vol.s),'lowpass',160,1);if(st%2==1)noiseB(nt,.03,.02*S.vol.mu/Math.max(.01,S.vol.s),'highpass',6000,.7)}
 if(s.dr==1&&st%8==0)noiseB(nt,.5,.012*S.vol.mu/Math.max(.01,S.vol.s),'bandpass',900,.6);nt+=s.dt;st++}}
function sfx(n){if(!AC||S.mute)return;const t=AC.currentTime,A=(arr,o=12,dd=.09,ty='triangle',v=.09)=>arr.forEach((s2,i)=>tone(fq(s2+o),t+i*dd,.22,ty,v));
 switch(n){
 case 'menu':tone(720,t,.035,'sine',.035);break;
 case 'blip':if(tick%2==0)tone(1150,t,.018,'sine',.012);break;
 case 'ok':tone(660,t,.07,'triangle',.06);tone(990,t+.06,.09,'triangle',.06);break;
 case 'back':tone(560,t,.06,'triangle',.05);tone(420,t+.05,.08,'triangle',.05);break;
 case 'open':noiseB(t,.16,.05,'bandpass',500,.8,1800);break;
 case 'door':tone(880,t,.18,'sine',.05);tone(660,t+.12,.26,'sine',.05);break;
 case 'err':tone(170,t,.16,'square',.035);tone(160,t+.02,.16,'square',.03);break;
 case 'step':if(tick-lastStep<6)break;lastStep=tick;noiseB(t,.035,.035,'lowpass',420,.7);break;
 case 'kick':sweep(160,52,t,.11,'sine',.22);noiseB(t,.03,.08,'highpass',2500,.7);break;
 case 'hit':sweep(150,60,t,.09,'sine',.16);noiseB(t,.05,.06,'bandpass',1400,1.2);break;
 case 'save':sweep(120,60,t,.08,'sine',.16);noiseB(t,.09,.09,'bandpass',900,1.5);break;
 case 'whistle':{const o=AC.createOscillator(),lfo=AC.createOscillator(),lg=AC.createGain(),e=AC.createGain();o.frequency.value=2850;lfo.frequency.value=34;lg.gain.value=90;lfo.connect(lg);lg.connect(o.frequency);e.gain.setValueAtTime(.0001,t);for(const [a,b] of [[0,.14],[.2,.34],[.42,.9]]){e.gain.setValueAtTime(.0001,t+a);e.gain.linearRampToValueAtTime(.05*S.vol.s,t+a+.02);e.gain.setValueAtTime(.05*S.vol.s,t+b-.03);e.gain.linearRampToValueAtTime(.0001,t+b)}o.connect(e);e.connect(SFXB);o.start(t);lfo.start(t);o.stop(t+1);lfo.stop(t+1);break}
 case 'goal':noiseB(t,2.2,.16,'bandpass',950,.5);noiseB(t+.1,1.8,.08,'bandpass',2200,.8);A([0,4,7,12],0,.06,'sawtooth',.03);A([7,12,16],12,.12,'triangle',.07);if(amb&&AC)amb.g.gain.setTargetAtTime(S.vol.a*1.2,AC.currentTime,.05);break;
 case 'groan':noiseB(t,1.1,.1,'lowpass',700,.8,250);break;
 case 'coin':tone(988,t,.07,'triangle',.08);tone(1319,t+.07,.14,'triangle',.08);break;
 case 'lvl':A([0,4,7,12,16]);tone(fq(28),t+.45,.4,'sine',.05);break;
 case 'ach':A([7,11,14,19],12,.08);break;
 case 'xfer':[0,4,7].forEach(s2=>tone(fq(s2+12),t,.6,'triangle',.05));A([12,16,19],12,.1,'sine',.05);break;
 case 'troph':A([0,4,7,12,16,19,24],12,.09);[0,4,7].forEach(s2=>tone(fq(s2+24),t+.7,.9,'triangle',.05));noiseB(t+.2,1.6,.1,'bandpass',1000,.5);break;
 default:break}}
function toggleMute(){S.mute=S.mute?0:1;if(mg0)mg0.gain.value=S.mute?0:S.vol.m*.55;save()}
