<template>
  <Toast />
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white"> AlmaPhone</h1>
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div class="text-gray-600 dark:text-gray-400">
          <span class="text-sm">Usuario:</span>
          <span class="ml-2 font-medium text-gray-900 dark:text-white">
            {{ authStore.userEmail }}
          </span>
        </div>
      </div>

      <div class="text-gray-600 dark:text-gray-400">
        <span class="text-sm">Extensión:</span>
        <Dropdown v-if="extensionStore.availableExtensions.length > 1" v-model="selectedExtensionValue"
          :options="extensionStore.availableExtensions.map((e) => ({ id: e.extension_uuid, name: e.extension }))"
          option-label="name" option-value="id" @change="handleExtensionChange" class="ml-2"
          :loading="extensionStore.isLoading" />
        <span v-else class="ml-2 font-medium text-gray-900 dark:text-white">
          {{ extensionStore.selectedExtension?.extension || 'Sin extensión' }}
        </span>
      </div>

      <div class="flex items-center space-x-4">

        <button @click="handleLogout" :disabled="authStore.isLoading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ authStore.isLoading ? t('auth.loggingOut') : t('auth.logOut') }}
        </button>
      </div>
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/login/AuthStore'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { computed, onMounted } from 'vue'
import Dropdown from 'primevue/dropdown'
import { useSipStore } from '@/components/login/SipStore'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'


const router = useRouter()
const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const sipStore = useSipStore()
const toast = useToast()
const { t } = useI18n()

const handleLogout = async () => {
  try {
    if (sipStore.isConnected) {
      await sipStore.disconnect()
    }

    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

const selectedExtensionValue = computed({
  get: () => extensionStore.selectedExtension?.extension_uuid || null,
  set: (value) => {
    const extension = extensionStore.availableExtensions.find(ext => ext.extension_uuid === value)
    if (extension) {
      extensionStore.changeExtension(extension)
    }
  }
})

const handleExtensionChange = async (event: { value: string }) => {
  const extensionId = event.value
  const extension = extensionStore.availableExtensions.find(ext => ext.extension_uuid === extensionId)

  if (extension) {
    const success = await extensionStore.changeExtension(extension)
    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Switched Extension',
        detail: `Switched to ${extension.extension}`,
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to switch extension',
        life: 3000
      })
    }
  }
}

onMounted(async () => {
  await extensionStore.fetchExtensions()
  extensionStore.restoreSelectedExtension()
})

</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>