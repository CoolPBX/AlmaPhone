<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <!-- Modal -->
    <div class="flex items-center justify-center min-h-screen p-4">
      <div
        class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all"
        :class="sizeClasses"
      >
        <!-- Header -->
        <div
          v-if="title || $slots.header"
          class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <slot name="header">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="showCloseButton"
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showCloseButton: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<Emits>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }
  return sizes[props.size]
})

const closeModal = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}
</script>
