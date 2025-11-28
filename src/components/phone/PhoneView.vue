<template>
  <div class="softphone-container flex gap-4 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <audio ref="remoteAudio" autoplay style="display: none;"></audio>
    <div
      class="phone-dialer bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 w-[320px] flex-shrink-0">
      <div class="mb-6">
        <!-- <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ extensionStore.selectedExtension?.extension }} ({{
              phoneStore.sipConfig.displayName
            }})
          </h3> -->
        <div v-if="agentStore.isAgent && agentStore.agentInfo" class="mb-4 relative z-20">

          <div class="relative w-full h-[60px]">
            <transition mode="out-in" enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1">
              <div v-if="agentStore.error" key="error-state"
                class="absolute inset-0 w-full h-full flex items-center justify-between px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="flex-shrink-0 text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-red-500 uppercase tracking-wide">Error</span>
                    <span class="text-xs text-red-700 dark:text-red-300 font-medium truncate max-w-[180px]"
                      :title="agentStore.error">
                      {{ agentStore.error }}
                    </span>
                  </div>
                </div>

                <button @click="agentStore.clearError"
                  class="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-800 text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <button v-else key="normal-state" @click="toggleStatusMenu" :disabled="agentStore.isLoading"
                class="absolute inset-0 w-full h-full flex items-center justify-between px-3 rounded-xl border transition-all duration-200 group"
                :class="[
                  isStatusMenuOpen
                    ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700'
                ]">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <span class="text-xs font-bold">{{ agentStore.agentInfo.agent_name.substring(0, 2).toUpperCase()
                    }}</span>
                  </div>

                  <div class="flex flex-col items-start">
                    <span
                      class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Agente</span>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full animate-pulse"
                        :class="getStatusColor(agentStore.currentStatus).split(' ')[0]"></span>
                      <span class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">
                        {{ agentStore.currentStatus || '...' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="agentStore.isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500">
                </div>
                <svg v-else class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isStatusMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </transition>
          </div>

          <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2">
            <div v-if="isStatusMenuOpen && !agentStore.error"
              class="absolute top-[65px] left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1 z-50">
              <button v-for="status in agentStore.availableStatuses" :key="status" @click="selectStatus(status)"
                class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full shadow-sm" :class="getStatusColor(status).split(' ')[0]"></div>
                  <span
                    class="text-sm text-gray-700 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white">
                    {{ t(`agent.statuses.${normalizeStatusKey(status)}`) }}
                  </span>
                </div>

                <svg v-if="agentStore.currentStatus === status" class="w-4 h-4 text-blue-500" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="mb-6">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600">
          <input v-model="displayNumber" type="text" readonly :placeholder="$t('phoneView.enternumber')"
            ref="numberInputRef"
            class="w-full text-center text-2xl font-mono bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
      </div>

      <div v-if="phoneStore.callState === 'ringing'" class="mb-6">
        <div
          class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border-2 border-blue-500 dark:border-blue-400 animate-pulse">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            <span class="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {{ t('phone.incomingCall') }}
            </span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="grid grid-cols-3 gap-3">
          <button v-for="key in dialpadKeys" :key="key.value" @click="addDigit(key.value)" :disabled="isCallActive"
            class="dial-button relative flex flex-col items-center justify-center h-16 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ key.value }}</span>
            <span v-if="key.letters" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ key.letters }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex justify-center space-x-3 mb-6">
        <button v-if="phoneStore.callState === 'ringing'" @click="answerCall"
          class="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 focus:ring-green-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 animate-pulse">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>

        <button v-if="phoneStore.callState === 'ringing'" @click="rejectCall"
          class="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 focus:ring-red-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50">
          <PhoneOff :size="32" class="text-white" />
        </button>

        <button v-else @click="handleCall" :disabled="!canMakeCall && !canEndCall" :class="callButtonClass"
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="!isCallActive" class="w-8 h-8 text-green-200" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <PhoneOff v-else :size="32" class="text-white" />
        </button>

        <button @click="toggleMute" :class="phoneStore.isMuted
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
          : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'
          " :disabled="!isCallActive"
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="phoneStore.isMuted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M3 3l18 18" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <button @mousedown="startDelete" @mouseup="endDelete" @mouseleave="endDelete" @touchstart="startDelete"
          @touchend="endDelete" @touchcancel="endDelete" :disabled="displayNumber.length === 0 || isCallActive" :class="isDeleting
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
            : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'
            "
          class="flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>

      <div v-if="isCallActive" class="mb-4">
        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
                {{ t('phoneView.callTo') }}
              </span>
            </div>
            <span class="text-sm text-blue-700 dark:text-blue-300">
              {{ callDuration }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.recentCalls') }}
        </h4>
        <div v-if="phoneStore.recentCalls.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
          <div v-for="call in phoneStore.recentCalls" :key="call.id" @click="selectRecentCall(call.number)"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
            <div class="flex items-center space-x-3">
              <svg :class="call.type === 'outgoing' ? 'text-green-500' : 'text-blue-500'" class="w-4 h-4" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ call.number }}
              </span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTime(call.timestamp) }}
            </span>
          </div>
        </div>
        <div v-else class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">No recent calls</p>
        </div>
      </div>
    </div>

    <div class="flex-1 min-w-0 space-y-4">
      <div
        class="control-panel bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('phoneView.controlPanel') }}
        </h3>

        <!-- <div class="mb-6">
          <div
            class="bg-red-50 dark:bg-red-900 rounded-lg p-4 border border-red-200 dark:border-red-700"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="text-sm font-medium text-red-900 dark:text-red-100">
                  Sara: Unregistered
                </span>
              </div>
            </div>
          </div>
        </div> -->

        <div class="grid grid-cols-2 gap-3 mb-6">
          <button @click="redial" :disabled="!lastDialedNumber || isCallActive"
            class="control-button bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-4 px-3 rounded-lg transition-colors disabled:cursor-not-allowed flex flex-col items-center space-y-1">
            <RotateCcw :size="20" />
            <span class="text-xs">{{ t('phoneView.redial') }}</span>
          </button>

          <button @click="toggleDnd" :class="isDnd ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'"
            :disabled="isCallActive"
            class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <BellOff :size="20" />
            <span class="text-xs">{{ t(isDnd ? 'phoneView.dndOn' : 'phoneView.dnd') }}</span>
          </button>

          <button @click="checkVoicemail" :disabled="isCallActive"
            class="control-button bg-teal-500 hover:bg-teal-600 text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <Voicemail :size="20" />
            <span class="text-xs">Voice mail: {{ phoneStore.voicemail.new }}/{{ phoneStore.voicemail.old }}</span>
          </button>

          <div class="relative">
            <button @click="toggleDialOptions"
              :class="showAdvancedDialOptions ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'"
              class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1 w-full">
              <Mic :size="20" />
              <span class="text-xs">{{
                t(showAdvancedDialOptions ? 'phoneView.micOn' : 'phoneView.mic')
              }}</span>
            </button>

            <div v-show="showAdvancedDialOptions"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
              <div>
                <label for="micSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('phoneView.selectMic') }}
                </label>
                <select id="micSelect" v-model="selectedMicId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="" disabled>{{ t('phoneView.selectDevice') }}</option>
                  <option v-for="device in audioInputDevices" :key="device.deviceId" :value="device.deviceId">
                    {{ device.label || `${t('devices.microphone')} ${device.deviceId.slice(0, 8)}...` }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="showAdvancedDialOptions" @click="showAdvancedDialOptions = false" class="fixed inset-0 z-40"></div>
        </div>

        <div class="grid grid-cols-1 gap-3 mb-6">
          <button @click="toggleAutoAnswer"
            :class="isAutoAnswer ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'" :disabled="isCallActive"
            class="control-button text-white font-medium py-4 px-3 rounded-lg transition-colors flex flex-col items-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <component :is="isAutoAnswer ? 'PhoneCall' : 'PhoneIncoming'" :size="20" />
            <span class="text-xs">{{
              t(isAutoAnswer ? 'phoneView.autoAnswerOn' : 'phoneView.autoAnswer')
            }}</span>
          </button>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <div class="grid grid-cols-1 gap-3">
          <button @click="handleLogout" :disabled="authStore.isLoading"
            class="w-full justify-center inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            <svg v-if="authStore.isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ authStore.isLoading ? t('auth.loggingOut') : t('auth.logOut') }}
          </button>
        </div>

      </div>

    </div>

    <div
      class="dynamic-panel bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 flex-1 min-w-0">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">{{ t('phoneView.info') }}</h3>

      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.recentCalls') }}
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.sip') }}:</span>
              <span :class="connectionStatusTextClass" class="text-sm font-medium">
                {{ connectionStatus }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.status') }}:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.connectionState }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.call') }}:</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.callState }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.sipConfig') }}
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                t('phoneView.server')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.server }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                t('phoneView.user')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.username }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                t('phoneView.domain')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ phoneStore.sipConfig.domain }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {{ t('phoneView.controls') }}
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
          <div class="space-y-2">
            <div v-for="log in activityLogs" :key="log.id" class="text-xs">
              <span class="text-gray-500 dark:text-gray-400">{{ formatTime(log.timestamp) }}</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">{{ t('phoneView.agentPanel') }}</h4>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('phoneView.tbd') }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import { useSipStore } from '@/components/login/SipStore'
