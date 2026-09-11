(()=>{
  const FALLBACKS=window.INLINE_EXERCISE_IMAGES||{};
  let imageMap={};
  fetch('./exercise-images.json',{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(x=>{imageMap=x||{}}).catch(()=>{});

  window.loadExerciseImage=(img,exerciseId,info)=>{
    const custom=imageMap[exerciseId];
    const fallback=FALLBACKS[info.img]||('./exercise_images/'+info.img);
    img.onerror=()=>{img.onerror=null;img.src=fallback};
    img.src=custom||fallback;
  };

  function showUpdate(reg){
    if(document.getElementById('pwaUpdateBanner')) return;
    const bar=document.createElement('div');
    bar.id='pwaUpdateBanner';
    bar.dir='rtl';
    bar.style.cssText='position:fixed;left:10px;right:10px;bottom:86px;z-index:9999;max-width:840px;margin:auto;background:#111827;color:white;padding:12px 14px;border-radius:14px;box-shadow:0 8px 28px #0004;display:flex;gap:10px;align-items:center;justify-content:space-between;font-family:system-ui';
    bar.innerHTML='<b>גרסה חדשה זמינה</b><button id="pwaUpdateNow" style="border:0;border-radius:10px;padding:9px 14px;font-weight:800;cursor:pointer">עדכן</button>';
    document.body.appendChild(bar);
    bar.querySelector('#pwaUpdateNow').onclick=()=>{reg.waiting?.postMessage({type:'SKIP_WAITING'});bar.querySelector('button').disabled=true;bar.querySelector('button').textContent='מעדכן…'};
  }

  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(reg=>{
      if(reg.waiting) showUpdate(reg);
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller) showUpdate(reg)});
      });
      setInterval(()=>reg.update().catch(()=>{}),60*60*1000);
    });
    let refreshing=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()});
  }
})();
