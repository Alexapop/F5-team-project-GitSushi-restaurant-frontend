<script setup>
import { computed, onMounted, ref } from 'vue'
import DeliveryMetrics from '../components/DeliveryMetrics.vue'
import { getDeliveryMetrics } from '../services/delivery.service'

const metrics = ref(null)
const isLoading = ref(true)
const error = ref('')

const isEmpty = computed(() => {
  if (!metrics.value) return false

  return (
    metrics.value.readyCount === 0 &&
    metrics.value.inTransitCount === 0 &&
    metrics.value.deliveredTodayCount === 0
  )
})

async function loadMetrics() {
  isLoading.value = true
  error.value = ''

  try {
    metrics.value = await getDeliveryMetrics()
  } catch {
    error.value = 'No se han podido cargar los datos de reparto.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMetrics)
</script>

<template>
  <main class="delivery-view" :aria-busy="isLoading">
    <header>
      <h1 class="delivery-view__title">Resumen de reparto</h1>
      <p class="delivery-view__description">
        Vista general de los pedidos del restaurante.
      </p>
    </header>

    <p v-if="isLoading" role="status">
      Cargando datos de reparto…
    </p>

    <div v-else-if="error" class="delivery-view__error">
      <p role="alert">{{ error }}</p>

      <button
        type="button"
        class="delivery-view__retry"
        @click="loadMetrics"
      >
        Reintentar
      </button>
    </div>

    <template v-else-if="metrics">
      <DeliveryMetrics :metrics="metrics" />

      <p v-if="isEmpty" role="status">
        No hay pedidos listos, en tránsito ni entregados hoy.
      </p>
    </template>
  </main>
</template>

<style scoped>
@reference "../style.css";

.delivery-view {
  @apply mx-auto flex w-full max-w-6xl flex-col gap-6
    px-4 py-8 sm:px-6;
}

.delivery-view__title {
  @apply text-2xl font-heading;
}

.delivery-view__description {
  @apply mt-2 text-sm text-on-surface;
}

.delivery-view__error {
  @apply flex flex-col items-start gap-4 text-error;
}

.delivery-view__retry {
  @apply cursor-pointer rounded-lg bg-primary px-5 py-3
    font-semibold text-white;
}
</style>