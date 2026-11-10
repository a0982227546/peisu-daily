const CACHE='peisu-daily-official-31-5-35-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new Request(file,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('peisu-daily-official-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const html=request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/');
 if(html){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   try{
    const response=await fetch(request,{cache:'no-store'});
    if(!response.ok)throw new Error('unavailable');
    await cache.put(request,response.clone());return response;
   }catch(error){
    return await cache.match(request)||await cache.match('./index.html')||new Response('目前離線，請在連線時開啟一次遊戲。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }
  })());return;
 }
 if(!FILES.some(file=>new URL(file,self.registration.scope).href===url.href))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const saved=await cache.match(request);if(saved)return saved;
  const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;
 }));
});
