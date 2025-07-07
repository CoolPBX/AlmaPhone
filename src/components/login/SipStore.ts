import { defineStore } from 'pinia'
import { URI, UserAgent } from 'sip.js'
import { ref } from 'vue'

export const useSipStore = defineStore('sip', () => {
  const userAgent = ref()
  // const registerer = ref(null)
  const isRegistered = ref(false)
  const isConnected = ref(false)
  // const currentCall = ref(null)
  // const incomingCall = ref(null)
  // const callState = ref('idle') // idle, calling, ringing, connected, ended
  const connectionState = ref('disconnected') // disconnected, connecting, connected, reconnecting
  const error = ref(null)
  // const audioElement = ref(null)

  const sipConfig = ref({
    server: 'wss://tu-servidor-fusionpbx.com:7443',
    username: '',
    password: '',
    domain: 'tu-dominio.com',
    displayName: '',
  })

  const initializeSip = async (config: { server: string; username: string; password: string; domain: string; displayName: string } | { server: string; username: string; password: string; domain: string; displayName: string }) => {
    try {
      // Actualizar configuración
      sipConfig.value = { ...sipConfig.value, ...config }

      connectionState.value = 'connecting'
      error.value = null

      // Crear UserAgent
      // `sip:${sipConfig.value.username}@${sipConfig.value.domain}`
      const uri = new URI(
        'sip',
        sipConfig.value.username,
        sipConfig.value.domain,
        5060,
      )
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

  return {
    userAgent,
    isRegistered,
    isConnected,
    connectionState,
    error,
    sipConfig,
    initializeSip,
  }
})
