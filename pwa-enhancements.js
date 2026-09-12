(()=>{
 let imageMap={};
 async function refreshImageMap(){
   try{
     const r=await fetch('./exercise-images.json',{cache:'no-store'});
     imageMap=r.ok?(await r.json()||{}):{};
   }catch{}
 }
 refreshImageMap();

 window.loadExerciseImage=(img,exerciseId,info,fallback)=>{
   const custom=imageMap[exerciseId];
   if(!custom){img.onerror=null;img.src=fallback;return;}
   img.onerror=()=>{img.onerror=null;img.src=fallback};
   img.src=custom;
 };

 // Keep new/unsaved workouts on the phone's current local date, even offline.
 // Existing saved sessions opened for editing keep their original date.
 try{
   const now=new Date();
   const localToday=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
   const editingSavedSession=typeof db!=='undefined'&&typeof draft!=='undefined'&&draft&&Array.isArray(db.sessions)&&db.sessions.some(s=>s.id===draft.id);
   if(typeof draft!=='undefined'&&draft&&!editingSavedSession&&draft.date!==localToday){
     draft.date=localToday;
     const dateInput=document.getElementById('date');
     if(dateInput)dateInput.value=localToday;
     if(typeof KEY!=='undefined')localStorage.setItem(KEY+'_draft',JSON.stringify(draft));
     if(typeof renderExercises==='function')renderExercises();
     if(typeof updateSummary==='function')updateSummary();
   }
 }catch{}

 function showUpdate(reg){
   if(document.getElementById('pwaUpdateBanner'))return;
   const bar=document.createElement('div');
   bar.id='pwaUpdateBanner';
   bar.dir='rtl';
   bar.style.cssText='position:fixed;left:10px;right:10px;bottom:86px;z-index:9999;max-width:840px;margin:auto;background:#111827;color:white;padding:12px 14px;border-radius:14px;box-shadow:0 8px 28px #0004;display:flex;gap:10px;align-items:center;justify-content:space-between;font-family:system-ui';
   bar.innerHTML='<b>גרסה חדשה זמינה</b><button id="pwaUpdateNow" style="border:0;border-radius:10px;padding:9px 14px;font-weight:800;cursor:pointer">עדכן</button>';
   document.body.appendChild(bar);
   bar.querySelector('#pwaUpdateNow').onclick=()=>{
     const b=bar.querySelector('button');
     b.disabled=true;
     b.textContent='מעדכן…';
     reg.waiting?.postMessage({type:'SKIP_WAITING'});
   };
 }

 if('serviceWorker' in navigator){
   navigator.serviceWorker.ready.then(async reg=>{
     if(reg.waiting)showUpdate(reg);
     reg.addEventListener('updatefound',()=>{
       const w=reg.installing;
       w?.addEventListener('statechange',()=>{
         if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdate(reg);
       });
     });
     try{await reg.update();}catch{}
     setInterval(()=>reg.update().catch(()=>{}),15*60*1000);
   });
   let refreshing=false;
   navigator.serviceWorker.addEventListener('controllerchange',()=>{
     if(refreshing)return;
     refreshing=true;
     location.reload();
   });
 }
})();