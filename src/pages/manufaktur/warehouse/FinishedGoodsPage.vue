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

    <q-card flat bordered class="filter-card bg-white q-mb-md">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode, nama barang jadi, ukuran, atau satuan..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ rows.length }} BAHAN JADI
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
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada data finished goods.
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
const loading = ref(false)
let unsubscribeRows = null

const columns = [
  { name: 'kode_barang', label: 'Kode Barang', field: 'kode_barang', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Nama Barang', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'kategori', label: 'Tipe', field: 'kategori', align: 'left', sortable: true },
  { name: 'ukuran', label: 'Ukuran', field: 'ukuran', align: 'left', sortable: true },
  { name: 'stok_minimum', label: 'Stok Min.', field: 'stok_minimum', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'supplier_default', label: 'Supplier Default', field: 'supplier_default', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
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
  kategori: getMaterialType(data) || '-',
  ukuran: data.ukuran || '-',
  stok_minimum: Number(data.stok_minimum ?? 0),
  satuan: data.satuan || 'PCS',
  supplier_default: data.supplier_default || '-',
  status: data.status || 'AVAILABLE',
})

const rows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return masterMaterials.value
    .filter((item) => item.status !== 'Nonaktif' && getMaterialType(item) === 'bahan_jadi')
    .map((item) => normalizeRow(item.id, item))
    .filter((row) => {
      if (!keyword) return true
      return [row.kode_barang, row.nama_barang, row.kategori, row.ukuran, row.satuan]
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
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}
</style>
