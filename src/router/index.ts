import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import ExtensionsView from '@/components/extension-selector/ExtensionSelector.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import MainLayout from '@/core/presentation/layouts/MainLayout.vue'
import { useAuthStore } from '@/components/login/AuthStore'

// Helper functions for route guards
const requiresAuth = (route: RouteLocationNormalized): boolean => {
  return route.matched.some((record) => record.meta.requiresAuth !== false)
}

const isPublicRoute = (route: RouteLocationNormalized): boolean => {
  console.log(
    'Checking if route is public:',
    route.path,
    route.matched.some((record) => record.meta.hideForAuthenticated === true),
  )
  return route.matched.some((record) => record.meta.hideForAuthenticated === true)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no auth required)
    {
      path: '/login',
      name: 'login',
      component: LoginForm,
      meta: {
        requiresAuth: false,
        hideForAuthenticated: true,
        title: 'Login',
      },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'extensions',
          name: 'extensions',
          component: ExtensionsView,
          meta: { title: 'Extensions' },
        },
        // {
        //   path: 'phone',
        //   name: 'phone',
        //   component: PhoneView,
        //   meta: { title: 'Phone' },
        // },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/' : '/login'
      },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.isAuthenticated) {
    authStore.restoreSession()
  }

  const requiresAuthCheck = requiresAuth(to)
  const isPublicRouteCheck = isPublicRoute(to)
  console.log('authStore.isAuthenticated:', authStore.apiKey, authStore.isAuthenticated)

  if (!authStore.isAuthenticated && requiresAuthCheck) {
    next('/login')
  } else if (authStore.isAuthenticated && isPublicRouteCheck) {
    next('/extensions')
  } else if (to.path === '/') {
    next('/extensions')
  } else {
    next()
  }
})

export default router
