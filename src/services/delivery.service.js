import api from './api'

const DELIVERY_METRICS_ENDPOINT = '/api/v1/delivery/metrics'

export async function getDeliveryMetrics() {
  const response = await api.get(DELIVERY_METRICS_ENDPOINT)
  return response.data
}