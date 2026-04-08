const CACHE_NAME = 'calculadora-concreto-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/header.png',
  '/manifest.json'
];

// Instalar o service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Erro ao cachear arquivos:', err);
      })
  );
  self.skipWaiting();
});

// Ativar o service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar do cache se encontrado
        if (response) {
          return response;
        }

        // Caso contrário, fazer a requisição
        return fetch(event.request).then(response => {
          // Não cachear respostas não-sucesso
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Retornar página offline se disponível
        return caches.match('/index.html');
      })
  );
});
