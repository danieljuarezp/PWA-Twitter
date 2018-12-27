// Guardar el cache dinamico
function UpdateDynamicCache(dynamicCacheName, req, res) {
  if (res.ok) {
    return caches.open(dynamicCacheName).then(cache => {
      cache.put(req, res.clone());
      return res.clone();
    });
  } else {
    return res;
  }
}
