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

function UpdateStaticCache(staticCacheName, req, appShellInmutable) {
  if (appShellInmutable.includes(req.url)) {
    // No hace falta actualizar el inmutable
    // console.log('existe en inmutable', req.url );
  } else {
    // console.log('actualizando', req.url );
    return fetch(req).then(res => {
      return UpdateDynamicCache(staticCacheName, req, res);
    });
  }
}

// Network with cache fallback / update
function ManagementApiMessages(dynamicCacheName, req) {

  if((req.url.indexOf('/api/key') >= 0) || (req.url.indexOf('/api/subscribe') >= 0))  {
    return fetch(req);
  }else if (req.clone().method === "POST") {
    //posteo de un nuevo mensaje
    if (self.registration.sync) {
      return req
        .clone()
        .text()
        .then(body => {
          const bodyObj = JSON.parse(body);
          return SaveMessage(bodyObj);
        });
    } else {
      return fetch(req);
    }
  } else {
    return fetch(req)
      .then(resp => {
        if (resp.ok) {
          UpdateDynamicCache(dynamicCacheName, req, resp.clone());
          return resp.clone();
        } else {
          return caches.match(req);
        }
      })
      .catch(err => {
        return caches.match(req);
      });
  }
}
