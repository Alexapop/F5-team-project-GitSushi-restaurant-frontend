<script setup>
import AdminProductsPanel from '../components/AdminProductsPanel.vue'
import AdminInvoicesPanel from '../components/AdminInvoicesPanel.vue'
</script>

<template>
  <main class="admin-view">
    <AdminProductsPanel />
    <AdminInvoicesPanel />
  </main>
</template>

<style scoped>
@reference "../style.css";

.admin-view {
  @apply mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-8;
}
</style>