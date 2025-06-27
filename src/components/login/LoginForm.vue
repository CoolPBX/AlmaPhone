<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin" class="form">
      <h2 class="title">Iniciar Sesión</h2>

      <div class="form-group">
        <label for="username" class="label">Usuario (Email)</label>
        <input
          id="username"
          v-model="form.username"
          type="email"
          class="input"
          placeholder="usuario@ejemplo.com"
          required
          :disabled="authStore.isLoading"
        />
      </div>

      <div class="form-group">
        <label for="password" class="label">Contraseña</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="input"
          placeholder="••••••••"
          required
          :disabled="authStore.isLoading"
        />
      </div>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
        <button type="button" @click="authStore.clearError" class="clear-error">✕</button>
      </div>

      <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isFormValid">
        <span v-if="authStore.isLoading" class="spinner"></span>
        {{ authStore.isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './repositories/internal/AuthStore'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  username: '',
  password: '',
})

const isFormValid = computed(() => {
  return (
    form.value.username.trim() !== '' &&
    form.value.password.trim() !== '' &&
    form.value.username.includes('@')
  )
})

const handleLogin = async () => {
  const success = await authStore.login({
    user_email: form.value.username,
    password: form.value.password,
  })

  if (success) {
    router.push('/extensions')
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: #555;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-error {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2rem;
}

.submit-btn {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
