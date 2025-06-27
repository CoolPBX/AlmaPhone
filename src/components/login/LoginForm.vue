<template>
  <div class="flex align-items-center justify-content-center min-h-screen px-3">
    <div class="w-full max-w-md">
      <Card class="shadow-2">
        <template #header>
          <div class="text-center py-4">
            <Avatar icon="pi pi-user" size="xlarge" class="mb-3" />
            <h2 class="text-2xl font-semibold m-0">Iniciar Sesión</h2>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="flex flex-column gap-4">
            <FloatLabel>
              <InputText
                id="username"
                v-model="form.username"
                type="email"
                :invalid="!!(authStore.error && !form.username)"
                :disabled="authStore.isLoading"
                class="w-full"
              />
              <label for="username">Usuario (Email)</label>
            </FloatLabel>

            <FloatLabel>
              <Password
                id="password"
                v-model="form.password"
                :feedback="false"
                toggleMask
                :invalid="!!(authStore.error && !form.password)"
                :disabled="authStore.isLoading"
                class="w-full"
              />
              <label for="password">Contraseña</label>
            </FloatLabel>

            <Message
              v-if="authStore.error"
              severity="error"
              :closable="true"
              @close="authStore.clearError"
            >
              {{ authStore.error }}
            </Message>

            <Button
              type="submit"
              :loading="authStore.isLoading"
              :disabled="!isFormValid"
              label="Iniciar Sesión"
              loadingIcon="pi pi-spin pi-spinner"
              class="w-full"
              size="large"
            />
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './AuthStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FloatLabel from 'primevue/floatlabel'
import Avatar from 'primevue/avatar'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  console.log('AuthStore mounted:', authStore.user, authStore.isAuthenticated)
})

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
