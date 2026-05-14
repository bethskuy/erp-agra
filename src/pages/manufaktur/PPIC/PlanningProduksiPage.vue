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

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Planning"
          class="q-px-lg shadow-premium"
          @click="openCreateDialog"
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

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari planning, project, customer, item, atau PIC..."
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

          <div class="col-12 col-md-3">
            <q-select
              v-model="priorityFilter"
              :options="priorityFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Prioritas"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-1">
            <q-btn
              outline
              rounded
              color="green-10"
              icon="refresh"
              class="full-width"
              @click="resetFilter"
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
        <template #top v-if="errorMessage">
          <q-banner rounded class="full-width bg-red-1 text-negative">
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </template>

        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="planning-row">
            <q-td key="no_planning" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.no_planning }}
              <div class="text-caption text-grey-6">{{ props.row.no_so }}</div>
            </q-td>

            <q-td key="project" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.project }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer }}</div>
            </q-td>

            <q-td key="item_produksi" :props="props">
              <div>{{ props.row.item_produksi }}</div>
              <div class="text-caption text-grey-6">{{ props.row.work_center }}</div>
            </q-td>

            <q-td key="qty" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty) }} {{ props.row.satuan }}
            </q-td>

            <q-td key="tanggal_planning" :props="props">
              {{ formatDate(props.row.tanggal_planning) }}
            </q-td>

            <q-td key="deadline" :props="props">
              {{ formatDate(props.row.deadline) }}
            </q-td>

            <q-td key="material_status" :props="props">
              <q-badge :color="materialColor(props.row.material_status)" class="status-badge">
                {{ props.row.material_status }}
              </q-badge>
            </q-td>

            <q-td key="progress" :props="props">
              <q-linear-progress
                rounded
                size="9px"
                :value="props.row.progress / 100"
                :color="progressColor(props.row.progress)"
                class="q-mb-xs"
              />
              <div class="text-caption text-weight-bold">{{ props.row.progress }}%</div>
            </q-td>

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

            <q-td key="pic" :props="props">
              {{ props.row.pic }}
            </q-td>

            <q-td key="action" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="visibility"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip>Detail</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="orange-9" icon="factory">
                  <q-tooltip>Generate SPK</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="event_note" size="28px" class="q-mr-sm" />
            Belum ada planning produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="formDialog" persistent>
      <q-card class="planning-dialog">
        <q-card-section class="row items-center justify-between bg-green-10 text-white">
          <div>
            <div class="text-h6 text-weight-bold">{{ formTitle }}</div>
            <div class="text-caption">Data utama planning akan tersinkron realtime ke menu PPIC.</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="savePlanning">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.no_planning"
                  outlined
                  dense
                  label="No Planning"
                  :rules="[(val) => !!val || 'No planning wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.no_so" outlined dense label="No SO" />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status"
                  :rules="[(val) => !!val || 'Status wajib dipilih']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.project"
                  outlined
                  dense
                  label="Project"
                  :rules="[(val) => !!val || 'Project wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.customer" outlined dense label="Customer" />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.item_produksi"
                  outlined
                  dense
                  label="Item Produksi"
                  :rules="[(val) => !!val || 'Item produksi wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.qty"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty"
                  :rules="[(val) => Number(val) > 0 || 'Qty wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.satuan" outlined dense label="Satuan" />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.tanggal_planning"
                  outlined
                  dense
                  type="date"
                  label="Tanggal Planning"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.deadline" outlined dense type="date" label="Deadline" />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.work_center" outlined dense label="Work Center" />
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.material_status"
                  :options="materialStatusOptions"
                  outlined
                  dense
                  label="Status Material"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.prioritas"
                  :options="priorityOptions"
                  outlined
                  dense
                  label="Prioritas"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.progress"
                  outlined
                  dense
                  type="number"
                  min="0"
                  max="100"
                  label="Progress (%)"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.pic" outlined dense label="PIC" />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.catatan"
                  outlined
                  dense
                  type="textarea"
                  label="Catatan"
                  autogrow
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
              label="Simpan"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="row items-center justify-between bg-green-10 text-white">
          <div>
            <div class="text-h6 text-weight-bold">Detail Planning Produksi</div>
            <div class="text-caption">{{ selectedRow?.no_planning }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRow" class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="detail-label">No SO</div>
              <div class="detail-value">{{ selectedRow.no_so || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Project</div>
              <div class="detail-value">{{ selectedRow.project }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Customer</div>
              <div class="detail-value">{{ selectedRow.customer }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Item Produksi</div>
              <div class="detail-value">{{ selectedRow.item_produksi }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Work Center</div>
              <div class="detail-value">{{ selectedRow.work_center }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Qty</div>
              <div class="detail-value">
                {{ formatNumber(selectedRow.qty) }} {{ selectedRow.satuan }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Tanggal Planning</div>
              <div class="detail-value">{{ formatDate(selectedRow.tanggal_planning) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Deadline</div>
              <div class="detail-value">{{ formatDate(selectedRow.deadline) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Material</div>
              <q-badge :color="materialColor(selectedRow.material_status)" class="status-badge">
                {{ selectedRow.material_status }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Prioritas</div>
              <q-badge :color="priorityColor(selectedRow.prioritas)" class="status-badge">
                {{ selectedRow.prioritas }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Status</div>
              <q-badge :color="statusColor(selectedRow.status)" class="status-badge">
                {{ selectedRow.status }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Progress</div>
              <div class="detail-value">{{ selectedRow.progress }}%</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">PIC Produksi</div>
              <div class="detail-value">{{ selectedRow.pic }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="detail-label q-mb-sm">Catatan PPIC</div>
          <div class="note-box">{{ selectedRow.catatan || '-' }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  createPlanningProduksi,
  deletePlanningProduksi,
  listenPlanningProduksi,
  updatePlanningProduksi,
} from 'src/services/manufaktur/planningProduksiService'

const $q = useQuasar()
const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const formDialog = ref(false)
const detailDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
let unsubscribePlanning = null

const statusOptions = ['Draft', 'Approved', 'Scheduled', 'On Progress', 'Selesai']
const priorityOptions = ['High', 'Medium', 'Low']
const materialStatusOptions = ['Ready', 'Partial', 'Waiting']

const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const priorityFilterOptions = [
  { label: 'Semua Prioritas', value: 'all' },
  ...priorityOptions.map((priority) => ({ label: priority, value: priority })),
]

const defaultForm = () => ({
  no_planning: '',
  no_so: '',
  project: '',
  customer: '',
  item_produksi: '',
  qty: null,
  satuan: 'Unit',
  tanggal_planning: '',
  deadline: '',
  work_center: '',
  material_status: 'Waiting',
  prioritas: 'Medium',
  status: 'Draft',
  progress: 0,
  pic: '',
  catatan: '',
})

const form = ref(defaultForm())

const columns = [
  {
    name: 'no_planning',
    align: 'left',
    label: 'No Planning',
    field: 'no_planning',
    sortable: true,
  },
  { name: 'project', align: 'left', label: 'Project / Customer', field: 'project', sortable: true },
  { name: 'item_produksi', align: 'left', label: 'Item / Work Center', field: 'item_produksi' },
  { name: 'qty', align: 'right', label: 'Qty', field: 'qty', sortable: true },
  { name: 'tanggal_planning', align: 'left', label: 'Tgl Planning', field: 'tanggal_planning' },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'material_status', align: 'center', label: 'Material', field: 'material_status' },
  { name: 'progress', align: 'left', label: 'Progress', field: 'progress', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Prioritas', field: 'prioritas', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'pic', align: 'left', label: 'PIC', field: 'pic' },
  { name: 'action', align: 'center', label: 'Action' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || row.prioritas === priorityFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.no_planning,
        row.no_so,
        row.project,
        row.customer,
        row.item_produksi,
        row.work_center,
        row.status,
        row.prioritas,
        row.pic,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPriority && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total Planning',
    value: rows.value.length,
    icon: 'business_center',
    color: 'green-10',
  },
  {
    title: 'Planning Aktif',
    value: rows.value.filter((row) => ['Approved', 'Scheduled', 'On Progress'].includes(row.status))
      .length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'Material Ready',
    value: rows.value.filter((row) => row.material_status === 'Ready').length,
    icon: 'inventory_2',
    color: 'teal-8',
  },
  {
    title: 'Avg Progress',
    value: `${averageProgress.value}%`,
    icon: 'monitoring',
    color: 'positive',
  },
])

const averageProgress = computed(() => {
  if (!rows.value.length) return 0
  return Math.round(
    rows.value.reduce((total, row) => total + Number(row.progress || 0), 0) / rows.value.length,
  )
})

const formTitle = computed(() => (editingId.value ? 'Edit Planning Produksi' : 'Tambah Planning Produksi'))

const buildPayload = () => ({
  no_planning: form.value.no_planning,
  no_so: form.value.no_so,
  project: form.value.project,
  customer: form.value.customer,
  item_produksi: form.value.item_produksi,
  qty: Number(form.value.qty || 0),
  satuan: form.value.satuan,
  tanggal_planning: form.value.tanggal_planning,
  deadline: form.value.deadline,
  work_center: form.value.work_center,
  material_status: form.value.material_status,
  prioritas: form.value.prioritas,
  status: form.value.status,
  progress: Math.min(Math.max(Number(form.value.progress || 0), 0), 100),
  pic: form.value.pic,
  catatan: form.value.catatan,
})

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  formDialog.value = true
}

const openEditDialog = (row) => {
  editingId.value = row.id
  form.value = {
    ...defaultForm(),
    ...row,
    qty: Number(row.qty || 0),
    progress: Number(row.progress || 0),
  }
  formDialog.value = true
}

const openDetailDialog = (row) => {
  selectedRow.value = row
  detailDialog.value = true
}

const savePlanning = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updatePlanningProduksi(editingId.value, payload)
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil diperbarui' })
    } else {
      await createPlanningProduksi(payload)
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil ditambahkan' })
    }

    formDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan planning produksi' })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Planning',
    message: `Hapus planning ${row.no_planning}?`,
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(async () => {
    try {
      await deletePlanningProduksi(row.id)
      $q.notify({ type: 'positive', message: 'Planning produksi berhasil dihapus' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal menghapus planning produksi' })
    }
  })
}

const listenPlanning = () => {
  loading.value = true
  errorMessage.value = ''
  if (unsubscribePlanning) unsubscribePlanning()

  unsubscribePlanning = listenPlanningProduksi(
    (planningRows) => {
      rows.value = planningRows
      loading.value = false
      errorMessage.value = ''
    },
    (error) => {
      console.error(error)
      loading.value = false
      errorMessage.value = 'Gagal memuat data planning produksi dari Firestore.'
      $q.notify({ type: 'negative', message: 'Gagal memuat planning produksi' })
    },
  )
}

const resetFilter = () => {
  search.value = ''
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
}

const statusColor = (status) => {
  const colors = {
    Draft: 'grey-7',
    Approved: 'blue-grey-7',
    Scheduled: 'purple-7',
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

const materialColor = (status) => {
  const colors = {
    Ready: 'green-10',
    Partial: 'orange-9',
    Waiting: 'negative',
  }
  return colors[status] || 'grey-6'
}

const progressColor = (progress) => {
  if (progress >= 75) return 'green-10'
  if (progress >= 40) return 'orange-9'
  return 'negative'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDate = (value) => {
  if (!value) return '-'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(listenPlanning)

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
  font-weight: 800;
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

.detail-dialog {
  width: 760px;
  max-width: 95vw;
  border-radius: 18px;
  overflow: hidden;
}

.planning-dialog {
  width: 860px;
  max-width: 95vw;
  border-radius: 18px;
  overflow: hidden;
}

.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-value {
  color: #1b5e20;
  font-size: 15px;
  font-weight: 700;
}

.note-box {
  background: #f5f7f5;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  color: #344054;
  padding: 14px;
}
</style>
