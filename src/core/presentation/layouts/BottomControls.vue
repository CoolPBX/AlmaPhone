<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 px-2 py-4 safe-area-pb pointer-events-none flex justify-center">
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5 max-w-fit overflow-visible pointer-events-auto">
      
      <div class="flex items-center justify-center gap-1 md:gap-4 min-w-max">
        
        <button @click="redial" :disabled="!lastDialedNumber || isCallActive"
          class="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 group min-w-[44px] md:min-w-[50px]">
          <RotateCcw :size="18"
            class="text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 mb-0.5" />
          <span class="text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-gray-400">{{ t('phoneView.redial') }}</span>
        </button>

        <button @click="toggleDnd"
          class="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group min-w-[44px] md:min-w-[50px]">
          <BellOff :size="18"
            :class="isDnd ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-500'"
            class="mb-0.5" />
          <span class="text-[9px] md:text-[10px] font-medium whitespace-nowrap"
            :class="isDnd ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'">
            {{ t(isDnd ? 'phoneView.dndOn' : 'phoneView.dnd') }}
          </span>
        </button>

        <button @click="checkVoicemail" :disabled="isCallActive"
          class="relative flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group min-w-[44px] md:min-w-[50px] disabled:opacity-50">
          
          <Voicemail :size="18" 
            class="text-gray-600 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-0.5" />
          
          <span class="text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {{ t('phoneView.voicemail') }}
          </span>

          <span v-if="phoneStore.voicemail.new > 0"
            class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-gray-800 animate-pulse">
          </span>
        </button>

        <div class="relative">
          <button @click="toggleDialOptions"
            class="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group min-w-[44px] md:min-w-[50px]">
            <Mic :size="18"
              :class="showAdvancedDialOptions ? 'text-blue-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-500'"
              class="mb-0.5" />
            <span class="text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-gray-400">{{ t('phoneView.mic') }}</span>
          </button>

          <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95 translate-y-2"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 translate-y-2">
            
            <div v-if="showAdvancedDialOptions"
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 z-50">
              <div class="flex justify-between items-center mb-2">
                <label class="text-xs font-semibold text-gray-500 uppercase">{{ t('phoneView.selectMic') }}</label>
                <button @click="showAdvancedDialOptions = false" class="text-gray-400 hover:text-gray-600">
                  <X :size="14" />
                </button>
              </div>
              <select v-model="selectedMicId"
                class="w-full text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="" disabled>{{ t('phoneView.selectDevice') }}</option>
                <option v-for="device in audioInputDevices" :key="device.deviceId" :value="device.deviceId">
                  {{ device.label || `Microphone ${device.deviceId.slice(0, 4)}...` }}
                </option>
              </select>
            </div>
          </transition>
        </div>

        <button @click="toggleAutoAnswer"
          class="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group min-w-[44px] md:min-w-[50px]">
          <component :is="isAutoAnswer ? PhoneCall : PhoneIncoming" :size="18"
            :class="isAutoAnswer ? 'text-green-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-green-500'"
            class="mb-0.5" />
          <span class="text-[9px] md:text-[10px] font-medium whitespace-nowrap"
            :class="isAutoAnswer ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'">
            {{ t('phoneView.autoAnswer') }}
          </span>
        </button>

        <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

        <button @click="handleLogout" :disabled="authStore.isLoading"
          class="flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group min-w-[44px] md:min-w-[50px]">
          <LogOut :size="18" class="text-gray-400 group-hover:text-red-500 mb-0.5" />
          <span class="text-[9px] md:text-[10px] font-medium text-gray-400 group-hover:text-red-500">{{ t('auth.logOut') }}</span>
        </button>

      </div>
    </div>
  </div>
  <div v-if="showAdvancedDialOptions" @click="showAdvancedDialOptions = false" class="fixed inset-0 z-30"></div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue' 
