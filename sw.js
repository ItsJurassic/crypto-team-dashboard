// Shell-only cache so the home-screen app opens fast; data and prices always go to the network.
const C="ckpi-v1",SHELL=["./","index.html","style.css","app.js","manifest.webmanifest","apple-touch-icon.png","icons/icon-192.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.includes("/data/"))return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
