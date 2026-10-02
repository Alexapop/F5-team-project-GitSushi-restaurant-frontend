import { defineStore } from "pinia";

// Guarda el último pedido confirmado de verdad contra el backend (la
// respuesta completa de createOrder, incluido paymentStatus). Sirve de
// puente entre OrderConfirmation.vue, que lo deja aquí justo antes de
// navegar a /mi-pedido, y esa vista, que hoy sigue mostrando un pedido
// simulado en su lugar.
export const useLastOrderStore = defineStore("lastOrder", {
  state: () => ({
    order: null,
  }),
  actions: {
    setOrder(order) {
      this.order = order;
    },
    clearOrder() {
      this.order = null;
    },
  },
});
