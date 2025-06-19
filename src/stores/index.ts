import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const appName = ref<string>(import.meta.env.VITE_APP_NAME || 'AlmaPhone')
  const isLoading = ref<boolean>(false)

  const getAppName = computed(() => appName.value)
  const getIsLoading = computed(() => isLoading.value)

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  return {
    appName,
    isLoading,
    getAppName,
    getIsLoading,
    setLoading
  }
})