<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useCheckoutStore } from '../stores/checkout'
import { useLastOrderStore } from '../stores/lastOrder'
import { createOrder } from '../services/orders.service'
import { getBackendPaymentMethod, getPaymentStatusLabel } from '../constants/paymentMethods'

const NAVIGATION_DELAY_MS = 2500

const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const lastOrderStore = useLastOrderStore()

const isSubmitting = ref(false)
const errorMessage = ref(null)
const paymentStatusMessage = ref(null)

const canConfirmOrder = computed(() => {
  if (cartStore.isEmpty) return false
  if (checkoutStore.channel === 'sala' && !checkoutStore.paymentMethod) return false
  return true
})

const formatCurrency = (value) =>
  value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

async function confirmOrder() {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const items = cartStore.items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))

    const order = await createOrder({
      items,
      chefNote: checkoutStore.chefNote,
      channel: checkoutStore.channel,
      paymentMethod: getBackendPaymentMethod(checkoutStore.paymentMethod),
    })

    lastOrderStore.setOrder(order)
    paymentStatusMessage.value = getPaymentStatusLabel(order.paymentStatus)
    cartStore.clearCart()

    setTimeout(() => {
      router.push({ name: 'mi-pedido' })
    }, NAVIGATION_DELAY_MS)
  } catch (err) {
    errorMessage.value = 'No se ha podido confirmar el pedido. Inténtalo de nuevo.'
    console.error('[OrderConfirmation] Error al confirmar el pedido:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="order-confirmation" aria-label="Confirmar pedido">
    <h2 class="order-confirmation__title">Resumen del pedido</h2>

    <dl class="order-confirmation__summary">
      <div class="order-confirmation__row">
        <dt>Subtotal</dt>
        <dd>{{ formatCurrency(cartStore.subtotal) }}</dd>
      </div>
      <div v-if="cartStore.discountAmount > 0" class="order-confirmation__row order-confirmation__row--discount">
        <dt>Descuento</dt>
        <dd>−{{ cartStore.discountAmount.toFixed(2) }} €</dd>
      </div>
      <div class="order-confirmation__row">
        <dt>IVA</dt>
        <dd>{{ formatCurrency(cartStore.taxAmount) }}</dd>
      </div>
      <div class="order-confirmation__row order-confirmation__row--total">
        <dt>Total</dt>
        <dd>{{ formatCurrency(cartStore.total) }}</dd>
      </div>
    </dl>

    <p v-if="errorMessage" class="order-confirmation__error">{{ errorMessage }}</p>

    <p v-if="paymentStatusMessage" class="order-confirmation__success" role="status">
      Pedido confirmado — {{ paymentStatusMessage }}. Redirigiendo a tu pedido...
    </p>

    <button
      type="button"
      class="order-confirmation__button"
      :disabled="!canConfirmOrder || isSubmitting"
      @click="confirmOrder"
    >
      {{ isSubmitting ? 'Confirmando...' : 'Confirmar y pagar pedido' }}
    </button>
  </section>
</template>

<style scoped>
@reference "../style.css";

.order-confirmation {
  @apply flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface p-4;
}

.order-confirmation__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.order-confirmation__summary {
  @apply flex flex-col gap-1;
}

.order-confirmation__row {
  @apply flex justify-between text-sm text-on-surface-variant;
}

.order-confirmation__row--discount {
  @apply text-secondary;
}

.order-confirmation__row--total {
  @apply text-base font-semibold text-on-surface;
}

.order-confirmation__error {
  @apply text-sm text-error;
}

.order-confirmation__success {
  @apply text-sm font-medium text-secondary;
}

.order-confirmation__button {
  @apply rounded-full bg-primary px-4 py-2 font-semibold text-on-primary transition-opacity disabled:opacity-50;
}
</style>
