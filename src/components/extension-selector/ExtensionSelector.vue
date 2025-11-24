<template>
  <BaseModal :isOpen="true" :title="t('extensionSelector.title')" size="lg" :closeOnBackdrop="false"
    :showCloseButton="false">
    <div class="space-y-4">
      <!-- User info -->
      <div class="flex justify-between flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center space-x-4 overflow-hidden max-w-full">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ t('auth.connectedAs') }}: {{ authStore.userEmail }}
          </span>
        </div>
      </div>

      <div v-if="extensionStore.isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ t('extensionSelector.loadingExtensions') }}
        </p>
      </div>

      <div v-else-if="extensionStore.error"
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex justify-between items-start">
          <p class="text-red-700 dark:text-red-400">{{ extensionStore.error }}</p>
          <button @click="extensionStore.clearError" class="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
        <button @click="handleRefresh" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
          {{ t('common.retry') }}
        </button>
      </div>

      <div v-else-if="!extensionStore.hasExtensions" class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">{{ t('extensionSelector.noExtensions') }}</p>
        <button @click="handleRefresh" class="mt-2 text-blue-600 hover:text-blue-800 underline">
          {{ t('common.refresh') }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[50vh] overflow-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('extensionSelector.extension') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('extensionSelector.action') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="extension in extensionStore.availableExtensions" :key="extension.extension_uuid"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected(extension) }">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold">
                  {{ extension.extension }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <button @click="selectExtension(extension)" class="px-3 py-1 rounded-md text-sm font-medium" :class="isSelected(extension)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    " :disabled="agentStore.isLoading">
                    {{
                      isSelected(extension)
                        ? t('extensionSelector.extensionSelectedLabel')
                        : t('extensionSelector.selectExtension')
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer v-if="extensionStore.selectedExtension">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('extensionSelector.extensionSelected') }}:
            <span class="font-bold text-gray-900 dark:text-white">
              {{ extensionStore.selectedExtension.extension }}
            </span>
          </div>
          <button @click="proceedToPhone"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {{ t('common.continue') }}
          </button>
        </div>

        <div v-if="agentStore.isLoading" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
          {{ t('extensionSelector.checkingCallCenter') }}
        </div>

        <div v-else-if="agentStore.isAgent && agentStore.agentInfo" 
          class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
                {{ t('callCenteragent.callCenterAgent') }}
              </p>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {{ t('callCenteragent.belongsToCallCenter') }}: 
                <span class="font-semibold">{{ agentStore.agentInfo.agent_name }}</span>
              </p>
              <p class="text-xs text-blue-500 dark:text-blue-500 mt-1">
                {{ t('callCenteragent.currentStatus') }}: 
                <span class="font-semibold">{{ agentStore.agentInfo.agent_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <div v-else-if="agentStore.error" 
          class="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
          {{ agentStore.error }}
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ExtensionItemDto } from './domain/schemas/ExtensionSchemas'
import { useAuthStore } from '../login/AuthStore'
import { useExtensionStore } from './ExtensionStore'
import { useAgentStore } from '../agent/AgentStore'
import BaseModal from '@/core/presentation/components/BaseModal.vue'

interface Emits {
  (e: 'extension-selected'): void
  (e: 'logout'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const agentStore = useAgentStore()
const router = useRouter()

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    extensionStore.clearExtensions()
    agentStore.clearAgent()
    await extensionStore.fetchExtensions()
    
    if (extensionStore.selectedExtension) {
      await agentStore.checkAgentStatus(extensionStore.selectedExtension.extension)
    }
  }
})

const isSelected = (extension: ExtensionItemDto) => {
  return extension.extension_uuid === extensionStore.selectedExtension?.extension_uuid
}

const selectExtension = async (extension: ExtensionItemDto) => {
  extensionStore.selectExtension(extension)
  
  await agentStore.checkAgentStatus(extension.extension)
}

const handleRefresh = async () => {
  await extensionStore.fetchExtensions()
  
  if (extensionStore.selectedExtension) {
    await agentStore.checkAgentStatus(extensionStore.selectedExtension.extension)
  }
}

const proceedToPhone = () => {
  emit('extension-selected')
}
</script>