import { useSipStore } from '@/components/login/SipStore'
import { useAuthStore } from '@/components/login/AuthStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RotateCcw, BellOff, Voicemail, Mic, PhoneIncoming, PhoneCall, LogOut, X } from 'lucide-vue-next'
import { usePhoneActions } from '@/core/composables/usePhoneActions'

const { t } = useI18n()
const router = useRouter()
const phoneStore = useSipStore()
const authStore = useAuthStore()

const phoneActionsComposable = usePhoneActions()
const { lastDialedNumber, isCallActive, addActivityLog, displayNumber } = phoneActionsComposable

const showAdvancedDialOptions = ref(false)
const audioInputDevices = ref<MediaDeviceInfo[]>([])
const selectedMicId = ref<string | null>(null)

const isDnd = computed(() => phoneStore.isDnd)
const isAutoAnswer = computed(() => phoneStore.isAutoAnswer)

const redial = () => {
  if (lastDialedNumber.value && !isCallActive.value) {
    displayNumber.value = lastDialedNumber.value
    phoneStore.makeCall(lastDialedNumber.value)
    addActivityLog(`${t('activityLogs.redialing')} ${lastDialedNumber.value}`)
  }
}

const toggleDnd = () => {
  phoneStore.isDnd = !phoneStore.isDnd
  addActivityLog(phoneStore.isDnd ? t('activityLogs.dndActivated') : t('activityLogs.dndDeactivated'))
}

const checkVoicemail = async () => {
  try {
    const vmNumber = '*98'
    await phoneStore.makeCall(vmNumber)
    addActivityLog(t('activityLogs.accessingVoicemail'))
  } catch (error) {
    addActivityLog(t('activityLogs.errorAccessingVoicemail'))
    console.error('Error checking voicemail:', error)
  }
}

const toggleAutoAnswer = () => {
  phoneStore.isAutoAnswer = !phoneStore.isAutoAnswer
  addActivityLog(phoneStore.isAutoAnswer ? t('activityLogs.autoAnswerActivated') : t('activityLogs.autoAnswerDeactivated'))
}

const handleLogout = async () => {
  try {
    if (phoneStore.isConnected) {
      await phoneStore.disconnect()
    }
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
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

const loadAudioInputDevices = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const devices = await navigator.mediaDevices.enumerateDevices()
    audioInputDevices.value = devices.filter((device) => device.kind === 'audioinput')

    if (!selectedMicId.value && audioInputDevices.value.length > 0) {
      const currentTrack = stream.getAudioTracks()[0]
      let currentSettings: MediaTrackSettings | undefined
      if (currentTrack) {
        currentSettings = currentTrack.getSettings()
      }

      const activeDevice = currentSettings
        ? audioInputDevices.value.find(d => d.deviceId === currentSettings.deviceId)
        : undefined
      selectedMicId.value = activeDevice?.deviceId || audioInputDevices.value[0]?.deviceId || null
    }

    stream.getTracks().forEach(track => track.stop())

  } catch (err) {
    console.error('Error accessing audio devices:', err)
  }
}

watch(selectedMicId, async (newDeviceId) => {
  if (!newDeviceId) return

  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: newDeviceId } }
    })

    const newTrack = newStream.getAudioTracks()[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (phoneStore.simpleUser as any)?.session

    if (session && isCallActive.value) {
      const pc = session.sessionDescriptionHandler?.peerConnection
      if (pc) {
        const sender = pc.getSenders().find((s: RTCRtpSender) => s.track?.kind === 'audio')
        if (sender) {
          await sender.replaceTrack(newTrack)
          addActivityLog(t('activityLogs.microphoneChanged') || 'Microphone changed')
        }
      }
    } else {
      console.log('Microphone selection updated for next call:', newDeviceId)
    }

  } catch (error) {
    console.error('Error changing microphone:', error)
    addActivityLog('Error changing microphone')
  }
})

</script>

<style scoped>
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>