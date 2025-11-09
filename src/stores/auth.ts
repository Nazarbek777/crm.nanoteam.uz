import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'operator' | 'technical'
  operator?: {
    id: number
    section_type: 'jobbank' | 'uytv'
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value)
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')
  const isOperator = computed(() => user.value?.role === 'operator')
  const isTechnical = computed(() => user.value?.role === 'technical')
  const sectionType = computed(() => user.value?.operator?.section_type)

  async function login(email: string, password: string) {
    try {
      const response = await api.post('/login', { email, password })
      const tokenValue = response.data.token as string
      token.value = tokenValue
      user.value = response.data.user
      if (tokenValue) {
        localStorage.setItem('auth_token', tokenValue)
      }
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (error: any) {
      throw error.response?.data || error
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async function fetchUser() {
    try {
      const response = await api.get('/me')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (error) {
      logout()
      throw error
    }
  }

  function initAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      fetchUser()
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isSuperAdmin,
    isOperator,
    isTechnical,
    sectionType,
    login,
    logout,
    fetchUser,
    initAuth,
  }
})