import { useAuthStore } from '../login/AuthStore'
import { RotateCcw, BellOff, Voicemail, Mic, PhoneOff } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '../agent/AgentStore'
import router from '@/router'

const { t } = useI18n()

const extensionStore = useExtensionStore()
const phoneStore = useSipStore()
const agentStore = useAgentStore()
const authStore = useAuthStore()
const isStatusMenuOpen = ref(false)
const remoteAudio = ref<HTMLAudioElement | null>(null)

const displayNumber = ref('')

const currentCallNumber = ref('')
const callStartTime = ref<Date | null>(null)
const callDuration = ref('00:00')
const callTimer = ref<number | null>(null)

const isDeleting = ref(false)
const deleteTimer = ref<number | null>(null)
const deleteStartTime = ref<number | null>(null)
const HOLD_DURATION = 500

const isDnd = ref(false)
const isAutoAnswer = ref(false)
const lastDialedNumber = ref('')

const showAdvancedDialOptions = ref(false)
const audioInputDevices = ref<MediaDeviceInfo[]>([])
const selectedMicId = ref<string | null>(null)
const numberInputRef = ref<HTMLInputElement | null>(null)

const isCallActive = computed(() => {
  const callStates = ['calling', 'ringing', 'connected', 'establishing']
  return callStates.includes(phoneStore.callState)
})

