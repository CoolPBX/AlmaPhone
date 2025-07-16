<template>
  <div class="softphone-container flex gap-4 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div
      class="phone-dialer bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 w-[320px] flex-shrink-0">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ extensionStore.selectedExtension?.extension }} ({{
              extensionStore.selectedExtension?.effective_caller_id_name ?? '-' }})
          </h3>
          <div class="flex items-center space-x-2">
            <div :class="connectionStatusClass" class="w-3 h-3 rounded-full"></div>
            <span class="text-sm font-medium" :class="connectionStatusTextClass">
              {{ connectionStatus }}
            </span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600">
          <input v-model="displayNumber" type="text" readonly :placeholder="$t('phoneView.enternumber')" ref="numberInputRef"
            class="w-full text-center text-2xl font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
      </div>

      <div class="mb-6">
        <div class="grid grid-cols-3 gap-3">
          <button v-for="key in dialpadKeys" :key="key.value" @click="addDigit(key.value)" :disabled="isCallActive"
            class="dial-button relative flex flex-col items-center justify-center h-16 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ key.value }}</span>
            <span v-if="key.letters" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ key.letters }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex justify-center space-x-3 mb-6">
        <button @click="handleCall" :disabled="!canCall" :class="callButtonClass"
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="!isCallActive" class="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <svg v-else class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18" />
          </svg>
        </button>

        <button @click="toggleMute"
          :class="phoneStore.isMuted ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'"
          :disabled="!isCallActive"
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="phoneStore.isMuted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5.586 5.586A2 2 0 001 8v8a2 2 0 003.414 1.414L16 6.828V4a2 2 0 00-3.414-1.414L5.586 5.586zM17 17l-4-4m0 0L9 9m4 4l4-4m-4 4v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <button @mousedown="startDelete" @mouseup="endDelete" @mouseleave="endDelete" @touchstart="startDelete"
          @touchend="endDelete" @touchcancel="endDelete" :disabled="displayNumber.length === 0 || isCallActive"
          :class="isDeleting ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'"
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>

      <div v-if="isCallActive" class="mb-4">
        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
                {{ t('phoneView.callTo', { number: currentCallNumber }) }}
              </span>
            </div>
            <span class="text-sm text-blue-700 dark:text-blue-300">
              {{ callDuration }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.recentCalls') }}
        </h4>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div v-for="call in recentCalls" :key="call.id" @click="selectRecentCall(call.number)"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
            <div class="flex items-center space-x-3">
              <svg :class="call.type === 'outgoing' ? 'text-green-500' : 'text-blue-500'" class="w-4 h-4" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ call.number }}
              </span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTime(call.timestamp) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="control-panel bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 flex-1 min-w-0">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">{{ t('phoneView.controlPanel') }}</h3>

      <div class="mb-6">
        <div class="bg-red-50 dark:bg-red-900 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="text-sm font-medium text-red-900 dark:text-red-100">
                Sara: Unregistered
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <button @click="redial" :disabled="!lastDialedNumber" v-tooltip.top="'Repetir última llamada'"
          class="control-button bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-4 px-3 rounded-lg transition-colors disabled:cursor-not-allowed flex flex-col items-center space-y-1">
          <RotateCcw :size="20" />
          <span class="text-xs">{{ t('phoneView.redial') }}</span>
        </button>

        <button @click="toggleDnd" :class="isDnd ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'"
          v-tooltip.top="'No molestar'"
          class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1">
          <BellOff :size="20" />
          <span class="text-xs">{{ t(isDnd ? 'phoneView.dndOn' : 'phoneView.dnd') }}</span>
        </button>

        <button @click="checkVoicemail" v-tooltip.top="'Revisar mensajes de voz'"
          class="control-button bg-teal-500 hover:bg-teal-600 text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1">
          <Voicemail :size="20" />
          <span class="text-xs">VoiceMail: {{ phoneStore.voicemail.new }}/{{ phoneStore.voicemail.old }}</span>
        </button>

        <div class="relative">
          <button @click="toggleDialOptions"
            :class="showAdvancedDialOptions ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'"
            v-tooltip.top="'Configurar micrófono'"
            class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1 w-full">
            <Mic :size="20" />
            <span class="text-xs">{{ t(showAdvancedDialOptions ? 'phoneView.micOn' : 'phoneView.mic') }}</span>
          </button>

          <div v-show="showAdvancedDialOptions"
            class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">

            <div>
              <label for="micSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('phoneView.selectMic') }}
              </label>
              <select id="micSelect" v-model="selectedMicId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="" disabled>{{ t('phoneView.selectDevice') }}</option>
                <option v-for="device in audioInputDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || `Micrófono ${device.deviceId.slice(0, 8)}...` }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="showAdvancedDialOptions" @click="showAdvancedDialOptions = false" class="fixed inset-0 z-40">
        </div>
      </div>

      <div v-if="isCallActive" class="grid grid-cols-2 gap-3 mb-6">
        <button @click="toggleMute" :class="isMuted ? 'bg-red-600' : 'bg-orange-500 hover:bg-orange-600'"
          v-tooltip.top="isMuted ? 'Activar timbre' : 'Silenciar timbre'"
          class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1">
          <component :is="isMuted ? 'VolumeX' : 'Volume2'" :size="20" />
          <span class="text-xs">{{ isMuted ? 'UNMUTE' : 'MUTE' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <button @click="toggleAutoAnswer" :class="isAutoAnswer ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'"
          v-tooltip.top="'Respuesta automática'"
          class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1">
          <component :is="isAutoAnswer ? 'PhoneCall' : 'PhoneIncoming'" :size="20" />
          <span class="text-xs">{{ t(isAutoAnswer ? 'phoneView.autoAnswerOn' : 'phoneView.autoAnswer') }}</span>
        </button>
      </div>
    </div>

    <div
      class="dynamic-panel bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 flex-1 min-w-0">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Información</h3>

      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('phoneView.recentCalls') }}</h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">SIP:</span>
              <span :class="connectionStatusTextClass" class="text-sm font-medium">
                {{ connectionStatus }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.connectionState }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Llamada:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.callState }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('phoneView.sipConfig') }}</h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.server') }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.server }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.user') }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.username }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.domain') }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.domain }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('phoneView.controls') }}</h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
          <div class="space-y-2">
            <div v-for="log in activityLogs" :key="log.id" class="text-xs">
              <span class="text-gray-500 dark:text-gray-400">{{ formatTime(log.timestamp) }}</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { useSipStore } from '@/components/login/SipStore'
