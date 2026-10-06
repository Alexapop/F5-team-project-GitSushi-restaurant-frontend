import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useExclusiveOffersStore } from './exclusiveOffers'
import * as offersService from '../services/offers.service'

describe('useExclusiveOffersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('starts empty', () => {
    const offersStore = useExclusiveOffersStore()

    expect(offersStore.offers).toEqual([])
    expect(offersStore.isLoading).toBe(false)
    expect(offersStore.error).toBeNull()
  })

  it('activeOffers excludes offers that have already been used', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [
      { id: 1, used: false, product: { id: 1 } },
      { id: 2, used: false, product: { id: 2 } },
      { id: 3, used: true, product: { id: 3 } },
    ]

    expect(offersStore.activeOffers.map((offer) => offer.id)).toEqual([1, 2])
  })

  it('offerForProduct returns the active offer for that product', () => {
    const offersStore = useExclusiveOffersStore()
    const offer = { id: 1, used: false, finalPrice: 8.5, discountRate: 15, product: { id: 1 } }
    offersStore.offers = [offer]

    expect(offersStore.offerForProduct(1)).toEqual(offer)
  })

  it('offerForProduct returns null when there is no offer for that product', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [
      { id: 1, used: false, finalPrice: 8.5, discountRate: 15, product: { id: 1 } },
    ]

    expect(offersStore.offerForProduct(999)).toBeNull()
  })

  it('offerForProduct returns null when the only offer for that product has already been used', () => {
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [
      { id: 1, used: true, finalPrice: 8.5, discountRate: 15, product: { id: 1 } },
    ]

    expect(offersStore.offerForProduct(1)).toBeNull()
  })

  it('sets isLoading to true while fetching and false when finished', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue([])
    const offersStore = useExclusiveOffersStore()

    const promise = offersStore.fetchOffers()
    expect(offersStore.isLoading).toBe(true)

    await promise
    expect(offersStore.isLoading).toBe(false)
  })

  it('stores the fetched offers on success', async () => {
    const fetchedOffers = [{ id: 1, used: false, discountRate: 15, product: { id: 1 } }]
    vi.spyOn(offersService, 'getExclusiveOffers').mockResolvedValue(fetchedOffers)
    const offersStore = useExclusiveOffersStore()

    await offersStore.fetchOffers()

    expect(offersStore.offers).toEqual(fetchedOffers)
    expect(offersStore.error).toBeNull()
  })

  it('stores an error message when the fetch fails', async () => {
    vi.spyOn(offersService, 'getExclusiveOffers').mockRejectedValue(new Error('network error'))
    const offersStore = useExclusiveOffersStore()

    await offersStore.fetchOffers()

    expect(offersStore.error).toBe(
      'No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.',
    )
    expect(offersStore.offers).toEqual([])
    expect(offersStore.isLoading).toBe(false)
  })

  it('consumeOffer replaces the offer in state with the updated one on success', async () => {
    vi.spyOn(offersService, 'consumeOffer').mockResolvedValue({
      id: 1,
      used: true,
      coupon: 'coupon-a',
      product: { id: 1 },
    })
    const offersStore = useExclusiveOffersStore()
    offersStore.offers = [
      { id: 1, used: false, coupon: 'coupon-a', product: { id: 1 } },
    ]

    await offersStore.consumeOffer('coupon-a')

    expect(offersStore.offers[0].used).toBe(true)
  })

  it('consumeOffer does not throw and leaves state unchanged when the request fails', async () => {
    vi.spyOn(offersService, 'consumeOffer').mockRejectedValue(new Error('network error'))
    const offersStore = useExclusiveOffersStore()
    const originalOffer = { id: 1, used: false, coupon: 'coupon-a', product: { id: 1 } }
    offersStore.offers = [originalOffer]

    await expect(offersStore.consumeOffer('coupon-a')).resolves.toBeUndefined()

    expect(offersStore.offers[0]).toEqual(originalOffer)
  })
})
