import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import {
  getKitchenOrders,
  getKitchenMetrics,
} from './kitchen.service'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('kitchen service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtiene y adapta las comandas del backend', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          status: 'PROCESSING',
          chefNote: 'Sin gluten',
          isDelayed: false,
          createdAt: '2026-09-28T12:00:00',
          paymentStatus: 'PAID',
          items: [
            {
              productName: 'Pull Nigiri',
              quantity: 2,
            },
          ],
        },
      ],
    })

    const orders = await getKitchenOrders()

    expect(api.get).toHaveBeenCalledWith('/api/v1/kitchen/orders')

    expect(orders).toEqual([
      {
        id: 1,
        status: 'PROCESSING',
        priorityNote: 'Sin gluten',
        isDelayed: false,
        createdAt: '2026-09-28T12:00:00',
        paymentStatus: 'PAID',
        products: [
          {
            name: 'Pull Nigiri',
            quantity: 2,
          },
        ],
      },
    ])
  })

  it('obtiene las métricas de cocina', async () => {
    const metrics = {
      totalActiveOrders: 5,
      averagePreparationMinutes: 12,
      processingCount: 3,
      delayedCount: 1,
      readyCount: 1,
    }

    api.get.mockResolvedValue({
      data: metrics,
    })

    const result = await getKitchenMetrics()

    expect(api.get).toHaveBeenCalledWith('/api/v1/kitchen/metrics')
    expect(result).toEqual(metrics)
  })
})