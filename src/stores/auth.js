import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const role = ref(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function login(credentials) {
    isLoading.value = true

    try {
      user.value = await authService.login(credentials)
      role.value = user.value?.role ?? null

      return user.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    try {
      user.value = await authService.getCurrentUser()
      role.value = user.value?.role ?? null
    } catch {
      user.value = null
      role.value = null
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      user.value = null
      role.value = null
    }
  }

  return {
    user,
    role,
    isLoading,
    isAuthenticated,
    login,
    fetchCurrentUser,
    logout,
  }
})