import {
  RotateCcw,
  BellOff,
  Voicemail,
  Mic,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const extensionStore = useExtensionStore()
const phoneStore = useSipStore()

const displayNumber = ref('')
const isCallActive = ref(false)
const currentCallNumber = ref('')
const callStartTime = ref<Date | null>(null)
const callDuration = ref('00:00')
const callTimer = ref<number | null>(null)

const isDeleting = ref(false)
const deleteTimer = ref<number | null>(null)
const deleteStartTime = ref<number | null>(null)
const HOLD_DURATION = 500

const isDnd = ref(false)
const isMuted = ref(false)
const isAutoAnswer = ref(false)
const lastDialedNumber = ref('')

const showAdvancedDialOptions = ref(false)
const audioInputDevices = ref<MediaDeviceInfo[]>([])
const selectedMicId = ref<string | null>(null)
const numberInputRef = ref<HTMLInputElement | null>(null)

const activityLogs = ref([
  { id: 1, timestamp: new Date(), message: 'SIP inicializado' },
  { id: 2, timestamp: new Date(Date.now() - 60000), message: 'Conectando al servidor' },
  { id: 3, timestamp: new Date(Date.now() - 120000), message: 'Aplicación iniciada' },
])

const dialSounds: Record<'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '*' | '#', HTMLAudioElement> = {
  '0': new Audio(new URL('@/assets/wav/0.wav', import.meta.url).href),
  '1': new Audio(new URL('@/assets/wav/1.wav', import.meta.url).href),
  '2': new Audio(new URL('@/assets/wav/2.wav', import.meta.url).href),
  '3': new Audio(new URL('@/assets/wav/3.wav', import.meta.url).href),
  '4': new Audio(new URL('@/assets/wav/4.wav', import.meta.url).href),
  '5': new Audio(new URL('@/assets/wav/5.wav', import.meta.url).href),
  '6': new Audio(new URL('@/assets/wav/6.wav', import.meta.url).href),
  '7': new Audio(new URL('@/assets/wav/7.wav', import.meta.url).href),
  '8': new Audio(new URL('@/assets/wav/8.wav', import.meta.url).href),
  '9': new Audio(new URL('@/assets/wav/9.wav', import.meta.url).href),
  '*': new Audio(new URL('@/assets/wav/star.wav', import.meta.url).href),
  '#': new Audio(new URL('@/assets/wav/hash.wav', import.meta.url).href),
}

