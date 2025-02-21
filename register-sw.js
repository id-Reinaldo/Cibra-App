const CACHE = "nome-offline";
const swVersion = "5";
const offlineFallbackPage = "index.html";
self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA Builder] Cached offline page during install");
      return cache.add(offlineFallbackPage);
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var blockedResources =
    event.request.url.includes('http://' + self.location.hostname) ||
    event.request.url.includes('https://' + self.location.hostname) ||
    event.request.url.includes('https://' + self.location.hostname + '/v1/?')
  if (event.request.url.includes('jsdelivr.net')) {
  } else if (!blockedResources) {
    console.log('Skipped cache for URL:', event.request.url)
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        console.log("Add page to offline cache: " + response.url);
        event.waitUntil(updateCache(event.request, response.clone()));

        return response;
      })
      .catch(function (error) {
        console.log("Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  );
});

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}



if ("serviceWorker" in navigator) {
	if (navigator.serviceWorker.controller) {
		console.log("Active service worker found, no need to register");
	} else {
		// Register the service worker
		navigator.serviceWorker
			.register("/sw.js", {
				scope: "./"
			})
			.then(function (reg) {
				console.log("Service worker has been registered for scope: " + reg.scope);
			});
	}
}
  