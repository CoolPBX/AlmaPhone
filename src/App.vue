<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSipStore } from '@/components/login/SipStore'
import { registerServiceWorker } from '@/utils/serviceWorkerRegistration'

const sipStore = useSipStore()

onMounted(async () => {
  console.log('AlmaPhone - Application Started')
 
  await registerServiceWorker()
  
  sipStore.initServiceWorkerListener() 
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  padding: 0;
}
</style>