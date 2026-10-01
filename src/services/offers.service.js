// src/services/offers.service.js
import api from './api'

const OFFERS_ENDPOINT = '/api/v1/offers'

export async function getExclusiveOffers() {
  const response = await api.get(OFFERS_ENDPOINT)
  return response.data
}
