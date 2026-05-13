<template>
  <q-page class="routing-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Tahapan Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Urutan Tahapan Produksi Produk
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola tahapan tiap produk mulai dari urutan proses, work center, proses fabrikasi, mesin,
          operator, dan estimasi waktu.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Routing"
          no-caps
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
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode routing, produk, proses, work center, atau line..."
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
              label="Filter Status Routing"
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
              @click="loadRouting"
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
        class="routing-table"
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
          <q-tr :props="props" class="routing-row">
            <q-td key="kode_routing" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.kode_routing }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk }}</div>
              <div class="text-caption text-grey-6">
                {{ props.row.proses.length }} proses produksi
              </div>
            </q-td>
            <q-td key="urutan_proses" :props="props">
              <div class="process-preview">
                <q-chip
                  v-for="process in props.row.proses.slice(0, 3)"
                  :key="processKey(process)"
                  dense
                  square
                  color="green-1"
                  text-color="green-10"
                  class="process-chip"
                >
                  {{ process.urutan }}. {{ process.urutan_proses }}
                </q-chip>
                <q-chip
                  v-if="props.row.proses.length > 3"
                  dense
                  square
                  color="blue-grey-1"
                  text-color="blue-grey-8"
                  class="process-chip"
                >
                  +{{ props.row.proses.length - 3 }}
                </q-chip>
              </div>
            </q-td>
            <q-td key="work_center" :props="props">{{ firstProcess(props.row).work_center }}</q-td>
            <q-td key="line_produksi" :props="props">
              {{ firstProcess(props.row).line_produksi }}
            </q-td>
            <q-td key="estimasi_waktu" :props="props" class="text-right text-weight-bold">
              {{ totalTime(props.row.proses) }} menit
            </q-td>
            <q-td key="status_routing" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_routing)"
                class="status-chip"
              >
                {{ props.row.status_routing }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  flat
                  round
                  dense
                  color="green-10"
                  icon="visibility"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip>Detail routing produksi</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-7"
                  icon="edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit routing</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="account_tree" size="28px" class="q-mr-sm" />
            Belum ada routing produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="routing-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ formModeLabel }} Tahapan Produksi</div>
            <div class="text-caption">Drag proses untuk mengatur tahapan produksi.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveRouting">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.kode_routing"
                  outlined
                  dense
                  label="Kode Routing"
                  :rules="[(val) => !!val || 'Kode routing wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-5">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  label="Nama Produk"
                  :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="form.status_routing"
                  :options="statusOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Status Routing"
                  :rules="[(val) => !!val || 'Status routing wajib dipilih']"
                />
              </div>
              <div class="col-12">
                <q-banner rounded class="bg-green-1 text-green-10">
                  <template #avatar>
                    <q-icon name="schedule" />
                  </template>
                  Total estimasi waktu: {{ formTotalTime }} menit dari
                  {{ form.proses.length }} proses produksi.
                </q-banner>
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 text-weight-bold text-green-10">
                  Tahapan Produksi
                </div>
                <div class="text-caption text-grey-7">
                  Tarik baris proses untuk mengatur tahapan produk.
                </div>
              </div>
              <q-btn
                flat
                dense
                color="green-10"
                icon="add"
                label="Tambah Proses"
                no-caps
                @click="addProcessRow"
              />
            </div>

            <div class="process-form-list">
              <div
                v-for="(process, index) in form.proses"
                :key="process.local_id"
                class="process-form-row"
                :class="{ 'process-form-row--dragging': draggedIndex === index }"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragover.prevent
                @drop="handleDrop(index)"
                @dragend="handleDragEnd"
              >
                <div class="row q-col-gutter-sm items-start">
                  <div class="col-auto">
                    <div class="drag-handle">
                      <q-icon name="drag_indicator" size="20px" />
                      <span>{{ process.urutan }}</span>
                    </div>
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="process.urutan_proses"
                      outlined
                      dense
                      label="Urutan Proses"
                      :rules="[(val) => !!val || 'Proses wajib diisi']"
                    />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="process.work_center" outlined dense label="Work Center" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="process.line_produksi" outlined dense label="Line Produksi" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="process.mesin" outlined dense label="Mesin" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-input v-model="process.operator" outlined dense label="Operator" />
                  </div>
                  <div class="col-8 col-md-1">
                    <q-input
                      v-model.number="process.estimasi_waktu"
                      outlined
                      dense
                      type="number"
                      min="0"
                      label="Menit"
                    />
                  </div>
                  <div class="col-4 col-md-auto text-right">
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :disable="form.proses.length === 1"
                      @click="removeProcessRow(index)"
                    />
                  </div>
                </div>
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
              label="Simpan Routing"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedRow?.kode_routing }}</div>
            <div class="text-caption">{{ selectedRow?.nama_produk }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-4">
              <div class="detail-label">Status Routing</div>
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(selectedRow?.status_routing)"
                class="status-chip q-mt-xs"
              >
                {{ selectedRow?.status_routing || '-' }}
              </q-chip>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">Total Proses</div>
              <div class="detail-value">{{ selectedRow?.proses?.length || 0 }}</div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="detail-label">Estimasi Waktu</div>
              <div class="detail-value">{{ totalTime(selectedRow?.proses) }} menit</div>
            </div>
          </div>

          <q-markup-table flat bordered class="process-table">
            <thead class="bg-green-10 text-white">
              <tr>
                <th class="text-center">Urutan</th>
                <th class="text-left">Proses</th>
                <th class="text-left">Work Center</th>
                <th class="text-left">Line</th>
                <th class="text-left">Mesin</th>
                <th class="text-left">Operator</th>
                <th class="text-right">Estimasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="process in selectedRow?.proses || []" :key="processKey(process)">
                <td class="text-center text-weight-bold text-green-10">{{ process.urutan }}</td>
                <td class="text-weight-bold">{{ process.urutan_proses || '-' }}</td>
                <td>{{ process.work_center || '-' }}</td>
                <td>{{ process.line_produksi || '-' }}</td>
                <td>{{ process.mesin || '-' }}</td>
                <td>{{ process.operator || '-' }}</td>
                <td class="text-right">{{ formatNumber(process.estimasi_waktu) }} menit</td>
              </tr>
              <tr v-if="!selectedRow?.proses?.length">
                <td colspan="7" class="text-center text-grey-7 q-pa-lg">
                  Urutan proses produksi belum diisi.
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'routing_produksi_manufaktur'
const statusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
  { label: 'DRAFT', value: 'DRAFT' },
]
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions,
]

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRow = ref(null)
const editingId = ref(null)
const draggedIndex = ref(null)
let unsubscribeRouting = null

