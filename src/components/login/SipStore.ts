import { defineStore } from 'pinia'
import { URI } from 'sip.js/lib/grammar/uri'
import {
  SimpleUser,
  type SimpleUserDelegate,
  type SimpleUserOptions,
} from 'sip.js/lib/platform/web'
import { ref } from 'vue'

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
  const callStartTime = ref<Date | null>(null)
  const error = ref<string | null>(null)
  const isMuted = ref(false)
  const isOnHold = ref(false)

  const audioElement = ref<HTMLAudioElement | null>(null)

  const sipConfig = ref({
    server: 'wss://hornblower.doesnotexist.com:7443',
    username: 'LDLQ2',
    password: '',
    domain: 'hornblower.doesnotexist.com',
    displayName: '',
  })

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

      if(isAutoAnswer.value) {
        console.log('Auto-answer enabled, answering call');
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
    },
    onCallHangup: (): void => {
      console.log('Call hangup')
      callState.value = 'ended'
      callStartTime.value = null
      isMuted.value = false
      isOnHold.value = false
    },
    onCallHold: (held: boolean): void => {
      console.log(`Call hold ${held}`)
      isOnHold.value = held
    },
    onRegistered: (): void => {
      console.log('Registered')
      isRegistered.value = true
    },
    onUnregistered: (): void => {
      console.log('Unregistered')
      isRegistered.value = false
    },
    onServerConnect: (): void => {
      console.log('Server connected')
      isConnected.value = true
      connectionState.value = 'connected'
    },
    onServerDisconnect: (): void => {
      console.log('Server disconnected')
      isConnected.value = false
      isRegistered.value = false
      connectionState.value = 'disconnected'

      setTimeout(() => {
        if (simpleUser.value && connectionState.value === 'disconnected') {
          reconnect()
        }
      }, 5000)
    },
  })

  const initializeSip = async (
    config: {
      server: string
      username: string
      password: string
      domain: string
      displayName: string
    },
    remoteAudio?: HTMLAudioElement,
  ): Promise<boolean> => {
    try {
      sipConfig.value = { ...sipConfig.value, ...config }

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
        },
      }

      simpleUser.value = new SimpleUser(webSocketServer, simpleUserOptions)

      await simpleUser.value.connect()

      await simpleUser.value.register()

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
    setAudioElement,
    reconnect,
  }
})
