<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Bill of Material (BOM)</div>

    <q-table :rows="boms" :columns="columns" row-key="id" flat bordered />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const boms = ref([])

const columns = [
  { name: 'produk', label: 'Produk', field: 'produk' },
  { name: 'material', label: 'Material', field: 'material' },
  { name: 'qty', label: 'Qty', field: 'qty' },
]

const loadData = async () => {
  const snapshot = await getDocs(collection(db, 'boms'))
  boms.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

onMounted(loadData)
</script>
