<template>
  <div class="phone-view">
    <h1>AlmaPhone</h1>
    <div class="phone-interface">
      <input v-model="phoneNumber" placeholder="Enter phone number..." />
      <button @click="makeCall" :disabled="!phoneNumber">Call</button>
      <button @click="clearNumber">Clear</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const phoneNumber = ref<string>('')

const makeCall = (): void => {
  if (phoneNumber.value) {
    alert(`Calling ${phoneNumber.value}...`)
    console.log('Making call to:', phoneNumber.value)
  }
}

const clearNumber = (): void => {
  phoneNumber.value = ''
}
</script>

<style scoped>
.phone-view {
  text-align: center;
}
.phone-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 300px;
  margin: 2rem auto;
}
.phone-interface input {
  padding: 0.5rem;
  width: 100%;
}
.phone-interface button {
  padding: 0.5rem 1rem;
  min-width: 100px;
}
</style>