const CACHE="workout-pwa-v2.0.1";
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./exercise_images/assisted_pullup.svg",
  "./exercise_images/biceps_curl.svg",
  "./exercise_images/cable_crunch.svg",
  "./exercise_images/cable_curl.svg",
  "./exercise_images/captains_chair_leg_raise.svg",
  "./exercise_images/chest_supported_row.svg",
  "./exercise_images/converging_shoulder_press.svg",
  "./exercise_images/dumbbell_bench_press.svg",
  "./exercise_images/hanging_knee_raise.svg",
  "./exercise_images/incline_dumbbell_press.svg",
  "./exercise_images/incline_machine_press.svg",
  "./exercise_images/lat_pulldown.svg",
  "./exercise_images/lateral_raise.svg",
  "./exercise_images/leg_extension.svg",
  "./exercise_images/leg_press.svg",
  "./exercise_images/machine_chest_press.svg",
  "./exercise_images/neutral_lat_pulldown.svg",
  "./exercise_images/overhead_cable_triceps.svg",
  "./exercise_images/prone_leg_curl.svg",
  "./exercise_images/reverse_pec_deck.svg",
  "./exercise_images/romanian_deadlift.svg",
  "./exercise_images/seated_cable_row.svg",
  "./exercise_images/seated_leg_curl.svg",
  "./exercise_images/triceps_pushdown.svg"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 event.respondWith(caches.match(event.request).then(cached=>{
   const network=fetch(event.request).then(response=>{
     if(response&&response.status===200&&response.type!=="opaque"){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
     return response;
   }).catch(()=>cached);
   return cached||network;
 }));
});
