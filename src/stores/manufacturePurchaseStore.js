import { defineStore } from 'pinia'
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrders,
  subscribePurchaseOrders,
  updatePurchaseStatus,
} from 'src/services/manufacturePurchaseService'

export const useManufacturePurchaseStore = defineStore('manufacturePurchaseOrder', {
  state: () => ({
    purchaseOrders: [],
    materialRequests: [],
    suppliers: [],
    config: { kopUrl: '', nama_pt: '', slogan_pt: '' },
    loading: false,
    error: null,
    unsubscribePurchaseOrders: null,
  }),
  actions: {
    bindPurchaseOrders() {
      this.loading = true
      if (this.unsubscribePurchaseOrders) this.unsubscribePurchaseOrders()
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
    bindMaterialRequests() {
      this.materialRequests = []
    },
    async loadConfig() {
      return this.config
    },
    async saveLogo(kopUrl) {
      this.config = { ...this.config, kopUrl }
    },
    async loadSuppliers() {
      this.suppliers = []
      return this.suppliers
    },
    async countPurchaseOrders() {
      const rows = await getPurchaseOrders()
      return rows.length
    },
    createPurchaseOrder(payload, items) {
      return createPurchaseOrder(payload, items)
    },
    updatePurchaseOrder(id, payload) {
      const status = payload.status || 'Draft'
      return updatePurchaseStatus(id, status, payload)
    },
    deletePurchaseOrder(id) {
      return deletePurchaseOrder(id)
    },
    unbind() {
      if (this.unsubscribePurchaseOrders) this.unsubscribePurchaseOrders()
      this.unsubscribePurchaseOrders = null
    },
  },
})