const ringTone = ref<HTMLAudioElement | null>(null)

const activityLogs = ref([
  { id: 1, timestamp: new Date(), message: t('activityLogs.sipInitialized') },
  { id: 2, timestamp: new Date(Date.now() - 60000), message: t('activityLogs.connectingToServer') },
  { id: 3, timestamp: new Date(Date.now() - 120000), message: t('activityLogs.applicationStarted') },
])

const dialSounds: Record<
  '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '*' | '#',
  HTMLAudioElement
> = {
  '0': new Audio(new URL('@/assets/wav/0.wav', import.meta.url).href),
  '1': new Audio(new URL('@/assets/wav/1.wav', import.meta.url).href),
  '2': new Audio(new URL('@/assets/wav/2.wav', import.meta.url).href),
  '3': new Audio(new URL('@/assets/wav/3.wav', import.meta.url).href),
  '4': new Audio(new URL('@/assets/wav/4.wav', import.meta.url).href),
  '5': new Audio(new URL('@/assets/wav/5.wav', import.meta.url).href),
  '6': new Audio(new URL('@/assets/wav/6.wav', import.meta.url).href),
  '7': new Audio(new URL('@/assets/wav/7.wav', import.meta.url).href),
  '8': new Audio(new URL('@/assets/wav/8.wav', import.meta.url).href),
  '9': new Audio(new URL('@/assets/wav/9.wav', import.meta.url).href),
  '*': new Audio(new URL('@/assets/wav/star.wav', import.meta.url).href),
  '#': new Audio(new URL('@/assets/wav/hash.wav', import.meta.url).href),
}

ringTone.value = new Audio(new URL('@/assets/ring.mp3', import.meta.url).href)
{
  if (ringTone.value) {
    ringTone.value.loop = true
    ringTone.value.volume = 0.5
  }
}

