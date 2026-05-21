<template>
  <q-page class="planning-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Planning Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Perencanaan SPK dan Target Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring rencana produksi dari nomor SPK, target quantity, line, PIC, deadline, dan
          status pengerjaan.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Planning"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openAddDialog"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-4">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="48px" />
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
              placeholder="Cari SPK, produk, customer, line, atau PIC..."
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

          <div class="col-12 col-md-auto">
            <q-btn
              flat
              round
              color="green-10"
              icon="refresh"
              :loading="loading"
              @click="loadPlanning"
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
        :loading="loading"
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
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer }}</div>
            </q-td>
            <q-td key="customer" :props="props">{{ props.row.customer }}</q-td>
            <q-td key="qty_target" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_target) }}
            </q-td>
            <q-td key="line_produksi" :props="props">{{ props.row.line_produksi }}</q-td>
            <q-td key="deadline" :props="props">{{ formatDate(props.row.deadline) }}</q-td>
            <q-td key="pic_produksi" :props="props">{{ props.row.pic_produksi }}</q-td>
            <q-td key="status" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status)"
                class="status-chip"
              >
                {{ props.row.status }}
              </q-chip>
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

    <q-dialog v-model="showDialog" persistent>
      <q-card class="planning-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">Tambah Planning Produksi</div>
            <div class="text-caption">Input SPK dan target produksi manufaktur.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="savePlanning">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nomor_spk"
                  outlined
                  dense
                  label="Nomor SPK"
                  :rules="[(val) => !!val || 'Nomor SPK wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  label="Nama Produk"
                  :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.customer"
                  outlined
                  dense
                  label="Customer"
                  :rules="[(val) => !!val || 'Customer wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.qty_target"
                  outlined
                  dense
                  type="number"
                  min="1"
                  label="Qty Target"
                  :rules="[(val) => Number(val) > 0 || 'Qty target wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.line_produksi"
                  :options="lineOptions"
                  outlined
                  dense
                  label="Line Produksi"
                  :rules="[(val) => !!val || 'Line produksi wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.deadline"
                  outlined
                  dense
                  type="date"
                  label="Deadline"
                  :rules="[(val) => !!val || 'Deadline wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.pic_produksi"
                  outlined
                  dense
                  label="PIC Produksi"
                  :rules="[(val) => !!val || 'PIC produksi wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status"
                  :rules="[(val) => !!val || 'Status wajib dipilih']"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan Planning"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'planning_produksi_manufaktur'
const statusOptions = ['Draft', 'Planning', 'On Progress', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]
const lineOptions = ['Line A', 'Line B', 'Line C', 'Line D']

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showDialog = ref(false)
let unsubscribePlanning = null

const defaultForm = () => ({
  nomor_spk: '',
  nama_produk: '',
  customer: '',
  qty_target: null,
  line_produksi: '',
  deadline: '',
  pic_produksi: '',
  status: 'Draft',
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  {
    name: 'nama_produk',
    align: 'left',
    label: 'Nama Produk',
    field: 'nama_produk',
    sortable: true,
  },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'qty_target', align: 'right', label: 'Qty Target', field: 'qty_target', sortable: true },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi', field: 'line_produksi' },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'pic_produksi', align: 'left', label: 'PIC Produksi', field: 'pic_produksi' },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_produk,
        row.customer,
        row.line_produksi,
        row.pic_produksi,
        row.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total Planning',
    value: rows.value.length,
    icon: 'assignment',
    color: 'green-10',
  },
  {
    title: 'On Progress',
    value: rows.value.filter((row) => row.status === 'On Progress').length,
    icon: 'precision_manufacturing',
    color: 'orange-9',
  },
  {
    title: 'Finished',
    value: rows.value.filter((row) => row.status === 'Finished').length,
    icon: 'fact_check',
    color: 'positive',
  },
])

const statusColor = (status) => {
  const colors = {
    Draft: 'grey-7',
    Planning: 'blue-grey-7',
    'On Progress': 'orange-9',
    Finished: 'green-10',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const openAddDialog = () => {
  form.value = defaultForm()
  showDialog.value = true
}

const savePlanning = async () => {
  submitting.value = true
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...form.value,
      qty_target: Number(form.value.qty_target || 0),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Planning produksi berhasil ditambahkan' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan planning produksi' })
  } finally {
    submitting.value = false
  }
}

const loadPlanning = () => {
  loading.value = true
  if (unsubscribePlanning) unsubscribePlanning()

  const planningQuery = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'))
  unsubscribePlanning = onSnapshot(
    planningQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((planningDoc) => ({
        id: planningDoc.id,
        ...planningDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat planning produksi' })
    },
  )
}

onMounted(loadPlanning)

onUnmounted(() => {
  if (unsubscribePlanning) unsubscribePlanning()
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

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.summary-card,
.filter-card,
.table-card,
.planning-dialog {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 30px;
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

.planning-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.planning-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 92px;
  justify-content: center;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.planning-dialog {
  max-width: 95vw;
  width: 760px;
}
</style>
