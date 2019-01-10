// imports
importScripts("https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js");
importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");

const _staticCache = "static-V1";
const _dynamicCache = "dynamic-V1";
const _inmutableCache = "inmutable-V1";

const appShell = [
  // '/',
  "index.html",
  "css/style.css",
  "css/mdtoast.min.css",
  "img/favicon.ico",
  "img/avatars/hulk.jpg",
  "img/avatars/ironman.jpg",
  "img/avatars/spiderman.jpg",
  "img/avatars/thor.jpg",
  "img/avatars/wolverine.jpg",
  "js/app.js",
  "js/sw-db.js",
  "js/sw-utils.js",
  "js/mdtoast.min.js"
];

const appShellInmutable = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
  "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js",
  "https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js"
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

self.addEventListener("fetch", e => {
  let result;

  if (e.request.url.includes("/api")) {
    result = ManagementApiMessages(_dynamicCache, e.request);
  } else {
    result = caches.match(e.request).then(resp => {
      if (resp) {
        UpdateStaticCache(_staticCache, e.request, appShellInmutable);
        return resp;
      } else {
        return fetch(e.request).then(newResp => {
          return UpdateDynamicCache(_dynamicCache, e.request, newResp);
        });
      }
    });
  }

  e.respondWith(result);
});

// Tareas asincronas
self.addEventListener("sync", e => {
  if (e.tag === "new-message") {
    // Postear a db cuando hay conexion
   const response = PostMessage();
    e.waitUntil(response);
  }
});

// Escuchar push
self.addEventListener('push', e => {
  const data = JSON.parse( e.data.text());
  const title = data.title;
  const options = {
    body: data.message,
    icon: `img/avatars/${data.user}.jpg`,
    badge: "img/favicon.ico",
    vibrate: [125,75,125,275,200,275,125,75,125,275,200,600,200,600],
    openUrl: '/',
    data: {
      url: '/',
      id: data.user
    },
    actions: [
      {
        action: 'action1',
        title: 'Accion 1',
        icon: 'img/icons/icon-72x72.png'
      },
      {
        action: 'action2',
        title: 'Accion 2',
        icon: 'img/icons/icon-96x96.png'
      }
    ]
  };

  e.waitUntil(self.registration.showNotification(title,options));
});

// Al cerrar notificacion
self.addEventListener('notificationclose', e =>{
  console.log('notificacion cerrada', e)
});

self.addEventListener('notificationclick', e =>{
  const notification = e.notification;
  const action = e.action;

  const resp = clients.matchAll().then(tabs =>{
    let tab = tabs.find(client =>{
      return client.visibilityState === 'visible';
    });

    if(tab !== undefined){
      tab.navigate(notification.data.url);
      tab.focus();
    }else{
      clients.openWindow( notification.data.url );
    }
    
    return notification.close();
  });

  e.waitUntil(resp);
});
