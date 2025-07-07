<template>
  <div class="language-switcher">
    <select
      :value="currentLocale"
      @change="handleLocaleChange"
      class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
        {{ locale.flag }} {{ locale.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from '@/core/composables/useLocale'
import type { AvailableLocales } from '@/i18n'

const { currentLocale, changeLocale, availableLocales } = useLocale()

const handleLocaleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  changeLocale(target.value as AvailableLocales)
}
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}
</style>
