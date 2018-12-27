// imports
importScripts('js/sw-utils.js');

const _staticCache = "static-V3";
const _dynamicCache = "dynamic-V2";
const _inmutableCache = "inmutable-V1";

const appShell = [
  // '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js',
  'js/sw-utils.js'
];

const appShellInmutable = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js'
];

self.addEventListener("install", e => {
   const cacheStatic = caches
    .open(_staticCache)
    .then(cache => cache.addAll(appShell));

 const cacheInmutable = caches
    .open(_inmutableCache)
    .then(cache => cache.addAll(appShellInmutable));

 e.waitUntil(Promise.all([cacheStatic, cacheInmutable])); 

});

self.addEventListener("activate", e => {
  const result = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== _staticCache && key.includes("static")) {
        return caches.delete(key);
      }

      if (key !== _dynamicCache && key.includes("dynamic")) {
        return caches.delete(key);
      }

    });
  });
  e.waitUntil(result);
});


self.addEventListener('fetch', e =>{

  const result = caches.match( e.request )
  .then( resp => {
    if(resp){
      UpdateStaticCache(_staticCache, e.request, appShellInmutable);
      return resp;
    }else{  
      return fetch(e.request)
      .then( newResp => {
        return UpdateDynamicCache(_dynamicCache, e.request, newResp);
      });

    }
  });

  e.respondWith( result );
});
