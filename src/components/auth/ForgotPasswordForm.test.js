import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ForgotPasswordForm from './ForgotPasswordForm.vue'

describe('ForgotPasswordForm', () => {
  const mountForm = () =>
    mount(ForgotPasswordForm, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

  it('renders the email field', () => {
    const wrapper = mountForm()

    expect(wrapper.find('#recovery-email').exists()).toBe(true)
  })

  it('shows the recovery button', () => {
    const wrapper = mountForm()

    expect(wrapper.find('button[type="submit"]').text()).toBe(
      'Enviar enlace de recuperación'
    )
  })

  it('shows a confirmation message after submitting', async () => {
    const wrapper = mountForm()

    await wrapper
      .find('#recovery-email')
      .setValue('usuario@gitsushi.com')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.get('[role="status"]').text()).toBe(
      'Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.'
    )
  })

  it('includes a link to return to login', () => {
    const wrapper = mountForm()

    expect(wrapper.text()).toContain('Volver a iniciar sesión')
  })
})