import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
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
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    const wrapper = mount(LoginForm)

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Iniciar sesión')
  })

  it('sends the credentials and redirects to profile', async () => {
    authService.login.mockResolvedValue({})

    const wrapper = mount(LoginForm)

    await wrapper.find('input[type="email"]').setValue('user@test.com')
    await wrapper.find('input[type="password"]').setValue('123456')

    await wrapper.find('form').trigger('submit')

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

    const wrapper = mount(LoginForm)

    await wrapper.find('input[type="email"]').setValue('user@test.com')
    await wrapper.find('input[type="password"]').setValue('wrong-password')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Credenciales incorrectas')
  })
})