const dialpadKeys = [
  { value: '1', letters: '' },
  { value: '2', letters: 'ABC' },
  { value: '3', letters: 'DEF' },
  { value: '4', letters: 'GHI' },
  { value: '5', letters: 'JKL' },
  { value: '6', letters: 'MNO' },
  { value: '7', letters: 'PQRS' },
  { value: '8', letters: 'TUV' },
  { value: '9', letters: 'WXYZ' },
  { value: '*', letters: '' },
  { value: '0', letters: '+' },
  { value: '#', letters: '' },
]

const recentCalls = ref([
  { id: 1, number: '1234567890', type: 'outgoing', timestamp: new Date(Date.now() - 300000) },
  { id: 2, number: '0987654321', type: 'incoming', timestamp: new Date(Date.now() - 600000) },
  { id: 3, number: '1122334455', type: 'outgoing', timestamp: new Date(Date.now() - 900000) },
])

const connectionStatus = computed(() => {
  return phoneStore.isConnected ? 'Conectado' : 'Desconectado'
})

const connectionStatusClass = computed(() => {
  return phoneStore.isConnected ? 'bg-green-500' : 'bg-red-500'
})

const connectionStatusTextClass = computed(() => {
  return phoneStore.isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
})

const canCall = computed(() => {
  return displayNumber.value.length > 0 && !isCallActive.value && phoneStore.isConnected
})

const callButtonClass = computed(() => {
  if (!canCall.value) {
    return 'bg-gray-400 cursor-not-allowed'
  }
  return isCallActive.value
    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse'
    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (isCallActive.value) return

  const key = event.key

  if (/^[0-9]$/.test(key)) {
    event.preventDefault()
    addDigit(key)
    return
  }

  if (key === '*') {
    event.preventDefault()
    addDigit('*')
    return
  }

  if (key === '#') {
    event.preventDefault()
    addDigit('#')
    return
  }

  if (key === 'Enter' && canCall.value) {
    event.preventDefault()
    handleCall()
    return
  }

  if (key === 'Escape' && isCallActive.value) {
    event.preventDefault()
    handleCall()
    return
  }

  if (key === 'Backspace' && displayNumber.value.length > 0) {
    event.preventDefault()
    clearLastDigit()
    return
  }

  if (key === 'Delete' && displayNumber.value.length > 0) {
    event.preventDefault()
    clearDisplay()
    return
  }
}

const addDigit = (digit: string) => {
  const sound = dialSounds[digit as keyof typeof dialSounds]
  if (sound) {
    sound.currentTime = 0
    sound.play()
  }

  displayNumber.value += digit
}

const startDelete = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  if (displayNumber.value.length === 0 || isCallActive.value) return

  isDeleting.value = true
  deleteStartTime.value = Date.now()

  deleteTimer.value = window.setTimeout(() => {
    clearDisplay()
    isDeleting.value = false
  }, HOLD_DURATION)
}

const endDelete = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  if (!isDeleting.value) return

  isDeleting.value = false

  if (deleteTimer.value) {
    clearTimeout(deleteTimer.value)
    deleteTimer.value = null

    if (deleteStartTime.value && (Date.now() - deleteStartTime.value) < HOLD_DURATION) {
      clearLastDigit()
    }
  }

  deleteStartTime.value = null
}

