import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ExclusiveOffersCard from './ExclusiveOffersCard.vue'
import * as offersService from '../services/offers.service'

function mountCard() {
  setActivePinia(createPinia())
  return mount(ExclusiveOffersCard)
}

describe('ExclusiveOffersCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  it('shows a loading message while the offers are being fetched', async () => {
    let resolveFetch
    vi.spyOn(offersService, 'getExclusiveOffers').mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    const wrapper = mountCard()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Cargando tus ofertas...')

    resolveFetch([])
    await flushPromises()
  })

  it('shows an error message when the offers fail to load', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockRejectedValue(new Error('network error'))

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.text()).toContain('No se han podido cargar tus ofertas exclusivas')
  })

  it('shows the empty state when there are no active offers', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([])

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no tienes ofertas exclusivas desbloqueadas.')
  })

  it('renders only the active offers, with product and discount', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([
      {
        id: 1,
        used: false,
        originalPrice: 6.5,
        finalPrice: 5.53,
        discountRate: 15,
        coupon: null,
        product: { id: 1, name: 'Hello Edamame' },
      },
      {
        id: 2,
        used: true,
        originalPrice: 12.5,
        finalPrice: 10,
        discountRate: 20,
        coupon: 'OLD20',
        product: { id: 2, name: 'Kaisen Init' },
      },
    ])

    const wrapper = mountCard()
    await flushPromises()

    const cards = wrapper.findAll('.exclusive-offers__card')
    expect(cards).toHaveLength(1)
    expect(cards[0].text()).toContain('Hello Edamame')
    expect(cards[0].text()).toContain('15% de descuento')
  })

  it('does not show a copy button when the offer has no coupon code', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([
      {
        id: 1,
        used: false,
        originalPrice: 6.5,
        finalPrice: 5.53,
        discountRate: 15,
        coupon: null,
        product: { id: 1, name: 'Hello Edamame' },
      },
    ])

    const wrapper = mountCard()
    await flushPromises()

    expect(wrapper.find('.exclusive-offers__copy-btn').exists()).toBe(false)
  })

  it('copies the coupon code to the clipboard and shows a confirmation when clicking the copy button', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([
      {
        id: 2,
        used: false,
        originalPrice: 12.5,
        finalPrice: 10,
        discountRate: 20,
        coupon: 'KAISEN20',
        product: { id: 3, name: 'Kaisen Init' },
      },
    ])

    const wrapper = mountCard()
    await flushPromises()

    const copyButton = wrapper.find('.exclusive-offers__copy-btn')
    expect(copyButton.text()).toBe('Copiar KAISEN20')

    await copyButton.trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('KAISEN20')
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('¡Copiado!')
  })

  it('reverts the copy confirmation back to the coupon code after a few seconds', async () => {
    vi.useFakeTimers()
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([
      {
        id: 2,
        used: false,
        originalPrice: 12.5,
        finalPrice: 10,
        discountRate: 20,
        coupon: 'KAISEN20',
        product: { id: 3, name: 'Kaisen Init' },
      },
    ])

    const wrapper = mountCard()
    await flushPromises()

    await wrapper.find('.exclusive-offers__copy-btn').trigger('click')
    await flushPromises()
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('¡Copiado!')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.exclusive-offers__copy-btn').text()).toBe('Copiar KAISEN20')

    vi.useRealTimers()
  })
})
