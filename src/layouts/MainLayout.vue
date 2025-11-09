<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>CRM</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          Dashboard
        </router-link>
        <router-link v-if="authStore.isSuperAdmin" to="/operators" class="nav-item">
          Operatorlar
        </router-link>
        <router-link 
          v-if="authStore.isSuperAdmin || authStore.sectionType === 'jobbank'" 
          to="/masters" 
          class="nav-item"
        >
          Ustalar
        </router-link>
        <router-link 
          v-if="authStore.isSuperAdmin || authStore.sectionType === 'uytv'" 
          to="/clients" 
          class="nav-item"
        >
          Mijozlar
        </router-link>
        <router-link
          v-if="authStore.isSuperAdmin || authStore.isTechnical || authStore.sectionType"
          to="/sms"
          class="nav-item"
        >
          SMS Yuborish
        </router-link>
        <router-link 
          v-if="authStore.isTechnical || authStore.isSuperAdmin" 
          to="/technical" 
          class="nav-item"
        >
          Texnik Bo'lim
        </router-link>
        <router-link to="/reminders" class="nav-item">
          Eslatmalar
        </router-link>
        <router-link to="/conversations" class="nav-item">
          Gaplashuvlar
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <strong>{{ authStore.user?.name }}</strong>
          <small>{{ authStore.user?.email }}</small>
        </div>
        <button @click="handleLogout" class="logout-btn">Chiqish</button>
      </div>
    </aside>
    <main class="main-content">
      <header class="main-header">
        <div class="header-content">
          <div class="header-left">
            <h1>{{ currentPageTitle }}</h1>
            <Breadcrumbs />
          </div>
          <div class="header-actions">
            <div class="notification-wrapper" @click="toggleNotifications">
              <button class="notification-btn">
                🔔
                <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </button>
              <div v-if="showNotificationDropdown" class="notification-dropdown">
                <div class="dropdown-header">
                  <h3>Xabarlar</h3>
                  <button @click.stop="markAllAsRead" class="mark-all-read" v-if="unreadCount > 0">
                    Barchasini o'qilgan deb belgilash
                  </button>
                </div>
                <div v-if="loadingNotifications" class="loading-notifications">
                  Yuklanmoqda...
                </div>
                <div v-else-if="notifications.length === 0" class="empty-notifications">
                  Xabarlar yo'q
                </div>
                <div v-else class="notifications-list">
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id" 
                    :class="['notification-item', { 'unread': !notification.is_read }]"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-content">
                      <div class="notification-title">{{ notification.title }}</div>
                      <div class="notification-message">{{ notification.message }}</div>
                      <div class="notification-meta">
                        <span v-if="notification.transferred_by">
                          {{ notification.transferred_by.name }} tomonidan
                        </span>
                        <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                      </div>
                    </div>
                    <button 
                      @click.stop="markAsRead(notification.id)" 
                      v-if="!notification.is_read"
                      class="mark-read-btn"
                      title="O'qilgan deb belgilash"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="content">
        <RouterView />
      </div>
      
      <!-- Toast Notifications -->
      <div v-if="toastMessage" :class="['toast', toastType]">
        <span class="toast-icon">{{ toastType === 'success' ? '✅' : '❌' }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
        <button @click="toastMessage = ''" class="toast-close">✕</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import type { Notification } from '../types/entities'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  operators: 'Operatorlar',
  masters: 'Ustalar',
  clients: 'Mijozlar',
  reminders: 'Eslatmalar',
  conversations: 'Gaplashuvlar',
  technical: 'Texnik Bo\'lim',
  'sms-center': 'SMS Yuborish',
}

const currentPageTitle = computed(() => pageTitles[route.name as string] || 'Dashboard')

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loadingNotifications = ref(false)
const showNotificationDropdown = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let notificationInterval: ReturnType<typeof window.setInterval> | null = null
let toastTimeout: ReturnType<typeof window.setTimeout> | null = null

const successToastHandler = (event: Event) => {
  const customEvent = event as CustomEvent<{ message: string }>
  if (customEvent.detail?.message) {
    showToast(customEvent.detail.message, 'success')
  }
}

const errorToastHandler = (event: Event) => {
  const customEvent = event as CustomEvent<{ message: string }>
  if (customEvent.detail?.message) {
    showToast(customEvent.detail.message, 'error')
  }
}

function handleNotificationClick(notification: Notification) {
  if (!notification.is_read) {
    markAsRead(notification.id)
  }
  
  // Navigate based on notification type
  if (notification.master_id && authStore.isTechnical) {
    router.push('/technical')
  } else if (notification.master_id) {
    router.push('/masters')
  } else if (notification.client_id) {
    router.push('/clients')
  }
  
  showNotificationDropdown.value = false
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  
  toastTimeout = window.setTimeout(() => {
    toastMessage.value = ''
  }, 5000)
}

// Listen for custom events from child components
onMounted(() => {
  fetchNotifications()
  // Fetch notifications every 30 seconds
  notificationInterval = window.setInterval(() => {
    fetchNotifications()
  }, 30000)
  
  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('show-success-toast', successToastHandler as EventListener)
  window.addEventListener('show-error-toast', errorToastHandler as EventListener)
})

onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('show-success-toast', successToastHandler as EventListener)
  window.removeEventListener('show-error-toast', errorToastHandler as EventListener)
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.notification-wrapper')) {
    showNotificationDropdown.value = false
  }
}

async function fetchNotifications() {
  try {
    loadingNotifications.value = true
    const [notificationsRes, countRes] = await Promise.all([
      api.get('/notifications'),
      api.get('/notifications/unread-count')
    ])
    notifications.value = notificationsRes.data as Notification[]
    unreadCount.value = countRes.data.count || 0
  } catch (error) {
    console.error('Fetch notifications error:', error)
  } finally {
    loadingNotifications.value = false
  }
}

function toggleNotifications() {
  showNotificationDropdown.value = !showNotificationDropdown.value
  if (showNotificationDropdown.value) {
    fetchNotifications()
  }
}

function formatTime(date?: string | null) {
  if (!date) {
    return '-'
  }
  const now = new Date()
  const notificationDate = new Date(date)
  const diffMs = now.getTime() - notificationDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hozir'
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  if (diffHours < 24) return `${diffHours} soat oldin`
  if (diffDays < 7) return `${diffDays} kun oldin`
  return notificationDate.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
}

async function markAsRead(id: number) {
  try {
    await api.put(`/notifications/${id}/read`)
    await fetchNotifications()
  } catch (error) {
    console.error('Mark as read error:', error)
  }
}

async function markAllAsRead() {
  try {
    await api.put('/notifications/read-all')
    await fetchNotifications()
  } catch (error) {
    console.error('Mark all as read error:', error)
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9375rem;
  margin: 0.125rem 0.75rem;
  border-radius: 8px;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.15);
  color: white;
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
  color: white;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.user-info strong {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
}

.user-info small {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  width: calc(100% - 280px);
}

.main-header {
  background: white;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.main-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  background: #f3f4f6;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  border: 2px solid white;
  transform: translate(25%, -25%);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.mark-all-read {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mark-all-read:hover {
  background: #e0e7ff;
}

.loading-notifications,
.empty-notifications {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9375rem;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 1rem;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 700;
  color: #111827;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
}

.notification-message {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.notification-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.notification-time {
  margin-left: auto;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-read-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.content {
  flex: 1;
  padding: 2rem 1rem;
  background: #f9fafb;
  width: 100%;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>

