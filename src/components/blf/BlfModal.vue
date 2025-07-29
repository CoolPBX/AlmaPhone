<template>
  <BaseModal 
    :is-open="props.isOpen" 
    :title="t('phoneView.manageBLF')" 
    size="lg"
    @close="closeModal"
  >
    <div class="space-y-6">
      <!-- Formulario para agregar nuevo BLF -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.addNewBLF') }}
        </h4>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('phoneView.extension') }}
            </label>
            <input
              v-model="newBlf.extension"
              type="text"
              placeholder="1001"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('phoneView.label') }}
            </label>
            <input
              v-model="newBlf.label"
              type="text"
              placeholder="BLF 101"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex justify-end">
            <button
              @click="addNewBlf"
              :disabled="!canAddBlf"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {{ t('phoneView.addBLF') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de BLFs existentes -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.currentBLFs') }} ({{ phoneStore.blfExtensions.length }})
        </h4>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="blf in phoneStore.blfExtensions"
            :key="blf.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-center space-x-3">
              <div :class="getBlfStatusClass(blf.status)" class="w-3 h-3 rounded-full"></div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ blf.label }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ blf.extension }} - {{ getBlfStatusText(blf.status) }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="callBlf(blf.extension)"
                :disabled="props.isCallActive"
                class="p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                :title="t('phoneView.call')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </button>
              <button
                @click="removeBlf(blf.id as string)"
                class="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                :title="t('phoneView.remove')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <div
            v-if="phoneStore.blfExtensions.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            {{ t('phoneView.noBLFsConfigured') }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSipStore } from '@/components/login/SipStore'
import BaseModal from '@/core/presentation/components/BaseModal.vue'

interface Props {
  isOpen: boolean
  isCallActive: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'call', extension: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const phoneStore = useSipStore()

const newBlf = ref({
  extension: '',
  label: ''
})

const canAddBlf = computed(() => {
  return newBlf.value.extension.trim() !== '' && newBlf.value.label.trim() !== ''
})

const getBlfStatusClass = (status: string) => {
  const statusClasses = {
    idle: 'bg-green-500',
    busy: 'bg-red-500',
    ringing: 'bg-yellow-500 animate-pulse',
    unavailable: 'bg-gray-500'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-500'
}

const getBlfStatusText = (status: string) => {
  const statusTexts = {
    idle: t('phoneView.available'),
    busy: t('phoneView.busy'),
    ringing: t('phoneView.ringing'),
    unavailable: t('phoneView.unavailable')
  }
  return statusTexts[status as keyof typeof statusTexts] || t('phoneView.unknown')
}

const addNewBlf = () => {
  if (canAddBlf.value) {
    phoneStore.addBlfExtension(newBlf.value.extension.trim(), newBlf.value.label.trim())
    newBlf.value = { extension: '', label: '' }
  }
}

const removeBlf = (id: string) => {
  phoneStore.removeBlfExtension(id)
}

const callBlf = (extension: string) => {
  emit('call', extension)
  closeModal()
}

const closeModal = () => {
  emit('close')
}
</script>