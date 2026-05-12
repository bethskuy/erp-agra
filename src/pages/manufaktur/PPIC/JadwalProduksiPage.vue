<template>
  <q-page class="schedule-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Jadwal Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Penjadwalan proses fabrikasi dan pengerjaan
          </span>
        </div>
      </div>
    </div>

    <q-card flat bordered class="progress-card bg-white q-mb-lg">
      <q-card-section class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-4">
          <div class="text-overline text-green-10 text-weight-black">Progress Jadwal</div>
          <div class="text-caption text-grey-7">
            Akumulasi proses finished terhadap total jadwal produksi.
          </div>
        </div>
        <div class="col-12 col-md-6">
          <q-linear-progress
            rounded
            size="16px"
            :value="progressPercent / 100"
            :color="progressPercent >= 100 ? 'green-10' : 'orange-9'"
            track-color="green-1"
          />
        </div>
        <div class="col-12 col-md-auto">
          <q-badge color="green-10" class="q-px-md q-py-xs text-weight-bold">
            {{ progressPercent }}%
          </q-badge>
        </div>
      </q-card-section>
    </q-card>

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
              placeholder="Cari SPK produksi, proses, atau PIC..."
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
        class="schedule-table"
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
          <q-tr :props="props" class="schedule-row">
            <q-td key="tanggal" :props="props">{{ formatDate(props.row.tanggal) }}</q-td>
            <q-td key="spk_produksi" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.spk_produksi }}
            </q-td>
            <q-td key="proses" :props="props">
              <div class="text-weight-bold">{{ props.row.proses }}</div>
              <q-linear-progress
                rounded
                size="7px"
                :value="rowProgress(props.row.status)"
                :color="statusColor(props.row.status)"
                track-color="green-1"
                class="q-mt-xs"
              />
            </q-td>
            <q-td key="pic" :props="props">{{ props.row.pic }}</q-td>
            <q-td key="estimasi_jam" :props="props" class="text-right text-weight-bold">
              {{ props.row.estimasi_jam }} jam
            </q-td>
            <q-td key="status" :props="props">
              <q-badge :color="statusColor(props.row.status)" class="status-badge">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="event_note" size="28px" class="q-mr-sm" />
            Belum ada jadwal produksi.
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

const statusOptions = ['Waiting', 'Process', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const rows = ref([
  {
    id: 1,
    tanggal: '2026-05-13',
    spk_produksi: 'SPK-FAB-2026-001',
    proses: 'Cutting',
    pic: 'Budi Santoso',
    estimasi_jam: 6,
    status: 'Finished',
  },
  {
    id: 2,
    tanggal: '2026-05-14',
    spk_produksi: 'SPK-FAB-2026-001',
    proses: 'Welding',
    pic: 'Rizky Pratama',
    estimasi_jam: 10,
    status: 'Process',
  },
  {
    id: 3,
    tanggal: '2026-05-15',
    spk_produksi: 'SPK-FAB-2026-002',
    proses: 'Assembly',
    pic: 'Agus Setiawan',
    estimasi_jam: 8,
    status: 'Waiting',
  },
  {
    id: 4,
    tanggal: '2026-05-16',
    spk_produksi: 'SPK-FAB-2026-003',
    proses: 'QC',
    pic: 'Maya Lestari',
    estimasi_jam: 4,
    status: 'Waiting',
  },
])

const columns = [
  { name: 'tanggal', align: 'left', label: 'Tanggal', field: 'tanggal', sortable: true },
  {
    name: 'spk_produksi',
    align: 'left',
    label: 'SPK Produksi',
    field: 'spk_produksi',
    sortable: true,
  },
  { name: 'proses', align: 'left', label: 'Proses', field: 'proses', sortable: true },
  { name: 'pic', align: 'left', label: 'PIC', field: 'pic', sortable: true },
  {
    name: 'estimasi_jam',
    align: 'right',
    label: 'Estimasi Jam',
    field: 'estimasi_jam',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.tanggal, row.spk_produksi, row.proses, row.pic, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const progressPercent = computed(() => {
  if (!rows.value.length) return 0
  const finished = rows.value.filter((row) => row.status === 'Finished').length
  return Math.round((finished / rows.value.length) * 100)
})

const statusColor = (status) => {
  const colors = {
    Waiting: 'blue-grey-6',
    Process: 'orange-9',
    Finished: 'green-10',
  }
  return colors[status] || 'grey-6'
}

const rowProgress = (status) => {
  const values = {
    Waiting: 0.15,
    Process: 0.58,
    Finished: 1,
  }
  return values[status] || 0
}

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

.progress-card,
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.schedule-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.schedule-row:hover {
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
