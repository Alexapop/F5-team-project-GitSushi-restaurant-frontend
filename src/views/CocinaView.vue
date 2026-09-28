<script setup>
import { onMounted, ref } from 'vue'
import KitchenMetrics from '../components/KitchenMetrics.vue'
import KitchenOrderList from '../components/KitchenOrderList.vue'
import { getKitchenOrders } from '../services/kitchen.service'

const orders = ref([])
const isLoading = ref(true)
const error = ref(null)

async function loadOrders() {
  isLoading.value = true
  error.value = null

  try {
    orders.value = await getKitchenOrders()
  } catch {
    error.value = 'No se han podido cargar las comandas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)
</script>

<template>
  <main class="page-container py-8">
    <KitchenMetrics />

    <div class="mt-8">
      <KitchenOrderList
        :orders="orders"
        :is-loading="isLoading"
        :error="error"
      />
    </div>
  </main>
</template>