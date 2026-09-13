import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCheckoutStore } from './checkout'

describe('useCheckoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with the sala channel and no table, address or payment method', () => {
    const checkoutStore = useCheckoutStore()

    expect(checkoutStore.channel).toBe('sala')
    expect(checkoutStore.tableNumber).toBeNull()
    expect(checkoutStore.address).toBeNull()
    expect(checkoutStore.paymentMethod).toBeNull()
  })

  it('changes the channel', () => {
    const checkoutStore = useCheckoutStore()

    checkoutStore.setChannel('domicilio')

    expect(checkoutStore.channel).toBe('domicilio')
  })

  it('resets the payment method when the channel actually changes', () => {
    const checkoutStore = useCheckoutStore()
    checkoutStore.paymentMethod = 'card'

    checkoutStore.setChannel('domicilio')

    expect(checkoutStore.paymentMethod).toBeNull()
  })

  it('does not reset the payment method when selecting the same channel again', () => {
    const checkoutStore = useCheckoutStore()
    checkoutStore.paymentMethod = 'card'

    checkoutStore.setChannel('sala')

    expect(checkoutStore.paymentMethod).toBe('card')
  })

  it('stores the table number', () => {
    const checkoutStore = useCheckoutStore()

    checkoutStore.setTableNumber(7)

    expect(checkoutStore.tableNumber).toBe(7)
  })

  it('stores the delivery address', () => {
    const checkoutStore = useCheckoutStore()

    checkoutStore.setAddress('Calle Falsa 123')

    expect(checkoutStore.address).toBe('Calle Falsa 123')
  })
})
