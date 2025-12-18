// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('install', (event) => {
    console.log('[SW] 🚀 Service Worker instalado');
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
    console.log('[SW] � activated Service Worker activado');
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 🔔 Notificación clickeada. Acción:', event.action);
  
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (!action) {
    event.waitUntil(focusWindow());
    return;
  }

  event.waitUntil(handleNotificationClick(action));
});

async function focusWindow() {
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  let client = clientList.find(c => c.visibilityState === 'visible');
  
  if (!client && clientList.length > 0) {
    client = clientList[0];
  }
  
  if (client && 'focus' in client) {
    return client.focus();
  }
  
  if (clients.openWindow) {
    return clients.openWindow('/');
  }
}

async function handleNotificationClick(action) {
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  
  let client = clientList.find(c => c.visibilityState === 'visible');
  if (!client && clientList.length > 0) client = clientList[0];

  if (client) {
    console.log('[SW] 🎯 Cliente encontrado, intentando enfocar...');
    
    if ('focus' in client) {
      await client.focus();
    }

    console.log(`[SW] 📨 Enviando acción: ${action}`);
    client.postMessage({
      type: 'CALL_ACTION',
      action: action
    });
  } else {
    console.log('[SW] ❌ No se encontró ventana del softphone abierta');
  }
}