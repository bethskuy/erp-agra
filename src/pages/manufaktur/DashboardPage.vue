<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="text-h4 text-weight-bold text-teal-10 q-mb-xl">Dashboard</div>
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-4" v-for="card in statCards" :key="card.title">
        <q-card
          flat
          class="rounded-borders shadow-sm"
          :style="`border-left: 6px solid ${card.color}`"
        >
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-7">{{ card.title }}</div>
              <div class="text-h3 text-weight-bold">{{ card.value }}</div>
            </div>
            <q-icon :name="card.icon" size="44px" :color="card.iconColor" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const totalActiveProduction = ref(0)
const totalCriticalStock = ref(0)
const totalBOM = ref(0)

const statCards = ref([
  {
    title: 'Produksi Aktif',
    value: totalActiveProduction,
    icon: 'precision_manufacturing',
    color: '#1976d2',
    iconColor: 'blue-8',
  },
  {
    title: 'Stok Kritis',
    value: totalCriticalStock,
    icon: 'warning_amber',
    color: '#d32f2f',
    iconColor: 'red-8',
  },
  {
    title: 'Total Resep (BOM)',
    value: totalBOM,
    icon: 'receipt_long',
    color: '#004d40',
    iconColor: 'teal-8',
  },
])

const fetchData = async () => {
  try {
    const wo = await getDocs(collection(db, 'work_orders'))
    totalActiveProduction.value = wo.docs.filter((d) => d.data().status !== 'Selesai').length
    const mat = await getDocs(collection(db, 'materials'))
    totalCriticalStock.value = mat.docs.filter((d) => Number(d.data().stok) <= 10).length
    const bom = await getDocs(collection(db, 'boms'))
    totalBOM.value = bom.size
  } catch (e) {
    console.error(e)
  }
}
onMounted(fetchData)
</script>
