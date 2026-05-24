<template>
  <q-page class="routing-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Routing Fabrikasi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Referensi tahapan kerja workshop dari master tahapan fabrikasi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Routing ini membaca master tahapan fabrikasi secara realtime untuk penyusunan alur kerja
          proyek fabrikasi.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="refresh"
          label="Refresh Data"
          no-caps
          :loading="loading"
          @click="refreshData"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Tahapan Aktif</div>
            <div class="text-h5 text-weight-bold text-green-10">{{ filteredRows.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Estimasi</div>
            <div class="text-h5 text-weight-bold text-green-10">{{ totalEstimasiMenit }} menit</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Estimasi (Jam)</div>
            <div class="text-h5 text-weight-bold text-green-10">{{ totalEstimasiJam }} jam</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode tahapan, nama tahapan, estimasi waktu..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="selectedTahapanId"
              :options="tahapanOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              option-label="label"
              option-value="value"
              label="Pilih Tahapan"
              :loading="loading"
              bg-color="white"
              clearable
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} TAHAPAN
            </q-chip>
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
        :loading="loading"
        :pagination="{ rowsPerPage: 10, sortBy: 'urutan', descending: false }"
        class="routing-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-nama_tahapan="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_tahapan || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.kode_tahapan || '-' }}</div>
          </q-td>
        </template>

        <template #body-cell-estimasi_waktu="props">
          <q-td :props="props">
            <div>{{ props.row.estimasi_waktu || '-' }}</div>
            <div class="text-caption text-grey-6">
              {{ Number(props.row.estimasi_menit || 0) }} menit
            </div>
          </q-td>
        </template>

        <template #body-cell-qc_required="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              text-color="white"
              :color="props.row.qc_required ? 'orange-9' : 'blue-grey-6'"
              class="status-chip"
            >
              {{ props.row.qc_required ? 'Wajib QC' : 'Opsional' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              text-color="white"
              :color="props.row.status === 'Aktif' ? 'positive' : 'grey-7'"
              class="status-chip"
            >
              {{ props.row.status || '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="route" size="28px" class="q-mr-sm" />
            Belum ada tahapan fabrikasi aktif.
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const search = ref('')
const selectedTahapanId = ref(null)
let unsubscribeTahapan = null

const columns = [
  { name: 'urutan', align: 'right', label: 'Urutan', field: 'urutan', sortable: true },
  {
    name: 'nama_tahapan',
    align: 'left',
    label: 'Tahapan Fabrikasi',
    field: 'nama_tahapan',
    sortable: true,
  },
  {
    name: 'estimasi_waktu',
    align: 'left',
    label: 'Estimasi Waktu',
    field: 'estimasi_waktu',
    sortable: true,
  },
  { name: 'qc_required', align: 'center', label: 'QC', field: 'qc_required', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
]

const tahapanOptions = computed(() =>
  rows.value.map((item) => ({
    label: `${item.urutan ? `${item.urutan}. ` : ''}${item.nama_tahapan || '-'}`,
    value: item.id,
  })),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const matchesSelected = !selectedTahapanId.value || row.id === selectedTahapanId.value
    const matchesSearch =
      !keyword ||
      [row.kode_tahapan, row.nama_tahapan, row.estimasi_waktu, row.estimasi_menit, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesSelected && matchesSearch
  })
})

const totalEstimasiMenit = computed(() =>
  filteredRows.value.reduce((acc, row) => acc + Number(row.estimasi_menit || 0), 0),
)

const totalEstimasiJam = computed(() => (totalEstimasiMenit.value / 60).toFixed(2))

const loadTahapanFabrikasi = () => {
  loading.value = true

  if (unsubscribeTahapan) unsubscribeTahapan()

  // Ambil hanya tahapan aktif agar siap dipakai routing SPK/PPIC
  unsubscribeTahapan = onSnapshot(
    query(
      collection(db, 'master_tahapan_fabrikasi'),
      where('status', '==', 'Aktif'),
      orderBy('urutan', 'asc'),
      orderBy('created_at', 'asc'),
    ),
    (snapshot) => {
      rows.value = snapshot.docs.map((tahapanDoc) => ({
        id: tahapanDoc.id,
        ...tahapanDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({
        type: 'negative',
        message: 'Gagal memuat routing tahapan fabrikasi',
        position: 'top-right',
      })
    },
  )
}

const refreshData = () => {
  loadTahapanFabrikasi()
  $q.notify({
    type: 'positive',
    message: 'Data routing diperbarui',
    position: 'top-right',
    timeout: 1500,
  })
}

onMounted(loadTahapanFabrikasi)

onUnmounted(() => {
  if (unsubscribeTahapan) unsubscribeTahapan()
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

.routing-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  font-weight: 800;
  text-transform: uppercase;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  min-width: 88px;
}
</style>
