import { defineStore } from "pinia";
import { getExclusiveOffers } from "../services/offers.service";

export const useExclusiveOffersStore = defineStore("exclusiveOffers", {
  state: () => ({
    offers: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    // El backend no tiene fecha de caducidad: una oferta deja de estar
    // activa cuando el cliente ya la ha canjeado (used === true).
    activeOffers: (state) => state.offers.filter((offer) => !offer.used),

    // Devuelve la oferta activa completa de un producto (con su finalPrice
    // ya calculado por el backend), o null si no tiene ninguna oferta activa.
    offerForProduct: (state) => (productId) => {
      return (
        state.offers.find((o) => o.product.id === productId && !o.used) ?? null
      );
    },
  },
  actions: {
    async fetchOffers() {
      this.isLoading = true;
      this.error = null;
      try {
        this.offers = await getExclusiveOffers();
      } catch (err) {
        this.error = "No se han podido cargar tus ofertas exclusivas. Inténtalo de nuevo más tarde.";
        console.error("[exclusiveOffers] Error al obtener las ofertas:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
