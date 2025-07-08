<template>
  <BaseModal
    :isOpen="true"
    :title="t('extensionSelector.title')"
    size="lg"
    :closeOnBackdrop="false"
    :showCloseButton="false"
  >
    <div class="space-y-4">
      <!-- User info -->
      <div
        class="flex justify-between flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
      >
        <div class="flex items-center space-x-4 overflow-hidden max-w-full">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ t('auth.connectedAs') }}: {{ authStore.userEmail }}
          </span>
          <!-- <LanguageSwitcher /> -->
        </div>
        <!-- <button
          @click="handleLogout"
          class="px-2 py-1 text-white rounded-md focus:outline-none focus:ring-2 text-sm bg-red-600 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-600"
        >
          {{ t('auth.logout') }}
        </button> -->
      </div>

      <div v-if="extensionStore.isLoading" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ t('extensionSelector.loadingExtensions') }}
        </p>
      </div>

      <div
        v-else-if="extensionStore.error"
        class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex justify-between items-start">
          <p class="text-red-700 dark:text-red-400">{{ extensionStore.error }}</p>
          <button @click="extensionStore.clearError" class="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
        <button
          @click="handleRefresh"
          class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
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
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-[50vh] overflow-auto"
        >
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {{ t('extensionSelector.extension') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {{ t('extensionSelector.action') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="extension in extensionStore.availableExtensions"
                :key="extension.extension_uuid"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected(extension) }"
              >
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold">
                  {{ extension.extension }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <button
                    @click="selectExtension(extension)"
                    class="px-3 py-1 rounded-md text-sm font-medium"
                    :class="
                      isSelected(extension)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    "
                  >
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
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('extensionSelector.extensionSelected') }}:
          <span class="font-bold text-white">{{ extensionStore.selectedExtension.extension }}</span>
        </div>
        <button
          @click="proceedToPhone"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ t('common.continue') }}
        </button>
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
import BaseModal from '@/core/presentation/components/BaseModal.vue'
// import LanguageSwitcher from '@/core/presentation/components/LanguageSwitcher.vue'

interface Emits {
  (e: 'extension-selected'): void
  (e: 'logout'): void
}

const emit = defineEmits<Emits>()

const { t } = useI18n()
const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const router = useRouter()

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    extensionStore.clearExtensions()
    await extensionStore.fetchExtensions()
  }
})

const isSelected = (extension: ExtensionItemDto) => {
  return extension.extension_uuid === extensionStore.selectedExtension?.extension_uuid
}

const selectExtension = (extension: ExtensionItemDto) => {
  extensionStore.selectExtension(extension)
}

const handleRefresh = async () => {
  await extensionStore.fetchExtensions()
}

const proceedToPhone = () => {
  emit('extension-selected')
}

// const handleLogout = () => {
//   emit('logout')
// }
</script>
