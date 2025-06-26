import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import MainLayout from '@/presentation/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/components/LoginForm.vue'
import ExtensionsView from '@/components/ExtensionSelector.vue'
import PhoneView from '@/presentation/views/PhoneView.vue'
import { useAuthStore } from '@/stores/AuthStore'

// Helper functions for route guards
const requiresAuth = (route: RouteLocationNormalized): boolean => {
  return route.matched.some((record) => record.meta.requiresAuth !== false)
}

const isPublicRoute = (route: RouteLocationNormalized): boolean => {
  return route.matched.some((record) => record.meta.hideForAuthenticated === true)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no auth required)
    {
      path: '/login',
      name: 'login',
      component: LoginView,
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
          path: '',
          name: 'home',
          component: HomeView,
          meta: { title: 'Home' },
        },
        {
          path: 'extensions',
          name: 'extensions',
          component: ExtensionsView,
          meta: { title: 'Extensions' },
        },
        {
          path: 'phone',
          name: 'phone',
          component: PhoneView,
          meta: { title: 'Phone' },
        },
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

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const requiresAuthCheck = requiresAuth(to)
  const isPublicRouteCheck = isPublicRoute(to)

  if (!authStore.isAuthenticated && requiresAuthCheck) {
    next('/login')
  } else if (authStore.isAuthenticated && isPublicRouteCheck) {
    next('/extensions')
  } else {
    next()
  }
})

export default router
