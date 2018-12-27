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

function UpdateStaticCache(staticCacheName, req, appShellInmutable){
  if ( appShellInmutable.includes(req.url) ) {
    // No hace falta actualizar el inmutable
    // console.log('existe en inmutable', req.url );

} else {
    // console.log('actualizando', req.url );
    return fetch( req )
            .then( res => {
                return UpdateDynamicCache( staticCacheName, req, res );
            });
}
}
