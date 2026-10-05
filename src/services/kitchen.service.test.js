import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import {
  getKitchenOrders,
  getKitchenMetrics,
  getAttendedOrders,
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
          channel: 'ONSITE',
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
        channel: 'ONSITE',
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
  
  it('obtiene las comandas atendidas (listas, en reparto y entregadas), de la más reciente a la más antigua', async () => {
    api.get.mockImplementation((url, { params }) => {
      const ordersByStatus = {
        READY: [{ id: 5, status: 'READY', channel: 'ONSITE', tableNumber: 2, total: 8.99 }],
        ONTHEWAY: [{ id: 2, status: 'ONTHEWAY', channel: 'ONLINE', tableNumber: null, total: 8.99 }],
        DELIVERED: [{ id: 7, status: 'DELIVERED', channel: 'ONLINE', tableNumber: null, total: '11.55' }],
      }
      return Promise.resolve({ data: ordersByStatus[params.status] })
    })

    const result = await getAttendedOrders()

    expect(api.get).toHaveBeenCalledWith('/api/v1/orders', { params: { status: 'READY' } })
    expect(api.get).toHaveBeenCalledWith('/api/v1/orders', { params: { status: 'ONTHEWAY' } })
    expect(api.get).toHaveBeenCalledWith('/api/v1/orders', { params: { status: 'DELIVERED' } })
    expect(result).toEqual([
      { id: 7, status: 'DELIVERED', channel: 'ONLINE', tableNumber: null, total: 11.55 },
      { id: 5, status: 'READY', channel: 'ONSITE', tableNumber: 2, total: 8.99 },
      { id: 2, status: 'ONTHEWAY', channel: 'ONLINE', tableNumber: null, total: 8.99 },
    ])
  })
})