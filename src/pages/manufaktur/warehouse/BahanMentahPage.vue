<template>
  <q-page class="warehouse-page bg-dark-premium q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder incoming-title">Bahan Mentah</div>
        <div class="text-subtitle1 incoming-subtitle">
          Monitoring stok bahan mentah warehouse manufaktur.
        </div>
      </div>
      <q-btn
        flat
        rounded
        icon="sync"
        label="Refresh Data"
        no-caps
        :loading="loading"
        class="btn-glass shadow-1 q-mt-md q-mt-md-none"
        @click="loadRows"
      />
    </div>

    <q-card flat bordered class="table-card glass-card">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        dark
        class="fg-table-dark"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #body-cell-nama_barang="props">
          <q-td :props="props">
            <div class="text-weight-bold text-neon-cyan">{{ props.row.nama_barang || '-' }}</div>
            <div class="text-caption text-secondary-premium">{{ props.row.kode_barang || '-' }}</div>
            <q-badge v-if="isLowStock(props.row)" color="negative" class="q-mt-xs">
              STOK MENIPIS
            </q-badge>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-secondary-premium q-pa-xl">
            <q-icon name="category" size="28px" class="q-mr-sm" />
            Belum ada data bahan mentah.
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

const COLLECTION_NAME = 'bahan_mentah_manufaktur'
const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
let unsubscribeRows = null

const columns = [
  { name: 'kode_barang', label: 'Kode Barang', field: 'kode_barang', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Nama Barang', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'kategori', label: 'Kategori', field: 'kategori', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'right', sortable: true },
  { name: 'stok_minimum', label: 'Stok Min.', field: 'stok_minimum', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'lokasi', label: 'Lokasi', field: 'lokasi', align: 'left' },
]

const normalizeRow = (id, data) => ({
  id,
  kode_barang: data.kode_barang || data.kode || '-',
  nama_barang: data.nama_barang || data.nama_material || '-',
  kategori: data.kategori || data.kategori_material || '-',
  qty: Number(data.qty ?? data.stok ?? 0),
  stok_tersedia: Number(data.stok_tersedia ?? data.qty ?? data.stok ?? 0),
  stok_minimum: Number(data.stok_minimum ?? 0),
  satuan: data.satuan || 'PCS',
  lokasi: data.lokasi || data.rak || '-',
})

const isLowStock = (row) => Number(row?.stok_tersedia || 0) <= Number(row?.stok_minimum || 0)

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
      $q.notify({ type: 'negative', message: 'Gagal memuat bahan mentah' })
    },
  )
}

onMounted(loadRows)
onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
})
</script>

<style scoped>
.warehouse-page {
  background-color: #071826;
  min-height: 100vh;
}

.incoming-title {
  color: #F4F7FA !important;
  text-shadow: 0 0 12px rgba(124, 255, 79, 0.18);
}

.incoming-subtitle {
  color: #B8C7D9 !important;
}

.text-neon-cyan {
  color: #00D1B2 !important;
}

.text-secondary-premium {
  color: #B8C7D9 !important;
}

.btn-glass {
  background: rgba(13, 34, 51, 0.5) !important;
  border: 1px solid rgba(0, 209, 178, 0.25) !important;
  color: #00D1B2 !important;
  font-weight: 700 !important;
}
.btn-glass:hover {
  background: rgba(0, 209, 178, 0.1) !important;
  box-shadow: 0 0 12px rgba(0, 209, 178, 0.2);
}

.glass-card {
  background: rgba(13, 34, 51, 0.7) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}

/* Table Spacing Alignment (Matching PlanningProduksiPage.vue) */
.table-card {
  margin-top: 20px !important;
  padding: 20px !important;
  border-radius: 18px !important;
  background: rgba(13, 34, 51, 0.85) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.table-card :deep(.q-table thead tr) {
  height: 54px !important;
}

.table-card :deep(.q-table thead th) {
  height: 54px !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  padding: 0 18px !important;
  vertical-align: middle !important;
  background: rgba(13, 34, 51, 0.9) !important;
}

.table-card :deep(.q-table tbody tr) {
  min-height: 64px !important;
  height: 64px !important;
}

.table-card :deep(.q-table tbody td) {
  padding: 14px 18px !important;
  white-space: normal !important;
  vertical-align: middle !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.table-card :deep(.q-table__bottom) {
  padding: 16px 20px !important;
}

.fg-table-dark :deep(tbody td) {
  color: #F4F7FA !important;
}

</style>
