(()=>{
 let imageMap={};
 fetch('./exercise-images.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(x=>{imageMap=x||{}}).catch(()=>{});
 window.loadExerciseImage=(img,exerciseId,info,fallback)=>{
   const custom=imageMap[exerciseId];
   if(!custom){img.onerror=null;img.src=fallback;return;}
   img.onerror=()=>{img.onerror=null;img.src=fallback};img.src=custom;
 };
 function showUpdate(reg){
   if(document.getElementById('pwaUpdateBanner'))return;
   const bar=document.createElement('div');bar.id='pwaUpdateBanner';bar.dir='rtl';
   bar.style.cssText='position:fixed;left:10px;right:10px;bottom:86px;z-index:9999;max-width:840px;margin:auto;background:#111827;color:white;padding:12px 14px;border-radius:14px;box-shadow:0 8px 28px #0004;display:flex;gap:10px;align-items:center;justify-content:space-between;font-family:system-ui';
   bar.innerHTML='<b>גרסה חדשה זמינה</b><button id="pwaUpdateNow" style="border:0;border-radius:10px;padding:9px 14px;font-weight:800;cursor:pointer">עדכן</button>';
   document.body.appendChild(bar);bar.querySelector('#pwaUpdateNow').onclick=()=>{reg.waiting?.postMessage({type:'SKIP_WAITING'});const b=bar.querySelector('button');b.disabled=true;b.textContent='מעדכן…'};
 }
 if('serviceWorker' in navigator){navigator.serviceWorker.ready.then(reg=>{if(reg.waiting)showUpdate(reg);reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg)})});setInterval(()=>reg.update().catch(()=>{}),3600000)});let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()})}
})();