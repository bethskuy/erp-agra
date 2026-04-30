<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 text-weight-bold text-teal-10 q-mb-md">Step 5: Packing (Final)</div>
    <q-card class="shadow-sm border-top-teal">
      <q-card-section>
        <div class="text-subtitle1 text-bold">Total Barang yang Siap Masuk Gudang:</div>
        <q-input v-model.number="qty_final" type="number" label="Jumlah Packing Selesai" outlined class="q-my-md" />
        <q-banner class="bg-blue-1 text-blue-10 q-mb-md">
          Setelah klik tombol di bawah, data akan dikirim ke <b>W/House (OQC)</b>.
        </q-banner>
        <q-btn color="teal-10" icon="inventory_2" label="Kirim ke Gudang (Warehouse)" class="full-width" @click="finish" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const qty_final = ref(0)
const finish = () => router.push('/manufaktur/warehouse/outgoing-check')
</script>

<style scoped>
.border-top-teal { border-top: 5px solid #004d40; }
</style>

