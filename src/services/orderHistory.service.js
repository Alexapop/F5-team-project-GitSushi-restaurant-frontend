// src/services/orderHistory.service.js
import api from './api'

const USERS_ENDPOINT = '/api/v1/users'
const ORDERS_ENDPOINT = '/api/v1/orders'

// Historial de pedidos de un cliente, paginado (misma forma de respuesta
// que products.service.js: { content, page: { number, totalElements, totalPages } }).
export async function getOrderHistory({ userId, page = 1, size = 3 } = {}) {
  const response = await api.get(`${USERS_ENDPOINT}/${userId}/orders`, {
    params: { page: page - 1, size },
  })

  const { content, page: pageInfo } = response.data
  const { totalElements, totalPages, number } = pageInfo

  return {
    items: content,
    page: number + 1,
    size,
    totalItems: totalElements,
    totalPages,
  }
}

// Líneas de un pedido anterior listas para repetir: el backend ya filtra
// los productos que ya no están disponibles y devuelve su precio actual.
export async function getRepeatOrderItems(orderId) {
  const response = await api.get(`${ORDERS_ENDPOINT}/${orderId}/repeat`)
  return response.data
}
