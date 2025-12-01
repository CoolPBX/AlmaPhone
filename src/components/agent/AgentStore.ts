import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { AgentRepository } from './repositories/external/AgentRepository'
import type { AgentItemDto } from './domain/schemas/AgentSchemas'
import { CheckIfExtensionIsAgentUseCase } from './domain/use-cases/CheckIfExtensionIsAgentUseCase'
import { ChangeAgentStatusUseCase } from './domain/use-cases/ChangeAgentStatusUseCase'
import { useAuthStore } from '../login/AuthStore'
import type { ApiErrorDto } from '../login/domain/schemas/AuthSchemas'

export const useAgentStore = defineStore('agent', () => {
  const agentInfo = ref<AgentItemDto | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const agentRepository = new AgentRepository()
  const checkIfExtensionIsAgentUseCase = new CheckIfExtensionIsAgentUseCase(agentRepository)
  const changeAgentStatusUseCase = new ChangeAgentStatusUseCase(agentRepository)

  const isAgent = computed(() => agentInfo.value !== null)
  const currentStatus = computed(() => agentInfo.value?.agent_status || null)
  const availableStatuses = ref<string[]>([
    'Available',
    'Available (On Demand)',
    'On Break',
    'Logged Out',
  ])

  const checkAgentStatus = async (extension: string): Promise<boolean> => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated || !extension) {
      agentInfo.value = null
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await checkIfExtensionIsAgentUseCase.execute(
        authStore.user!.api_key,
        extension,
      )

      return result.fold(
        (err: ApiErrorDto) => {
          error.value = err.message
          agentInfo.value = null
          return false
        },
        (agent) => {
          agentInfo.value = agent
          return agent !== null
        },
      )
    } finally {
      isLoading.value = false
    }
  }

  const changeAgentStatus = async (newStatus: string): Promise<boolean> => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated || !agentInfo.value) {
      error.value = 'No agent information available'
      return false
    }

    if (!agentInfo.value.call_center_agent_uuid) {
      error.value = 'Agent UUID not found'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await changeAgentStatusUseCase.execute(
        authStore.user!.api_key,
        agentInfo.value.call_center_agent_uuid,
        newStatus,
      )

      return result.fold(
        (err) => {
          error.value = err.message
          return false
        },
        () => {
          if (agentInfo.value) {
            agentInfo.value = {
              ...agentInfo.value,
              agent_status: newStatus,
            }
          }
          return true
        },
      )
    } finally {
      isLoading.value = false
    }
  }
  const clearAgent = () => {
    agentInfo.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    agentInfo: readonly(agentInfo),
    isLoading: readonly(isLoading),
    error: readonly(error),

    isAgent,
    currentStatus,
    availableStatuses: readonly(availableStatuses),

    checkAgentStatus,
    changeAgentStatus,
    clearAgent,
    clearError,
  }
})
