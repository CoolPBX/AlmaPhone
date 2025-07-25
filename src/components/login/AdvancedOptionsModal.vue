<template>
  <BaseModal
    :isOpen="isOpen"
    :title="t('auth.advacedOptions')"
    size="lg"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="grid grid-cols-1 gap-6">
        <FloatLabel>
          <InputText
            id="sipDomain"
            v-model="form.sipDomain"
            class="w-full"
            :invalid="!isValidDomain(form.sipDomain)"
          />
          <label for="sipDomain">SIP Domain Name</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            id="wssProxy"
            v-model="form.wssProxy"
            class="w-full"
            :invalid="!isValidHost(form.wssProxy)"
          />
          <label for="wssProxy">WSS Proxy Name</label>
        </FloatLabel>

        <FloatLabel>
          <InputNumber
            id="wssPort"
            v-model="form.wssPort"
            :min="1"
            :max="65535"
            class="w-full"
            :invalid="!isValidPort(form.wssPort)"
          />
          <label for="wssPort">WSS Proxy Port</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            id="displayName"
            v-model="form.displayName"
            class="w-full"
          />
          <label for="displayName">Display Name</label>
        </FloatLabel>
      </div>

      <Message
        v-if="error"
        severity="error"
        :closable="true"
        @close="error = null"
      >
        {{ error }}
      </Message>

      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="handleCancel"
        />
        <Button
          type="submit"
          label="Guardar"
          :disabled="!isFormValid"
        />
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSipStore } from './SipStore'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'
import BaseModal from '@/core/presentation/components/BaseModal.vue'
import { useI18n } from 'vue-i18n'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sipStore = useSipStore()
const error = ref<string | null>(null)
const { t } = useI18n()



const form = ref({
  sipDomain: sipStore.sipConfig.domain,
  wssProxy: sipStore.sipConfig.server.replace(/^wss:\/\//, '').replace(/:\d+$/, ''),
  wssPort: parseInt(sipStore.sipConfig.server.replace(/^wss:\/\/.*:/, '')),
  displayName: sipStore.sipConfig.displayName
})


const isValidDomain = (domain: string): boolean => {
  if (!domain) return false
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/
  return domainRegex.test(domain)
}

const isValidHost = (host: string): boolean => {
  if (!host) return false
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/
  return ipRegex.test(host) || hostnameRegex.test(host)
}

const isValidPort = (port: number | null): boolean => {
  return port !== null && port >= 1 && port <= 65535
}

const isFormValid = computed(() => {
  return (
    isValidDomain(form.value.sipDomain) &&
    isValidHost(form.value.wssProxy) &&
    isValidPort(form.value.wssPort)
  )
})

const handleSave = () => {
  if (!isFormValid.value) {
    error.value = 'Por favor, corrige los campos marcados en rojo'
    return
  }

  try {
    sipStore.updateAdvancedConfig({
      domain: form.value.sipDomain,
      server: `wss://${form.value.wssProxy}:${form.value.wssPort}`,
      displayName: form.value.displayName
    })
    
    emit('saved')
    emit('close')
  } catch {
    error.value = 'Error al guardar la configuración'
  }
}

const handleCancel = () => {
  form.value = {
    sipDomain: sipStore.sipConfig.domain,
    wssProxy: sipStore.sipConfig.server.replace(/^wss:\/\//, '').replace(/:\d+$/, ''),
    wssPort: parseInt(sipStore.sipConfig.server.replace(/^wss:\/\/.*:/, '')),
    displayName: sipStore.sipConfig.displayName
  }
  error.value = null
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    form.value = {
      sipDomain: sipStore.sipConfig.domain,
      wssProxy: sipStore.sipConfig.server.replace(/^wss:\/\//, '').replace(/:\d+$/, ''),
      wssPort: parseInt(sipStore.sipConfig.server.replace(/^wss:\/\/.*:/, ''))
    }
    error.value = null
  }
})
</script>