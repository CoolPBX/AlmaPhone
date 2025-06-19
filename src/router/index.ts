import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/presentation/layouts/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import PhoneView from '@/presentation/views/PhoneView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: '/phone',
          name: 'phone',
          component: PhoneView
        }
      ]
    }
  ]
})

export default router