import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import ProfileForm from './ProfileForm.vue'

const user = {
  id: 'test-user',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  address: 'Calle Mayor 10',
  postalCode: '28001',
  city: 'Madrid',
  roles: ['ROLE_CUSTOMER'],
}

const fields = [
  'firstName',
  'lastName',
  'email',
  'address',
  'postalCode',
  'city',
]

function mountForm(options = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore()
  authStore.user = { ...user }

  const wrapper = mount(ProfileForm, {
  ...options,
  global: {
    plugins: [pinia],
  },
})

  return { wrapper, authStore }
}

describe('ProfileForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('precarga los datos del usuario sin mostrar errores', () => {
    const { wrapper } = mountForm()

    fields.forEach((field) => {
      expect(wrapper.get(`#${field}`).element.value).toBe(user[field])
    })

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
  })

  it('detecta cambios sin modificar los datos del store', async () => {
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#firstName').setValue('Lucía')

    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
    expect(authStore.user.firstName).toBe('Ana')

    await wrapper.get('#firstName').setValue('Ana')

    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
  })

  it.each(fields)(
    'valida %s al salir del campo y rechaza espacios',
    async (field) => {
      const { wrapper } = mountForm()
      const input = wrapper.get(`#${field}`)

      await input.setValue('')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(false)

      await input.trigger('blur')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(true)
      expect(input.attributes('aria-invalid')).toBe('true')

      await input.setValue('   ')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(true)

      await input.setValue(user[field])

      expect(wrapper.find(`#${field}-error`).exists()).toBe(false)
      expect(input.attributes('aria-invalid')).toBe('false')
    }
  )

  it('rechaza un email sin formato válido', async () => {
    const { wrapper } = mountForm()
    const input = wrapper.get('#email')

    await input.setValue('hola')
    await input.trigger('blur')

    expect(wrapper.get('#email-error').text()).toBe(
      'Introduce un correo electrónico válido.'
    )

    await input.setValue('nuevo@example.com')

    expect(wrapper.find('#email-error').exists()).toBe(false)
  })

  it('descarta los cambios y limpia los errores', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#firstName').setValue('')
    await wrapper.get('#firstName').trigger('blur')
    await wrapper.get('#city').setValue('Barcelona')

    expect(wrapper.find('#firstName-error').exists()).toBe(true)

    await wrapper.get('.profile-form__reset').trigger('click')

    fields.forEach((field) => {
      expect(wrapper.get(`#${field}`).element.value).toBe(user[field])
    })

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
    expect(wrapper.find('.profile-form__reset').exists()).toBe(false)
  })

  it('mantiene el guardado deshabilitado aunque haya cambios válidos', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')

    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
    expect(wrapper.get('#profile-save-help').text()).toContain(
      'El guardado de cambios estará disponible próximamente.'
    )
  })
  it('valida todos los campos al enviar el formulario', async () => {
  const { wrapper } = mountForm()

  for (const field of fields) {
    await wrapper.get(`#${field}`).setValue('')
  }

  expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)

  await wrapper.get('form').trigger('submit')

  expect(wrapper.findAll('.profile-form__error')).toHaveLength(6)
})
it('enfoca el primer campo con error al enviar', async () => {
  const { wrapper } = mountForm({
    attachTo: document.body,
  })

  try {
    await wrapper.get('#email').setValue('correo-invalido')
    await wrapper.get('#city').setValue('')

    await wrapper.get('form').trigger('submit')

    expect(document.activeElement).toBe(
      wrapper.get('#email').element
    )
  } finally {
    wrapper.unmount()
  }
})
})