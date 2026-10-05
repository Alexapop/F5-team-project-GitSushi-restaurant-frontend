import api from './api'

const KITCHEN_ORDERS_ENDPOINT = '/api/v1/kitchen/orders'
const KITCHEN_METRICS_ENDPOINT = '/api/v1/kitchen/metrics'

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