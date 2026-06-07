import { defineStore } from 'pinia'
import {
  approvePurchaseOrder,
  subscribePurchaseOrders,
  updatePurchaseStatus,
} from 'src/services/manufacturePurchaseService'

export const useManufactureApprovalStore = defineStore('manufactureApprovalPO', {
  state: () => ({
    purchaseOrders: [],
    loading: false,
    error: null,
    unsubscribePurchaseOrders: null,
  }),

  actions: {
    bindPurchaseOrders() {
      this.loading = true

      if (this.unsubscribePurchaseOrders) {
        this.unsubscribePurchaseOrders()
      }

      this.unsubscribePurchaseOrders = subscribePurchaseOrders(
        (rows) => {
          this.purchaseOrders = rows
          this.loading = false
          this.error = null
        },
        (error) => {
          this.purchaseOrders = []
          this.loading = false
          this.error = error
        },
      )
    },

    updatePurchaseOrder(id, payload) {
      const status = payload.status || 'Draft'
      return updatePurchaseStatus(id, status, payload)
    },

    approvePurchaseOrder(row, status, payload) {
      return approvePurchaseOrder(row, status, payload)
    },

    unbind() {
      if (this.unsubscribePurchaseOrders) {
        this.unsubscribePurchaseOrders()
      }

      this.unsubscribePurchaseOrders = null
    },
  },
})
