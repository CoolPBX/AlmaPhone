import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/presentation/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/components/LoginForm.vue'
import ExtensionsView from '@/components/ExtensionSelector.vue'
import PhoneView from '@/presentation/views/PhoneView.vue'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { 
        requiresAuth: false,
        hideForAuth: true 
      }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'extensions',
          name: 'extensions',
          component: ExtensionsView,
          meta: { requiresAuth: true }
        },
        {
          path: 'phone',
          name: 'phone',
          component: PhoneView,
          meta: { requiresAuth: true }
        }
      ]
    },
    // Ruta catch-all para 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Verificar si la ruta debe ocultarse para usuarios autenticados
  const hideForAuth = to.matched.some(record => record.meta.hideForAuth)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirigir al login si requiere auth y no está autenticado
    next('/login')
  } else if (hideForAuth && authStore.isAuthenticated) {
    // Redirigir a extensions si ya está autenticado y trata de ir al login
    next('/extensions')
  } else {
    // Permitir navegación
    next()
  }
})

export default router