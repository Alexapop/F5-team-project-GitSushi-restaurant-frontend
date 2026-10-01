// src/constants/paymentMethods.js

// Métodos de pago válidos cuando el canal del pedido es "en sala".
// Los métodos de "a domicilio" (tarjeta online, efectivo a la entrega) son
// responsabilidad de otra parte y no se incluyen aquí.
// `backendValue` es el valor real del enum PaymentMethod que espera el
// backend (dev.team1.enums.PaymentMethod).
// `backendPaymentStatus` es el valor real del enum PaymentStatus que
// devuelve el backend tras confirmar el pedido (dev.team1.enums.PaymentStatus).
export const DINE_IN_PAYMENT_METHODS = Object.freeze([
  {
    value: 'cashier',
    backendValue: 'CASH_ONSITE',
    backendPaymentStatus: 'PENDING_CASH',
    label: 'Pago en caja',
    pendingStatusLabel: 'pendiente de cobro en caja',
  },
  {
    value: 'cardOnTable',
    backendValue: 'CARD_ONSITE',
    backendPaymentStatus: 'PENDING_CARD_TERMINAL',
    label: 'Tarjeta en mesa',
    pendingStatusLabel: 'pago pendiente en mesa',
  },
])

// Métodos de pago válidos cuando el canal del pedido es "a domicilio".
// `backendPaymentStatus` queda en null: el backend todavía no devuelve un
// paymentStatus real para estos dos métodos (confirmado leyendo
// OrderService.java) — en cuanto lo publique, se rellena aquí igual que ya
// está hecho arriba para "en sala".
export const HOME_DELIVERY_PAYMENT_METHODS = Object.freeze([
  {
    value: 'onlineCard',
    backendValue: 'ONLINE_CARD',
    backendPaymentStatus: null,
    label: 'Tarjeta online',
    pendingStatusLabel: 'pagado',
  },
  {
    value: 'cashOnDelivery',
    backendValue: 'CASH_ON_DELIVERY',
    backendPaymentStatus: null,
    label: 'Efectivo a la entrega',
    pendingStatusLabel: 'pendiente de cobro por el repartidor',
  },
])

const ALL_PAYMENT_METHODS = [...DINE_IN_PAYMENT_METHODS, ...HOME_DELIVERY_PAYMENT_METHODS]

// Traduce el valor interno del frontend (p. ej. 'cashier') al valor real
// del enum PaymentMethod que espera el backend (p. ej. 'CASH_ONSITE').
// Devuelve null si no encuentra el método, para no enviar un valor inválido.
export function getBackendPaymentMethod(value) {
  const method = ALL_PAYMENT_METHODS.find((method) => method.value === value)
  return method ? method.backendValue : null
}

// Traduce el paymentStatus real que devuelve el backend al confirmar un
// pedido (p. ej. 'PENDING_CASH') al texto en español que se muestra en el
// resumen del pedido. Devuelve null si no lo reconoce, o si el backend
// todavía no envía un paymentStatus real para ese método (los dos de
// "a domicilio" tienen backendPaymentStatus: null a propósito).
export function getPaymentStatusLabel(paymentStatus) {
  if (!paymentStatus) return null

  const method = ALL_PAYMENT_METHODS.find(
    (method) => method.backendPaymentStatus === paymentStatus
  )
  return method ? method.pendingStatusLabel : null
}
