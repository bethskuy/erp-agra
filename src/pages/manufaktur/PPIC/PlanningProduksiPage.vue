<template>
  <q-page class="planning-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Planning Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Perencanaan target produksi project dan fabrikasi
          </span>
        </div>
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

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari planning, project, customer, atau item produksi..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
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
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :pagination="{ rowsPerPage: 10 }"
        class="planning-table"
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
          <q-tr :props="props" class="planning-row">
            <q-td key="no_planning" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.no_planning }}
            </q-td>
            <q-td key="project" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.project }}</div>
              <div class="text-caption text-grey-6">{{ props.row.item_produksi }}</div>
            </q-td>
            <q-td key="customer" :props="props">{{ props.row.customer }}</q-td>
            <q-td key="item_produksi" :props="props">{{ props.row.item_produksi }}</q-td>
            <q-td key="qty" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty) }}
            </q-td>
            <q-td key="deadline" :props="props">{{ formatDate(props.row.deadline) }}</q-td>
            <q-td key="prioritas" :props="props">
              <q-badge :color="priorityColor(props.row.prioritas)" class="status-badge">
                {{ props.row.prioritas }}
              </q-badge>
            </q-td>
            <q-td key="status" :props="props">
              <q-badge :color="statusColor(props.row.status)" class="status-badge">
                {{ props.row.status }}
              </q-badge>
            </q-td>
            <q-td key="action" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn flat round dense color="green-10" icon="visibility">
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="blue-grey-7" icon="edit">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="negative" icon="delete">
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="assignment" size="28px" class="q-mr-sm" />
            Belum ada planning produksi.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'

const search = ref('')
const statusFilter = ref('all')

const statusOptions = ['Draft', 'Approved', 'On Progress', 'Selesai']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const rows = ref([
  {
    id: 1,
    no_planning: 'PLN-FAB-2026-001',
    project: 'Upgrade Conveyor Line A',
    customer: 'PT Sinar Baja Makmur',
    item_produksi: 'Frame Conveyor',
    qty: 12,
    deadline: '2026-05-18',
    prioritas: 'High',
    status: 'On Progress',
  },
  {
    id: 2,
    no_planning: 'PLN-FAB-2026-002',
    project: 'Food Grade Handling System',
    customer: 'PT Agro Pangan Lestari',
    item_produksi: 'Hopper Stainless',
    qty: 6,
    deadline: '2026-05-22',
    prioritas: 'Medium',
    status: 'Approved',
  },
  {
    id: 3,
    no_planning: 'PLN-FAB-2026-003',
    project: 'Automation Packing Area',
    customer: 'PT Nusantara Packaging',
    item_produksi: 'Panel Automation',
    qty: 4,
    deadline: '2026-05-29',
    prioritas: 'High',
    status: 'Draft',
  },
])

const columns = [
  { name: 'no_planning', align: 'left', label: 'No Planning', field: 'no_planning', sortable: true },
  { name: 'project', align: 'left', label: 'Project', field: 'project', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  {
    name: 'item_produksi',
    align: 'left',
    label: 'Item Produksi',
    field: 'item_produksi',
    sortable: true,
  },
  { name: 'qty', align: 'right', label: 'Qty', field: 'qty', sortable: true },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Prioritas', field: 'prioritas', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'action', align: 'center', label: 'Action' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.no_planning, row.project, row.customer, row.item_produksi, row.status, row.prioritas]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total Project',
    value: rows.value.length,
    icon: 'business_center',
    color: 'green-10',
  },
  {
    title: 'Planning Aktif',
    value: rows.value.filter((row) => ['Approved', 'On Progress'].includes(row.status)).length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'Deadline Minggu Ini',
    value: rows.value.filter((row) => row.deadline <= '2026-05-19').length,
    icon: 'event_busy',
    color: 'orange-9',
  },
  {
    title: 'Progress Planning',
    value: `${Math.round(
      (rows.value.filter((row) => ['Approved', 'On Progress', 'Selesai'].includes(row.status))
        .length /
        rows.value.length) *
        100,
    )}%`,
    icon: 'monitoring',
    color: 'positive',
  },
])

const statusColor = (status) => {
  const colors = {
    Draft: 'grey-7',
    Approved: 'blue-grey-7',
    'On Progress': 'orange-9',
    Selesai: 'green-10',
  }
  return colors[status] || 'grey-6'
}

const priorityColor = (priority) => {
  const colors = {
    High: 'negative',
    Medium: 'orange-9',
    Low: 'green-8',
  }
  return colors[priority] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) =>
  new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
.filter-card,
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

.planning-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.planning-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-badge {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  min-width: 82px;
  padding: 5px 8px;
}
</style>
