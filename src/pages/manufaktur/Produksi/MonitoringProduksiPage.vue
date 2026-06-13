<template>
  <q-page class="monitoring-page font-pro">

    <!-- ═══════ HEADER ═══════ -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-badge">PRODUCTION CONTROL</div>
          <h1 class="header-title">Monitoring Produksi</h1>
          <p class="header-subtitle">Data realtime planning produksi dari PPIC ke tiap departemen manufacturing.</p>
        </div>
        <div class="header-right">
          <q-btn
            flat
            no-caps
            class="btn-realtime"
            icon="sync"
            label="Realtime Firestore"
            :loading="loading"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ SUMMARY CARDS ═══════ -->
    <div class="summary-grid">
      <div v-for="card in summaryCards" :key="card.title" class="summary-card-wrap">
        <div class="glass-card summary-card">
          <div class="summary-icon-wrap">
            <q-icon :name="card.icon" size="26px" color="white" />
          </div>
          <div class="summary-info">
            <div class="summary-label">{{ card.title }}</div>
            <div class="summary-value">{{ card.value }}</div>
          </div>
          <div class="summary-glow"></div>
        </div>
      </div>
    </div>

    <!-- ═══════ DASHBOARD ROW: Progress + Timeline ═══════ -->
    <div class="dashboard-row">

      <!-- Department Performance -->
      <div class="glass-card dashboard-card dashboard-card--wide">
        <div class="card-header">
          <div>
            <div class="card-header-label">Progress Produksi</div>
            <div class="card-header-desc">Akumulasi qty hasil jadi dibanding qty PO.</div>
          </div>
          <div class="avg-badge">
            <q-icon name="speed" size="16px" />
            <span>{{ averageProgress }}%</span>
          </div>
        </div>
        <div class="card-body">
          <div class="overall-progress-wrap">
            <q-linear-progress
              rounded
              size="12px"
              :value="averageProgress / 100"
              :color="progressColor(averageProgress)"
              track-color="grey-10"
              class="overall-bar"
            />
          </div>
          <div class="department-grid">
            <div v-for="item in departmentSummary" :key="item.nama" class="dept-perf-card">
              <div class="dept-perf-icon">
                <q-icon name="corporate_fare" size="20px" color="cyan" />
              </div>
              <div class="dept-perf-info">
                <div class="dept-perf-name">{{ item.nama }}</div>
                <div class="dept-perf-stats">
                  <span class="dept-perf-pct">{{ item.progress }}%</span>
                  <span class="dept-perf-qty">{{ formatNumber(item.qty_hasil_jadi) }} / {{ formatNumber(item.qty_po) }}</span>
                </div>
                <q-linear-progress
                  rounded
                  size="6px"
                  :value="item.progress / 100"
                  :color="progressColor(item.progress)"
                  track-color="grey-10"
                  class="dept-perf-bar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="glass-card dashboard-card">
        <div class="card-header">
          <div>
            <div class="card-header-label">Aktivitas Terbaru</div>
            <div class="card-header-desc">Input produksi terakhir per departemen.</div>
          </div>
        </div>
        <div class="card-body timeline-panel">
          <q-timeline color="cyan" layout="dense">
            <q-timeline-entry
              v-for="item in timelineItems"
              :key="item.id"
              :title="item.title"
              :subtitle="item.subtitle"
              :icon="statusIcon(item.status_produksi)"
              :color="statusColor(item.status_produksi)"
            >
              <div class="timeline-caption">{{ item.caption }}</div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </div>

    <!-- ═══════ SEARCH / FILTER BAR ═══════ -->
    <div class="glass-card filter-card">
      <div class="filter-grid">
        <div class="filter-search">
          <q-input
            v-model="search"
            dense
            rounded
            standout="bg-transparent"
            debounce="250"
            placeholder="Cari departemen, tanggal, customer, PO, atau status..."
            class="search-input"
            input-class="text-white"
          >
            <template #prepend>
              <q-icon name="search" color="cyan" />
            </template>
            <template #append v-if="search">
              <q-icon name="close" class="cursor-pointer text-grey-5" @click="search = ''" />
            </template>
          </q-input>
        </div>
        <div class="filter-select">
          <q-select
            v-model="statusFilter"
            :options="statusFilterOptions"
            dense
            rounded
            standout="bg-transparent"
            emit-value
            map-options
            label="Filter Status"
            class="filter-input"
            label-color="grey-6"
            input-class="text-white"
            popup-content-class="dark-dropdown"
          />
        </div>
        <div class="filter-count">
          <div class="count-chip">
            <q-icon name="precision_manufacturing" size="16px" />
            <span>{{ filteredRows.length }} Data Produksi</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ REWORK / REJECT TABLE ═══════ -->
    <div v-if="activeReworkRows.length" class="glass-card table-card rework-section">
      <div class="card-header rework-header">
        <div>
          <div class="card-header-label rework-label">
            <q-icon name="warning" size="18px" class="q-mr-xs" />
            Barang Reject / Rework
          </div>
          <div class="card-header-desc">Queue produk yang perlu diproses ulang dari QC Produksi.</div>
        </div>
        <div class="rework-badge">
          <q-icon name="restart_alt" size="14px" />
          <span>{{ activeReworkRows.length }} perlu rework</span>
        </div>
      </div>

      <q-table
        :rows="activeReworkRows"
        :columns="reworkColumns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loadingRework"
        :pagination="{ rowsPerPage: 5 }"
        class="monitoring-table"
        color="cyan"
      >
        <template #header="props">
          <q-tr :props="props" class="monitoring-thead-row">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="monitoring-row">
            <q-td key="no_spk" :props="props">
              <div class="cell-spk">{{ props.row.no_spk || props.row.nomor_spk || '-' }}</div>
            </q-td>
            <q-td key="produk" :props="props">
              <div class="cell-product">{{ props.row.produk || props.row.nama_produk || '-' }}</div>
            </q-td>
            <q-td key="qty_reject" :props="props" class="text-right">
              <div class="qty-badge qty-badge--reject">{{ formatNumber(props.row.qty_reject) }}</div>
            </q-td>
            <q-td key="qty_rework" :props="props" class="text-right">
              <div class="qty-badge qty-badge--rework">{{ formatNumber(props.row.qty_rework) }}</div>
            </q-td>
            <q-td key="departemen_asal" :props="props">
              <span class="cell-dept">{{ props.row.departemen_asal || '-' }}</span>
            </q-td>
            <q-td key="status_rework" :props="props">
              <div :class="['status-pill', `status-rework--${reworkStatusColor(props.row.status_rework)}`]">
                {{ reworkStatusLabel(props.row.status_rework) }}
              </div>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <div class="dept-badge-sm">Departemen</div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="no-data-wrap">
            <q-icon name="restart_alt" size="48px" color="grey-8" />
            <div class="no-data-text">Belum ada barang reject atau rework.</div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- ═══════ MAIN MONITORING TABLE ═══════ -->
    <div class="glass-card table-card">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="monitoring-table"
        color="cyan"
      >
        <template #header="props">
          <q-tr :props="props" class="monitoring-thead-row">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="monitoring-row">
            <q-td key="departemen" :props="props">
              <div class="cell-dept-name">{{ props.row.nama_departemen }}</div>
              <div class="cell-sub">{{ props.row.kode_departemen || '-' }}</div>
            </q-td>
            <q-td key="tanggal" :props="props">
              <div class="cell-date">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatDate(props.row.tanggal) }}
              </div>
            </q-td>
            <q-td key="nomor_spk" :props="props">
              <div class="cell-spk">{{ props.row.nomor_spk || '-' }}</div>
            </q-td>
            <q-td key="customer" :props="props">
              <div class="cell-customer">{{ props.row.customer_nama || '-' }}</div>
            </q-td>
            <q-td key="nomor_po" :props="props">
              <div class="cell-po">{{ props.row.nomor_po || '-' }}</div>
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="cell-product">{{ props.row.nama_produk || '-' }}</div>
              <div class="cell-sub">{{ props.row.kode_produk || '-' }}</div>
            </q-td>
            <q-td key="qty_po" :props="props" class="text-right">
              <div class="cell-qty">{{ formatNumber(props.row.qty_po) }}</div>
            </q-td>
            <q-td key="qty_hasil_jadi" :props="props" class="text-right">
              <div class="cell-qty cell-qty--accent">{{ formatNumber(props.row.qty_hasil_jadi) }}</div>
            </q-td>
            <q-td key="satuan" :props="props" class="text-center">
              <span class="cell-unit">{{ props.row.satuan || '-' }}</span>
            </q-td>
            <q-td key="status_produksi" :props="props">
              <div :class="['status-pill', `status--${statusColor(props.row.status_produksi)}`]">
                {{ productionStatusLabel(props.row.status_produksi) }}
              </div>
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="progress-top">
                  <span class="progress-label">Progress</span>
                  <span class="progress-value">{{ props.row.progress }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="7px"
                  :value="props.row.progress / 100"
                  :color="progressColor(props.row.progress)"
                  track-color="grey-10"
                  class="progress-bar"
                />
              </div>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center" @click.stop>
              <q-btn
                v-if="canFinishProduction(props.row)"
                unelevated
                dense
                no-caps
                class="btn-finish"
                icon="task_alt"
                label="Selesai"
                :loading="finishingId === props.row.id"
                @click="finishProduction(props.row)"
              />
              <div v-else class="status-pill-sm">
                {{ productionStatusLabel(props.row.status_produksi) }}
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="no-data-wrap">
            <q-icon name="monitoring" size="48px" color="grey-8" />
            <div class="no-data-text">Belum ada planning produksi departemen.</div>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import {
  addDoc,
  collection,
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
const PLANNING_COLLECTION = 'mf_production_planning'
const PRODUKSI_COLLECTION = 'manufactur_departemen_produksi'
const QC_COLLECTION = 'qc_produksi_manufaktur'
const REWORK_QUEUE_COLLECTION = 'produksi_rework_queue'

const rows = ref([])
const planningRows = ref([])
const productionRows = ref([])
const reworkRows = ref([])
const loading = ref(true)
const loadingRework = ref(true)
const search = ref('')
const statusFilter = ref('all')
const finishingId = ref(null)
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
  {
    name: 'departemen',
    align: 'left',
    label: 'Nama Departemen',
    field: 'nama_departemen',
    sortable: true,
  },
  { name: 'tanggal', align: 'left', label: 'Tanggal Planing', field: 'tanggal', sortable: true },
  { name: 'nomor_spk', align: 'left', label: 'Nomor Planing', field: 'nomor_spk', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_nama', sortable: true },
  { name: 'nomor_po', align: 'left', label: 'Nomor PO', field: 'nomor_po', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Produk', field: 'nama_produk', sortable: true },
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
  { name: 'no_spk', align: 'left', label: 'Planning Ref', field: 'no_spk', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'produk', sortable: true },
  { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
  { name: 'qty_rework', align: 'right', label: 'Qty Rework', field: 'qty_rework', sortable: true },
  {
    name: 'departemen_asal',
    align: 'left',
    label: 'Departemen Asal',
    field: 'departemen_asal',
    sortable: true,
  },
  {
    name: 'status_rework',
    align: 'left',
    label: 'Status Rework',
    field: 'status_rework',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const normalizeRow = (row) => {
  const qtyPo = Number(row.qty_target ?? row.qty_po ?? row.total_po ?? 0)
  const qtyHasilJadi = Number(
    row.total_hasil_produksi || row.total_progress || row.qty_hasil_jadi || 0,
  )
  const progress = Number(
    row.progress_percent ??
      row.progress ??
      (qtyPo ? Math.min(100, Math.round((qtyHasilJadi / qtyPo) * 100)) : 0),
  )
  const customerValue = typeof row.customer === 'object' ? row.customer?.nama : row.customer
  const customerName =
    customerValue || row.customer_nama || row.nama_customer || row.customerName || ''

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
      row.tujuan_departemen?.kode_departemen ||
      row.departemen_kode ||
      row.departemen?.kode_departemen ||
      '',
    customer: customerName,
    customer_nama: customerName,
    customer_id: row.customer_id || row.id_customer || row.customerId || null,
    nama_produk: row.nama_produk || row.item_produksi || row.produk?.nama_produk || '',
    kode_produk: row.kode_produk || row.produk?.kode_produk || '',
    no_spk: row.no_spk || row.nomor_spk || '',
    qty_po: qtyPo,
    qty_hasil_jadi: qtyHasilJadi,
    status_produksi:
      row.status_produksi || row.status_planning || row.status || 'Menunggu Produksi',
    operator:
      row.operator || row.operator_nama || row.created_by || row.createdBy || row.updatedBy || '',
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
    ['menunggu_rework', 'rework', 'diproses_ulang', 'pending_qc_ulang'].includes(
      normalizeStatus(row.status_rework),
    ),
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
    progress: item.qty_po
      ? Math.min(100, Math.round((item.qty_hasil_jadi / item.qty_po) * 100))
      : 0,
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
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
  if (['qc process', 'qc_process', 'menunggu qc', 'pending_qc'].includes(normalized))
    return 'pending_qc'
  if (['qc approved', 'qc_approved', 'approved'].includes(normalized)) return 'qc_approved'
  if (['qc reject', 'qc_reject', 'qc_rejected', 'reject'].includes(normalized)) return 'qc_reject'
  if (['qc rework', 'qc_rework', 'rework'].includes(normalized)) return 'rework'
  if (['re-qc', 're_qc', 'qc ulang'].includes(normalized)) return 're_qc'
  if (['qc selesai', 'qc_selesai'].includes(normalized)) return 'qc_selesai'
  if (['menunggu rework', 'menunggu_rework'].includes(normalized)) return 'menunggu_rework'
  if (['diproses', 'diproses ulang', 'diproses_ulang', 'proses ulang'].includes(normalized))
    return 'diproses_ulang'
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
  if (['menunggu produksi', 'belum mulai', 'pending_qc', 'menunggu qc'].includes(normalized))
    return 'pending_actions'
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
  if (value >= 90) return 'green-8'
  if (value >= 60) return 'cyan'
  if (value >= 30) return 'orange-8'
  return 'red-8'
}

const canFinishProduction = (row) =>
  Number(row.qty_hasil_jadi || 0) > 0 &&
  ![
    'pending_qc',
    'qc_approved',
    'qc_reject',
    'rework',
    're_qc',
    'qc_selesai',
    'selesai',
    'qc process',
  ].includes(normalizeStatus(row.status_produksi))

const buildQcQueuePayload = (row) => ({
  id: row.id,
  production_source_id: row.id,
  source_type: row.source_type || 'monitoring',
  no_spk: row.no_spk || row.nomor_spk || '',
  nomor_spk: row.nomor_spk || row.no_spk || '',
  nomor_po: row.nomor_po || row.no_po || row.po_number || '',
  po_id: row.po_id || row.po_customer_id || row.id_po_customer || null,
  po_source_collection: row.po_source_collection || 'manufacturing_po_customer',
  po_source_document_id:
    row.po_source_document_id || row.po_id || row.po_customer_id || row.id_po_customer || null,
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
      $q.notify({
        type: 'warning',
        message: 'Antrean QC untuk produksi ini sudah ada atau sudah selesai.',
      })
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
  rows.value = [...productionRows.value, ...planningRows.value]
}

onMounted(() => {
  loading.value = true
  unsubscribePlanning = listenPlanningProduksi(
    (nextRows) => {
      planningRows.value = nextRows
      syncRows()
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({
        type: 'negative',
        message: 'Gagal memuat monitoring planning produksi realtime.',
      })
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
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeProduction) unsubscribeProduction()
  if (unsubscribeRework) unsubscribeRework()
})
</script>

<style scoped>
/* ═══════ BASE ═══════ */
.font-pro { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

.monitoring-page {
  background: #071826;
  min-height: 100vh;
  padding: 28px 32px;
}

/* ═══════ HEADER ═══════ */
.page-header { margin-bottom: 28px; }
.header-content { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.header-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; background: rgba(0,209,178,0.12); border: 1px solid rgba(0,209,178,0.25); color: #00D1B2; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 10px; }
.header-title { margin: 0; font-size: 32px; font-weight: 900; color: #F4F7FA; line-height: 1.1; text-shadow: 0 0 12px rgba(124,255,79,0.18); }
.header-subtitle { margin: 8px 0 0; font-size: 14px; color: #B8C7D9; line-height: 1.5; max-width: 520px; }
.btn-realtime { background: rgba(0,209,178,0.1); border: 1px solid rgba(0,209,178,0.2); color: #00D1B2; font-weight: 700; border-radius: 14px; padding: 10px 20px; font-size: 13px; }

/* ═══════ GLASS CARD ═══════ */
.glass-card { background: rgba(13,34,51,0.7); border: 1px solid rgba(124,255,79,0.08); border-radius: 18px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

/* ═══════ SUMMARY CARDS ═══════ */
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.summary-card { padding: 20px; display: flex; align-items: center; gap: 14px; position: relative; overflow: hidden; }
.summary-icon-wrap { width: 48px; height: 48px; border-radius: 14px; background: rgba(0,209,178,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.summary-info { flex: 1; min-width: 0; }
.summary-label { color: #8CA3B8; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
.summary-value { color: #FFFFFF; font-size: 28px; font-weight: 700; line-height: 1; margin-top: 5px; }
.summary-glow { position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(124,255,79,0.06) 0%, transparent 70%); pointer-events: none; }

/* ═══════ DASHBOARD ROW ═══════ */
.dashboard-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 24px; }
.dashboard-card { display: flex; flex-direction: column; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(124,255,79,0.06); }
.card-header-label { color: #00D1B2; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
.card-header-desc { color: #8CA3B8; font-size: 12px; margin-top: 2px; }
.card-body { padding: 20px; flex: 1; }
.avg-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 12px; background: rgba(124,255,79,0.1); border: 1px solid rgba(124,255,79,0.2); color: #7CFF4F; font-size: 14px; font-weight: 800; }
.overall-progress-wrap { margin-bottom: 20px; }
.overall-bar { border-radius: 8px; }

/* Department Performance Cards */
.department-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); }
.dept-perf-card { display: flex; align-items: flex-start; gap: 10px; padding: 14px; background: rgba(7,24,38,0.6); border: 1px solid rgba(0,209,178,0.1); border-radius: 14px; transition: all 0.3s ease; }
.dept-perf-card:hover { border-color: rgba(0,209,178,0.3); box-shadow: 0 4px 16px rgba(0,209,178,0.08); }
.dept-perf-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,209,178,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dept-perf-info { flex: 1; min-width: 0; }
.dept-perf-name { color: #8CA3B8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dept-perf-stats { display: flex; align-items: baseline; gap: 8px; margin: 6px 0; }
.dept-perf-pct { color: #00D1B2; font-size: 22px; font-weight: 900; line-height: 1; }
.dept-perf-qty { color: #8CA3B8; font-size: 10px; font-weight: 600; }
.dept-perf-bar { border-radius: 4px; }

/* Timeline */
.timeline-panel { max-height: 320px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(0,209,178,0.3) transparent; }
.timeline-caption { color: #8CA3B8; font-size: 12px; }
:deep(.q-timeline__title) { color: #F4F7FA !important; font-size: 13px; font-weight: 700; }
:deep(.q-timeline__subtitle) { color: #8CA3B8 !important; font-size: 11px; }

/* ═══════ FILTER BAR ═══════ */
.filter-card { padding: 16px 20px !important; margin-bottom: 16px !important; }
.filter-grid { display: flex; align-items: center; gap: 16px !important; flex-wrap: wrap; }
.filter-search { flex: 2; min-width: 200px; }
.filter-select { flex: 1; min-width: 160px; }
.search-input :deep(.q-field__control) { background: rgba(124,255,79,0.04); border: 1px solid rgba(124,255,79,0.1); border-radius: 14px; }
.filter-input :deep(.q-field__control) { background: rgba(124,255,79,0.04); border: 1px solid rgba(124,255,79,0.1); border-radius: 14px; }
.count-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 12px; background: rgba(0,209,178,0.1); border: 1px solid rgba(0,209,178,0.2); color: #00D1B2; font-size: 12px; font-weight: 700; }

/* ═══════ TABLE ═══════ */
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

.table-card :deep(.q-table) {
  background: transparent !important;
}

.table-card :deep(.q-table__top) {
  background: transparent;
  color: #8CA3B8;
}

.table-card :deep(thead tr) {
  height: 54px !important;
}

.table-card :deep(thead tr th) {
  height: 54px !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  padding: 0 18px !important;
  color: #EAF2FF !important;
  vertical-align: middle !important;
}

.table-card :deep(tbody tr) {
  min-height: 64px !important;
  height: 64px !important;
}

.table-card :deep(tbody td) {
  padding: 14px 18px !important;
  white-space: normal !important;
  vertical-align: middle !important;
  color: #F4F7FA;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.table-card :deep(.q-table__bottom) {
  padding: 16px 20px !important;
  background: transparent;
  color: #8CA3B8;
  border-top: 1px solid rgba(124, 255, 79, 0.06);
}

.monitoring-thead-row { background: rgba(0,209,178,0.08) !important; }
.monitoring-thead-row th { color: #EAF2FF !important; font-weight: 700 !important; border-bottom: 1px solid rgba(0,209,178,0.15) !important; }
.table-head { text-transform: uppercase; }
.monitoring-row { transition: all 0.2s ease; }
.monitoring-row:hover { background: rgba(124,255,79,0.04) !important; }


/* Cell styles */
.cell-dept-name { color: #F4F7FA; font-weight: 700; font-size: 13px; }
.cell-sub { color: #8CA3B8; font-size: 11px; margin-top: 2px; }
.cell-date { color: #8CA3B8; font-size: 12px; display: flex; align-items: center; }
.cell-spk { color: #7CFF4F; font-weight: 700; font-size: 13px; }
.cell-customer { color: #F4F7FA; font-weight: 600; }
.cell-po { color: #F4F7FA; font-weight: 700; }
.cell-product { color: #00D1B2; font-weight: 700; }
.cell-qty { color: #FFFFFF; font-weight: 700; font-size: 13px; }
.cell-qty--accent { color: #FFFFFF; font-weight: 700; }
.cell-unit { color: #8CA3B8; font-size: 12px; }
.cell-dept { color: #8CA3B8; }

/* Progress cell */
.progress-cell { min-width: 150px; }
.progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.progress-label { color: #8CA3B8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.progress-value { color: #7CFF4F; font-size: 12px; font-weight: 900; }

/* Status pills */
.status-pill { display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
.status--positive { background: rgba(76,175,80,0.15); color: #66BB6A; border: 1px solid rgba(76,175,80,0.25); }
.status--primary { background: rgba(33,150,243,0.15); color: #42A5F5; border: 1px solid rgba(33,150,243,0.25); }
.status--indigo-7 { background: rgba(92,107,192,0.15); color: #7986CB; border: 1px solid rgba(92,107,192,0.25); }
.status--orange-9 { background: rgba(255,152,0,0.15); color: #FFA726; border: 1px solid rgba(255,152,0,0.25); }
.status--negative { background: rgba(244,67,54,0.15); color: #EF5350; border: 1px solid rgba(244,67,54,0.25); }
.status--purple-7 { background: rgba(156,39,176,0.15); color: #AB47BC; border: 1px solid rgba(156,39,176,0.25); }
.status--warning { background: rgba(255,193,7,0.15); color: #FFCA28; border: 1px solid rgba(255,193,7,0.25); }
.status--blue-grey-6 { background: rgba(120,144,156,0.15); color: #90A4AE; border: 1px solid rgba(120,144,156,0.25); }
.status-pill-sm { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; color: #8CA3B8; background: rgba(107,130,153,0.1); border: 1px solid rgba(107,130,153,0.15); }

/* Qty badges */
.qty-badge { display: inline-flex; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; }
.qty-badge--reject { background: rgba(244,67,54,0.15); color: #EF5350; border: 1px solid rgba(244,67,54,0.2); }
.qty-badge--rework { background: rgba(156,39,176,0.15); color: #AB47BC; border: 1px solid rgba(156,39,176,0.2); }

/* Rework status pills */
.status-rework--negative { background: rgba(244,67,54,0.15); color: #EF5350; border: 1px solid rgba(244,67,54,0.2); }
.status-rework--purple-7 { background: rgba(156,39,176,0.15); color: #AB47BC; border: 1px solid rgba(156,39,176,0.2); }
.status-rework--orange-9 { background: rgba(255,152,0,0.15); color: #FFA726; border: 1px solid rgba(255,152,0,0.2); }
.status-rework--positive { background: rgba(76,175,80,0.15); color: #66BB6A; border: 1px solid rgba(76,175,80,0.2); }
.dept-badge-sm { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; color: #8CA3B8; background: rgba(107,130,153,0.1); border: 1px solid rgba(107,130,153,0.15); display: inline-block; }

/* Rework section */
.rework-section { border-color: rgba(244,67,54,0.15); }
.rework-header { border-bottom-color: rgba(244,67,54,0.1); }
.rework-label { color: #FF5252 !important; }
.rework-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 10px; background: rgba(244,67,54,0.12); border: 1px solid rgba(244,67,54,0.25); color: #FF5252; font-size: 12px; font-weight: 700; }

/* Action buttons */
.btn-finish { background: linear-gradient(135deg, #7CFF4F 0%, #5ae030 100%); color: #071826; font-weight: 700; border-radius: 10px; padding: 6px 14px; font-size: 12px; transition: all 0.3s ease; }
.btn-finish:hover { box-shadow: 0 4px 16px rgba(124,255,79,0.3); transform: translateY(-1px); }

/* No data */
.no-data-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; gap: 12px; }
.no-data-text { color: #8CA3B8; font-size: 14px; font-weight: 600; }

/* ═══════ DARK DROPDOWN ═══════ */
:deep(.dark-dropdown) { background: #0d2233 !important; border: 1px solid rgba(124,255,79,0.1); }
:deep(.dark-dropdown .q-item) { color: #B0BEC5; }
:deep(.dark-dropdown .q-item--active),
:deep(.dark-dropdown .q-item:hover) { background: rgba(124,255,79,0.08); color: #7CFF4F; }

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 1279px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-row { grid-template-columns: 1fr; }
  .department-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 599px) {
  .monitoring-page { padding: 16px; }
  .summary-grid { grid-template-columns: 1fr; }
  .department-grid { grid-template-columns: 1fr; }
  .header-title { font-size: 24px; }
  .summary-value { font-size: 24px; }
  .filter-grid { flex-direction: column; }
}
</style>
