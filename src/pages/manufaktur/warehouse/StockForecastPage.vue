<template>
  <q-page class="warehouse-page bg-grey-2 q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Stock Forecast</div>
        <div class="text-subtitle1 text-grey-7">
          Proyeksi kebutuhan stok warehouse berdasarkan data forecast yang tersedia.
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
            <q-icon name="query_stats" size="28px" class="q-mr-sm" />
            Belum ada data stock forecast.
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

const COLLECTION_NAME = 'stock_forecast_manufaktur'
const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
let unsubscribeRows = null

const columns = [
  { name: 'kode_barang', label: 'Kode Barang', field: 'kode_barang', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Nama Barang', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'stok_saat_ini', label: 'Stok Saat Ini', field: 'stok_saat_ini', align: 'right', sortable: true },
  { name: 'kebutuhan', label: 'Kebutuhan', field: 'kebutuhan', align: 'right', sortable: true },
  { name: 'forecast', label: 'Forecast', field: 'forecast', align: 'right', sortable: true },
  { name: 'periode', label: 'Periode', field: 'periode', align: 'left' },
]

const normalizeRow = (id, data) => ({
  id,
  kode_barang: data.kode_barang || data.kode || '-',
  nama_barang: data.nama_barang || data.nama_produk || '-',
  stok_saat_ini: Number(data.stok_saat_ini ?? data.stok ?? 0),
  kebutuhan: Number(data.kebutuhan ?? data.qty_kebutuhan ?? 0),
  forecast: Number(data.forecast ?? data.qty_forecast ?? 0),
  periode: data.periode || data.bulan || '-',
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
      $q.notify({ type: 'negative', message: 'Gagal memuat stock forecast' })
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
