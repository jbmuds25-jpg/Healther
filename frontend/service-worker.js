/**
 * Healther AI Service Worker
 * 
 * Enables:
 * - Offline functionality
 * - Intelligent caching strategies
 * - Push notifications
 * - Background sync
 */

const CACHE_NAME = 'healther-v1';
const RUNTIME_CACHE = 'healther-runtime-v1';
const API_CACHE = 'healther-api-v1';

// Assets to pre-cache (shell)
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/citizen/citizen.html',
    '/doctor/doctor.html',
    '/scientist/scientist.html',
    '/hospital/hospital.html',
    '/management/management.html',
    '/auth/auth.html',
    '/global/style.css',
    '/global/nav.css',
    '/global/light.css',
    '/global/dark.css',
    '/global/components.css',
    '/global/assistant.css',
    '/global/assistant.js',
    '/global/healtherAIClient.js',
    '/global/navigation.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

/**
 * Install event - cache the shell
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching shell assets');
                return cache.addAll(SHELL_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[ServiceWorker] Install error:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME &&
                                   cacheName !== RUNTIME_CACHE &&
                                   cacheName !== API_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch event - intelligent caching strategy
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and external URLs
    if (request.method !== 'GET') {
        return;
    }

    // API requests - network first with cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }

    // HTML pages - network first
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
        return;
    }

    // CSS, JS, images - cache first with network fallback
    if (url.pathname.match(/\.(css|js|jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf|otf|eot)$/)) {
        event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
        return;
    }

    // Everything else - network first
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

/**
 * Network First Strategy
 * Try network first, fallback to cache, then offline response
 */
function networkFirstStrategy(request, cacheName) {
    return fetch(request)
        .then((response) => {
            // Cache successful responses
            if (response.ok) {
                const clonedResponse = response.clone();
                caches.open(cacheName)
                    .then((cache) => {
                        cache.put(request, clonedResponse);
                    });
            }
            return response;
        })
        .catch(() => {
            // Fallback to cache
            return caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Return offline response
                    if (request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/offline.html') || createOfflineResponse();
                    }
                    
                    return createOfflineResponse();
                });
        });
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
function cacheFirstStrategy(request, cacheName) {
    return caches.match(request)
        .then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const clonedResponse = response.clone();
                        caches.open(cacheName)
                            .then((cache) => {
                                cache.put(request, clonedResponse);
                            });
                    }
                    return response;
                })
                .catch(() => createOfflineResponse());
        });
}

/**
 * Create offline fallback response
 */
function createOfflineResponse() {
    return new Response(
        'You are offline. This content is not available. Please check your connection.',
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        }
    );
}

/**
 * Push notification event
 */
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');
    
    const options = {
        badge: '/assets/icons/badge-72x72.png',
        icon: '/assets/icons/icon-192x192.png',
        body: 'New message from Healther',
        tag: 'healther-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.title = data.title || 'Healther';
        } catch (e) {
            options.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification('Healther', options)
    );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');
    
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

/**
 * Background sync for offline messages
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            clients.matchAll()
                .then((clients) => {
                    return Promise.all(
                        clients.map((client) => {
                            return client.postMessage({
                                type: 'SYNC_MESSAGES'
                            });
                        })
                    );
                })
        );
    }
});

/**
 * Message from clients
 */
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('[ServiceWorker] Script loaded');