const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const defaultProcess = () => ({
  local_id: createLocalId(),
  urutan: 1,
  urutan_proses: '',
  work_center: '',
  line_produksi: '',
  mesin: '',
  operator: '',
  estimasi_waktu: null,
})

const generateRoutingCode = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const suffix = String(Date.now()).slice(-4)
  return `RTG-${year}${month}-${suffix}`
}

const defaultForm = () => ({
  kode_routing: generateRoutingCode(),
  nama_produk: '',
  status_routing: 'DRAFT',
  proses: [defaultProcess()],
})

const form = ref(defaultForm())

const columns = [
  { name: 'kode_routing', align: 'left', label: 'Kode Routing', field: 'kode_routing', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'urutan_proses', align: 'left', label: 'Urutan Proses' },
  { name: 'work_center', align: 'left', label: 'Work Center' },
  { name: 'line_produksi', align: 'left', label: 'Line Produksi' },
  { name: 'estimasi_waktu', align: 'right', label: 'Estimasi Waktu', sortable: true },
  {
    name: 'status_routing',
    align: 'center',
    label: 'Status Routing',
    field: 'status_routing',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const normalizedRows = computed(() =>
  rows.value.map((row) => ({
    ...row,
    proses: normalizeProcesses(row.proses),
  })),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return normalizedRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_routing === statusFilter.value
    const processText = row.proses
      .map(
        (process) =>
          `${process.urutan_proses} ${process.work_center} ${process.line_produksi} ${process.mesin} ${process.operator}`,
      )
      .join(' ')
    const matchesSearch =
      !keyword ||
      [row.kode_routing, row.nama_produk, row.status_routing, processText]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Total Tahapan',
    value: rows.value.length,
    icon: 'account_tree',
    color: 'green-10',
  },
  {
    title: 'Active',
    value: rows.value.filter((row) => row.status_routing === 'ACTIVE').length,
    icon: 'verified',
    color: 'positive',
  },
  {
    title: 'Draft',
    value: rows.value.filter((row) => row.status_routing === 'DRAFT').length,
    icon: 'edit_note',
    color: 'orange-9',
  },
  {
    title: 'Total Proses',
    value: rows.value.reduce((sum, row) => sum + normalizeProcesses(row.proses).length, 0),
    icon: 'format_list_numbered',
    color: 'blue-grey-7',
  },
])

const formModeLabel = computed(() => (editingId.value ? 'Edit' : 'Tambah'))
const formTotalTime = computed(() => totalTime(form.value.proses))

