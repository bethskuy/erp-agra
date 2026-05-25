<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 text-weight-bold text-teal-10 q-mb-md">Finance - Invoice Customer</div>

    <q-card class="shadow-sm">
      <q-card-section class="bg-blue-grey-10 text-white">
        <div class="text-subtitle1">Penagihan (Billing)</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-table :rows="invoices" :columns="invCols" flat bordered>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.value === 'Paid' ? 'positive' : 'orange'">{{ props.value }}</q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const invoices = ref([])
const invCols = [
  { name: 'no_inv', label: 'No. Invoice', field: 'no_invoice', align: 'left' },
  { name: 'cust', label: 'Customer', field: 'customer', align: 'left' },
  { name: 'total', label: 'Total Tagihan', field: 'amount', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]
</script>


