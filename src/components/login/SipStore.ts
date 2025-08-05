import { defineStore } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { URI } from 'sip.js/lib/grammar/uri'
import { type SimpleUserDelegate, type SimpleUserOptions } from 'sip.js/lib/platform/web'
import { ref } from 'vue'
import type { BlfItemDto } from '../blf/domain/shemas/BlfsShemas'
import { SimpleUser } from '@/core/simple-user'
import type { Subscription } from 'sip.js/lib/api/subscription'
import type { OutgoingSubscribeRequestDelegate } from 'sip.js/lib/core/messages/methods/subscribe'
import type { OutgoingRequestMessageOptions } from 'sip.js/lib/core/messages/outgoing-request-message'

export const useSipStore = defineStore('sip', () => {
  const simpleUser = ref<SimpleUser | null>(null)
  const isConnected = ref(false)
  const isRegistered = ref(false)
  const voicemail = ref({ new: 0, old: 0 })
  const isDnd = ref(false)
  const isAutoAnswer = ref(false)
  const callState = ref<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle')
  const connectionState = ref<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>(
    'disconnected',
  )
  const blfExtensions = ref<BlfItemDto[]>([])
  const callStartTime = ref<Date | null>(null)
  const error = ref<string | null>(null)
  const isMuted = ref(false)
  const isOnHold = ref(false)
  const toast = useToast()

  interface BlfSubscription {
    subscription: Subscription
    timer?: number
  }

  const blfSubscriptions = ref<Map<string, BlfSubscription>>(new Map())

  const audioElement = ref<HTMLAudioElement | null>(null)

  const sipConfig = ref({
    server: 'wss://hornblower.doesntexist.org:7443',
    username: '',
    password: '',
    domain: 'hornblower.doesntexist.org',
    displayName: 'LDLQ2',
  })

  const subscribeToBlfStatus = async (extension: string): Promise<void> => {
    try {
      if (!simpleUser.value || !isRegistered.value) {
        console.log('No se puede suscribir a BLF, SIP no está listo')
        return
      }

      const userAgentCore = simpleUser.value.getSessionManager().userAgent.userAgentCore

      const targetURI = new URI('sip', extension, sipConfig.value.domain)
      const fromURI = new URI('sip', sipConfig.value.username, sipConfig.value.domain)
      const toURI = targetURI.clone()

      // Opciones del mensaje
      const options: OutgoingRequestMessageOptions = {
        cseq: 1,
        callId: userAgentCore.configuration.sipjsId, 
        fromTag: userAgentCore.configuration.sipjsId, 
        fromDisplayName: sipConfig.value.displayName,
        toDisplayName: extension,
        routeSet: [], 
      }

      // Headers adicionales
      const extraHeaders = [
        `Event: dialog`,
        `Accept: application/dialog-info+xml`,
        `Expires: 3600`,
        `Contact: <sip:${sipConfig.value.username}@${sipConfig.value.domain};transport=ws>`,
      ]

      const subscribeRequest = userAgentCore.makeOutgoingRequestMessage(
        'SUBSCRIBE',
        targetURI,
        fromURI,
        toURI, 
        options, 
        extraHeaders,
      )

      const delegate: OutgoingSubscribeRequestDelegate = {
        onAccept: (response) => {
          console.log(`Suscripción BLF aceptada para ${extension}`, response)
        },
        onReject: (response) => {
          console.error(`Suscripción BLF rechazada para ${extension}`, response)
          updateBlfStatus(extension, 'unavailable')
        },
        onNotify: (notification) => {
          parseBlfNotification(extension, notification)
        },
      }

      const subscription = userAgentCore.subscribe(subscribeRequest, delegate)

      // Guardar la suscripción
      blfSubscriptions.value.set(extension, {
        state: 'active',
        ...subscription,
      })

      console.log(`Suscripción BLF creada para ${extension}`)
    } catch (error) {
      console.error(`Error en suscripción BLF para ${extension}:`, error)
      updateBlfStatus(extension, 'unavailable')
    }
  }
  const unsubscribeFromBlfStatus = async (extension: string): Promise<void> => {
    try {
      const subscription = blfSubscriptions.value.get(extension)
      if (subscription) {
        // Enviar SUBSCRIBE con Expires: 0 para cancelar
        await subscription.unsubscribe()
        blfSubscriptions.value.delete(extension)
        console.log(`Unsubscribed from BLF status for extension ${extension}`)
      }
    } catch (error) {
      console.error(`Error unsubscribing from BLF for ${extension}:`, error)
    }
  }

  const parseBlfNotification = (extension: string, notification: any): void => {
    try {
      const body = notification.request?.body
      if (!body) return

      // Parsear el XML del dialog-info
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(body, 'text/xml')

      const dialogInfo = xmlDoc.querySelector('dialog-info')
      const dialogs = xmlDoc.querySelectorAll('dialog')

      let status: BlfItemDto['status'] = 'idle'

      if (dialogs.length === 0) {
        // No hay diálogos activos = idle
        status = 'idle'
      } else {
        for (const dialog of dialogs) {
          const state = dialog.getAttribute('state')
          const direction = dialog.getAttribute('direction')

          if (state === 'trying' || state === 'proceeding') {
            status = 'ringing'
            break
          } else if (state === 'confirmed') {
            status = 'busy'
            break
          }
        }
      }

      updateBlfStatus(extension, status)
      console.log(`BLF status updated for ${extension}: ${status}`)
    } catch (error) {
      console.error(`Error parsing BLF notification for ${extension}:`, error)
      updateBlfStatus(extension, 'unavailable')
    }
  }

  const subscribeToAllBlfs = async (): Promise<void> => {
    if (!blfExtensions.value || blfExtensions.value.length === 0) return

    for (const blf of blfExtensions.value) {
      await subscribeToBlfStatus(blf.extension)
      // Pequeña pausa entre suscripciones para evitar spam
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  const unsubscribeFromAllBlfs = async (): Promise<void> => {
    for (const [extension] of blfSubscriptions.value) {
      await unsubscribeFromBlfStatus(extension)
    }
    blfSubscriptions.value.clear()
  }

  const createSimpleUserDelegate = (): SimpleUserDelegate => ({
    onCallCreated: (): void => {
      console.log('Call created')
      callState.value = 'calling'
      callStartTime.value = new Date()
    },
    onCallReceived: async (): Promise<void> => {
      console.log('Call received')
      if (isDnd.value) {
        console.log('Llamada entrante ignorada por DND')
        simpleUser.value?.hangup()
        return
      }
      callState.value = 'ringing'

      if (isAutoAnswer.value) {
        console.log('Auto-answer enabled, answering call')
        try {
          await simpleUser.value?.answer()
        } catch (err) {
          console.error('Error auto-answering call:', err)
          error.value = err instanceof Error ? err.message : 'Error auto-answering call'
        }
      }
    },
    onCallAnswered: (): void => {
      console.log('Call answered')
      callState.value = 'connected'
      toast.add({
        severity: 'success',
        summary: 'Call Answered',
        detail: 'You are now connected to the call.',
        life: 3000,
      })
    },
    onCallHangup: (): void => {
      console.log('Call hangup')
      callState.value = 'ended'
      callStartTime.value = null
      isMuted.value = false
      isOnHold.value = false
      toast.add({
        severity: 'info',
        summary: 'Call Ended',
        detail: 'The call has been ended.',
        life: 3000,
      })
    },
    onCallHold: (held: boolean): void => {
      console.log(`Call hold ${held}`)
      isOnHold.value = held
    },
    onRegistered: async (): Promise<void> => {
      console.log('Registered')
      toast.add({
        severity: 'success',
        summary: 'Registered',
        detail: 'You are registered to receive calls.',
        life: 3000,
      })
      isRegistered.value = true
      // Suscribirse a MWI
      await subscribeMWI()

      // Suscribirse a todos los BLFs existentes
      await subscribeToAllBlfs()
    },
    onUnregistered: async (): Promise<void> => {
      console.log('Unregistered')
      connectionState.value = 'disconnected'
      toast.add({
        severity: 'warn',
        summary: 'Unregistered',
        detail: 'You are no longer registered to receive calls.',
        life: 3000,
      })
      isRegistered.value = false
      // Desuscribirse de todos los BLFs
      await unsubscribeFromAllBlfs()

      // Marcar todos los BLFs como unavailable
      if (blfExtensions.value) {
        for (const blf of blfExtensions.value) {
          blf.status = 'unavailable'
        }
      }

      console.log('Unregistered from SIP server', isRegistered.value)
    },
    onServerConnect: (): void => {
      console.log('Server connected')
      isConnected.value = true
      connectionState.value = 'connected'
    },
    onServerDisconnect: async (): Promise<void> => {
      console.log('Server disconnected')
      isConnected.value = false
      isRegistered.value = false
      connectionState.value = 'disconnected'

      // Limpiar suscripciones BLF
      await unsubscribeFromAllBlfs()

      // Marcar todos los BLFs como unavailable
      if (blfExtensions.value) {
        for (const blf of blfExtensions.value) {
          blf.status = 'unavailable'
        }
      }

      toast.add({
        severity: 'error',
        summary: 'Server Disconnected',
        detail: 'Connection to the server was lost. Attempting to reconnect...',
        life: 5000,
      })

      setTimeout(() => {
        if (simpleUser.value && connectionState.value === 'disconnected') {
          reconnect()
        }
      }, 5000)
    },
    onMessageReceived: (message: string): void => {
      console.log('Message received:', message)

      if (message.includes('Messages-Waiting:') || message.includes('Message-Waiting:')) {
        parseMWIMessage(message)
      }
    },
  })

  const initializeSip = async (
    config: {
      server?: string
      username: string
      password: string
      domain?: string
      displayName: string
    },
    remoteAudio?: HTMLAudioElement,
  ): Promise<boolean> => {
    try {
      const finalConfig = {
        server: config.server || sipConfig.value.server,
        username: config.username,
        password: config.password,
        domain: config.domain || sipConfig.value.domain,
        displayName: config.displayName || sipConfig.value.displayName,
      }

      sipConfig.value = { ...sipConfig.value, ...finalConfig }

      if (remoteAudio) {
        audioElement.value = remoteAudio
      }

      connectionState.value = 'connecting'
      error.value = null

      const webSocketServer = sipConfig.value.server

      const simpleUserOptions: SimpleUserOptions = {
        delegate: createSimpleUserDelegate(),
        media: {
          remote: {
            audio: audioElement.value || undefined,
          },
        },
        registererOptions: {
          regId: 1,
          expires: 120,
        },
        userAgentOptions: {
          displayName: sipConfig.value.displayName,
          authorizationUsername: sipConfig.value.username,
          authorizationPassword: sipConfig.value.password,
          uri: new URI('sip', sipConfig.value.username, sipConfig.value.domain),
          transportOptions: {
            server: webSocketServer,
            connectionTimeout: 10000,
            keepAliveInterval: 30000,
            traceSip: true,
            allowLegacyNotifications: true,
            wsServerMaxReconnection: 5000,
            wsServerReconnectionTimeout: 1,
            connectionRecoveryMaxInterval: 3,
            connectionRecoveryMinInterval: 2,
          },
          contactParams: {
            transport: 'wss',
          },
        },
      }

      simpleUser.value = new SimpleUser(webSocketServer, simpleUserOptions)

      await simpleUser.value.connect()
      await simpleUser.value.register()
      saveSipConfigToStorage()

      return true
    } catch (err) {
      console.error('Error inicializando SIP:', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      connectionState.value = 'disconnected'
      return false
    }
  }

  const reconnect = async (): Promise<void> => {
    if (simpleUser.value) {
      connectionState.value = 'reconnecting'
      try {
        await simpleUser.value.connect()
        await simpleUser.value.register()
      } catch (err) {
        console.error('Error reconnecting:', err)
        connectionState.value = 'disconnected'
      }
    }
  }

  const makeCall = async (number: string): Promise<boolean> => {
    try {
      if (!simpleUser.value || !isConnected.value) {
        throw new Error('SIP no está conectado')
      }

      const target = `sip:${number}@${sipConfig.value.domain}`

      await simpleUser.value.call(target, {
        inviteWithoutSdp: false,
      })

      return true
    } catch (err) {
      console.error('Error haciendo llamada:', err)
      error.value = err instanceof Error ? err.message : 'Error en la llamada'
      callState.value = 'idle'
      return false
    }
  }

  const endCall = async (): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.hangup()
        callState.value = 'idle'
      }
    } catch (err) {
      console.error('Error terminando llamada:', err)
      error.value = err instanceof Error ? err.message : 'Error terminando llamada'
    }
  }

  const answerCall = async (): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.answer()
      }
    } catch (err) {
      console.error('Error contestando llamada:', err)
      error.value = err instanceof Error ? err.message : 'Error contestando llamada'
    }
  }

  const muteCall = (): void => {
    try {
      if (simpleUser.value) {
        simpleUser.value.mute()
        isMuted.value = simpleUser.value.isMuted()
      }
    } catch (err) {
      console.error('Error muting call:', err)
    }
  }

  const unmuteCall = (): void => {
    try {
      if (simpleUser.value) {
        simpleUser.value.unmute()
        isMuted.value = simpleUser.value.isMuted()
      }
    } catch (err) {
      console.error('Error unmuting call:', err)
    }
  }

  const toggleMute = (): void => {
    if (isMuted.value) {
      unmuteCall()
    } else {
      muteCall()
    }
  }

  const holdCall = async (): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.hold()
      }
    } catch (err) {
      console.error('Error holding call:', err)
      error.value = err instanceof Error ? err.message : 'Error poniendo en espera'
    }
  }

  const unholdCall = async (): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.unhold()
      }
    } catch (err) {
      console.error('Error unholding call:', err)
      error.value = err instanceof Error ? err.message : 'Error quitando de espera'
    }
  }

  const toggleHold = async (): Promise<void> => {
    if (isOnHold.value) {
      await unholdCall()
    } else {
      await holdCall()
    }
  }

  const sendDTMF = async (tone: string): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.sendDTMF(tone)
      }
    } catch (err) {
      console.error('Error sending DTMF:', err)
      error.value = err instanceof Error ? err.message : 'Error enviando DTMF'
    }
  }

  const disconnect = async (): Promise<void> => {
    try {
      if (simpleUser.value) {
        await simpleUser.value.disconnect()
      }
      connectionState.value = 'disconnected'
      isConnected.value = false
      isRegistered.value = false
    } catch (err) {
      console.error('Error disconnecting:', err)
      error.value = err instanceof Error ? err.message : 'Error desconectando'
    }
  }

  const setAudioElement = (element: HTMLAudioElement): void => {
    audioElement.value = element
  }

  const updateAdvancedConfig = (config: {
    domain?: string
    server?: string
    displayName?: string
  }): void => {
    if (config.domain) {
      sipConfig.value.domain = config.domain
    }
    if (config.server) {
      sipConfig.value.server = config.server
    }
    if (config.displayName) {
      sipConfig.value.displayName = config.displayName
    }
  }

  const reinitializeWithExtension = async (extension: {
    server?: string
    username: string
    password: string
    displayName: string
    domain?: string
  }): Promise<boolean> => {
    try {
      if (simpleUser.value && isConnected.value) {
        await disconnect()
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return await initializeSip(extension, audioElement.value || undefined)
    } catch (err) {
      console.error('Error reinitializando SIP:', err)
      error.value = err instanceof Error ? err.message : 'Error reinitializando SIP'
      return false
    }
  }

  const loadSipConfigFromStorage = (): void => {
    const saved = localStorage.getItem('sipConfig')
    if (saved) {
      const parsed = JSON.parse(saved)
      sipConfig.value = { ...sipConfig.value, ...parsed }
    }
  }

  const saveSipConfigToStorage = (): void => {
    localStorage.setItem('sipConfig', JSON.stringify(sipConfig.value))
  }

  const parseMWIMessage = (message: string): void => {
    const lines = message.split('\n')
    let newMessages = 0
    let oldMessages = 0
    let isWaiting = false

    for (const line of lines) {
      const trimmedLine = line.trim()

      if (
        trimmedLine.startsWith('Messages-Waiting:') ||
        trimmedLine.startsWith('Message-Waiting:')
      ) {
        isWaiting = trimmedLine.toLowerCase().includes('yes')
      }

      if (trimmedLine.startsWith('Voice-Message:')) {
        const parts = trimmedLine.split(' ')
        if (parts.length >= 2 && typeof parts[1] === 'string') {
          const counts = parts[1].split('/')
          newMessages = parseInt(counts[0] || '0') || 0
          oldMessages = parseInt(counts[1] || '0') || 0
        }
      }
    }

    if (voicemail.value.new !== newMessages || voicemail.value.old !== oldMessages) {
      voicemail.value = { new: newMessages, old: oldMessages }

      if (newMessages > 0 && isWaiting) {
        toast.add({
          severity: 'info',
          summary: 'Nuevo Mensaje de Voz',
          detail: `Tienes ${newMessages} mensaje(s) de voz nuevo(s)`,
          life: 5000,
        })
      }
    }
  }

  const subscribeMWI = async (): Promise<void> => {
    try {
      if (simpleUser.value && isRegistered.value) {
        console.log('MWI subscription active')
      }
    } catch (err) {
      console.error('Error subscribing to MWI:', err)
    }
  }

  const addBlfExtension = async (extension: string, label: string): Promise<void> => {
    const newBlf: BlfItemDto = {
      id: Date.now().toString(),
      extension,
      label,
      status: 'unavailable', // Inicialmente unavailable hasta que se confirme
    }
    blfExtensions.value?.push(newBlf)
    saveBlfExtensionsToStorage()
    addActivityLog(`BLF agregado: ${label} (${extension})`)

    // Suscribirse inmediatamente si estamos conectados
    if (isRegistered.value) {
      await subscribeToBlfStatus(extension)
    }
  }

  const removeBlfExtension = async (id: string): Promise<void> => {
    const index = blfExtensions.value?.findIndex((blf) => blf.id === id)
    if (index !== -1) {
      const blf = blfExtensions.value[index]

      // Desuscribirse antes de eliminar
      if (blf && isRegistered.value) {
        await unsubscribeFromBlfStatus(blf.extension)
      }

      blfExtensions.value?.splice(index !== undefined ? index : -1, 1)
      saveBlfExtensionsToStorage()
      addActivityLog(`BLF eliminado: ${blf?.label} (${blf?.extension})`)
    }
  }
  const updateBlfStatus = (extension: string, status: BlfItemDto['status']): void => {
    const blf = blfExtensions.value?.find((b) => b.extension === extension)
    if (blf) {
      blf.status = status
    }
  }

  const loadBlfExtensionsFromStorage = (): void => {
    const saved = localStorage.getItem('blfExtensions')
    if (saved) {
      try {
        blfExtensions.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error loading BLF extensions from storage:', error)
        blfExtensions.value = []
      }
    }
  }

  const saveBlfExtensionsToStorage = (): void => {
    localStorage.setItem('blfExtensions', JSON.stringify(blfExtensions.value))
  }

  // Función para realizar llamada a extensión BLF
  const callBlfExtension = async (extension: string): Promise<boolean> => {
    return await makeCall(extension)
  }

  const addActivityLog = (message: string): void => {
    console.log(`[SIP] ${message}`)
  }

  return {
    // State
    simpleUser,
    isRegistered,
    isConnected,
    connectionState,
    error,
    sipConfig,
    isAutoAnswer,
    voicemail,
    isDnd,
    callState,
    callStartTime,
    isMuted,
    isOnHold,
    blfExtensions,

    // Actions
    initializeSip,
    makeCall,
    endCall,
    answerCall,
    muteCall,
    unmuteCall,
    toggleMute,
    holdCall,
    unholdCall,
    toggleHold,
    sendDTMF,
    disconnect,
    updateAdvancedConfig,
    setAudioElement,
    reconnect,
    reinitializeWithExtension,
    loadSipConfigFromStorage,
    saveSipConfigToStorage,
    subscribeMWI,
    addBlfExtension,
    removeBlfExtension,
    updateBlfStatus,
    loadBlfExtensionsFromStorage,
    saveBlfExtensionsToStorage,
    callBlfExtension,
    subscribeToBlfStatus,
    unsubscribeFromBlfStatus,
    subscribeToAllBlfs,
    unsubscribeFromAllBlfs,
    parseBlfNotification,
  }
})
