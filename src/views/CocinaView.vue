<script setup>
import { onMounted, ref } from 'vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import {
  getKitchenOrders,
  getKitchenMetrics,
} from '../services/kitchen.service'
import { useAutoRefresh } from '../composables/useAutoRefresh'

const orders = ref([])
const metrics = ref(null)

const isLoadingOrders = ref(true)
const isLoadingMetrics = ref(true)

const ordersError = ref(null)
const metricsError = ref(null)

// Solo "cargando" la primera vez: al refrescar se mantienen las comandas en pantalla.
let hasLoadedOrders = false

async function loadOrders() {
  isLoadingOrders.value = !hasLoadedOrders
  ordersError.value = null

  try {
    orders.value = await getKitchenOrders()
  } catch {
    ordersError.value = 'No se han podido cargar las comandas.'
  } finally {
    isLoadingOrders.value = false
    hasLoadedOrders = true
  }
}

async function loadMetrics() {
  // Solo "cargando" la primera vez: al refrescar se mantienen las métricas en pantalla.
  isLoadingMetrics.value = metrics.value === null
  metricsError.value = null

  try {
    metrics.value = await getKitchenMetrics()
  } catch {
    metricsError.value = 'No se han podido cargar las métricas de cocina.'
  } finally {
    isLoadingMetrics.value = false
  }
}

onMounted(() => {
  loadOrders()
  loadMetrics()
})

// Las comandas nuevas y los cambios de otros puestos aparecen sin recargar.
useAutoRefresh(() => {
  loadOrders()
  loadMetrics()
})
</script>

<template>
  <main class="page-container py-8">
    <KitchenMetrics
      :metrics="metrics"
      :is-loading="isLoadingMetrics"
      :error="metricsError"
    />

    <div class="mt-8">
      <KitchenOrderList
        :orders="orders"
        :is-loading="isLoadingOrders"
        :error="ordersError"
        @status-changed="loadMetrics"
      />
    </div>
  </main>
</template>