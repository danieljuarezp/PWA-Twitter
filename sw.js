const _staticCache = "static-V1";
const _dynamicCache = "dynamic-V1";
const _inmutableCache = "inmutable-V1";

const appShell = [
  "/",
  "index.html",
  "css/style.css",
  "img/favicon.ico",
  "avatars/hulk.jpg",
  "avatars/ironman.jpg",
  "avatars/spiderman.jpg",
  "avatars/thor.jpg",
  "avatars/wolverine.jpg",
  "js/app.js"
];

const appShellInmutable = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
  "css/animate.css",
  "js/libs/jquery.js"
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
    });
  });
  e.waitUntil(result);
});
