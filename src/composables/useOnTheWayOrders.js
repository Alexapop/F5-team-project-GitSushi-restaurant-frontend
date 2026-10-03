import { ref } from 'vue'
import { getOrdersByStatus } from '../services/orders.service'
import { markOrderAsDelivered } from '../services/delivery.service'

// Lista provisional de pedidos "en tránsito": mientras no exista la
// asignación real de repartidor ni la acción de marcarlos "en
// tránsito", se piden todos los pedidos en ese estado con el
// endpoint genérico de pedidos, sin filtrar por repartidor asignado.
export function useOnTheWayOrders() {
  const orders = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  async function fetchOrders() {
    isLoading.value = true
    error.value = null

    try {
      orders.value = await getOrdersByStatus('ONTHEWAY')
    } catch (err) {
      error.value = 'No se han podido cargar los pedidos en tránsito.'
      console.error('[useOnTheWayOrders] Error al cargar los pedidos:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function deliverOrder(order) {
    if (order.paymentMethod === 'CASH_ON_DELIVERY') {
      const confirmed = window.confirm(
        `¿Confirmas que se han cobrado ${order.total.toFixed(2)} € en efectivo por el pedido #${order.id}?`,
      )
      if (!confirmed) return
    }

    try {
      await markOrderAsDelivered(order.id, {
        cashCollected: order.paymentMethod === 'CASH_ON_DELIVERY',
      })
      orders.value = orders.value.filter((item) => item.id !== order.id)
    } catch (err) {
      error.value = 'No se ha podido marcar el pedido como entregado.'
      console.error('[useOnTheWayOrders] Error al marcar como entregado:', err)
    }
  }

  return { orders, isLoading, error, fetchOrders, deliverOrder }
}
