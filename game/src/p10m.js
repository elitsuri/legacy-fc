// ===================== v10 tablets (p10m): a bigger picture and finger-sized touch controls =====================
// Phones keep the touch panel / floating controls of p10g. Tablets (touch screens wider than 640 px) keep the normal layout, where the
// canvas text is already large enough to read, but the picture grows to use the screen and the buttons become finger-sized and
// sit at the bottom of the screen. Nothing here touches game logic.
(function(){const st=document.createElement('style');st.textContent=`
@media (pointer:coarse) and (min-width:641px){
 body:not(.pl9):not(.pp9){min-height:100vh;min-height:100dvh;padding-bottom:max(14px,env(safe-area-inset-bottom))}
 body:not(.pl9):not(.pp9) #hint{display:none}
 body:not(.pl9):not(.pp9) .ctl,body:not(.pl9):not(.pp9)>div:has(.pad){margin-top:auto}
 body:not(.pl9):not(.pp9) .pad{grid-template-columns:repeat(3,84px);gap:8px;margin:10px 18px}body:not(.pl9):not(.pp9) .pad button{width:84px;height:84px;font-size:30px}
 body:not(.pl9):not(.pp9) .ab{gap:10px;margin:10px 18px}body:not(.pl9):not(.pp9) .ab button{width:88px;height:88px;font-size:28px}body:not(.pl9):not(.pp9) .ab .m{width:60px;height:60px;font-size:18px}
}
@media (pointer:coarse) and (min-width:641px) and (orientation:portrait){
 body:not(.pl9):not(.pp9) canvas{width:min(100%,1100px)!important}
}
@media (pointer:coarse) and (min-width:641px) and (orientation:landscape){
 body:not(.pl9):not(.pp9) canvas{width:min(100%,calc((100vh - 200px) * 1.5),1100px)!important;width:min(100%,calc((100dvh - 200px) * 1.5),1100px)!important}
 body:not(.pl9):not(.pp9) .pad{grid-template-columns:repeat(3,76px)}body:not(.pl9):not(.pp9) .pad button{width:76px;height:76px}
 body:not(.pl9):not(.pp9) .ab button{width:80px;height:80px}
}`;document.head.appendChild(st)})();
