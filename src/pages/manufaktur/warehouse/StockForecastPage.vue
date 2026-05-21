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

    <q-card flat bordered class="filter-card bg-white q-mb-md">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode, nama material, ukuran, atau satuan..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="typeFilter"
              :options="typeOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Tipe Material"
              bg-color="white"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ rows.length }} MATERIAL
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'master_material'
const $q = useQuasar()
const masterMaterials = ref([])
const search = ref('')
const typeFilter = ref('all')
const loading = ref(false)
let unsubscribeRows = null
const typeOptions = [
  { label: 'Semua Tipe', value: 'all' },
  { label: 'Bahan Mentah', value: 'bahan_mentah' },
  { label: 'Bahan Jadi', value: 'bahan_jadi' },
  { label: 'Consumable', value: 'consumable' },
]

const columns = [
  { name: 'kode_barang', label: 'Kode Barang', field: 'kode_barang', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Nama Material', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'tipe_material', label: 'Tipe', field: 'tipe_material', align: 'left', sortable: true },
  { name: 'stok_saat_ini', label: 'Stok Saat Ini', field: 'stok_saat_ini', align: 'right', sortable: true },
  { name: 'kebutuhan', label: 'Kebutuhan', field: 'kebutuhan', align: 'right', sortable: true },
  { name: 'forecast', label: 'Forecast', field: 'forecast', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
]

const getMaterialType = (data = {}) =>
  String(data.jenis_material || data.tipe_material || data.tipe || data.kategori || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')

const normalizeRow = (id, data) => ({
  id,
  kode_barang: data.kode_material || data.kode_barang || data.kode || '-',
  nama_barang: data.nama_material || data.nama_barang || data.nama_produk || '-',
  tipe_material: getMaterialType(data) || '-',
  stok_saat_ini: Number(data.stok_saat_ini ?? data.stok ?? 0),
  kebutuhan: Number(data.kebutuhan ?? data.qty_kebutuhan ?? data.stok_minimum ?? 0),
  forecast: Math.max(
    Number(data.kebutuhan ?? data.qty_kebutuhan ?? data.stok_minimum ?? 0) -
      Number(data.stok_saat_ini ?? data.stok ?? 0),
    0,
  ),
  satuan: data.satuan || 'PCS',
})

const rows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return masterMaterials.value
    .filter((item) => item.status !== 'Nonaktif')
    .filter((item) => ['bahan_mentah', 'bahan_jadi', 'consumable'].includes(getMaterialType(item)))
    .filter((item) => typeFilter.value === 'all' || getMaterialType(item) === typeFilter.value)
    .map((item) => normalizeRow(item.id, item))
    .filter((row) => {
      if (!keyword) return true
      return [row.kode_barang, row.nama_barang, row.tipe_material, row.satuan]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
})

const loadRows = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('nama_material', 'asc')),
    (snapshot) => {
      masterMaterials.value = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
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
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}
</style>
