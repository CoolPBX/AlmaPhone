<template>
  <Toast />
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
      
      <div class="flex items-center justify-between md:justify-start md:space-x-4 w-full md:w-auto">
        <div class="flex items-center gap-3">
          <div :class="connectionStatusClass" class="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0"></div>
          <h1 class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            AlmaPhone
          </h1>
        </div>
        
        <span class="md:hidden font-medium text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
            {{ authStore.userEmail }}
        </span>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full md:w-auto">
        
        <span class="hidden md:block font-medium text-gray-900 dark:text-white">
          {{ authStore.userEmail }}
        </span>

        <span class="hidden md:inline text-sm text-gray-500 dark:text-gray-400">•</span>

        <div class="w-full sm:w-auto">
          <Select v-if="extensionStore.availableExtensions.length > 1" 
            v-model="selectedExtensionValue"
            :options="extensionStore.availableExtensions" 
            optionLabel="extension" 
            optionValue="extension_uuid"
            @change="handleExtensionChange" 
            :loading="extensionStore.isLoading" 
            checkmark 
            :highlightOnSelect="false"
            placeholder="Ext" 
            class="custom-extension-select w-full sm:w-48" 
            :pt="{
              root: { class: 'relative inline-flex bg-transparent w-full' },
              label: { class: 'flex-1 bg-transparent' }
            }">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="font-semibold truncate">
                  {{extensionStore.availableExtensions.find(e => e.extension_uuid === slotProps.value)?.extension}}
                </span>
              </div>
              <span v-else class="text-gray-400">{{ slotProps.placeholder }}</span>
            </template>

            <template #option="slotProps">
              <div class="flex items-center justify-between w-full py-1">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="font-medium">{{ slotProps.option.extension }}</span>
                </div>
              </div>
            </template>

            <template #dropdownicon>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </template>
          </Select>

          <div v-else class="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md w-full sm:w-auto">
            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span class="text-sm font-medium dark:text-white">
                 {{ extensionStore.selectedExtension?.extension || 'Sin extensión' }}
            </span>
          </div>
        </div>

        <div v-if="agentName" class="w-full sm:w-auto">
           <span class="hidden md:inline text-sm text-gray-500 dark:text-gray-400 mr-2">•</span>
           <div class="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 w-full sm:w-auto">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                {{ agentName }}
              </span>
            </div>
        </div>

        <div class="w-full sm:w-auto mt-2 sm:mt-0">
             <span class="hidden md:inline text-sm text-gray-500 dark:text-gray-400 mr-4">•</span>
             <button @click="handleLogout" :disabled="authStore.isLoading"
              class="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {{ authStore.isLoading ? t('auth.loggingOut') : t('auth.logOut') }}
            </button>
        </div>
      </div>

    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/components/login/AuthStore'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import { useSipStore } from '@/components/login/SipStore'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '@/components/agent/AgentStore'


const router = useRouter()
const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const sipStore = useSipStore()
const agentStore = useAgentStore()
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

const agentName = computed(() => agentStore.agentInfo?.agent_name || null)

const selectedExtensionValue = computed({
  get: () => extensionStore.selectedExtension?.extension_uuid || null,
  set: (value) => {
    const extension = extensionStore.availableExtensions.find(ext => ext.extension_uuid === value)
    if (extension) {
      extensionStore.changeExtension(extension)
    }
  }
})

const connectionStatusClass = computed(() => {
  return sipStore.isRegistered ? 'bg-green-500' : 'bg-red-500'
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

watch(
  () => extensionStore.selectedExtension?.extension,
  async (newExtension) => {
    if (newExtension) {
      await agentStore.checkAgentStatus(newExtension)
    } else {
      agentStore.clearAgent()
    }
  },
  { immediate: true }
)

</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.custom-extension-select) {
  background: transparent !important;
}

:deep(.custom-extension-select .p-select) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.custom-extension-select .p-component) {
  background: transparent !important;
}

:deep(.p-select-label-container) {
  background: transparent !important;
}

:deep(.p-inputwrapper) {
  background: transparent !important;
}
</style>