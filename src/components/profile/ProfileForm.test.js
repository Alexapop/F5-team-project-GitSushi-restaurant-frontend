import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { updateProfile } from '../../services/users.service'
import ProfileForm from './ProfileForm.vue'

vi.mock('../../services/users.service', () => ({
  updateProfile: vi.fn(),
}))

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

function mountForm({
  currentUser = user,
  loading = false,
  attachTo,
} = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore()
  authStore.user = currentUser ? { ...currentUser } : null
  authStore.isFetchingUser = loading

  const wrapper = mount(ProfileForm, {
    ...(attachTo ? { attachTo } : {}),
    global: {
      plugins: [pinia],
    },
  })

  return { wrapper, authStore }
}

describe('ProfileForm', () => {
    beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
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
      expect(input.attributes('aria-describedby')).toBe(`${field}-error`)

      await input.setValue('   ')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(true)

      await input.setValue(user[field])

      expect(wrapper.find(`#${field}-error`).exists()).toBe(false)
      expect(input.attributes('aria-invalid')).toBe('false')
      expect(input.attributes('aria-describedby')).toBeUndefined()
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

    it('deshabilita el guardado mientras no haya cambios', async () => {
    const { wrapper } = mountForm()
    const submit = wrapper.get('.profile-form__submit')

    expect(submit.element.disabled).toBe(true)

    await wrapper.get('#city').setValue('Barcelona')

    expect(submit.element.disabled).toBe(false)
    expect(wrapper.text()).not.toContain('próximamente')
  })

  it('valida todos los campos al enviar el formulario', async () => {
    const { wrapper } = mountForm()

    for (const field of fields) {
      await wrapper.get(`#${field}`).setValue('')
    }

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)

    await wrapper.get('form').trigger('submit')
    await nextTick()

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
      await nextTick()

      expect(document.activeElement).toBe(
        wrapper.get('#email').element
      )
    } finally {
      wrapper.unmount()
    }
  })

  it('muestra el estado vacío cuando no hay usuario', () => {
    const { wrapper } = mountForm({
      currentUser: null,
    })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(
      'No hay datos de usuario disponibles.'
    )
  })

  it('muestra carga y oculta el formulario mientras recupera datos', () => {
    const { wrapper } = mountForm({
      loading: true,
    })

    expect(wrapper.text()).toContain('Cargando tus datos…')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('true')
  })

  it('muestra el usuario cuando termina la carga', async () => {
    const { wrapper, authStore } = mountForm({
      currentUser: null,
      loading: true,
    })

    authStore.user = { ...user }
    authStore.isFetchingUser = false
    await nextTick()

    expect(wrapper.text()).not.toContain('Cargando tus datos…')
    expect(wrapper.get('#firstName').element.value).toBe('Ana')
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('false')
  })

  it('muestra el estado vacío si la carga termina sin usuario', async () => {
    const { wrapper, authStore } = mountForm({
      currentUser: null,
      loading: true,
    })

    authStore.isFetchingUser = false
    await nextTick()

    expect(wrapper.text()).not.toContain('Cargando tus datos…')
    expect(wrapper.text()).toContain(
      'No hay datos de usuario disponibles.'
    )
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('oculta el formulario si desaparece el usuario', async () => {
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')

    authStore.user = null
    await nextTick()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
  })

    it('guarda los datos sin espacios sobrantes y actualiza el store', async () => {
    updateProfile.mockResolvedValue({ ...user, city: 'Barcelona' })
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#city').setValue('  Barcelona  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(updateProfile).toHaveBeenCalledWith('test-user', {
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      address: 'Calle Mayor 10',
      postalCode: '28001',
      city: 'Barcelona',
    })
    expect(authStore.user.city).toBe('Barcelona')
    expect(wrapper.get('#city').element.value).toBe('Barcelona')
    expect(wrapper.get('[role="status"].profile-form__feedback').text()).toBe(
      'Tus datos se han guardado.'
    )
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
  })

  it('muestra "Guardando…" y bloquea los botones mientras guarda', async () => {
    let resolveSave
    updateProfile.mockReturnValue(new Promise((resolve) => { resolveSave = resolve }))
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')
    await nextTick()

    const submit = wrapper.get('.profile-form__submit')
    expect(submit.text()).toBe('Guardando…')
    expect(submit.element.disabled).toBe(true)
    expect(wrapper.get('.profile-form__reset').element.disabled).toBe(true)

    resolveSave({ ...user, city: 'Barcelona' })
    await flushPromises()

    expect(wrapper.get('.profile-form__submit').text()).toBe('Guardar cambios')
  })

  it('avisa si el email ya lo usa otra cuenta y mantiene los cambios', async () => {
    updateProfile.mockRejectedValue({ response: { status: 409 } })
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#email').setValue('otra@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"].profile-form__feedback').text()).toBe(
      'Ya existe una cuenta con este email.'
    )
    expect(authStore.user.email).toBe('ana@example.com')
    expect(wrapper.get('#email').element.value).toBe('otra@example.com')
    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
  })

  it('muestra un error general si el guardado falla por otro motivo', async () => {
    updateProfile.mockRejectedValue(new Error('500'))
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"].profile-form__feedback').text()).toBe(
      'No se han podido guardar los cambios. Inténtalo de nuevo.'
    )
  })

  it('oculta el mensaje de guardado al volver a editar', async () => {
    updateProfile.mockResolvedValue({ ...user, city: 'Barcelona' })
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await wrapper.get('#city').setValue('Gijón')

    expect(wrapper.find('.profile-form__feedback').exists()).toBe(false)
  })

  it('no llama al backend si hay errores de validación', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(updateProfile).not.toHaveBeenCalled()
  })
})