const dialpadKeys = [
  { value: '1', letters: '' },
  { value: '2', letters: 'ABC' },
  { value: '3', letters: 'DEF' },
  { value: '4', letters: 'GHI' },
  { value: '5', letters: 'JKL' },
  { value: '6', letters: 'MNO' },
  { value: '7', letters: 'PQRS' },
  { value: '8', letters: 'TUV' },
  { value: '9', letters: 'WXYZ' },
  { value: '*', letters: '' },
  { value: '0', letters: '+' },
  { value: '#', letters: '' },
]

const connectionStatus = computed(() => {
  return phoneStore.isRegistered ? t('connectionStatus.connected') : t('connectionStatus.disconnected')
})


const connectionStatusTextClass = computed(() => {
  return phoneStore.isRegistered
    ? 'text-green-700 dark:text-green-400'
    : 'text-red-700 dark:text-red-400'
})

const canMakeCall = computed(() => {
  return displayNumber.value.length > 0 && !isCallActive.value && phoneStore.isRegistered
})

const canEndCall = computed(() => {
  return isCallActive.value
})

const callButtonClass = computed(() => {
  if (isCallActive.value) {
    return 'bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse'
  }
  if (!canMakeCall.value) {
    return 'bg-gray-400 cursor-not-allowed'
  }
  return 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
})

const startRinging = () => {
  if (ringTone.value && !phoneStore.isDnd) {
    ringTone.value.currentTime = 0
    ringTone.value.play().catch(error => {
      console.error('Error playing ringtone:', error)
    })
  }
}

const stopRinging = () => {
  if (ringTone.value) {
    ringTone.value.pause()
    ringTone.value.currentTime = 0
  }
}


const toggleStatusMenu = () => {
  if (!agentStore.isLoading) {
    isStatusMenuOpen.value = !isStatusMenuOpen.value
  }
}

const selectStatus = async (status: string) => {
  isStatusMenuOpen.value = false;
  const success = await agentStore.changeAgentStatus(status);
  if (success) {
    addActivityLog(`${t('activityLogs.statusChangedTo')}: ${status}`);
  } else {
    addActivityLog(t('activityLogs.errorChangingStatus'));
  }
}

const normalizeStatusKey = (status: string): string => {
  return status
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim()
}

const getStatusColor = (status: string | null | undefined) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('on demand') || s.includes('on_demand')) return 'bg-blue-500 text-blue-500';
  if (s.includes('available')) return 'bg-green-500 text-green-500';
  if (s.includes('break')) return 'bg-orange-500 text-orange-500';
  if (s.includes('log')) return 'bg-red-500 text-red-500';
  return 'bg-gray-400 text-gray-400';
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (isCallActive.value) return

  const key = event.key

  if (/^[0-9]$/.test(key)) {
    event.preventDefault()
    addDigit(key)
    return
  }

  if (key === '*') {
    event.preventDefault()
    addDigit('*')
    return
  }

  if (key === '#') {
    event.preventDefault()
    addDigit('#')
    return
  }

  if (key === 'Enter' && canMakeCall.value) {
    event.preventDefault()
    handleCall()
    return
  }

  if (key === 'Escape' && canEndCall.value) {
    event.preventDefault()
    handleCall()
    return
  }

  if (key === 'Backspace' && displayNumber.value.length > 0) {
    event.preventDefault()
    clearLastDigit()
    return
  }

  if (key === 'Delete' && displayNumber.value.length > 0) {
    event.preventDefault()
    clearDisplay()
    return
  }
}

const addDigit = (digit: string) => {
  const sound = dialSounds[digit as keyof typeof dialSounds]
  if (sound) {
    sound.currentTime = 0
    sound.play()
  }

  displayNumber.value += digit
}

const startDelete = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  if (displayNumber.value.length === 0 || isCallActive.value) return

  isDeleting.value = true
  deleteStartTime.value = Date.now()

  deleteTimer.value = window.setTimeout(() => {
    clearDisplay()
    isDeleting.value = false
  }, HOLD_DURATION)
}

