const CACHE="workout-pwa-v2.1.0";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-192.svg","./icons/icon-512.svg","./exercise-images.json"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  // Do not skipWaiting: future versions can wait until the user presses Update.
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("message",event=>{
  if(event.data?.type==="SKIP_WAITING") self.skipWaiting();
});

function enhanceHtml(text){
  text=text.replaceAll("2.0.1","2.1.0").replace("Build 2026-09-11","Build 2026-09-11 · image overrides + update manager");
  const old='const img=document.getElementById("helpImage");img.src=INLINE_EXERCISE_IMAGES[info.img]||("./exercise_images/"+info.img);img.alt="איור התחלה וסיום עבור "+info.title;';
  const replacement='const img=document.getElementById("helpImage");window.loadExerciseImage?window.loadExerciseImage(img,ex.infoId,info):img.src=(INLINE_EXERCISE_IMAGES[info.img]||("./exercise_images/"+info.img));img.alt="איור התחלה וסיום עבור "+info.title;';
  text=text.replace(old,replacement);
  const injected=`<script src="./pwa-enhancements.js"></script>`;
  return text.replace("</body>",injected+"</body>");
}

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  const isNavigation=event.request.mode==="navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/workout-tracker/");
  if(isNavigation){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(async response=>{
      if(!response.ok) throw new Error("network");
      const html=enhanceHtml(await response.text());
      const enhanced=new Response(html,{status:response.status,statusText:response.statusText,headers:{"Content-Type":"text/html; charset=utf-8"}});
      const copy=enhanced.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy));
      return enhanced;
    }).catch(()=>caches.match("./index.html").then(async cached=>{
      if(!cached) return caches.match("./");
      const html=enhanceHtml(await cached.text());
      return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8"}});
    })));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return response;
  })));
});