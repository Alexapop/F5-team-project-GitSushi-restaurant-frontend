import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    role: null,
  }),
  actions: {
    login(role) {
      this.role = role
    },
    logout() {
      this.role = null
    },
  },
})