function normalizeProcesses(processes) {
  return (processes || [])
    .map((process, index) => ({
      local_id: process.local_id || createLocalId(),
      urutan: Number(process.urutan || index + 1),
      urutan_proses: process.urutan_proses || '',
      work_center: process.work_center || '',
      line_produksi: process.line_produksi || '',
      mesin: process.mesin || '',
      operator: process.operator || '',
      estimasi_waktu: Number(process.estimasi_waktu || 0),
    }))
    .filter(
      (process) =>
        process.urutan_proses ||
        process.work_center ||
        process.line_produksi ||
        process.mesin ||
        process.operator ||
        process.estimasi_waktu,
    )
    .sort((a, b) => a.urutan - b.urutan)
    .map((process, index) => ({ ...process, urutan: index + 1 }))
}

const totalTime = (processes) =>
  normalizeProcesses(processes).reduce(
    (sum, process) => sum + Number(process.estimasi_waktu || 0),
    0,
  )

const firstProcess = (row) =>
  row.proses?.[0] || {
    work_center: '-',
    line_produksi: '-',
  }

const processKey = (process) =>
  `${process.urutan || 0}-${process.urutan_proses || 'proses'}-${process.work_center || 'center'}`

const statusColor = (status) => {
  const colors = {
    ACTIVE: 'green-10',
    INACTIVE: 'blue-grey-6',
    DRAFT: 'orange-9',
  }
  return colors[status] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const resequenceProcesses = () => {
  form.value.proses = form.value.proses.map((process, index) => ({
    ...process,
    urutan: index + 1,
  }))
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  resequenceProcesses()
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  editingId.value = row.id
  form.value = {
    kode_routing: row.kode_routing || '',
    nama_produk: row.nama_produk || '',
    status_routing: row.status_routing || 'DRAFT',
    proses: normalizeProcesses(row.proses).length
      ? normalizeProcesses(row.proses)
      : [defaultProcess()],
  }
  resequenceProcesses()
  showFormDialog.value = true
}

const openDetailDialog = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const addProcessRow = () => {
  form.value.proses.push(defaultProcess())
  resequenceProcesses()
}

const removeProcessRow = (index) => {
  form.value.proses.splice(index, 1)
  resequenceProcesses()
}

const handleDragStart = (index) => {
  draggedIndex.value = index
}

const handleDrop = (targetIndex) => {
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return
  const processes = [...form.value.proses]
  const [movedProcess] = processes.splice(draggedIndex.value, 1)
  processes.splice(targetIndex, 0, movedProcess)
  form.value.proses = processes
  draggedIndex.value = null
  resequenceProcesses()
}

const handleDragEnd = () => {
  draggedIndex.value = null
}

const buildPayload = () => ({
  kode_routing: form.value.kode_routing,
  nama_produk: form.value.nama_produk,
  status_routing: form.value.status_routing,
  proses: normalizeProcesses(form.value.proses),
  total_proses: normalizeProcesses(form.value.proses).length,
  total_estimasi_waktu: formTotalTime.value,
  updated_at: serverTimestamp(),
})

const saveRouting = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'Routing produksi berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Routing produksi berhasil dibuat' })
    }

    showFormDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan routing produksi' })
  } finally {
    submitting.value = false
  }
}

const loadRouting = () => {
  loading.value = true
  if (unsubscribeRouting) unsubscribeRouting()

  const routingQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeRouting = onSnapshot(
    routingQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((routingDoc) => ({
        id: routingDoc.id,
        proses: [],
        ...routingDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat routing produksi' })
    },
  )
}

onMounted(loadRouting)

onUnmounted(() => {
  if (unsubscribeRouting) unsubscribeRouting()
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
.routing-dialog,
.detail-dialog {
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

.routing-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.routing-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.routing-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.process-preview {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 220px;
}

.process-chip,
.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.status-chip {
  justify-content: center;
  min-width: 88px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.routing-dialog {
  max-width: 98vw;
  width: 1120px;
}

.detail-dialog {
  max-width: 95vw;
  width: 920px;
}

.process-form-list {
  display: grid;
  gap: 10px;
}

.process-form-row {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  cursor: grab;
  padding: 12px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease;
}

.process-form-row:active {
  cursor: grabbing;
}

.process-form-row--dragging {
  background: #edf7f3;
  border-color: #1b5e20;
  opacity: 0.72;
}

.drag-handle {
  align-items: center;
  background: #e8f5e9;
  border-radius: 10px;
  color: #1b5e20;
  display: inline-flex;
  font-size: 12px;
  font-weight: 900;
  gap: 2px;
  min-height: 40px;
  padding: 0 8px;
}

.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-value {
  color: #1b5e20;
  font-size: 16px;
  font-weight: 800;
  margin-top: 4px;
}

.process-table {
  border-color: #dfe8df;
  border-radius: 12px;
  overflow: hidden;
}
</style>
