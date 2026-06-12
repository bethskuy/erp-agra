<template>
  <q-page class="monitoring-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Monitoring Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Produksi Per Departemen
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Data realtime SPK dan planning produksi dari PPIC ke tiap departemen manufacturing.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Realtime Firestore"
          no-caps
          :loading="loading"
          class="bg-white shadow-1 q-px-lg"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="46px" />
            <div class="q-ml-md col">
              <div class="summary-label">{{ card.title }}</div>
              <div class="summary-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Progress Produksi</div>
              <div class="text-caption text-grey-7">Akumulasi qty hasil jadi dibanding qty PO.</div>
            </div>
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold">
              {{ averageProgress }}%
            </q-chip>
          </q-card-section>
          <q-card-section>
            <q-linear-progress
              rounded
              size="14px"
              :value="averageProgress / 100"
              :color="progressColor(averageProgress)"
              track-color="green-1"
              class="q-mb-lg"
            />

            <div class="department-grid">
              <div v-for="item in departmentSummary" :key="item.nama" class="department-card">
                <q-avatar icon="corporate_fare" color="green-1" text-color="green-10" size="38px" />
                <div class="department-card__title">{{ item.nama }}</div>
                <div class="department-card__value">{{ item.progress }}%</div>
                <q-linear-progress
                  rounded
                  size="8px"
                  :value="item.progress / 100"
                  :color="progressColor(item.progress)"
                  track-color="green-1"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Aktivitas Terbaru</div>
              <div class="text-caption text-grey-7">Input produksi terakhir per departemen.</div>
            </div>
          </q-card-section>
          <q-card-section class="timeline-panel">
            <q-timeline color="green-10" layout="dense">
              <q-timeline-entry
                v-for="item in timelineItems"
                :key="item.id"
                :title="item.title"
                :subtitle="item.subtitle"
                :icon="statusIcon(item.status_produksi)"
                :color="statusColor(item.status_produksi)"
              >
                <div class="text-caption text-grey-7">{{ item.caption }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="search"
          outlined
          dense
          rounded
          debounce="250"
          placeholder="Cari departemen, tanggal, customer, PO, atau status..."
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" color="green-10" />
          </template>
          <template #append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search = ''" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="statusFilter"
          :options="statusFilterOptions"
          outlined
          dense
          rounded
          emit-value
          map-options
          label="Filter Status"
          bg-color="white"
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
          {{ filteredRows.length }} DATA PRODUKSI
        </q-chip>
      </div>
    </div>

    <q-card flat bordered class="table-card bg-white q-mb-lg">
      <q-card-section class="card-header">
        <div>
          <div class="text-overline text-green-10 text-weight-black">Barang Reject / Rework</div>
          <div class="text-caption text-grey-7">Queue produk yang perlu diproses ulang dari QC Produksi.</div>
        </div>
        <q-badge color="negative" class="notification-badge">
          {{ activeReworkRows.length }} Barang reject perlu rework
        </q-badge>
      </q-card-section>
      <q-separator />

      <q-table
        :rows="activeReworkRows"
        :columns="reworkColumns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loadingRework"
        :pagination="{ rowsPerPage: 5 }"
        class="monitoring-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase table-head"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="monitoring-row">
            <q-td key="no_spk" :props="props" class="text-weight-bold text-green-10">
              {{ props.row.no_spk || props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="produk" :props="props">{{ props.row.produk || props.row.nama_produk || '-' }}</q-td>
            <q-td key="qty_reject" :props="props" class="text-right">
              <q-badge color="negative" class="q-px-sm q-py-xs">
                {{ formatNumber(props.row.qty_reject) }}
              </q-badge>
            </q-td>
            <q-td key="qty_rework" :props="props" class="text-right">
              <q-badge color="purple-7" class="q-px-sm q-py-xs">
                {{ formatNumber(props.row.qty_rework) }}
              </q-badge>
            </q-td>
            <q-td key="departemen_asal" :props="props">{{ props.row.departemen_asal || '-' }}</q-td>
            <q-td key="status_rework" :props="props">
              <q-badge :color="reworkStatusColor(props.row.status_rework)" class="q-px-sm q-py-xs">
                {{ reworkStatusLabel(props.row.status_rework) }}
              </q-badge>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <q-badge color="blue-grey-6" class="q-px-sm q-py-xs">Departemen</q-badge>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="restart_alt" size="28px" class="q-mr-sm" />
            Belum ada barang reject atau rework.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="monitoring-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase table-head"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="monitoring-row">
            <q-td key="departemen" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_departemen }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_departemen || '-' }}</div>
            </q-td>
            <q-td key="tanggal" :props="props">{{ formatDate(props.row.tanggal) }}</q-td>
            <q-td key="nomor_spk" :props="props" class="text-weight-bold text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="customer" :props="props">{{ props.row.customer_nama || '-' }}</q-td>
            <q-td key="nomor_po" :props="props" class="text-weight-bold">
              {{ props.row.nomor_po || '-' }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
            </q-td>
            <q-td key="qty_po" :props="props" class="text-right">
              {{ formatNumber(props.row.qty_po) }}
            </q-td>
            <q-td key="qty_hasil_jadi" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty_hasil_jadi) }}
            </q-td>
            <q-td key="satuan" :props="props" class="text-center">
              {{ props.row.satuan || '-' }}
            </q-td>
            <q-td key="status_produksi" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_produksi)"
                class="status-chip"
              >
                {{ productionStatusLabel(props.row.status_produksi) }}
              </q-chip>
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="progress-label">Progress</span>
                  <span class="progress-value">{{ props.row.progress }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="9px"
                  :value="props.row.progress / 100"
                  :color="progressColor(props.row.progress)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center" @click.stop>
              <q-btn
                v-if="canFinishProduction(props.row)"
                unelevated
                dense
                rounded
                no-caps
                color="green-10"
                icon="task_alt"
                label="Produksi Selesai"
                :loading="finishingId === props.row.id"
                @click="finishProduction(props.row)"
              />
              <q-badge v-else color="grey-6" class="q-px-sm">
                {{ productionStatusLabel(props.row.status_produksi) }}
              </q-badge>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="monitoring" size="28px" class="q-mr-sm" />
            Belum ada SPK produksi departemen.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const SPK_SUBCOLLECTION = 'spk'
const PLANNING_COLLECTION = 'mf_production_planning'
const PRODUKSI_COLLECTION = 'manufactur_departemen_produksi'
const QC_COLLECTION = 'qc_produksi_manufaktur'
const REWORK_QUEUE_COLLECTION = 'produksi_rework_queue'

const rows = ref([])
const spkRows = ref([])
const planningRows = ref([])
const productionRows = ref([])
const reworkRows = ref([])
const loading = ref(true)
const loadingRework = ref(true)
const search = ref('')
const statusFilter = ref('all')
const finishingId = ref(null)
let unsubscribeSpk = null
let unsubscribePlanning = null
let unsubscribeProduction = null
let unsubscribeRework = null

const statusOptions = [
  'Menunggu Produksi',
  'On Production',
  'QC Process',
  'Finished',
  'Draft',
  'Scheduled',
  'On Progress',
  'Selesai',
  'Menunggu QC',
  'QC Approved',
  'QC Reject',
  'Rework',
]
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const columns = [
  { name: 'departemen', align: 'left', label: 'Nama Departemen', field: 'nama_departemen', sortable: true },
  { name: 'tanggal', align: 'left', label: 'Tanggal SPK', field: 'tanggal', sortable: true },
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_nama', sortable: true },
  { name: 'nomor_po', align: 'left', label: 'Nomor PO', field: 'nomor_po', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Master Produk', field: 'nama_produk', sortable: true },
  { name: 'qty_po', align: 'right', label: 'Qty PO', field: 'qty_po', sortable: true },
  {
    name: 'qty_hasil_jadi',
    align: 'right',
    label: 'Qty Hasil Jadi',
    field: 'qty_hasil_jadi',
    sortable: true,
  },
  { name: 'satuan', align: 'center', label: 'Satuan', field: 'satuan', sortable: true },
  {
    name: 'status_produksi',
    align: 'left',
    label: 'Status Produksi',
    field: 'status_produksi',
    sortable: true,
  },
  { name: 'progress', align: 'left', label: 'Progress', field: 'progress', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const reworkColumns = [
  { name: 'no_spk', align: 'left', label: 'SPK', field: 'no_spk', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'produk', sortable: true },
  { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
  { name: 'qty_rework', align: 'right', label: 'Qty Rework', field: 'qty_rework', sortable: true },
  { name: 'departemen_asal', align: 'left', label: 'Departemen Asal', field: 'departemen_asal', sortable: true },
  { name: 'status_rework', align: 'left', label: 'Status Rework', field: 'status_rework', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const normalizeRow = (row) => {
  const qtyPo = Number(row.qty_target ?? row.qty_po ?? row.total_po ?? 0)
  const qtyHasilJadi = Number(row.total_hasil_produksi || row.total_progress || row.qty_hasil_jadi || 0)
  const progress = Number(row.progress_percent ?? row.progress ?? (qtyPo ? Math.min(100, Math.round((qtyHasilJadi / qtyPo) * 100)) : 0))
  const customerValue = typeof row.customer === 'object' ? row.customer?.nama : row.customer
  const customerName =
    customerValue ||
    row.customer_nama ||
    row.nama_customer ||
    row.customerName ||
    ''

  return {
    ...row,
    tanggal: row.created_at || row.tanggal_planning || row.updated_at || row.deadline || '',
    nomor_spk: row.nomor_spk || '-',
    nama_departemen:
      row.tujuan_departemen?.nama_departemen ||
      row.departemen_nama ||
      row.departemen?.nama_departemen ||
      row.departemen?.nama ||
      row.departemen ||
      'Departemen Manufacturing',
    kode_departemen:
      row.tujuan_departemen?.kode_departemen || row.departemen_kode || row.departemen?.kode_departemen || '',
    customer: customerName,
    customer_nama: customerName,
    customer_id: row.customer_id || row.id_customer || row.customerId || null,
    nama_produk: row.nama_produk || row.item_produksi || row.produk?.nama_produk || '',
    kode_produk: row.kode_produk || row.produk?.kode_produk || '',
    no_spk: row.no_spk || row.nomor_spk || '',
    qty_po: qtyPo,
    qty_hasil_jadi: qtyHasilJadi,
    status_produksi: row.status_produksi || row.status_planning || row.status || 'Menunggu Produksi',
    operator: row.operator || row.operator_nama || row.created_by || row.createdBy || row.updatedBy || '',
    progress,
  }
}

const normalizeItem = (item = {}, index = 0) => {
  const qty = Number(item.qty ?? item.quantity ?? item.qty_target ?? item.qty_po ?? 0)
  const harga = Number(item.harga ?? item.price ?? item.harga_satuan ?? item.unit_price ?? 0)
  const namaProduk =
    item.nama_produk ||
    item.nama_barang ||
    item.deskripsi ||
    item.produk ||
    item.product ||
    `Item ${index + 1}`

  return {
    ...item,
    item_id: item.item_id || item.id || `item-${index + 1}`,
    nama_produk: namaProduk,
    deskripsi: item.deskripsi || namaProduk,
    qty,
    satuan: item.satuan || item.unit || 'Unit',
    harga,
    subtotal: Number(item.subtotal ?? item.total ?? qty * harga),
    produk_id: item.produk_id || item.product_id || item.id_produk || null,
    kode_produk: item.kode_produk || item.kode_barang || '',
  }
}

const expandRowItems = (row) => {
  if (row.item_id || !Array.isArray(row.items) || row.items.length <= 1) return [row]

  return row.items.map((rawItem, index) => {
    const item = normalizeItem(rawItem, index)
    return {
      ...row,
      id: `${row.id}-${item.item_id}`,
      item_id: item.item_id,
      item_index: index,
      produk_id: item.produk_id || row.produk_id || null,
      kode_produk: item.kode_produk || row.kode_produk || '',
      nama_produk: item.nama_produk || row.nama_produk || '',
      item_produksi: item.nama_produk || row.item_produksi || '',
      qty_target: Number(item.qty || 0),
      qty_po: Number(item.qty || 0),
      qty: Number(item.qty || 0),
      satuan: item.satuan || row.satuan || '',
      harga: Number(item.harga || 0),
      subtotal: Number(item.subtotal || 0),
    }
  })
}

const monitoringRows = computed(() => rows.value.flatMap(expandRowItems).map(normalizeRow))

const activeReworkRows = computed(() =>
  reworkRows.value.filter((row) =>
    ['menunggu_rework', 'rework', 'diproses_ulang', 'pending_qc_ulang'].includes(normalizeStatus(row.status_rework)),
  ),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return monitoringRows.value.filter((row) => {
    const normalizedStatus = normalizeStatus(row.status_produksi)
    const matchesStatus =
      statusFilter.value === 'all' ||
      normalizedStatus === normalizeStatus(statusFilter.value) ||
      (statusFilter.value === 'Menunggu Produksi' && normalizedStatus === 'menunggu produksi')
    const matchesSearch =
      !keyword ||
      [
        row.nama_departemen,
        row.kode_departemen,
        row.tanggal,
        row.nomor_spk,
        row.customer_nama,
        row.nomor_po,
        row.nama_produk,
        row.kode_produk,
        row.qty_po,
        row.qty_hasil_jadi,
        row.satuan,
        row.status_produksi,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const totalQty = computed(() =>
  monitoringRows.value.reduce((sum, row) => sum + Number(row.qty_hasil_jadi || 0), 0),
)

const averageProgress = computed(() => {
  if (!monitoringRows.value.length) return 0
  const total = monitoringRows.value.reduce((sum, row) => sum + row.progress, 0)
  return Math.round(total / monitoringRows.value.length)
})

const activeDepartments = computed(
  () => new Set(monitoringRows.value.map((row) => row.nama_departemen).filter(Boolean)).size,
)

const summaryCards = computed(() => [
  {
    title: 'Data Produksi',
    value: monitoringRows.value.length,
    icon: 'precision_manufacturing',
    color: 'green-10',
  },
  {
    title: 'Departemen Aktif',
    value: activeDepartments.value,
    icon: 'corporate_fare',
    color: 'blue-grey-7',
  },
  {
    title: 'Qty Hasil Jadi',
    value: formatNumber(totalQty.value),
    icon: 'inventory_2',
    color: 'positive',
  },
  {
    title: 'Progress Rata-rata',
    value: `${averageProgress.value}%`,
    icon: 'trending_up',
    color: 'orange-9',
  },
])

const departmentSummary = computed(() => {
  const map = new Map()

  monitoringRows.value.forEach((row) => {
    const key = row.nama_departemen || 'Departemen Manufacturing'
    if (!map.has(key)) {
      map.set(key, { nama: key, qty_po: 0, qty_hasil_jadi: 0 })
    }

    const item = map.get(key)
    item.qty_po += Number(row.qty_po || 0)
    item.qty_hasil_jadi += Number(row.qty_hasil_jadi || 0)
  })

  return Array.from(map.values()).map((item) => ({
    ...item,
    progress: item.qty_po ? Math.min(100, Math.round((item.qty_hasil_jadi / item.qty_po) * 100)) : 0,
  }))
})

const timelineItems = computed(() =>
  monitoringRows.value.slice(0, 6).map((row) => ({
    id: row.id,
    title: `${row.nama_departemen} - ${productionStatusLabel(row.status_produksi)}`,
    subtitle: `${formatDate(row.tanggal)} | PO ${row.nomor_po || '-'}`,
    caption: `${row.customer_nama || 'Customer belum tersedia'} | Qty ${formatNumber(row.qty_hasil_jadi)} ${row.satuan || ''} | Progress ${row.progress}%`,
    status_produksi: row.status_produksi,
  })),
)

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase()
  if (['qc process', 'qc_process', 'menunggu qc', 'pending_qc'].includes(normalized)) return 'pending_qc'
  if (['qc approved', 'qc_approved', 'approved'].includes(normalized)) return 'qc_approved'
  if (['qc reject', 'qc_reject', 'qc_rejected', 'reject'].includes(normalized)) return 'qc_reject'
  if (['qc rework', 'qc_rework', 'rework'].includes(normalized)) return 'rework'
  if (['re-qc', 're_qc', 'qc ulang'].includes(normalized)) return 're_qc'
  if (['qc selesai', 'qc_selesai'].includes(normalized)) return 'qc_selesai'
  if (['menunggu rework', 'menunggu_rework'].includes(normalized)) return 'menunggu_rework'
  if (['diproses', 'diproses ulang', 'diproses_ulang', 'proses ulang'].includes(normalized)) return 'diproses_ulang'
  if (['pending qc ulang', 'pending_qc_ulang'].includes(normalized)) return 'pending_qc_ulang'
  if (['finished', 'selesai'].includes(normalized)) return 'selesai'
  if (['on production', 'proses'].includes(normalized)) return 'on production'
  if (['menunggu produksi', 'belum mulai'].includes(normalized)) return 'menunggu produksi'
  return normalized
}

const productionStatusLabel = (status) => {
  const normalized = normalizeStatus(status)
  if (['finished', 'selesai'].includes(normalized)) return 'Selesai'
  if (['on production', 'proses'].includes(normalized)) return 'On Production'
  if (normalized === 'qc process') return 'QC Process'
  if (['menunggu produksi', 'belum mulai'].includes(normalized)) return 'Menunggu Produksi'
  if (normalized === 'pending_qc' || normalized === 'menunggu qc') return 'Menunggu QC'
  if (normalized === 'qc_approved') return 'QC Approved'
  if (normalized === 'qc_reject') return 'QC Reject'
  if (normalized === 'rework') return 'Rework'
  if (normalized === 'tertunda') return 'Tertunda'
  if (normalized === 'batal') return 'Batal'
  return status || '-'
}

const statusColor = (status) => {
  const normalized = normalizeStatus(status)
  if (['finished', 'selesai'].includes(normalized)) return 'positive'
  if (['on production', 'proses'].includes(normalized)) return 'primary'
  if (normalized === 'qc process') return 'indigo-7'
  if (['menunggu produksi', 'belum mulai'].includes(normalized)) return 'orange-9'
  if (normalized === 'pending_qc' || normalized === 'menunggu qc') return 'orange-9'
  if (normalized === 'qc_approved') return 'positive'
  if (normalized === 'qc_reject') return 'negative'
  if (normalized === 'rework') return 'purple-7'
  if (normalized === 'tertunda') return 'warning'
  if (normalized === 'batal') return 'negative'
  return 'blue-grey-6'
}

const statusIcon = (status) => {
  const normalized = normalizeStatus(status)
  if (['finished', 'selesai'].includes(normalized)) return 'task_alt'
  if (['on production', 'proses'].includes(normalized)) return 'precision_manufacturing'
  if (normalized === 'qc process') return 'fact_check'
  if (['menunggu produksi', 'belum mulai', 'pending_qc', 'menunggu qc'].includes(normalized)) return 'pending_actions'
  if (normalized === 'qc_approved') return 'task_alt'
  if (normalized === 'qc_reject') return 'cancel'
  if (normalized === 'rework') return 'restart_alt'
  return 'radio_button_unchecked'
}

const reworkStatusLabel = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'diproses_ulang') return 'Diproses Ulang'
  if (normalized === 'pending_qc_ulang') return 'Pending QC Ulang'
  if (normalized === 'rework' || normalized === 'menunggu_rework') return 'Menunggu Rework'
  if (normalized === 'selesai') return 'Selesai'
  return status || 'Menunggu Rework'
}

const reworkStatusColor = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'diproses_ulang') return 'purple-7'
  if (normalized === 'pending_qc_ulang') return 'orange-9'
  if (normalized === 'selesai') return 'positive'
  return 'negative'
}

const progressColor = (value) => {
  if (value >= 90) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const canFinishProduction = (row) =>
  Number(row.qty_hasil_jadi || 0) > 0 &&
  !['pending_qc', 'qc_approved', 'qc_reject', 'rework', 're_qc', 'qc_selesai', 'selesai', 'qc process'].includes(
    normalizeStatus(row.status_produksi),
  )

const buildQcQueuePayload = (row) => ({
  id: row.id,
  production_source_id: row.id,
  source_type: row.source_type || 'monitoring',
  no_spk: row.no_spk || row.nomor_spk || '',
  nomor_spk: row.nomor_spk || row.no_spk || '',
  nomor_po: row.nomor_po || row.no_po || row.po_number || '',
  po_id: row.po_id || row.po_customer_id || row.id_po_customer || null,
  po_source_collection: row.po_source_collection || 'manufacturing_po_customer',
  po_source_document_id: row.po_source_document_id || row.po_id || row.po_customer_id || row.id_po_customer || null,
  customer:
    (typeof row.customer === 'object' ? row.customer?.nama : row.customer) ||
    row.customer_nama ||
    row.nama_customer ||
    row.customerName ||
    '',
  customer_nama:
    (typeof row.customer === 'object' ? row.customer?.nama : row.customer) ||
    row.customer_nama ||
    row.nama_customer ||
    row.customerName ||
    '',
  customer_id: row.customer_id || row.id_customer || row.customerId || null,
  nama_produk: row.nama_produk || '',
  kode_produk: row.kode_produk || '',
  produk_id: row.produk_id || row.id_produk || '',
  departemen_asal: row.departemen_asal || row.nama_departemen || '',
  departemen_id: row.departemen_id || row.departemen_path_id || row.tujuan_departemen?.id || '',
  departemen_terkait: row.departemen_terkait || row.nama_departemen || '',
  kategori_produk: row.kategori_produk || row.kategori || '',
  qty_produksi_awal: Number(row.qty_hasil_jadi || row.qty_produksi_awal || row.qty_produksi || 0),
  qty_pending_qc: Number(row.qty_hasil_jadi || row.qty_produksi_awal || row.qty_produksi || 0),
  qty_produksi: Number(row.qty_hasil_jadi || row.qty_produksi_awal || row.qty_produksi || 0),
  satuan: row.satuan || 'Unit',
  operator: row.operator || row.operator_nama || row.created_by || row.createdBy || '',
  tanggal_finish: serverTimestamp(),
  status_qc: 'pending_qc',
  status_produksi: 'pending_qc',
  status: 'pending_qc',
  qty_passed: 0,
  qty_approved: 0,
  qty_approved_qc: 0,
  qty_rework: 0,
  qty_reject: 0,
  created_at: serverTimestamp(),
  updated_at: serverTimestamp(),
})

const finishProduction = async (row) => {
  finishingId.value = row.id
  try {
    const duplicateSnap = await getDocs(
      query(collection(db, QC_COLLECTION), where('production_source_id', '==', row.id)),
    )
    if (!duplicateSnap.empty) {
      $q.notify({ type: 'warning', message: 'Antrean QC untuk produksi ini sudah ada atau sudah selesai.' })
      return
    }

    await addDoc(collection(db, QC_COLLECTION), buildQcQueuePayload(row))

    if (row.source_type === 'production') {
      await updateDoc(doc(db, PRODUKSI_COLLECTION, row.id), {
        status_produksi: 'pending_qc',
        status: 'pending_qc',
        status_qc: 'pending_qc',
        finished_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    $q.notify({ type: 'positive', message: 'Produksi selesai dan antrean QC berhasil dibuat.' })
  } catch (error) {
    console.error('[Monitoring->QC] Gagal membuat antrean QC', { row, error })
    $q.notify({ type: 'negative', message: 'Gagal membuat antrean QC produksi.' })
  } finally {
    finishingId.value = null
  }
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return value
  return date.formatDate(rawDate, 'dddd, DD MMM YYYY')
}

const listenSpkProduksi = (callback, errorCallback) =>
  onSnapshot(
    collectionGroup(db, SPK_SUBCOLLECTION),
    (snapshot) => {
      callback(
        snapshot.docs.map((spkDoc) => ({
          id: spkDoc.id,
          departemen_path_id: spkDoc.ref.parent.parent?.id || '',
          ...spkDoc.data(),
        })),
      )
    },
    errorCallback,
  )

const listenPlanningProduksi = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PLANNING_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      callback(
        snapshot.docs.map((planningDoc) => ({
          id: planningDoc.id,
          source_type: 'planning',
          ...planningDoc.data(),
        })),
      )
    },
    errorCallback,
  )

const listenProductionHistory = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PRODUKSI_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      callback(
        snapshot.docs.map((productionDoc) => ({
          id: productionDoc.id,
          source_type: productionDoc.data().source_type || 'production',
          ...productionDoc.data(),
        })),
      )
    },
    errorCallback,
  )

const listenReworkQueue = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, REWORK_QUEUE_COLLECTION), orderBy('tanggal_reject', 'desc')),
    (snapshot) => {
      callback(
        snapshot.docs.map((reworkDoc) => ({
          id: reworkDoc.id,
          ...reworkDoc.data(),
        })),
      )
    },
    errorCallback,
  )

const syncRows = () => {
  rows.value = [...productionRows.value, ...spkRows.value, ...planningRows.value]
}

onMounted(() => {
  loading.value = true
  unsubscribeSpk = listenSpkProduksi(
    (nextRows) => {
      spkRows.value = nextRows.map((row) => ({ ...row, source_type: 'spk' }))
      syncRows()
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat monitoring produksi realtime.' })
    },
  )

  unsubscribePlanning = listenPlanningProduksi(
    (nextRows) => {
      planningRows.value = nextRows
      syncRows()
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat monitoring planning produksi realtime.' })
    },
  )

  unsubscribeProduction = listenProductionHistory(
    (nextRows) => {
      productionRows.value = nextRows
      syncRows()
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat histori produksi realtime.' })
    },
  )

  unsubscribeRework = listenReworkQueue(
    (nextRows) => {
      reworkRows.value = nextRows
      loadingRework.value = false
    },
    (error) => {
      console.error(error)
      loadingRework.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat queue reject/rework.' })
    },
  )
})

onUnmounted(() => {
  if (unsubscribeSpk) unsubscribeSpk()
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeProduction) unsubscribeProduction()
  if (unsubscribeRework) unsubscribeRework()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.leading-tight {
  line-height: 1.15;
}

.summary-card,
.dashboard-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.card-header {
  align-items: center;
  border-bottom: 1px solid #edf1f0;
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
}

.notification-badge {
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 12px;
}

.department-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.department-card {
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  min-height: 126px;
  padding: 14px 10px;
}

.department-card__title {
  color: #1f2a24;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
  margin-top: 9px;
}

.department-card__value {
  color: #1b5e20;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  margin: 8px 0;
}

.timeline-panel {
  max-height: 284px;
  overflow-y: auto;
}

.monitoring-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.monitoring-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.monitoring-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.progress-cell {
  min-width: 160px;
}

.progress-label {
  color: #667085;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.progress-value {
  color: #1b5e20;
  font-size: 11px;
  font-weight: 900;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  letter-spacing: 0.2px;
  min-width: 104px;
}

.block {
  display: block;
}

@media (max-width: 1023px) {
  .department-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .department-grid {
    grid-template-columns: 1fr;
  }
}
</style>
