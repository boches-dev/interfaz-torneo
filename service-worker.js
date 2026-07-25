const CACHE_NAME = 'tourney-decks-v1';
const ARCHIVOS = [
    '/menu_app.html',
    '/styles.css'
];

// Instalar — guarda archivos en caché
self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Archivos guardados en caché');
            return cache.addAll(ARCHIVOS);
        })
    );
});

// Activar — limpia cachés viejos
self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch — sirve desde caché si no hay internet
self.addEventListener('fetch', evento => {
    evento.respondWith(
        caches.match(evento.request).then(respuesta => {
            return respuesta || fetch(evento.request);
        })
    );
});