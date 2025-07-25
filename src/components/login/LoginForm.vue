<template>
  <div class="w-full">
    <!-- Login Form -->
    <Card v-if="!showExtensionModal" class="shadow-2">
      <template #header>
        <div class="text-center py-4">
          <Avatar icon="pi pi-user" size="xlarge" class="mb-3" />
          <h2 class="text-2xl font-semibold m-0">{{ t('auth.login') }}</h2>
        </div>
      </template>

      <template #content>
        <!-- <div class="mb-4">
          <LanguageSwitcher />
        </div> -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <FloatLabel>
            <InputText id="username" v-model="form.username" type="email"
              :invalid="!!(authStore.error && !form.username)" :disabled="authStore.isLoading" class="w-full" />
            <label for="username">{{ t('auth.email') }}</label>
          </FloatLabel>

          <FloatLabel class="mt-3">
            <Password id="password" v-model="form.password" :feedback="false" toggleMask
              :invalid="!!(authStore.error && !form.password)" :disabled="authStore.isLoading" class="w-full"
              inputClass="w-full" />
            <label for="password">{{ t('auth.password') }}</label>
          </FloatLabel>

          <Message v-if="authStore.error" severity="error" :closable="true" @close="authStore.clearError">
            {{ authStore.error }}
          </Message>

          <Button type="submit" :loading="authStore.isLoading" :disabled="!isFormValid" :label="t('auth.signIn')"
            loadingIcon="pi pi-spin pi-spinner" class="w-full" size="large" />
        </form>
        <div class="flex justify-center mt-3">
          <Button type="button" label="Opciones Avanzadas" severity="secondary" size="small" text
            @click="showAdvancedOptions = true" />
        </div>

      </template>
    </Card>

    <!-- Extension Selector Modal -->
    <ExtensionSelector v-if="showExtensionModal" @extension-selected="onExtensionSelected" @logout="onLogout" />
  </div>
  <AdvancedOptionsModal :isOpen="showAdvancedOptions" @close="showAdvancedOptions = false"
    @saved="onAdvancedOptionsSaved" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './AuthStore'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FloatLabel from 'primevue/floatlabel'
import Avatar from 'primevue/avatar'
import ExtensionSelector from '@/components/extension-selector/ExtensionSelector.vue'
import { useSipStore } from './SipStore'
import { useExtensionStore } from '../extension-selector/ExtensionStore'
import AdvancedOptionsModal from './AdvancedOptionsModal.vue'
// import LanguageSwitcher from '@/core/presentation/components/LanguageSwitcher.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const extensionStore = useExtensionStore()
const sipStore = useSipStore()
const router = useRouter()
const showAdvancedOptions = ref(false)

const form = ref({
  username: '',
  password: '',
})

const showExtensionModal = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.username.trim() !== '' &&
    form.value.password.trim() !== '' &&
    form.value.username.includes('@')
  )
})

const onAdvancedOptionsSaved = () => {
  console.log('Configuración avanzada guardada')
}

const handleLogin = async () => {
  const success = await authStore.login({
    user_email: form.value.username,
    password: form.value.password,
  })

  if (success) {
    showExtensionModal.value = true
  }
}

const onExtensionSelected = async () => {
  showExtensionModal.value = false
  await sipStore.initializeSip({
    username: extensionStore.selectedExtension?.extension || '',
    password: extensionStore.selectedExtension?.password || '',
    displayName: 'LDLQ2',
  })
  console.log('Extension selected:', extensionStore.selectedExtension?.password);
  
  router.push('/phone')
}

const onLogout = () => {
  showExtensionModal.value = false
  authStore.logout()
}
</script>
