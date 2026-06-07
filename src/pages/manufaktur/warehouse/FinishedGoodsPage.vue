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
          <div class="col-12 col-md-5">
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
          <div class="col-12 col-md-3">
            <q-select
              v-model="rackFilter"
              :options="rackOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Lokasi Rak"
            />
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
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        active-color="green-10"
        indicator-color="green-10"
        class="text-grey-7"
      >
        <q-tab name="receiving" icon="qr_code_scanner" label="Receiving FG" />
        <q-tab name="stock" icon="inventory" label="Stok Finished Goods" />
        <q-tab name="movement" icon="history" label="Riwayat Pergerakan Stok" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="receiving" class="q-pa-none">
          <FinishedGoodsReceivingPage />
        </q-tab-panel>

        <q-tab-panel name="stock" class="q-pa-none">
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

            <template #body-cell-rack_location="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-xs">
                  <q-chip dense square color="green-1" text-color="green-10" class="text-weight-bold">
                    {{ props.row.rack_location || '-' }}
                  </q-chip>
                  <q-btn flat round dense color="green-10" icon="edit_location_alt" @click="openRackDialog(props.row)">
                    <q-tooltip>Edit lokasi rak</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-xl">
                <q-icon name="inventory" size="28px" class="q-mr-sm" />
                Belum ada data finished goods.
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="movement" class="q-pa-none">
          <q-card flat bordered class="filter-card bg-white q-ma-md">
            <q-card-section class="q-py-md">
              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-sm-6 col-lg-3">
                  <q-input v-model="movementDateFilter" outlined dense rounded type="date" label="Tanggal" />
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <q-select
                    v-model="movementTypeFilter"
                    :options="movementTypeOptions"
                    outlined
                    dense
                    rounded
                    emit-value
                    map-options
                    label="Tipe Movement"
                  />
                </div>
                <div class="col-12 col-lg-4">
                  <q-select
                    v-model="movementProductFilter"
                    :options="movementProductOptions"
                    outlined
                    dense
                    rounded
                    emit-value
                    map-options
                    label="Produk"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-table
            :rows="filteredMovements"
            :columns="movementColumns"
            row-key="id"
            flat
            :loading="movementLoading"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-tipe_movement="props">
              <q-td :props="props">
                <q-chip dense square color="blue-grey-8" text-color="white" class="text-weight-bold">
                  {{ props.row.tipe_movement || '-' }}
                </q-chip>
              </q-td>
            </template>

            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-xl">
                <q-icon name="history" size="28px" class="q-mr-sm" />
                Belum ada riwayat pergerakan stok.
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="rackDialog" persistent>
      <q-card class="rack-dialog">
        <q-card-section class="bg-green-10 text-white">
          <div class="text-h6 text-weight-bold">Edit Lokasi Rak</div>
          <div class="text-caption">{{ selectedStock?.nama_barang || '-' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="rackForm"
            outlined
            dense
            autofocus
            label="Lokasi Rak"
            placeholder="RAK-A1 / FG-B2 / PALLET-C3"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
          <q-btn
            unelevated
            color="green-10"
            icon="save"
            label="Simpan"
            no-caps
            :loading="rackSaving"
            @click="saveRackLocation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'
import FinishedGoodsReceivingPage from 'src/pages/manufaktur/warehouse/FinishedGoodsReceivingPage.vue'
import {
  FG_STOCK_MOVEMENTS_COLLECTION,
  FINISHED_GOODS_STOCK_COLLECTION,
  updateFinishedGoodsRackLocation,
} from 'src/services/finishedGoodsService'

const $q = useQuasar()
const masterMaterials = ref([])
const stockMovements = ref([])
const search = ref('')
const rackFilter = ref('all')
const movementDateFilter = ref('')
const movementTypeFilter = ref('all')
const movementProductFilter = ref('all')
const activeTab = ref('receiving')
const loading = ref(false)
const movementLoading = ref(false)
const rackDialog = ref(false)
const rackSaving = ref(false)
const selectedStock = ref(null)
const rackForm = ref('')
let unsubscribeRows = null
let unsubscribeMovements = null

const columns = [
  {
    name: 'kode_barang',
    label: 'Kode Barang',
    field: 'kode_barang',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nama_barang',
    label: 'Nama Barang',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'kategori', label: 'Tipe', field: 'kategori', align: 'left', sortable: true },
  { name: 'ukuran', label: 'Ukuran', field: 'ukuran', align: 'left', sortable: true },
  { name: 'rack_location', label: 'Lokasi Rak', field: 'rack_location', align: 'left', sortable: true },
  {
    name: 'stok_tersedia',
    label: 'Stok Tersedia',
    field: 'stok_tersedia',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stok_minimum',
    label: 'Stok Min.',
    field: 'stok_minimum',
    align: 'right',
    sortable: true,
  },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'supplier_default', label: 'Supplier Default', field: 'supplier_default', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

const movementColumns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal_display', align: 'left', sortable: true },
  { name: 'tipe_movement', label: 'Tipe Movement', field: 'tipe_movement', align: 'left', sortable: true },
  { name: 'referensi', label: 'Referensi', field: 'referensi', align: 'left', sortable: true },
  { name: 'product_name', label: 'Produk', field: 'product_name', align: 'left', sortable: true },
  { name: 'qty_in', label: 'Qty In', field: 'qty_in', align: 'right', sortable: true },
  { name: 'qty_out', label: 'Qty Out', field: 'qty_out', align: 'right', sortable: true },
  { name: 'saldo_akhir', label: 'Saldo Akhir', field: 'saldo_akhir', align: 'right', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left', sortable: true },
  { name: 'rack_location', label: 'Lokasi Rak', field: 'rack_location', align: 'left', sortable: true },
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
  nama_barang: data.nama || data.nama_material || data.nama_barang || data.nama_produk || '-',
  kategori: getMaterialType(data) || '-',
  ukuran: data.ukuran || '-',
  stok_tersedia: Number(data.stok_tersedia ?? data.stok_saat_ini ?? data.stok ?? 0),
  stok_minimum: Number(data.stok_minimum ?? 0),
  satuan: data.unit || data.satuan || 'PCS',
  rack_location: data.rack_location || '',
  supplier_default:
    data.supplier_default ||
    data.vendor_prices?.[0]?.vendor?.nama ||
    data.vendor_prices?.[0]?.vendor ||
    '-',
  status: data.status || data.status_aktif || 'AVAILABLE',
})

const isLowStock = (row) => Number(row?.stok_tersedia || 0) <= Number(row?.stok_minimum || 0)

const rows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return masterMaterials.value
    .filter(
      (item) =>
        item.status !== 'Nonaktif' &&
        item.status_aktif !== 'Nonaktif' &&
        ['bahan_jadi', 'finished_goods'].includes(getMaterialType(item)),
    )
    .map((item) => normalizeRow(item.id, item))
    .filter((row) => {
      if (rackFilter.value !== 'all' && row.rack_location !== rackFilter.value) return false
      if (!keyword) return true
      return [row.kode_barang, row.nama_barang, row.kategori, row.ukuran, row.satuan, row.rack_location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
})

const rackOptions = computed(() => {
  const locations = [...new Set(masterMaterials.value.map((item) => item.rack_location).filter(Boolean))].sort()
  return [{ label: 'Semua Lokasi', value: 'all' }, ...locations.map((value) => ({ label: value, value }))]
})

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const normalizeMovement = (id, data) => ({
  id,
  ...data,
  tanggal_display: formatDateTime(data.tanggal || data.created_at),
  qty_in: Number(data.qty_in || 0),
  qty_out: Number(data.qty_out || 0),
  saldo_akhir: Number(data.saldo_akhir || 0),
})

const filteredMovements = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return stockMovements.value.filter((row) => {
    if (rackFilter.value !== 'all' && row.rack_location !== rackFilter.value) return false
    if (movementDateFilter.value && normalizeDate(row.tanggal || row.timestamp || row.created_at) !== movementDateFilter.value) return false
    if (movementTypeFilter.value !== 'all' && movementTypeValue(row) !== movementTypeFilter.value) return false
    if (movementProductFilter.value !== 'all' && row.product_name !== movementProductFilter.value) return false
    if (!keyword) return true
    return [
      row.tipe_movement,
      row.referensi,
      row.product_name,
      row.user,
      row.rack_location,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  })
})

const movementTypeValue = (row = {}) => row.type || row.tipe_movement || row.action || ''

const movementTypeOptions = computed(() => {
  const values = [...new Set(stockMovements.value.map((row) => movementTypeValue(row)).filter(Boolean))].sort()
  return [{ label: 'Semua Tipe', value: 'all' }, ...values.map((value) => ({ label: value, value }))]
})

const movementProductOptions = computed(() => {
  const values = [...new Set(stockMovements.value.map((row) => row.product_name).filter(Boolean))].sort()
  return [{ label: 'Semua Produk', value: 'all' }, ...values.map((value) => ({ label: value, value }))]
})

const normalizeDate = (value) => {
  if (!value) return ''
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const loadRows = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()
  unsubscribeRows = onSnapshot(
    query(collection(db, FINISHED_GOODS_STOCK_COLLECTION), orderBy('product_name', 'asc')),
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

const loadMovements = () => {
  movementLoading.value = true
  if (unsubscribeMovements) unsubscribeMovements()
  unsubscribeMovements = onSnapshot(
    query(collection(db, FG_STOCK_MOVEMENTS_COLLECTION), orderBy('tanggal', 'desc')),
    (snapshot) => {
      stockMovements.value = snapshot.docs.map((docItem) => normalizeMovement(docItem.id, docItem.data()))
      movementLoading.value = false
    },
    (error) => {
      console.error(error)
      movementLoading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat riwayat pergerakan stok' })
    },
  )
}

const openRackDialog = (row) => {
  selectedStock.value = row
  rackForm.value = row.rack_location || ''
  rackDialog.value = true
}

const saveRackLocation = async () => {
  if (!selectedStock.value?.id) return
  rackSaving.value = true
  try {
    await updateFinishedGoodsRackLocation({
      stockId: selectedStock.value.id,
      rackLocation: rackForm.value,
      userName: auth.currentUser?.displayName || auth.currentUser?.email || '',
      userId: auth.currentUser?.uid || '',
    })
    $q.notify({ type: 'positive', message: 'Lokasi rak berhasil diperbarui.' })
    rackDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error?.message || 'Gagal memperbarui lokasi rak' })
  } finally {
    rackSaving.value = false
  }
}

onMounted(() => {
  loadRows()
  loadMovements()
})
onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeMovements) unsubscribeMovements()
})
</script>

<style scoped>
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.rack-dialog {
  max-width: 92vw;
  width: 420px;
}
</style>
