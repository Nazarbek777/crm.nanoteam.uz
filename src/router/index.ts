import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
        },
        {
          path: 'operators',
          name: 'operators',
          component: () => import('../views/OperatorsView.vue'),
          meta: { requiresSuperAdmin: true },
        },
        {
          path: 'masters',
          name: 'masters',
          component: () => import('../views/MastersView.vue'),
        },
        {
          path: 'masters/:id',
          name: 'master-detail',
          component: () => import('../views/MasterDetailView.vue'),
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('../views/ClientsView.vue'),
        },
        {
          path: 'clients/:id',
          name: 'client-detail',
          component: () => import('../views/ClientDetailView.vue'),
        },
        {
          path: 'reminders',
          name: 'reminders',
          component: () => import('../views/RemindersView.vue'),
        },
        {
          path: 'conversations',
          name: 'conversations',
          component: () => import('../views/ConversationsView.vue'),
        },
        {
          path: 'sms',
          name: 'sms-center',
          component: () => import('../views/SmsCenterView.vue'),
        },
        {
          path: 'technical',
          name: 'technical',
          component: () => import('../views/TechnicalView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
