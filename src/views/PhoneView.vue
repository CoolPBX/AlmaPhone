<template>
  <div class="phone-view">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Phone Interface</h2>

      <div v-if="extensionStore.selectedExtension" class="mb-6">
        <p class="text-gray-600 dark:text-gray-400">
          Connected with extension:
          <span class="font-medium text-blue-600 dark:text-blue-400">
            {{ extensionStore.selectedExtension.extension }}
          </span>
        </p>
      </div>

      <div class="space-y-4">
        <p class="text-gray-500 dark:text-gray-400">Phone interface will be implemented here</p>

        <button
          @click="goBackToExtensions"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Change Extension
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'

const router = useRouter()
const extensionStore = useExtensionStore()

const goBackToExtensions = () => {
  router.push('/extensions')
}
</script>