const endDelete = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  if (!isDeleting.value) return

  isDeleting.value = false

  if (deleteTimer.value) {
    clearTimeout(deleteTimer.value)
    deleteTimer.value = null

    if (deleteStartTime.value && Date.now() - deleteStartTime.value < HOLD_DURATION) {
      clearLastDigit()
    }
  }

  deleteStartTime.value = null
}

const clearLastDigit = () => {
  displayNumber.value = displayNumber.value.slice(0, -1)
}

const clearDisplay = () => {
  displayNumber.value = ''
}

const makeCall = async (number: string) => {
  try {
    lastDialedNumber.value = number

    const success = await phoneStore.makeCall(number)

    if (success) {
      currentCallNumber.value = number
      callStartTime.value = new Date()
      startCallTimer()

      phoneStore.addRecentCall(number, 'outgoing')

      addActivityLog(`${t('activityLogs.callInitiated')} ${number}`)
    } else {
      addActivityLog(`${t('activityLogs.errorInitiatingCall')} ${number}`)
    }
  } catch (error) {
    console.error('Error making call:', error)
    addActivityLog(`${t('activityLogs.errorCalling')} ${number}`)
  }
}

const endCall = async () => {
  try {
    console.log('Attempting to end call, current state:', phoneStore.callState)

    await phoneStore.endCall()

    addActivityLog(`${t('activityLogs.callEnded')} ${currentCallNumber.value}`)

    currentCallNumber.value = ''
    callStartTime.value = null
    stopCallTimer()

    console.log('Call ended, new state:', phoneStore.callState)
  } catch (error) {
    console.error('Error ending call:', error)
    addActivityLog(t('activityLogs.errorEndingCall'))
  }
}

const answerCall = async () => {
  try {
    stopRinging()
    console.log('Answering incoming call...')

    await phoneStore.answerCall()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const incomingNumber = (phoneStore.simpleUser as any)?.session?.remoteIdentity?.uri?.user || 'Incoming Call'

    currentCallNumber.value = incomingNumber
    callStartTime.value = new Date()
    startCallTimer()

    phoneStore.addRecentCall(incomingNumber, 'incoming')

    addActivityLog(t('activityLogs.incomingCallAnswered'))

    console.log('Call answered successfully, new state:', phoneStore.callState)
  } catch (error) {
    console.error('Error answering call:', error)
    addActivityLog(t('activityLogs.errorAnsweringCall'))
  }
}

const rejectCall = async () => {
  try {
    console.log('Rejecting incoming call...')
    stopRinging()

    await phoneStore.endCall()

    addActivityLog(t('activityLogs.incomingCallRejected'))

    console.log('Call rejected, new state:', phoneStore.callState)
  } catch (error) {
    console.error('Error rejecting call:', error)
    addActivityLog(t('activityLogs.errorRejectingCall'))
  }
}

const handleCall = async () => {
  console.log('handleCall - Estados:', {
    isCallActive: isCallActive.value,
    phoneStoreCallState: phoneStore.callState,
    canMakeCall: canMakeCall.value,
    canEndCall: canEndCall.value,
    displayNumber: displayNumber.value,
  })

  if (isCallActive.value && canEndCall.value) {
    console.log('Ending call...')
    await endCall()
  } else if (!isCallActive.value && canMakeCall.value) {
    console.log('Initiating call...')
    await makeCall(displayNumber.value)
  }
}

