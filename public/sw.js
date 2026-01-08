// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activado');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[SW] Service Worker tomó control de todos los clientes');
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (!action) {
    console.log('[SW] Click en el cuerpo, enfocando ventana...');
    event.waitUntil(focusWindow());
    return;
  }

  console.log('[SW] Click en boton:', action);
  event.waitUntil(handleNotificationClick(action));
});

async function focusWindow() {
  console.log('[SW] focusWindow() iniciado');
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  console.log('[SW] Clientes encontrados:', clientList.length);
  
  let client = clientList.find(c => c.visibilityState === 'visible');
  
  if (!client && clientList.length > 0) {
    client = clientList[0];
  }
  
  if (client && 'focus' in client) {
    console.log('[SW] Enfocando cliente existente');
    return client.focus();
  }
  
  if (clients.openWindow) {
    console.log('[SW] Abriendo nueva ventana');
    return clients.openWindow('/');
  }
}

async function handleNotificationClick(action) {
  console.log('[SW] handleNotificationClick() iniciado con accion:', action);
  
  const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  console.log('[SW] Clientes encontrados:', clientList.length);
  
  let client = clientList.find(c => c.visibilityState === 'visible');
  if (!client && clientList.length > 0) {
    client = clientList[0];
    console.log('[SW] Usando primer cliente disponible');
  }

  if (client) {    
    if ('focus' in client) {
      await client.focus();
    }
        
    client.postMessage({
      type: 'CALL_ACTION',
      action: action
    });
    
    console.log('[SW] Mensaje enviado exitosamente');
  } else {
    console.log('[SW] ERROR: No se encontro ninguna ventana del softphone abierta');
  }
}