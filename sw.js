const CACHE="workout-pwa-v2.1.2";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-192.svg","./icons/icon-512.svg","./pwa-enhancements.js"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting();});
function enhanceHtml(text){
 text=text.replaceAll("2.0.1","2.1.2").replaceAll("2.1.0","2.1.2").replaceAll("2.1.1","2.1.2").replace("Build 2026-09-11","Build 2026-09-11 · custom images + update manager");
 const old='const img=document.getElementById("helpImage");img.src=INLINE_EXERCISE_IMAGES[info.img]||("./exercise_images/"+info.img);img.alt="איור התחלה וסיום עבור "+info.title;';
 const replacement='const img=document.getElementById("helpImage");const fallbackImg=INLINE_EXERCISE_IMAGES[info.img]||("./exercise_images/"+info.img);window.loadExerciseImage?window.loadExerciseImage(img,ex.infoId,info,fallbackImg):img.src=fallbackImg;img.alt="איור התחלה וסיום עבור "+info.title;';
 text=text.replace(old,replacement);
 if(!text.includes('pwa-enhancements.js')) text=text.replace("</body>",'<script src="./pwa-enhancements.js"></script></body>');
 return text;
}
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 const isImageMap=url.pathname.endsWith("/exercise-images.json");
 if(isImageMap){
   event.respondWith(
     fetch(event.request,{cache:"no-store"}).then(r=>{
       if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put("./exercise-images.json",copy));}
       return r;
     }).catch(()=>caches.match("./exercise-images.json"))
   );
   return;
 }
 const isNav=event.request.mode==="navigate"||url.pathname.endsWith("/index.html")||url.pathname.endsWith("/workout-tracker/");
 if(isNav){
   event.respondWith(fetch(event.request,{cache:"no-store"}).then(async r=>{
     if(!r.ok)throw 0;
     const out=new Response(enhanceHtml(await r.text()),{status:r.status,headers:{"Content-Type":"text/html; charset=utf-8"}});
     caches.open(CACHE).then(c=>c.put("./index.html",out.clone()));
     return out;
   }).catch(()=>caches.match("./index.html").then(async r=>r?new Response(enhanceHtml(await r.text()),{headers:{"Content-Type":"text/html; charset=utf-8"}}):caches.match("./"))));
   return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return r})));
});