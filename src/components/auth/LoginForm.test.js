import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginForm from './LoginForm.vue'
import { authService } from '../../services/authService'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

function mountLoginForm() {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(LoginForm, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    const wrapper = mountLoginForm()

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Iniciar sesión')
  })

  it('sends the credentials, stores the user and redirects to profile', async () => {
    const user = {
      email: 'user@test.com',
      firstName: 'Andrea',
    }

    authService.login.mockResolvedValue(user)

    const wrapper = mountLoginForm()

    await wrapper
      .find('input[type="email"]')
      .setValue('user@test.com')

    await wrapper
      .find('input[type="password"]')
      .setValue('123456')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: '123456',
    })

    expect(pushMock).toHaveBeenCalledWith('/perfil')
  })

  it('shows an error when login fails', async () => {
    authService.login.mockRejectedValue({
      response: {
        data: {
          message: 'Credenciales incorrectas',
        },
      },
    })

    const wrapper = mountLoginForm()

    await wrapper
      .find('input[type="email"]')
      .setValue('user@test.com')

    await wrapper
      .find('input[type="password"]')
      .setValue('wrong-password')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Credenciales incorrectas')
    expect(pushMock).not.toHaveBeenCalled()
  })
})