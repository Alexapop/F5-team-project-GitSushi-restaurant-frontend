import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { getDeliveryMetrics, markOrderAsDelivered } from './delivery.service'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('delivery.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('consulta las métricas y devuelve la respuesta del backend', async () => {
    const metrics = {
      readyCount: 4,
      inTransitCount: 2,
      deliveredTodayCount: 7,
      averageDeliveryMinutes: 18.5,
    }

    api.get.mockResolvedValue({ data: metrics })

    const result = await getDeliveryMetrics()

    expect(api.get).toHaveBeenCalledWith('/api/v1/delivery/metrics')
    expect(result).toEqual(metrics)
  })

  it('conserva los valores cero cuando no hay pedidos', async () => {
    const metrics = {
      readyCount: 0,
      inTransitCount: 0,
      deliveredTodayCount: 0,
      averageDeliveryMinutes: 0,
    }

    api.get.mockResolvedValue({ data: metrics })

    expect(await getDeliveryMetrics()).toEqual(metrics)
  })

  it('propaga el error para que la vista pueda gestionarlo', async () => {
    const error = new Error('No se pueden cargar las métricas')
    api.get.mockRejectedValue(error)

    await expect(getDeliveryMetrics()).rejects.toBe(error)
  })

  it('marks an order as delivered with the cash collected flag', async () => {
    const updatedOrder = { id: 12, status: 'DELIVERED' }
    api.patch.mockResolvedValue({ data: updatedOrder })

    const result = await markOrderAsDelivered(12, { cashCollected: true })

    expect(api.patch).toHaveBeenCalledWith('/api/v1/delivery/orders/12/status', {
      cashCollected: true,
    })
    expect(result).toEqual(updatedOrder)
  })

  it('propagates the error when marking as delivered fails', async () => {
    const error = new Error('Cannot mark as delivered')
    api.patch.mockRejectedValue(error)

    await expect(markOrderAsDelivered(12, { cashCollected: false })).rejects.toBe(error)
  })
})
