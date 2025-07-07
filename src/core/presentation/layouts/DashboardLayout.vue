<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
      <!-- Top Row Section -->
      <div class="mb-8">
        <slot name="header">
          <!-- Default header content or can be overridden by parent component -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Welcome to your dashboard</p>
          </div>
        </slot>
      </div>

      <!-- Two Columns Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <slot name="left-column">
            <!-- Default left column content -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Left Column</h2>
              <router-view name="left" />
            </div>
          </slot>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <slot name="right-column">
            <!-- Default right column content -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Right Column</h2>
              <router-view name="right" />
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This layout provides a header row and two columns below
// Perfect for dashboard-style applications
</script>

<style scoped>
/* Additional responsive adjustments if needed */
@media (max-width: 1024px) {
  .grid-cols-1.lg\:grid-cols-2 {
    gap: 1rem;
  }
}
</style>
