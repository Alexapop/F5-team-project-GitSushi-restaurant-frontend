import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getExclusiveOffers } from './offers.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('offers.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the real exclusive offers endpoint', async () => {
    api.get.mockResolvedValue({ data: [] })

    await getExclusiveOffers()

    expect(api.get).toHaveBeenCalledWith('/api/v1/offers')
  })

  it('returns the response data as-is', async () => {
    const offers = [{ id: 1, used: false, product: { id: 1, name: 'Hello Edamame' } }]
    api.get.mockResolvedValue({ data: offers })

    const result = await getExclusiveOffers()

    expect(result).toEqual(offers)
  })
})
