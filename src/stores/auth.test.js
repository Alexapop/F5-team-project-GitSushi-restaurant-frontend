import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

    it('empieza sin rol (usuario anónimo)', () => {
    const authStore = useAuthStore()

    expect(authStore.role).toBeNull()
  })

    it('login guarda el rol recibido', () => {
    const authStore = useAuthStore()

    authStore.login('admin')

    expect(authStore.role).toBe('admin')
  })

  it('logout vuelve a dejar el rol a null', () => {
    const authStore = useAuthStore()
    authStore.login('cliente')

    authStore.logout()

    expect(authStore.role).toBeNull()
  })

})