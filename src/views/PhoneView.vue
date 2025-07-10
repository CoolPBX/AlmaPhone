<template>
  <div
    class="phone-dialer bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 w-[320px] ">
    <!-- Header con información de la extensión -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Teléfono - Ext. {{ extensionStore.selectedExtension?.extension }}
        </h3>
        <div class="flex items-center space-x-2">
          <div :class="connectionStatusClass" class="w-3 h-3 rounded-full"></div>
          <span class="text-sm font-medium" :class="connectionStatusTextClass">
            {{ connectionStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Display del número -->
    <div class="mb-6">
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600">
        <input v-model="displayNumber" type="text" readonly placeholder="Ingrese un número"
          class="w-full text-center text-2xl font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" />
      </div>
    </div>

    <!-- Teclado numérico -->
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

    <!-- Botones de acción -->
    <div class="flex justify-center space-x-4 mb-6">
      <!-- Botón de llamada -->
      <button @click="handleCall" :disabled="!canCall" :class="callButtonClass"
        class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
        <svg v-if="!isCallActive" class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <svg v-else class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18" />
        </svg>
      </button>

      <!-- Botón de borrar -->
      <button @click="clearLastDigit" :disabled="displayNumber.length === 0 || isCallActive"
        class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>

      <!-- Botón de limpiar -->
      <button @click="clearDisplay" :disabled="displayNumber.length === 0 || isCallActive"
        class="flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Estado de la llamada -->
    <div v-if="isCallActive" class="mb-4">
      <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
              Llamando a {{ currentCallNumber }}
            </span>
          </div>
          <span class="text-sm text-blue-700 dark:text-blue-300">
            {{ callDuration }}
          </span>
        </div>
      </div>
    </div>

    <!-- Historial de llamadas recientes -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Llamadas Recientes
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
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { useSipStore } from '@/components/login/SipStore'


const extensionStore = useExtensionStore()
 const phoneStore = useSipStore()

// Estado local
const displayNumber = ref('')
const isCallActive = ref(false)
const currentCallNumber = ref('')
const callStartTime = ref<Date | null>(null)
const callDuration = ref('00:00')
const callTimer = ref<number | null>(null)

// Configuración del teclado
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

// Historial de llamadas (simulado)
const recentCalls = ref([
  { id: 1, number: '1234567890', type: 'outgoing', timestamp: new Date(Date.now() - 300000) },
  { id: 2, number: '0987654321', type: 'incoming', timestamp: new Date(Date.now() - 600000) },
  { id: 3, number: '1122334455', type: 'outgoing', timestamp: new Date(Date.now() - 900000) },
])

// Computed properties
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

// Métodos
const addDigit = (digit: string) => {
  if (displayNumber.value.length < 15) {
    displayNumber.value += digit
  }
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
    // Colgar llamada
    await endCall()
  } else {
    // Iniciar llamada
    await makeCall(displayNumber.value)
  }
}

const makeCall = async (number: string) => {
  try {
    const success = await phoneStore.makeCall(number)
    if (success) {
      isCallActive.value = true
      currentCallNumber.value = number
      callStartTime.value = new Date()
      startCallTimer()

      // Agregar al historial
      recentCalls.value.unshift({
        id: Date.now(),
        number: number,
        type: 'outgoing',
        timestamp: new Date()
      })
    }
  } catch (error) {
    console.error('Error making call:', error)
  }
}

const endCall = async () => {
  try {
    await phoneStore.endCall()
    isCallActive.value = false
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


onUnmounted(() => {
  stopCallTimer() 
})
</script>

<style scoped>
.dial-button:active {
  transform: scale(0.95);
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
</style>