import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/components/login/AuthStore'

import 'primeicons/primeicons.css'
import { setupDependencyInjection } from './core/di'

const app = createApp(App)
setupDependencyInjection(app)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

useAuthStore()

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.mount('#app')
