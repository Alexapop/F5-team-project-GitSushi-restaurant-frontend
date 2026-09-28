import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenMetrics from './KitchenMetrics.vue'

const metrics = {
  totalActiveOrders: 12,
  averagePreparationMinutes: 18,
  processingCount: 7,
  delayedCount: 2,
  readyCount: 3,
}

describe('KitchenMetrics', () => {
  it('shows the kitchen metrics', () => {
    const wrapper = mount(KitchenMetrics, {
      props: { metrics },
    })

    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('18 min')
    expect(wrapper.text()).toContain('En preparación: 7')
    expect(wrapper.text()).toContain('Con retraso: 2')
    expect(wrapper.text()).toContain('Listas para pase: 3')
  })

  it('shows delayed orders alert', () => {
    const wrapper = mount(KitchenMetrics, {
      props: { metrics },
    })

    expect(wrapper.text()).toContain('2 con retraso')
  })

  it('does not show delayed alert when there are no delayed orders', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        metrics: {
          ...metrics,
          delayedCount: 0,
        },
      },
    })

    expect(wrapper.text()).not.toContain('0 con retraso')
  })

  it('shows loading state', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        isLoading: true,
      },
    })

    expect(wrapper.text()).toContain('Cargando métricas de cocina...')
  })

  it('shows error state', () => {
    const wrapper = mount(KitchenMetrics, {
      props: {
        error: 'No se han podido cargar las métricas de cocina.',
      },
    })

    expect(wrapper.text()).toContain(
      'No se han podido cargar las métricas de cocina.'
    )
  })

  it('shows empty state when metrics are not available', () => {
    const wrapper = mount(KitchenMetrics)

    expect(wrapper.text()).toContain(
      'No hay métricas de cocina disponibles.'
    )
  })
})