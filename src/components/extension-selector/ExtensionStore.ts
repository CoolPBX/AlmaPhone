import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ExtensionRepository } from './repositories/external/ExtensionRepository'
import type { ExtensionItemDto, ExtensionListResponseDto } from './domain/schemas/ExtensionSchemas'
import { GetExtensionsUseCase } from './domain/use-cases/extension/GetExtensionsUseCase'
import { useAuthStore } from '../login/AuthStore'
import type { ApiErrorDto } from '../login/domain/schemas/AuthSchemas'

export const useExtensionStore = defineStore(
  'extension',
  () => {
    const extensions = ref<ExtensionItemDto[]>([])
    const selectedExtension = ref<ExtensionItemDto | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const extensionRepository = new ExtensionRepository()
    const getExtensionsUseCase = new GetExtensionsUseCase(extensionRepository)

    const hasExtensions = computed(() => extensions.value.length > 0)
    const availableExtensions = computed(() =>
      extensions.value.filter((ext) => ext.enabled !== false),
    )

    const fetchExtensions = async (): Promise<boolean> => {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        error.value = 'User not authenticated'
        return false
      }

      isLoading.value = true
      error.value = null

      try {
        const result = await getExtensionsUseCase.execute(authStore.user!.api_key)

        return result.fold(
          (err: ApiErrorDto) => {
            error.value = err.message
            extensions.value = []
            return false
          },
          (response: ExtensionListResponseDto) => {
            if (response.data && response.data.length > 0) {
              extensions.value = response.data

              if (response.data.length === 1 && response.data[0]) {
                selectedExtension.value = response.data[0]
              }
            } else {
              extensions.value = []
            }

            return true
          },
        )
      } finally {
        isLoading.value = false
      }
    }

    const selectExtension = (extension: ExtensionItemDto): void => {
      selectedExtension.value = extension
      localStorage.setItem('selected_extension', JSON.stringify(extension))
    }

    const restoreSelectedExtension = (): boolean => {
      const stored = localStorage.getItem('selected_extension')

      if (stored) {
        try {
          selectedExtension.value = JSON.parse(stored)
          return true
        } catch {
          localStorage.removeItem('selected_extension')
          return false
        }
      }

      return false
    }

    const clearExtensions = () => {
      extensions.value = []
      selectedExtension.value = null
      error.value = null
      localStorage.removeItem('selected_extension')
    }

    const clearError = () => {
      error.value = null
    }

    return {
      extensions: readonly(extensions),
      selectedExtension: readonly(selectedExtension),
      isLoading: readonly(isLoading),
      error: readonly(error),

      hasExtensions,
      availableExtensions,

      // Actions
      fetchExtensions,
      selectExtension,
      restoreSelectedExtension,
      clearExtensions,
      clearError,
    }
  },
  {
    persist: {
      key: 'extension-store',
      storage: localStorage,
      pick: ['selectedExtension', 'extensions'],
    },
  },
)
