<template>
  <div v-if="agentStore.isAgent && agentStore.agentInfo" 
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('agent.title') }}
        </h3>
      </div>
      <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {{ agentStore.agentInfo.agent_name }}
      </span>
    </div>

    <!-- Error message -->
    <div v-if="agentStore.error" 
      class="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400 flex justify-between items-start">
      <span>{{ agentStore.error }}</span>
      <button @click="agentStore.clearError" class="text-red-500 hover:text-red-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Status selector -->
    <div class="space-y-2">
      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400">
        {{ t('agent.changeStatus') }}
      </label>
      
      <select
        :value="agentStore.currentStatus"
        @change="handleStatusChange"
        :disabled="agentStore.isLoading"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
               focus:outline-none focus:ring-2 focus:ring-blue-500 
               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors duration-200"
      >
        <option v-for="status in agentStore.availableStatuses" :key="status" :value="status">
          {{ t(`agent.statuses.${status.toLowerCase().replace(' ', '_')}`) }}
        </option>
      </select>

      <!-- Current status indicator -->
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span :class="getStatusDotColor(agentStore.currentStatus)" 
            class="inline-block w-2 h-2 rounded-full animate-pulse"></span>
          <span>{{ t('agent.currentStatus') }}:</span>
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ t(`agent.statuses.${agentStore.currentStatus?.toLowerCase().replace(' ', '_')}`) }}
          </span>
        </div>

        <!-- Loading indicator -->
        <div v-if="agentStore.isLoading" class="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
          <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span>{{ t('agent.updating') }}</span>
        </div>
      </div>
    </div>

    <!-- Additional agent info (optional) -->
    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ t('agent.type') }}:</span>
          <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ agentStore.agentInfo.agent_type }}</span>
        </div>
        <div>
          <span class="text-gray-500 dark:text-gray-400">{{ t('agent.timeout') }}:</span>
          <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ agentStore.agentInfo.agent_call_timeout }}s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAgentStore } from './AgentStore'

const { t } = useI18n()
const agentStore = useAgentStore()

const handleStatusChange = async (event: Event) => {
  const newStatus = (event.target as HTMLSelectElement).value
  const success = await agentStore.changeAgentStatus(newStatus)
  
  if (success) {
    console.log('Agent status changed successfully to:', newStatus)
  }
}

const getStatusDotColor = (status: string | null) => {
  switch (status) {
    case 'Available':
      return 'bg-green-500'
    case 'On Break':
      return 'bg-yellow-500'
    case 'Logged Out':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}
</script>