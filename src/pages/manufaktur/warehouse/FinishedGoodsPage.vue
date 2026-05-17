<template>
  <q-page class="warehouse-page bg-grey-2 q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Finished Goods</div>
        <div class="text-subtitle1 text-grey-7">
          Monitoring barang jadi yang sudah tersedia di warehouse manufaktur.
        </div>
      </div>
      <q-btn
        flat
        rounded
        color="green-10"
        icon="sync"
        label="Refresh Data"
        no-caps
        :loading="loading"
        class="bg-white shadow-1 q-mt-md q-mt-md-none"
        @click="loadRows"
      />
    </div>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada data finished goods.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'finished_goods_manufaktur'
const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
let unsubscribeRows = null

const columns = [
  { name: 'kode_barang', label: 'Kode Barang', field: 'kode_barang', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Nama Barang', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'lokasi', label: 'Lokasi', field: 'lokasi', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

const normalizeRow = (id, data) => ({
  id,
  kode_barang: data.kode_barang || data.kode || '-',
  nama_barang: data.nama_barang || data.nama_produk || '-',
  qty: Number(data.qty ?? data.stok ?? 0),
  satuan: data.satuan || 'PCS',
  lokasi: data.lokasi || data.rak || '-',
  status: data.status || 'AVAILABLE',
})

const loadRows = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((docItem) => normalizeRow(docItem.id, docItem.data()))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat finished goods' })
    },
  )
}

onMounted(loadRows)
onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
})
</script>

<style scoped>
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}
</style>
