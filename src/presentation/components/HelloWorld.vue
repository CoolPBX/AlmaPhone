<template>
  <div class="hello-world">
    <h2>Hello World!</h2>
    <p>Welcome to {{ appStore.getAppName }} - your modern web-based VoIP solution!</p>
    <p>Status: <span :class="{ ready: isReady }">{{ isReady ? 'Ready' : 'Loading...' }}</span></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const isReady = ref<boolean>(false)

onMounted(() => {
  setTimeout(() => {
    isReady.value = true
  }, 1000)
})
</script>

<style scoped>
.hello-world {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0;
}
.ready {
  color: #27ae60;
  font-weight: bold;
}
</style>