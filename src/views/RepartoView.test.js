import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RepartoView from './RepartoView.vue'
import DeliveryMetrics from '../components/DeliveryMetrics.vue'
import { getDeliveryMetrics } from '../services/delivery.service'

vi.mock('../services/delivery.service', () => ({
  getDeliveryMetrics: vi.fn(),
}))

const metrics = {
  readyCount: 4,
  inTransitCount: 2,
  deliveredTodayCount: 7,
  averageDeliveryMinutes: 18.5,
}

describe('RepartoView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('muestra carga hasta recibir las métricas', async () => {
    let resolveRequest

    getDeliveryMetrics.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    const wrapper = mount(RepartoView)

    expect(wrapper.text()).toContain('Cargando datos de reparto…')
    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(false)

    resolveRequest(metrics)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Cargando datos de reparto…')
    expect(wrapper.getComponent(DeliveryMetrics).props('metrics')).toEqual(
      metrics
    )
    expect(getDeliveryMetrics).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('muestra las tarjetas y un aviso cuando no hay pedidos', async () => {
    getDeliveryMetrics.mockResolvedValue({
      readyCount: 0,
      inTransitCount: 0,
      deliveredTodayCount: 0,
      averageDeliveryMinutes: 0,
    })

    const wrapper = mount(RepartoView)
    await flushPromises()

    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'No hay pedidos listos, en tránsito ni entregados hoy.'
    )

    wrapper.unmount()
  })

  it('muestra un error sin presentar ceros como datos reales', async () => {
    getDeliveryMetrics.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(RepartoView)
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'No se han podido cargar los datos de reparto.'
    )
    expect(wrapper.findComponent(DeliveryMetrics).exists()).toBe(false)
    expect(wrapper.get('button').text()).toBe('Reintentar')

    wrapper.unmount()
  })

  it('permite recuperar los datos después de un error', async () => {
    getDeliveryMetrics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(metrics)

    const wrapper = mount(RepartoView)
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(getDeliveryMetrics).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.getComponent(DeliveryMetrics).props('metrics')).toEqual(
      metrics
    )

    wrapper.unmount()
  })
})