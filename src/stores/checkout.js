import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    channel: 'sala',
    tableNumber: null,
    address: null,
    paymentMethod: null,
  }),
  actions: {
    setChannel(channel) {
      if (this.channel === channel) return

      this.channel = channel
      this.paymentMethod = null
    },
    setTableNumber(tableNumber) {
      this.tableNumber = tableNumber
    },
    setAddress(address) {
      this.address = address
    },
  },
})
