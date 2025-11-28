<template>
  <Toast position="top-right" />
  <div class="p-4 bg-white dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">AlmaPhone</h1>

      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div class="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-3 md:gap-0">

          <div class="flex items-center gap-3 h-9 w-full md:w-auto">
            <div class="flex items-center space-x-2">
              <div :class="connectionStatusClass" class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span class="font-medium text-gray-900 dark:text-white break-all truncate">
              {{ authStore.userEmail }}
            </span>
          </div>

          <div class="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-0 w-full md:w-auto">

            <div class="flex items-center h-9 w-full md:w-auto min-w-0">
              <span class="text-sm text-gray-500 dark:text-gray-400 hidden md:inline mx-2">•</span>

              <Select v-if="extensionStore.availableExtensions.length > 1" v-model="selectedExtensionValue"
                :options="extensionStore.availableExtensions" optionLabel="extension" optionValue="extension_uuid"
                @change="handleExtensionChange" :loading="extensionStore.isLoading" checkmark :highlightOnSelect="false"
                placeholder="Ext" class="custom-extension-select flex items-center w-full md:w-auto" 
                :pt="{
                  root: { class: 'relative inline-flex bg-transparent align-middle w-full md:w-auto' },
                  label: { class: 'flex-1 bg-transparent truncate' }
                }">
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex items-center space-x-2 overflow-hidden">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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

              <span v-else class="text-sm font-medium dark:text-white flex items-center space-x-2 h-full w-full md:w-auto">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{{ extensionStore.selectedExtension?.extension }}</span>
              </span>
            </div>

            <div v-if="agentName" class="flex items-center h-9 w-full md:w-auto min-w-0">
              <span class="text-sm text-gray-500 dark:text-gray-400 hidden md:inline mx-2">•</span>

              <div class="flex items-center justify-center space-x-2 px-3 h-full w-full md:w-auto bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-sm font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap truncate">
                  {{ agentName }}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/components/login/AuthStore'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import { useSipStore } from '@/components/login/SipStore'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useAgentStore } from '@/components/agent/AgentStore'


const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const sipStore = useSipStore()
const agentStore = useAgentStore()
const toast = useToast()

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

:deep(.p-toast) {
  width: auto !important;
  max-width: 25rem;
}

@media (max-width: 768px) {
  :deep(.p-toast) {
    width: 90% !important;
    left: 50% !important;
    transform: translateX(-50%);
    top: 20px !important;
    right: auto !important;
  }
}

:deep(.p-toast-message-content) {
  display: flex;
  align-items: start;
}

:deep(.p-toast-detail) {
  word-break: break-word;
  white-space: normal !important;
  text-align: left;
}
</style>