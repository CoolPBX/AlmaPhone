import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useSipStore } from '@/components/login/SipStore'

interface ActivityLog {
  id: number
  timestamp: Date
  message: string
}

interface PhoneActionsComposable {
  lastDialedNumber: Ref<string>
  activityLogs: Ref<ActivityLog[]>
  isCallActive: ComputedRef<boolean>
  addActivityLog: (message: string) => void
  setLastDialedNumber: (number: string) => void
}

let instance: PhoneActionsComposable | null = null

export function usePhoneActions(): PhoneActionsComposable {
  if (instance) {
    return instance
  }

  const phoneStore = useSipStore()

  const lastDialedNumber = ref('')
  const activityLogs = ref<ActivityLog[]>([])

  const isCallActive = computed(() => {
    const callStates = ['calling', 'ringing', 'connected', 'establishing']
    return callStates.includes(phoneStore.callState)
  })

  const addActivityLog = (message: string) => {
    activityLogs.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      message,
    })

    if (activityLogs.value.length > 50) {
      activityLogs.value = activityLogs.value.slice(0, 50)
    }
  }

  const setLastDialedNumber = (number: string) => {
    lastDialedNumber.value = number
  }

  instance = {
    lastDialedNumber,
    activityLogs,
    isCallActive,
    addActivityLog,
    setLastDialedNumber,
  }

  return instance
}