const startCallTimer = () => {
  callTimer.value = setInterval(() => {
    if (callStartTime.value) {
      const elapsed = Math.floor((Date.now() - callStartTime.value.getTime()) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      callDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }, 1000)
}

const stopCallTimer = () => {
  if (callTimer.value) {
    clearInterval(callTimer.value)
    callTimer.value = null
  }
  callDuration.value = '00:00'
}

const selectRecentCall = (number: string) => {
  if (!isCallActive.value) {
    displayNumber.value = number
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const redial = () => {
  if (lastDialedNumber.value && !isCallActive.value) {
    displayNumber.value = lastDialedNumber.value
    handleCall()
  }
}

const toggleDnd = () => {
  isDnd.value = !isDnd.value
  phoneStore.isDnd = isDnd.value
  addActivityLog(isDnd.value ? t('activityLogs.dndActivated') : t('activityLogs.dndDeactivated'))
}

const checkVoicemail = async () => {
  try {
    const vmNumber = '*98'
    displayNumber.value = vmNumber
    await handleCall()
    addActivityLog(t('activityLogs.accessingVoicemail'))
  } catch (error) {
    addActivityLog(t('activityLogs.errorAccessingVoicemail'))
    console.error('Error checking voicemail:', error)
  }
}

const toggleAutoAnswer = () => {
  isAutoAnswer.value = !isAutoAnswer.value
  phoneStore.isAutoAnswer = isAutoAnswer.value
  addActivityLog(isAutoAnswer.value ? t('activityLogs.autoAnswerActivated') : t('activityLogs.autoAnswerDeactivated'))
}

const addActivityLog = (message: string) => {
  activityLogs.value.unshift({
    id: Date.now(),
    timestamp: new Date(),
    message,
  })

  if (activityLogs.value.length > 50) {
    activityLogs.value = activityLogs.value.slice(0, 50)
  }
}

const toggleDialOptions = async () => {
  if (showAdvancedDialOptions.value) {
    showAdvancedDialOptions.value = false
  } else {
    showAdvancedDialOptions.value = true
    await loadAudioInputDevices()
  }
}

const toggleMute = async () => {
  await phoneStore.toggleMute()
  addActivityLog(phoneStore.isMuted ? t('activityLogs.microphoneMuted') : t('activityLogs.microphoneActivated'))
}

const loadAudioInputDevices = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })

    const devices = await navigator.mediaDevices.enumerateDevices()
    audioInputDevices.value = devices.filter((device) => device.kind === 'audioinput')
  } catch (err) {
    console.error('Error accediendo a dispositivos de audio:', err)
  }
}

watch(
  () => phoneStore.callState,
  (newState, oldState) => {
    if (newState === 'ended' || newState === 'idle') {
      stopCallTimer()
      currentCallNumber.value = ''
      callStartTime.value = null
      stopRinging()
      clearDisplay()
    }

    if (newState === 'ringing' && oldState !== 'ringing') {
      startRinging()
      addActivityLog(t('activityLogs.incomingCallRinging'))
    }
  },
)

watch(
  () => extensionStore.selectedExtension,
  async (newExtension) => {
    if (newExtension) {
      await agentStore.checkAgentStatus(newExtension.extension)
    } else {
      agentStore.clearAgent()
    }
  },
  { immediate: false }
)

onMounted(async () => {
  phoneStore.loadSipConfigFromStorage()
  phoneStore.loadRecentCallsFromStorage()

  isDnd.value = phoneStore.isDnd
  isAutoAnswer.value = phoneStore.isAutoAnswer

  window.addEventListener('keydown', handleKeyDown)

  if (
    phoneStore.sipConfig.username &&
    phoneStore.sipConfig.password &&
    phoneStore.sipConfig.server &&
    !phoneStore.isConnected
  ) {
    if (remoteAudio.value) {
      await phoneStore.initializeSip(phoneStore.sipConfig, remoteAudio.value)
    }
  } else if (remoteAudio.value) {
    phoneStore.setAudioElement(remoteAudio.value)
  }

  if (extensionStore.selectedExtension) {
    await agentStore.checkAgentStatus(extensionStore.selectedExtension.extension)
  }
})

onUnmounted(() => {
  stopCallTimer()
  stopRinging()
  if (deleteTimer.value) {
    clearTimeout(deleteTimer.value)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

watch(displayNumber, () => {
  nextTick(() => {
    if (numberInputRef.value) {
      numberInputRef.value.scrollLeft = numberInputRef.value.scrollWidth
    }
  })
})

const handleLogout = async () => {
  try {
    if (phoneStore.isConnected) {
      await phoneStore.disconnect()
    }
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}


</script>

<style scoped>
.dial-button:active {
  transform: scale(0.95);
}

.control-button:active {
  transform: scale(0.98);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 1024px) {
  .softphone-container {
    flex-direction: column;
  }

  .phone-dialer {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .control-panel,
  .dynamic-panel {
    min-width: auto;
  }
}
</style>
