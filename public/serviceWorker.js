// serviceWorker.js

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
    console.log('[ServiceWorker] Push event received!', event);
    if (event.data) {
        let payload = {};
        try {
            payload = event.data.json();
            console.log('[ServiceWorker] Payload:', payload);
        } catch (e) {
            payload = { title: 'New Notification', body: event.data.text() };
            console.log('[ServiceWorker] Payload (Text):', payload);
        }

        const options = {
            body: payload.body,
            icon: payload.icon || '/logo192.png',
            badge: '/logo192.png',
            vibrate: [200, 100, 200],
            tag: 'bizlink-notif-' + Date.now(), // Unique tag forces a new banner
            renotify: true,
            requireInteraction: true, // Forces banner to stay visible until dismissed
            data: {
                url: (payload.data && payload.data.url) ? payload.data.url : '/'
            }
        };

        const title = payload.title || 'BizLink';
        event.waitUntil(self.registration.showNotification(title, options));

        // Broadcast to all open tabs so the app can show a toast
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'PUSH_NOTIFICATION',
                        payload: {
                            title: title,
                            body: payload.body,
                            url: options.data.url
                        }
                    });
                });
            })
        );

        console.log('[ServiceWorker] Notification shown and broadcasted to clients');
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (windowClients) {
            let matchingClient = null;
            // Target the exact URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen)) {
                    matchingClient = client;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
