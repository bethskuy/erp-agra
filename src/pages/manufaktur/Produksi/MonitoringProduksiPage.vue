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
          Data realtime dari input produksi tiap departemen manufacturing dan Master Produk.
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
                {{ props.row.status_produksi || '-' }}
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
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="monitoring" size="28px" class="q-mr-sm" />
            Belum ada data produksi departemen.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import { listenManufacturingDepartemenProduksi } from 'src/services/manufaktur/departemenProduksiService'

const $q = useQuasar()

const rows = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
let unsubscribeProduksi = null

const statusOptions = ['Belum Mulai', 'Proses', 'Selesai', 'Tertunda', 'Batal']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const columns = [
  { name: 'departemen', align: 'left', label: 'Nama Departemen', field: 'nama_departemen', sortable: true },
  { name: 'tanggal', align: 'left', label: 'Hari / Tanggal', field: 'tanggal', sortable: true },
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
]

const normalizeRow = (row) => {
  const qtyPo = Number(row.qty_po ?? row.total_po ?? 0)
  const qtyHasilJadi = Number(row.qty_hasil_jadi || 0)
  const progress = qtyPo ? Math.min(100, Math.round((qtyHasilJadi / qtyPo) * 100)) : 0

  return {
    ...row,
    nama_departemen: row.departemen?.nama_departemen || row.departemen || 'Departemen Manufacturing',
    kode_departemen: row.departemen?.kode_departemen || '',
    customer_nama: row.customer_nama || row.customer?.nama || '',
    nama_produk: row.nama_produk || row.produk?.nama_produk || '',
    kode_produk: row.kode_produk || row.produk?.kode_produk || '',
    qty_po: qtyPo,
    qty_hasil_jadi: qtyHasilJadi,
    progress,
  }
}

const monitoringRows = computed(() => rows.value.map(normalizeRow))

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return monitoringRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_produksi === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nama_departemen,
        row.kode_departemen,
        row.tanggal,
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
    title: `${row.nama_departemen} - ${row.status_produksi || '-'}`,
    subtitle: `${formatDate(row.tanggal)} | PO ${row.nomor_po || '-'}`,
    caption: `${row.customer_nama || 'Customer belum tersedia'} | Qty ${formatNumber(row.qty_hasil_jadi)} ${row.satuan || ''} | Progress ${row.progress}%`,
    status_produksi: row.status_produksi,
  })),
)

const statusColor = (status) => {
  if (status === 'Selesai') return 'positive'
  if (status === 'Proses') return 'primary'
  if (status === 'Tertunda') return 'orange-9'
  if (status === 'Batal') return 'negative'
  return 'blue-grey-6'
}

const statusIcon = (status) => {
  if (status === 'Selesai') return 'task_alt'
  if (status === 'Proses') return 'precision_manufacturing'
  if (status === 'Tertunda') return 'pending_actions'
  if (status === 'Batal') return 'cancel'
  return 'radio_button_unchecked'
}

const progressColor = (value) => {
  if (value >= 90) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return value
  return date.formatDate(rawDate, 'dddd, DD MMM YYYY')
}

onMounted(() => {
  loading.value = true
  unsubscribeProduksi = listenManufacturingDepartemenProduksi(
    (nextRows) => {
      rows.value = nextRows
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat monitoring produksi realtime.' })
    },
  )
})

onUnmounted(() => {
  if (unsubscribeProduksi) unsubscribeProduksi()
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
