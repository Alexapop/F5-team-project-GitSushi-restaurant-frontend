import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResetPasswordForm from './ResetPasswordForm.vue'

describe('ResetPasswordForm', () => {
  it('renders the password fields', () => {
    const wrapper = mount(ResetPasswordForm, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    expect(wrapper.find('#new-password').exists()).toBe(true)
    expect(wrapper.find('#confirm-password').exists()).toBe(true)
  })

  it('shows an error when passwords do not match', async () => {
    const wrapper = mount(ResetPasswordForm, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    await wrapper.find('#new-password').setValue('password123')
    await wrapper.find('#confirm-password').setValue('different123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'Las contraseñas no coinciden.'
    )
  })

  it('shows a success message when passwords match', async () => {
    const wrapper = mount(ResetPasswordForm, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    await wrapper.find('#new-password').setValue('password123')
    await wrapper.find('#confirm-password').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.get('[role="status"]').text()).toBe(
      'Tu contraseña se ha restablecido correctamente.'
    )
  })
})