const clearLastDigit = () => {
  displayNumber.value = displayNumber.value.slice(0, -1)
}

const clearDisplay = () => {
  displayNumber.value = ''
}

const handleCall = async () => {
  if (!canCall.value) return

  if (isCallActive.value) {
    await endCall()
  } else {
    await makeCall(displayNumber.value)
  }
}

const makeCall = async (number: string) => {
  try {
    lastDialedNumber.value = number
    const success = await phoneStore.makeCall(number)
    if (success) {
      isCallActive.value = true
      currentCallNumber.value = number
      callStartTime.value = new Date()
      startCallTimer()

      recentCalls.value.unshift({
        id: Date.now(),
        number: number,
        type: 'outgoing',
        timestamp: new Date()
      })

      addActivityLog(`Llamada iniciada a ${number}`)
    }
  } catch (error) {
    console.error('Error making call:', error)
    addActivityLog(`Error al llamar a ${number}`)
  }
}

const endCall = async () => {
  try {
    await phoneStore.endCall()
    isCallActive.value = false
    addActivityLog(`Llamada terminada con ${currentCallNumber.value}`)
    currentCallNumber.value = ''
    callStartTime.value = null
    stopCallTimer()
  } catch (error) {
    console.error('Error ending call:', error)
  }
}

const startCallTimer = () => {
  callTimer.value = setInterval(() => {
    if (callStartTime.value) {
      const elapsed = Math.floor((Date.now() - callStartTime.value.getTime()) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      callDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }, 1000)
}

const stopCallTimer = () => {
  if (callTimer.value) {
    clearInterval(callTimer.value)
    callTimer.value = null
  }
  callDuration.value = '00:00'
}

const selectRecentCall = (number: string) => {
  if (!isCallActive.value) {
    displayNumber.value = number
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const redial = () => {
  if (lastDialedNumber.value && !isCallActive.value) {
    displayNumber.value = lastDialedNumber.value
    handleCall()
  }
}

const toggleDnd = () => {
  isDnd.value = !isDnd.value
  addActivityLog(`DND ${isDnd.value ? 'activado' : 'desactivado'}`)
}

const checkVoicemail = () => {
  addActivityLog('Verificando mensajes de voz')
}

const toggleAutoAnswer = () => {
  isAutoAnswer.value = !isAutoAnswer.value
  addActivityLog(`AutoAnswer ${isAutoAnswer.value ? 'activado' : 'desactivado'}`)
}

const addActivityLog = (message: string) => {
  activityLogs.value.unshift({
    id: Date.now(),
    timestamp: new Date(),
    message
  })

  if (activityLogs.value.length > 50) {
    activityLogs.value = activityLogs.value.slice(0, 50)
  }
}

const toggleDialOptions = async () => {
  if (showAdvancedDialOptions.value) {
    showAdvancedDialOptions.value = false
  } else {
    showAdvancedDialOptions.value = true
    await loadAudioInputDevices()
  }
}

const toggleMute = async () => {
  await phoneStore.toggleMute()
  addActivityLog(`Micrófono ${phoneStore.isMuted ? 'silenciado' : 'activado'}`)
}

const loadAudioInputDevices = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })

    const devices = await navigator.mediaDevices.enumerateDevices()
    audioInputDevices.value = devices.filter(device => device.kind === 'audioinput')
  } catch (err) {
    console.error('Error accediendo a dispositivos de audio:', err)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  stopCallTimer()
  if (deleteTimer.value) {
    clearTimeout(deleteTimer.value)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

watch(displayNumber, () => {
  nextTick(() => {
    if (numberInputRef.value) {
      numberInputRef.value.scrollLeft = numberInputRef.value.scrollWidth
    }
  })
})
</script>

<style scoped>
.dial-button:active {
  transform: scale(0.95);
}

.control-button:active {
  transform: scale(0.98);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 1024px) {
  .softphone-container {
    flex-direction: column;
  }

  .phone-dialer {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .control-panel,
  .dynamic-panel {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .softphone-container {
    padding: 2px;
    gap: 2px;
  }

  .control-panel,
  .dynamic-panel {
    padding: 4px;
  }
}
</style>