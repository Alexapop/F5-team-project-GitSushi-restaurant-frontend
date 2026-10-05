<script setup>
import { ref, computed } from 'vue'
import KitchenOrderCard from './KitchenOrderCard.vue'
import KitchenAttendedOrders from './KitchenAttendedOrders.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})


// Reenvía a la vista el cambio de estado de una comanda.
const emit = defineEmits(['status-changed'])

const selectedChannel = ref('ALL')


// "Atendidas" no es un canal: muestra las comandas ya terminadas en lugar de las activas.
const ATTENDED_FILTER = 'ATTENDED'
const isShowingAttended = computed(() => selectedChannel.value === ATTENDED_FILTER)

const filteredOrders = computed(() => {
  if (selectedChannel.value === 'ALL') {
    return props.orders
  }

  return props.orders.filter(
    order => order.channel === selectedChannel.value
  )
})
</script>

<template>
  <section>
    <h2 class="mb-4">
            {{ isShowingAttended ? 'Comandas atendidas' : 'Comandas activas' }}
    </h2>
    <div class="mb-4 flex flex-wrap gap-2">
  <button
  type="button"
  :class="
    selectedChannel === 'ALL'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'ALL'"
>
  Todos
</button>

<button
  type="button"
  :class="
    selectedChannel === 'ONSITE'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'ONSITE'"
>
  En Sala
</button>

<button
  type="button"
  :class="
    selectedChannel === 'ONLINE'
      ? 'btn-primary'
      : 'btn-secondary'
  "
  @click="selectedChannel = 'ONLINE'"
>
  A Domicilio
</button>

<button
  type="button"
  :class="isShowingAttended ? 'btn-primary' : 'btn-secondary'"
  @click="selectedChannel = ATTENDED_FILTER"
>
  Atendidas
</button>
</div>

    <KitchenAttendedOrders v-if="isShowingAttended" />

    <LoadingSpinner
      v-else-if="isLoading"
      class="card"
      label="Cargando comandas..."
    />

    <p
      v-else-if="error"
      class="card p-6 text-error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="orders.length === 0"
      class="card p-6 text-on-surface-variant"
    >
      No hay comandas activas.
    </p>

    <!-- Móvil: 1 columna · Tablet (md): 2 columnas · Escritorio (xl): 4 columnas -->
    <div
      v-else
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
  <KitchenOrderCard
  v-for="order in filteredOrders"
  :key="order.id"
  :order="order"
  @status-changed="emit('status-changed', $event)"
/>
    </div>
  </section>
</template>