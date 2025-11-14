import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/components/login/AuthStore'
import { useExtensionStore } from '@/components/extension-selector/ExtensionStore'
import {
  createPublicRoute,
  createProtectedRoute,
  withLayout,
  type RouteConfig,
} from './routeHelpers'

const routeConfigs: RouteConfig[] = [
  createPublicRoute('/login', () => import('@/components/login/LoginForm.vue'), {
    name: 'login',
    title: 'Login',
  }),
  createProtectedRoute('/phone', () => import('@/components/phone/PhoneView.vue'), {
    name: 'phone',
    title: 'Phone',
    requiresExtension: true,
  }),
]

// Generate routes from configurations
const routes: RouteRecordRaw[] = [
  ...routeConfigs.map(withLayout),
  {
    path: '/',
    redirect: '/phone',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? '/phone' : '/login'
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const extensionStore = useExtensionStore()

  if (!authStore.user && !authStore.isAuthenticated) {
    authStore.restoreSession()
  }

  if (authStore.isAuthenticated && !extensionStore.selectedExtension) {
    extensionStore.restoreSelectedExtension()
  }

  // Extract route meta with defaults
  const meta = {
    requiresAuth: true,
    requiresExtension: true,
    ...to.meta,
  }

  const needsAuth = meta.requiresAuth || meta.requiresExtension

  if (needsAuth && !authStore.isAuthenticated && to.path !== '/login') {
    console.log('Redirecting to login: user not authenticated')
    next('/login')
    return
  }

  if (meta.requiresExtension && !extensionStore.selectedExtension && to.path !== '/login') {
    console.log('Redirecting to login: extension required but not selected', extensionStore.selectedExtension)
    next('/login')
    return
  }

  next()
})

export default router
