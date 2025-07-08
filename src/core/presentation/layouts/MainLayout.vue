<template>
  <DashboardLayout>
    <!-- Custom header for the main layout -->
    <template #header>
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">AlmaPhone</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Communication Platform</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Navigation or user menu can go here -->
            <router-link
              to="/extensions"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Extensions
            </router-link>
          </div>
        </div>
      </div>
    </template>

    <!-- Main content in left column -->
    <template #left-column>
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 min-h-[400px]"
      >
        <router-view />
      </div>
    </template>

    <!-- Sidebar/secondary content in right column -->
    <template #right-column>
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 min-h-[400px]"
      >
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Extension Manager</p>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Call History</p>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Settings</p>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from './DashboardLayout.vue'
</script>
