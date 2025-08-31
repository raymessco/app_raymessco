function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("preview");

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.classList.add("hidden");
  }
}
const CACHE_NAME = "ray-mess-co-v4";
const STATIC_ASSETS = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "/"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("index.html").then(cached => cached || fetch(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(resp => {
        if (resp && resp.ok && (event.request.destination === "image")) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => caches.match("icon-192.png"));
    })
  );
});

