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
        <template #body-cell-nama_barang="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_barang || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.kode_barang || '-' }}</div>
            <q-badge v-if="isLowStock(props.row)" color="negative" class="q-mt-xs">
              STOK MENIPIS
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-stok_tersedia="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              no-caps
              class="stock-link text-weight-bold"
              :class="isLowStock(props.row) ? 'text-negative' : 'text-green-10'"
              @click="openMutationHistory(props.row)"
            >
              {{ formatNumber(props.row.stok_tersedia) }}
            </q-btn>
          </q-td>
        </template>

        <template #body-cell-kebutuhan="props">
          <q-td :props="props" class="text-right text-weight-bold">
            {{ formatNumber(props.row.kebutuhan) }}
          </q-td>
        </template>

        <template #body-cell-status_stok="props">
          <q-td :props="props">
            <q-badge
              :color="isLowStock(props.row) ? 'negative' : 'positive'"
              class="text-weight-bold q-px-sm q-py-xs"
            >
              {{ props.row.status_stok }}
            </q-badge>
            <div v-if="isLowStock(props.row)" class="text-caption text-negative text-weight-bold q-mt-xs">
              STOK MENIPIS
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="query_stats" size="28px" class="q-mr-sm" />
            Belum ada data stock forecast.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showMutationDialog" @hide="closeMutationHistory">
      <q-card class="mutation-dialog">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6 text-weight-bold text-green-10">Mutation History</div>
            <div class="text-caption text-grey-7">
              {{ selectedMaterial?.nama_barang || '-' }} - {{ selectedMaterial?.kode_barang || '-' }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-none">
          <q-table
            :rows="mutationRows"
            :columns="mutationColumns"
            row-key="id"
            flat
            dense
            :loading="loadingMutations"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-tanggal="props">
              <q-td :props="props">{{ formatDateTime(props.row.tanggal) }}</q-td>
            </template>
            <template #body-cell-incoming="props">
              <q-td :props="props" class="text-right text-positive text-weight-bold">
                {{ formatNumber(props.row.incoming) }}
              </q-td>
            </template>
            <template #body-cell-outgoing="props">
              <q-td :props="props" class="text-right text-negative text-weight-bold">
                {{ formatNumber(props.row.outgoing) }}
              </q-td>
            </template>
            <template #body-cell-qty="props">
              <q-td :props="props" class="text-right text-weight-bold">
                {{ formatNumber(props.row.qty) }}
              </q-td>
            </template>
            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-lg">
                Belum ada mutation history.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'master_material'
const MUTATION_COLLECTION_NAME = 'stock_mutation_history'
const $q = useQuasar()
const masterMaterials = ref([])
const mutationRows = ref([])
const selectedMaterial = ref(null)
const search = ref('')
const typeFilter = ref('all')
const loading = ref(false)
const loadingMutations = ref(false)
const showMutationDialog = ref(false)
let unsubscribeRows = null
let unsubscribeMutations = null
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
  { name: 'stok_tersedia', label: 'Stok Tersedia', field: 'stok_tersedia', align: 'right', sortable: true },
  { name: 'stok_minimum', label: 'Stok Min.', field: 'stok_minimum', align: 'right', sortable: true },
  { name: 'kebutuhan', label: 'Kebutuhan', field: 'kebutuhan', align: 'right', sortable: true },
  { name: 'status_stok', label: 'Status', field: 'status_stok', align: 'left', sortable: true },
  { name: 'forecast', label: 'Forecast', field: 'forecast', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
]

const mutationColumns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  { name: 'tipe_mutasi', label: 'Tipe Mutasi', field: 'tipe_mutasi', align: 'left', sortable: true },
  { name: 'incoming', label: 'Incoming', field: 'incoming', align: 'right', sortable: true },
  { name: 'outgoing', label: 'Outgoing', field: 'outgoing', align: 'right', sortable: true },
  { name: 'spk_reference', label: 'SPK Reference', field: 'spk_reference', align: 'left', sortable: true },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'right', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left', sortable: true },
]

