import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChannelSelector from './ChannelSelector.vue'
import { useCheckoutStore } from '../stores/checkout'

function mountChannelSelector() {
  setActivePinia(createPinia())
  const checkoutStore = useCheckoutStore()

  const wrapper = mount(ChannelSelector)

  return { wrapper, checkoutStore }
}

describe('ChannelSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows "En sala" as active and the table number field by default', () => {
    const { wrapper } = mountChannelSelector()

    expect(wrapper.find('#table-number').exists()).toBe(true)
    expect(wrapper.find('#address-street').exists()).toBe(false)
    expect(
      wrapper.findAll('.channel-selector__toggle-btn').find((btn) => btn.text() === 'En sala')
        .attributes('aria-pressed')
    ).toBe('true')
  })

  it('switches to the address form when "A domicilio" is clicked', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()

    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    expect(checkoutStore.channel).toBe('domicilio')
    expect(wrapper.find('#table-number').exists()).toBe(false)
    expect(wrapper.find('#address-street').exists()).toBe(true)
  })

  it('updates the table number in the store when typed', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()

    await wrapper.find('#table-number').setValue('12')

    expect(checkoutStore.tableNumber).toBe('12')
  })

  it('updates each address field in the store without overwriting the others', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()
    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    await wrapper.find('#address-street').setValue('Calle Falsa 123')
    await wrapper.find('#address-city').setValue('Oviedo')
    await wrapper.find('#address-postal-code').setValue('33001')

    expect(checkoutStore.address).toEqual({
      street: 'Calle Falsa 123',
      city: 'Oviedo',
      postalCode: '33001',
    })
  })

  it('resets the payment method in the store when the channel changes', async () => {
    const { wrapper, checkoutStore } = mountChannelSelector()
    checkoutStore.paymentMethod = 'card'

    const domicilioBtn = wrapper
      .findAll('.channel-selector__toggle-btn')
      .find((btn) => btn.text() === 'A domicilio')
    await domicilioBtn.trigger('click')

    expect(checkoutStore.paymentMethod).toBeNull()
  })
})
