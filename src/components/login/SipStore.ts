import { defineStore } from 'pinia'
import { URI, UserAgent } from 'sip.js'
import { ref } from 'vue'
import { Inviter, Invitation } from 'sip.js'

export const useSipStore = defineStore('sip', () => {
  const userAgent = ref()
  // const registerer = ref(null)
  const isRegistered = ref(false)
  const isConnected = ref(false)
  const currentCall = ref<Inviter | Invitation | null>(null)
  const incomingCall = ref<Invitation | null>(null)
  const callState = ref<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle')
  const connectionState = ref('disconnected') // disconnected, connecting, connected, reconnecting
  const callStartTime = ref<Date | null>(null)
  const error = ref(null)

  // const audioElement = ref(null)

  const sipConfig = ref({
    server: 'wss://hornblower.doesnotexist.com:7443',
    username: '',
    password: '',
    domain: 'hornblower.doesnotexist.com',
    displayName: '',
  })

  const initializeSip = async (
    config:
      | { server: string; username: string; password: string; domain: string; displayName: string }
      | { server: string; username: string; password: string; domain: string; displayName: string },
  ) => {
    try {
      // Actualizar configuración
      sipConfig.value = { ...sipConfig.value, ...config }

      connectionState.value = 'connecting'
      error.value = null

      // Crear UserAgent
      const uri = new URI('sip', sipConfig.value.username, sipConfig.value.domain, 5060)
      const transportOptions = {
        server: 'wss://hornblower.doesnotexist.com:7443',
        connectionTimeout: 10000,
        keepAliveInterval: 30000,
        traceSip: true,
      }

      const userAgentOptions = {
        uri,
        transportOptions,
        userAgentString: 'SIP.js/0.7.8 SaraPhone 04',
        traceSip: true,
        iceCheckingTimeout: 1000,
        registerExpires: 120,
        allowLegacyNotifications: true,
        hackWssInTransport: true,
        wsServerMaxReconnection: 5000,
        wsServerReconnectionTimeout: 1,
        connectionRecoveryMaxInterval: 3,
        connectionRecoveryMinInterval: 2,
        delegate: {
          onConnect: () => {
            console.log('SIP conectado')
            isConnected.value = true
            connectionState.value = 'connected'
            // register()
          },
          onDisconnect: (error: unknown) => {
            console.log('SIP desconectado', error)
            isConnected.value = false
            isRegistered.value = false
            connectionState.value = 'disconnected'
            if (error) {
              connectionState.value = 'reconnecting'
              // Intentar reconectar después de 5 segundos
              setTimeout(() => {
                if (userAgent.value) {
                  userAgent.value.start()
                }
              }, 5000)
            }
          },
          // onInvite: (invitation) => {
          //   console.log('Llamada entrante')
          //   handleIncomingCall(invitation)
          // },
        },
      }

      userAgent.value = new UserAgent(userAgentOptions)

      // Iniciar UserAgent
      await userAgent.value.start()
    } catch (err) {
      console.error('Error inicializando SIP:', err)
      connectionState.value = 'disconnected'
    }
  }

  const makeCall = async (number: string): Promise<boolean> => {
    try {
      if (!userAgent.value || !isConnected.value) {
        throw new Error('SIP no está conectado')
      }

      const target = new URI('sip', number, sipConfig.value.domain)
      const inviter = new Inviter(userAgent.value, target)

      currentCall.value = inviter
      callState.value = 'calling'
      callStartTime.value = new Date()

      // Configurar eventos para manejar la llamada
      inviter.stateChange.addListener((state) => {
        if (state === 'Establishing') {
          console.log('Llamada creada')
        }
        if (state === 'Established') {
          console.log('Llamada contestada')
          callState.value = 'connected'
        }
        if (state === 'Terminated') {
          console.log('Llamada terminada')
          callState.value = 'ended'
          currentCall.value = null
          callStartTime.value = null
        }
      })

      await inviter.invite()
      return true
    } catch (err) {
      console.error('Error haciendo llamada:', err)
      callState.value = 'idle'
      currentCall.value = null
      return false
    }
  }

  const endCall = async (): Promise<void> => {
    try {
      if (currentCall.value) {
        if (currentCall.value instanceof Inviter) {
          await currentCall.value.cancel()
        } else {
          // await currentCall.value.reject()
        }
      }

      callState.value = 'ended'
      currentCall.value = null
      callStartTime.value = null
    } catch (err) {
      console.error('Error terminando llamada:', err)
    }
  }

  return {
    userAgent,
    isRegistered,
    isConnected,
    connectionState,
    error,
    sipConfig,
    currentCall,
    incomingCall,
    callState,
    callStartTime,
    makeCall,
    endCall,
    initializeSip,
  }
})