const getMaterialType = (data = {}) =>
  String(data.jenis_material || data.tipe_material || data.tipe || data.kategori || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')

const normalizeRow = (id, data) => {
  const stokTersedia = Number(data.stok_tersedia ?? data.stok_saat_ini ?? data.stok ?? 0)
  const stokMinimum = Number(data.stok_minimum ?? 0)
  const kebutuhan = Number(data.kebutuhan ?? data.qty_kebutuhan ?? stokMinimum)

  return {
    id,
    kode_barang: data.kode_material || data.kode_barang || data.kode || '-',
    nama_barang: data.nama_material || data.nama_barang || data.nama_produk || '-',
    tipe_material: getMaterialType(data) || '-',
    stok_tersedia: stokTersedia,
    stok_minimum: stokMinimum,
    kebutuhan,
    status_stok: stokTersedia <= stokMinimum ? 'STOK MENIPIS' : 'AMAN',
    forecast: Math.max(kebutuhan - stokTersedia, 0),
    satuan: data.satuan || 'PCS',
  }
}

const isLowStock = (row) => Number(row?.stok_tersedia || 0) <= Number(row?.stok_minimum || 0)
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const toDate = (value) => {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateTime = (value) => {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getMutationDateValue = (data) =>
  data.tanggal || data.date || data.created_at || data.updated_at || data.timestamp || ''

const normalizeMutationRow = (id, data) => {
  const qty = Number(data.qty ?? data.jumlah ?? data.quantity ?? 0)
  const type = data.tipe_mutasi || data.tipe || data.type || data.mutation_type || '-'
  const incoming = Number(data.incoming ?? (String(type).toLowerCase().includes('in') ? qty : 0))
  const outgoing = Number(data.outgoing ?? (String(type).toLowerCase().includes('out') ? qty : 0))

  return {
    id,
    tanggal: getMutationDateValue(data),
    tipe_mutasi: type,
    incoming,
    outgoing,
    spk_reference: data.spk_reference || data.no_spk || data.nomor_spk || data.spk || data.reference || '-',
    qty,
    user: data.user || data.created_by || data.updated_by || data.createdBy || '-',
    material_id: data.material_id || data.master_material_id || data.id_material || data.id_barang || '',
    kode_barang: data.kode_barang || data.kode_material || data.kode || '',
    nama_barang: data.nama_barang || data.nama_material || data.material || '',
  }
}

const isMutationForMaterial = (mutation, material) => {
  if (!material) return false
  const mutationKeys = [mutation.material_id, mutation.kode_barang, mutation.nama_barang]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
  const materialKeys = [material.id, material.kode_barang, material.nama_barang]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return mutationKeys.some((key) => materialKeys.includes(key))
}

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

const closeMutationHistory = () => {
  if (unsubscribeMutations) unsubscribeMutations()
  unsubscribeMutations = null
  mutationRows.value = []
  selectedMaterial.value = null
  loadingMutations.value = false
}

const openMutationHistory = (row) => {
  closeMutationHistory()
  selectedMaterial.value = row
  showMutationDialog.value = true
  loadingMutations.value = true

  unsubscribeMutations = onSnapshot(
    query(collection(db, MUTATION_COLLECTION_NAME)),
    (snapshot) => {
      mutationRows.value = snapshot.docs
        .map((docItem) => normalizeMutationRow(docItem.id, docItem.data()))
        .filter((mutation) => isMutationForMaterial(mutation, row))
        .sort((a, b) => Number(toDate(b.tanggal) || 0) - Number(toDate(a.tanggal) || 0))
      loadingMutations.value = false
    },
    (error) => {
      console.error(error)
      loadingMutations.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat mutation history' })
    },
  )
}

onMounted(loadRows)
onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeMutations) unsubscribeMutations()
})
</script>

<style scoped>
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.stock-link {
  min-height: 28px;
  padding: 0 8px;
}

.mutation-dialog {
  width: min(960px, 94vw);
  max-width: 94vw;
}
</style>
