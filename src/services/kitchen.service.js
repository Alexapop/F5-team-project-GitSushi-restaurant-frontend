import api from './api'

const KITCHEN_ORDERS_ENDPOINT = '/api/v1/kitchen/orders'
const KITCHEN_METRICS_ENDPOINT = '/api/v1/kitchen/metrics'
const ORDERS_ENDPOINT = '/api/v1/orders'

// Estados en los que cocina ya terminó la comanda.
const ATTENDED_STATUSES = Object.freeze(['READY', 'ONTHEWAY', 'DELIVERED'])

export async function getKitchenOrders() {
  const response = await api.get(KITCHEN_ORDERS_ENDPOINT)

  return response.data.map((order) => ({
    id: order.id,
    status: order.status,
    priorityNote: order.chefNote,
    isDelayed: order.isDelayed,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    channel: order.channel,
    products: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
    })),
  }))
}

export async function getKitchenMetrics() {
  const response = await api.get(KITCHEN_METRICS_ENDPOINT)
  return response.data
}

export async function updateKitchenOrderStatus(orderId, status) {
  const response = await api.patch(
    `/api/v1/kitchen/orders/${orderId}/status`,
    { status }
  )

  return response.data
}

// Comandas que cocina ya terminó. El backend filtra por un único estado,
// así que se pide cada uno y se juntan, de la más reciente a la más antigua.
export async function getAttendedOrders() {
  const responses = await Promise.all(
    ATTENDED_STATUSES.map((status) => api.get(ORDERS_ENDPOINT, { params: { status } })),
  )

  return responses
    .flatMap((response) => response.data)
    .map((order) => ({
      id: order.id,
      status: order.status,
      channel: order.channel,
      tableNumber: order.tableNumber,
      total: Number(order.total),
    }))
    .sort((first, second) => second.id - first.id)
}

// El personal confirma que ha cobrado un pedido de sala: el backend lo pasa a
// PAID y genera su factura. Solo se acepta mientras el pedido está en PLACED.
export async function markOrderAsPaid(orderId) {
  const response = await api.patch(`${ORDERS_ENDPOINT}/${orderId}/paid`)
  return response.data
}