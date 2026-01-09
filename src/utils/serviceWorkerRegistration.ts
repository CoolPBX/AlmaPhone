export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Workers no soportados')
    return null
  }

  try {
    console.log('[SW] Registrando Service Worker...')
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('[SW] Service Worker registrado exitosamente')

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    return registration
  } catch (error) {
    console.error('[SW] Error registrando:', error)
    return null
  }
}

export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    return await navigator.serviceWorker.ready
  } catch (error) {
    console.error('[SW] Error obteniendo registration:', error)
    return null
  }
}