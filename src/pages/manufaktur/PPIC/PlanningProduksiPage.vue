<template>
  <q-page class="planning-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Planning Produksi
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Planning produksi dari project manufaktur ke departemen manufacturing
          </span>
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Generate Planning"
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

    <q-card flat bordered class="tabs-card bg-white q-mb-lg">
      <q-tabs
        v-model="activeSection"
        align="left"
        class="text-green-10"
        active-color="green-10"
        indicator-color="green-10"
      >
        <q-tab name="planning" icon="assignment" label="Planning" no-caps />
        <q-tab name="schedule" icon="event_note" label="Schedule" no-caps />
      </q-tabs>
    </q-card>

    <q-tab-panels v-model="activeSection" animated keep-alive class="bg-transparent">
      <q-tab-panel name="planning" class="q-pa-none">
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
                  placeholder="Cari planning, project, customer, produk, atau departemen..."
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
                <q-td key="project_id" :props="props" class="text-weight-bolder text-green-10">
                  {{ props.row.planning_number || props.row.no_planning || props.row.nomor_planning || props.row.project_id || props.row.id }}
                  <div class="text-caption text-grey-6">
                    {{ props.row.project_id || props.row.project_number || '-' }}
                  </div>
                </q-td>

                <q-td key="customer" :props="props">
                  <div class="text-weight-bold text-green-10">{{ props.row.customer_name || props.row.customer_nama || props.row.customer || '-' }}</div>
                </q-td>

                <q-td key="products" :props="props">
                  <div>{{ formatProducts(props.row.products) }}</div>
                  <div class="text-caption text-grey-6">{{ props.row.products?.length || 0 }} item</div>
                </q-td>

                <q-td key="quantity" :props="props" class="text-right text-weight-bold">
                  {{ formatNumber(props.row.quantity) }} {{ props.row.satuan }}
                </q-td>

                <q-td key="deadline" :props="props">
                  {{ formatDate(props.row.deadline) }}
                </q-td>

                <q-td key="prioritas" :props="props">
                  <q-badge :color="priorityColor(props.row.priority)" class="status-badge">
                    {{ props.row.priority }}
                  </q-badge>
                </q-td>

                <q-td key="status" :props="props">
                  <q-badge :color="statusColor(props.row.planning_status || props.row.status)" class="status-badge">
                    {{ formatPlanningStatus(props.row.planning_status || props.row.status) }}
                  </q-badge>
                </q-td>

                <q-td key="action" :props="props" class="text-center">
                  <div class="row justify-center q-gutter-xs no-wrap">
                    <q-btn
                      v-if="!props.row.is_generated"
                      unelevated
                      rounded
                      dense
                      color="green-10"
                      icon="playlist_add_check"
                      label="Generate Planning"
                      no-caps
                      @click="openGenerateDialog(props.row)"
                    >
                      <q-tooltip>Buat draft planning dari master project</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.is_generated"
                      flat
                      round
                      dense
                      color="green-10"
                      icon="task_alt"
                      :disable="isApprovedPlanning(props.row)"
                      @click="approvePlanning(props.row)"
                    >
                      <q-tooltip>Approve planning</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-xl">
                <q-icon name="event_note" size="28px" class="q-mr-sm" />
                Belum ada project atau planning produksi.
              </div>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="schedule" class="q-pa-none">
        <q-card flat bordered class="filter-card bg-white q-mb-lg">
          <q-card-section class="q-py-md">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="selectedSchedulePlanning"
                  :options="schedulePlanningOptions"
                  outlined
                  dense
                  use-input
                  input-debounce="200"
                  label="Pilih planning untuk schedule"
                  @filter="filterSchedulePlanning"
                />
              </div>
              <div class="col-12 col-md-auto">
                <q-btn
                  unelevated
                  rounded
                  color="green-10"
                  icon="event_repeat"
                  label="Generate Schedule"
                  no-caps
                  :disable="!selectedScheduleRow"
                  :loading="scheduleSaving"
                  @click="generateScheduleForPlanning(selectedScheduleRow)"
                />
              </div>
              <div class="col-12 col-md-auto">
                <q-chip dense color="blue-grey-7" text-color="white" class="text-weight-bold q-px-md">
                  Total workload: {{ formatNumber(selectedScheduleWorkload) }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="table-card bg-white q-mb-lg">
          <q-table
            :rows="selectedScheduleRows"
            :columns="scheduleColumns"
            row-key="key"
            flat
            binary-state-sort
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            class="planning-table"
          >
            <template #header="props">
              <q-tr :props="props" class="bg-green-10 text-white">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body-cell-target_qty="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.target_qty"
                  dense
                  outlined
                  type="number"
                  min="0"
                  @blur="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #body-cell-actual_qty="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.actual_qty"
                  dense
                  outlined
                  type="number"
                  min="0"
                  @blur="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.status"
                  dense
                  outlined
                  emit-value
                  map-options
                  :options="scheduleStatusOptions"
                  @update:model-value="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-xl">
                <q-icon name="event_busy" size="28px" class="q-mr-sm" />
                Pilih planning, lalu generate schedule.
              </div>
            </template>
          </q-table>
        </q-card>

        <q-card flat bordered class="table-card bg-white">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-subtitle1 text-weight-bolder text-green-10">Daily Workload</div>
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold">
              {{ dailyWorkloadRows.length }} hari
            </q-chip>
          </q-card-section>
          <q-table
            :rows="dailyWorkloadRows"
            :columns="dailyWorkloadColumns"
            row-key="date"
            flat
            dense
            binary-state-sort
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #header="props">
              <q-tr :props="props" class="bg-grey-2 text-grey-9">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="formDialog" persistent maximized transition-show="fade" transition-hide="fade">
      <q-card class="planning-dialog">
        <q-card-section class="dialog-header row items-center justify-between bg-green-10 text-white">
          <div>
            <div class="text-h6 text-weight-bold">{{ formTitle }}</div>
            <div class="text-caption">Data planning tersinkron realtime ke departemen tujuan.</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form class="planning-dialog-form" @submit.prevent="savePlanning">
          <q-card-section class="planning-dialog-body">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.no_planning"
                  outlined
                  dense
                  readonly
                  label="Nomor Planning"
                  :rules="[(val) => !!val || 'No planning wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.approved_obj"
                  :options="approvedOptions"
                  outlined
                  dense
                  use-input
                  input-debounce="200"
                  label="Project / Item Project"
                  :loading="loadingProjects"
                  :rules="[(val) => !!val || 'Project wajib dipilih']"
                  @filter="filterApproved"
                  @update:model-value="handleApprovedSelected"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.status_planning"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status Planning"
                  :rules="[(val) => !!val || 'Status wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.assigned_ic"
                  outlined
                  dense
                  label="IC / PIC Planning"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.customer_nama"
                  outlined
                  dense
                  readonly
                  label="Customer"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.departemen_obj"
                  :options="departemenOptions"
                  outlined
                  dense
                  multiple
                  use-chips
                  label="Departemen Tujuan / Routing Produksi"
                  :loading="loadingDepartemen"
                  :rules="[(val) => (Array.isArray(val) ? val.length > 0 : !!val) || 'Departemen tujuan wajib dipilih']"
                  @update:model-value="handleDepartemenSelected"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  readonly
                  label="Produk"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.qty_target"
                  outlined
                  dense
                  type="number"
                  min="0"
                  readonly
                  label="Qty Target"
                  :rules="[(val) => Number(val) > 0 || 'Qty wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.satuan" outlined dense readonly label="Satuan" />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.deadline" outlined dense type="date" label="Deadline" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.prioritas"
                  :options="priorityOptions"
                  outlined
                  dense
                  readonly
                  label="Prioritas"
                />
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

          <q-card-actions align="right" class="dialog-footer bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="playlist_add_check"
              label="Generate Planning"
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
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const PLANNING_COLLECTION = 'mf_production_planning'
const MASTER_PROJECT_COLLECTION = 'mf_projects'
const PROJECT_ITEMS_COLLECTION = 'mf_project_items'
const PROJECT_MONITORING_COLLECTION = 'mf_project_monitoring'
const DEPARTMENT_PROGRESS_COLLECTION = 'mf_department_progress'
const MASTER_PRODUK_COLLECTION = 'master_produk'
const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'

const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const activeSection = ref('planning')
const formDialog = ref(false)
const selectedSchedulePlanning = ref(null)
const editingId = ref(null)
const rows = ref([])
const planningRows = ref([])
const departmentProgressRows = ref([])
const departemenRows = ref([])
const masterProjectRows = ref([])
const produkRows = ref([])
const filteredProjectOptions = ref([])
const loading = ref(true)
const loadingDepartemen = ref(true)
const loadingProjects = ref(true)
const submitting = ref(false)
const scheduleSaving = ref(false)
const errorMessage = ref('')
let unsubscribePlanning = null
let unsubscribeDepartmentProgress = null
let unsubscribeDepartemen = null
let unsubscribeProjects = null
let unsubscribeProduk = null

const statusOptions = ['not_started', 'planned', 'approved', 'in_progress', 'done']
const priorityOptions = ['High', 'Medium', 'Low']
const scheduleStatusOptions = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const planningCollection = collection(db, PLANNING_COLLECTION)

const listenPlanningProduksi = (callback, errorCallback) =>
  onSnapshot(
    query(planningCollection, orderBy('created_at', 'desc')),
    (snapshot) =>
      callback(snapshot.docs.map((planningDoc) => ({ id: planningDoc.id, ...planningDoc.data() }))),
    errorCallback,
  )

const listenDepartmentProgress = (callback, errorCallback) =>
  onSnapshot(
    collection(db, DEPARTMENT_PROGRESS_COLLECTION),
    (snapshot) =>
      callback(snapshot.docs.map((progressDoc) => ({ id: progressDoc.id, ...progressDoc.data() }))),
    errorCallback,
  )

const createPlanningFromProject = async (project, payload) => {
  const batch = writeBatch(db)
  const planningRef = doc(planningCollection)

  batch.set(planningRef, {
    ...payload,
    planning_id: planningRef.id,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  batch.update(doc(db, MASTER_PROJECT_COLLECTION, project.master_project_doc_id), {
    planning_status: 'planned',
    planning_id: planningRef.id,
    planning_status_updated_at: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
  return planningRef
}

const mapDepartemen = (departemenDoc) => {
  const data = departemenDoc.data()
  return {
    id: departemenDoc.id,
    value: departemenDoc.id,
    label: `${data.nama_departemen || departemenDoc.id}${data.kode_departemen ? ` - ${data.kode_departemen}` : ''}`,
    ...data,
  }
}

const listenMasterDepartemen = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_DEPARTEMEN_COLLECTION), orderBy('nama_departemen', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map(mapDepartemen)
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const listenMasterProjectSources = (callback, errorCallback) =>
  {
    const snapshots = {
      projects: [],
      items: [],
      monitoring: [],
    }

    const emit = () => callback(buildMasterProjectPlanningSources(snapshots))
    const handleError = (error) => {
      if (errorCallback) errorCallback(error)
    }

    const unsubscribeMasterProjects = onSnapshot(collection(db, MASTER_PROJECT_COLLECTION), (snapshot) => {
      snapshots.projects = snapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        ...projectDoc.data(),
        __collection: MASTER_PROJECT_COLLECTION,
      }))
      emit()
    }, handleError)

    const unsubscribeProjectItems = onSnapshot(collection(db, PROJECT_ITEMS_COLLECTION), (snapshot) => {
      snapshots.items = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
        __collection: PROJECT_ITEMS_COLLECTION,
      }))
      emit()
    }, handleError)

    const unsubscribeMonitoring = onSnapshot(collection(db, PROJECT_MONITORING_COLLECTION), (snapshot) => {
      snapshots.monitoring = snapshot.docs.map((monitoringDoc) => ({
        id: monitoringDoc.id,
        ...monitoringDoc.data(),
        __collection: PROJECT_MONITORING_COLLECTION,
      }))
      emit()
    }, handleError)

    return () => {
      unsubscribeMasterProjects()
      unsubscribeProjectItems()
      unsubscribeMonitoring()
    }
  }

const listenMasterProduk = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama_produk', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((produkDoc) => ({ id: produkDoc.id, value: produkDoc.id, ...produkDoc.data() }))
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'Planned', value: 'planned' },
  { label: 'Approved', value: 'approved' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const priorityFilterOptions = [
  { label: 'Semua Prioritas', value: 'all' },
  ...priorityOptions.map((priority) => ({ label: priority, value: priority })),
]

const scheduleColumns = [
  { name: 'day', align: 'right', label: 'Day', field: 'day', sortable: true },
  { name: 'date', align: 'left', label: 'Date', field: 'date', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'product', align: 'left', label: 'Product', field: 'product', sortable: true },
  { name: 'target_qty', align: 'right', label: 'Target Qty', field: 'target_qty', sortable: true },
  { name: 'actual_qty', align: 'right', label: 'Actual Qty', field: 'actual_qty', sortable: true },
  { name: 'status', align: 'left', label: 'Status', field: 'status', sortable: true },
]

const dailyWorkloadColumns = [
  { name: 'day', align: 'right', label: 'Day', field: 'day', sortable: true },
  { name: 'date', align: 'left', label: 'Date', field: 'date', sortable: true },
  { name: 'customers', align: 'left', label: 'Customer Load', field: 'customers', sortable: true },
  { name: 'total_target_qty', align: 'right', label: 'Total Target Qty', field: 'total_target_qty', sortable: true },
  { name: 'total_actual_qty', align: 'right', label: 'Total Actual Qty', field: 'total_actual_qty', sortable: true },
]

const generatePlanningNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const countThisMonth = planningRows.value.filter((row) =>
    String(row.no_planning || row.nomor_planning || '').includes(`PLN-MFG/${year}${month}`),
  ).length
  return `PLN-MFG/${year}${month}/${String(countThisMonth + 1).padStart(4, '0')}`
}

const defaultForm = () => ({
  no_planning: generatePlanningNumber(),
  nomor_planning: generatePlanningNumber(),
  approved_obj: null,
  project_id: '',
  project_name: '',
  project_item_id: '',
  project_monitoring_id: '',
  spk_id: '',
  nomor_spk: '',
  no_so: '',
  project: '',
  customer: '',
  customer_id: '',
  customer_nama: '',
  item_produksi: '',
  produk_id: '',
  kode_produk: '',
  nama_produk: '',
  qty: null,
  qty_target: null,
  satuan: 'Unit',
  tanggal_planning: '',
  deadline: '',
  departemen_obj: null,
  departemen_id: '',
  departemen_nama: '',
  departemen_kode: '',
  assigned_ic: '',
  ic: '',
  all_departemen: false,
  routing_mode: 'single',
  route_departemen: [],
  current_route_index: 0,
  current_departemen_id: '',
  current_departemen_nama: '',
  prioritas: 'Medium',
  priority: 'Medium',
  status: 'not_started',
  status_planning: 'not_started',
  planning_status: 'not_started',
  progress: 0,
  catatan: '',
})

const form = ref(defaultForm())

const columns = [
  {
    name: 'project_id',
    align: 'left',
    label: 'Planning Number',
    field: 'project_id',
    sortable: true,
  },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_name', sortable: true },
  { name: 'products', align: 'left', label: 'Products', field: 'products' },
  { name: 'quantity', align: 'right', label: 'Quantity', field: 'quantity', sortable: true },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Priority', field: 'priority', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'action', align: 'center', label: 'Action' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const rowStatus = row.planning_status || row.status_planning || row.status
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || row.priority === priorityFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.project_id,
        row.project_number,
        row.project_name,
        row.customer_name,
        row.customer,
        formatProducts(row.products),
        formatDepartmentProgress(row),
        row.tujuan_departemen?.nama_departemen,
        formatPlanningStatus(rowStatus),
        rowStatus,
        row.priority,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPriority && matchesSearch
  })
})

const generatedPlanningRows = computed(() => rows.value.filter((row) => row.is_generated))

const schedulePlanningRows = computed(() =>
  generatedPlanningRows.value.filter((row) =>
    ['planned', 'approved', 'in_progress', 'done'].includes(normalizeStatus(row.planning_status || row.status)),
  ),
)

const mapSchedulePlanningOption = (row) => ({
  label: `${planningNumber(row)} - ${row.customer_name || row.customer_nama || row.customer || '-'} - ${formatNumber(row.quantity)} ${row.satuan || 'Unit'}`,
  value: planningIdOf(row),
  item: row,
})

const schedulePlanningOptions = ref([])

const refreshSchedulePlanningOptions = (needle = '') => {
  const searchText = normalizeText(needle)
  schedulePlanningOptions.value = schedulePlanningRows.value
    .filter((row) => {
      if (!searchText) return true
      return [
        planningNumber(row),
        row.project_id,
        row.customer_name,
        formatProducts(row.products),
        row.deadline,
      ]
        .filter(Boolean)
        .some((value) => normalizeText(value).includes(searchText))
    })
    .map(mapSchedulePlanningOption)
}

const filterSchedulePlanning = (value, update) => {
  update(() => refreshSchedulePlanningOptions(value || ''))
}

const selectedScheduleRow = computed(() => {
  const planningId = selectedSchedulePlanning.value?.value
  if (!planningId) return null
  return generatedPlanningRows.value.find((row) => planningIdOf(row) === planningId) || null
})

const selectedScheduleRows = computed(() => normalizeScheduleRows(selectedScheduleRow.value))

const selectedScheduleWorkload = computed(() =>
  selectedScheduleRows.value.reduce((sum, row) => sum + Number(row.target_qty || 0), 0),
)

const allScheduleRows = computed(() =>
  generatedPlanningRows.value.flatMap((planning) => normalizeScheduleRows(planning)),
)

const dailyWorkloadRows = computed(() => {
  const rowsByDate = new Map()
  allScheduleRows.value.forEach((row) => {
    const key = row.date || ''
    if (!key) return
    if (!rowsByDate.has(key)) {
      rowsByDate.set(key, {
        day: row.day,
        date: key,
        customerLoads: new Map(),
        total_target_qty: 0,
        total_actual_qty: 0,
      })
    }

    const item = rowsByDate.get(key)
    const customerKey = row.customer || '-'
    item.customerLoads.set(
      customerKey,
      Number(item.customerLoads.get(customerKey) || 0) + Number(row.target_qty || 0),
    )
    item.total_target_qty += Number(row.target_qty || 0)
    item.total_actual_qty += Number(row.actual_qty || 0)
  })

  return Array.from(rowsByDate.values())
    .map((row) => ({
      day: row.day,
      date: row.date,
      customers: Array.from(row.customerLoads.entries())
        .map(([customer, qty]) => `${customer}: ${formatNumber(qty)}`)
        .join(' | '),
      total_target_qty: row.total_target_qty,
      total_actual_qty: row.total_actual_qty,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
})

const summaryCards = computed(() => [
  {
    title: 'Total Planning',
    value: rows.value.length,
    icon: 'business_center',
    color: 'green-10',
  },
  {
    title: 'Not Started',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'not_started').length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'Approved',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'approved').length,
    icon: 'assignment',
    color: 'teal-8',
  },
  {
    title: 'Done',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'done').length,
    icon: 'fiber_new',
    color: 'positive',
  },
])

const formTitle = computed(() => 'Generate Planning Produksi')

const departemenOptions = computed(() =>
  [
    {
      label: 'ALL DEPARTEMEN',
      value: '__ALL_DEPARTEMEN__',
      item: {
        id: '__ALL_DEPARTEMEN__',
        nama_departemen: 'ALL DEPARTEMEN',
        kode_departemen: 'ALL',
      },
    },
    ...departemenRows.value.map((item) => ({
      label: item.label,
      value: item.id,
      item,
    })),
  ],
)

const approvedOptions = computed(() => filteredProjectOptions.value)

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const getProjectRefId = (row = {}) => {
  const value = row.project_id ?? row.projectId ?? row.proyek_id ?? row.proyekId ?? row.project
  if (value && typeof value === 'object') {
    return value.id || value.value || value.project_id || value.projectId || ''
  }
  return value || row.id || ''
}

const getProjectName = (row = {}, fallback = '') =>
  row.project_name ||
  row.projectName ||
  row.proyek_nama ||
  row.nama_project ||
  row.nama_proyek ||
  row.nama ||
  row.name ||
  row.nomor_project ||
  fallback ||
  ''

const getProjectNumber = (row) =>
  row.nomor_project ||
  row.nomor_monitoring ||
  row.nomor_spk ||
  row.nomor ||
  row.reference_no ||
  row.project_name ||
  row.id

const getProjectItems = (row) =>
  (Array.isArray(row.items) && row.items.length
    ? row.items
    : [
        {
          deskripsi: row.nama_produk || row.produk?.nama_produk || row.produk,
          nama_produk: row.nama_produk || row.produk?.nama_produk || row.produk,
          qty: row.qty_target || row.qty_po || row.qty,
          satuan: row.satuan || row.produk?.satuan,
          kode_produk: row.kode_produk || row.produk?.kode_produk,
          produk_id: row.produk_id || row.produk?.id,
        },
      ]
  ).map((item, index) => {
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
      project_id: item.project_id || row.project_id || row.projectId || row.proyek_id || '',
      project_name: item.project_name || row.project_name || row.projectName || row.proyek_nama || '',
      project_item_id: item.project_item_id || item.item_id || item.id || '',
      project_monitoring_id: item.project_monitoring_id || row.project_monitoring_id || '',
    }
  })

const flattenMonitoringItems = (monitoring) => {
  const groups = Array.isArray(monitoring.groups) ? monitoring.groups : []
  const groupItems = groups.flatMap((group) =>
    (Array.isArray(group.items) ? group.items : []).map((item) => ({
      ...item,
      group_id: group.id || group.group_id || group.name || '',
      group_name: group.name || group.nama_group || group.label || '',
    })),
  )
  if (groupItems.length) return groupItems
  if (Array.isArray(monitoring.items) && monitoring.items.length) return monitoring.items
  if (Array.isArray(monitoring.item_pekerjaan) && monitoring.item_pekerjaan.length) {
    return monitoring.item_pekerjaan
  }
  return []
}

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

const isReadyProjectStatus = (status) => {
  if (!status) return true
  const normalized = normalizeStatus(status)
  return ['approved', 'approve', 'ready', 'aktif', 'active', 'project active', 'not_started'].includes(normalized)
}

const isPlanningGenerated = (project, generatedProjectIds) =>
  ['planned', 'approved', 'in_progress', 'done'].includes(normalizeStatus(project.planning_status)) ||
  generatedProjectIds.has(getProjectRefId(project)) ||
  generatedProjectIds.has(project.id)

const normalizePlanningRow = (planning, sourceProject = {}) => {
  const projectId = planning.project_id || getProjectRefId(sourceProject) || planning.source_document_id || planning.id
  const sourceProducts = Array.isArray(sourceProject.products) ? sourceProject.products : []
  const sourceItems = Array.isArray(sourceProject.items) ? sourceProject.items : []
  const mergedPlanning = {
    ...planning,
    ...sourceProject,
    id: planning.id,
    planning_id: planning.planning_id || planning.id,
    project_id: projectId,
    status: planning.status,
    assigned_departments: planning.assigned_departments || [],
    is_generated: true,
  }
  const progress = projectProgress(mergedPlanning)
  const planningStatus = normalizePlanningStatus(planning.planning_status || planning.status_planning || planning.status, progress)

  return {
    ...mergedPlanning,
    id: planning.id,
    is_generated: true,
    planning_id: planning.planning_id || planning.id,
    project_id: projectId,
    project_name: sourceProject.project_name || planning.project_name || planning.project || '-',
    customer_name:
      sourceProject.customer_name ||
      planning.customer_name ||
      planning.customer_nama ||
      planning.customer ||
      '',
    products: sourceProducts.length ? sourceProducts : buildProducts(sourceItems),
    items: sourceItems,
    quantity: Number(sourceProject.quantity || 0),
    satuan: sourceProject.satuan || planning.satuan || 'Unit',
    deadline: sourceProject.deadline || planning.deadline || '',
    priority: sourceProject.priority || planning.priority || planning.prioritas || 'Medium',
    planning_status: planningStatus,
    status: planningStatus,
    production_schedule: Array.isArray(planning.production_schedule) ? planning.production_schedule : [],
    progress,
  }
}

const buildProducts = (items) =>
  items.map((item, index) => {
    const productName =
      item.nama_produk ||
      item.nama_barang ||
      item.nama_item ||
      item.pekerjaan ||
      item.deskripsi ||
      item.name ||
      `Item Project ${index + 1}`
    return {
      product_id: item.produk_id || item.product_id || item.id_produk || '',
      product_code: item.kode_produk || item.kode_barang || '',
      product_name: productName,
      name: productName,
      quantity: Number(item.qty ?? item.quantity ?? item.qty_target ?? item.volume ?? item.target ?? 0),
      unit: item.satuan || item.unit || 'Unit',
    }
  })

const buildMasterProjectPlanningSources = ({ projects, items, monitoring }) => {
  const itemsByProjectId = new Map()
  const monitoringByProjectId = new Map()

  items.forEach((item) => {
    const projectId = getProjectRefId(item)
    if (!itemsByProjectId.has(projectId)) itemsByProjectId.set(projectId, [])
    itemsByProjectId.get(projectId).push(item)
  })

  monitoring.forEach((monitoringRow) => {
    const projectId = getProjectRefId(monitoringRow)
    if (!monitoringByProjectId.has(projectId)) monitoringByProjectId.set(projectId, [])
    monitoringByProjectId.get(projectId).push(monitoringRow)
  })

  return projects
    .filter((project) =>
      isReadyProjectStatus(
        project.status ||
          project.project_status ||
          project.status_project ||
          project.approval_status ||
          project.approvalStatus,
      ),
    )
    .map((project) => {
      const projectId = getProjectRefId(project)
      const projectName = getProjectName(project, projectId)
      const relatedMonitoring = monitoringByProjectId.get(projectId) || []
      const readyMonitoring = relatedMonitoring.find((item) => isReadyProjectStatus(item.status)) || relatedMonitoring[0] || {}
      const sourceItems = [
        ...(itemsByProjectId.get(projectId) || []),
        ...relatedMonitoring.flatMap(flattenMonitoringItems),
      ]
      const normalizedItems = sourceItems.length ? sourceItems : [project]
      const products = buildProducts(normalizedItems)
      const quantity = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

      return {
        ...project,
        id: project.id,
        is_generated: false,
        master_project_doc_id: project.id,
        master_project_status:
          project.status ||
          project.project_status ||
          project.status_project ||
          project.approval_status ||
          project.approvalStatus ||
          '',
        status: 'not_started',
        planning_status: 'not_started',
        project_id: projectId,
        project_name: projectName,
        project_number: project.nomor_project || project.nomor || readyMonitoring.nomor_spk || projectId,
        customer_id: project.customer_id || project.customer?.id || readyMonitoring.customer_id || '',
        customer_name:
          project.customer_name ||
          project.customer_nama ||
          project.konsumen ||
          project.customer?.nama ||
          readyMonitoring.customer_nama ||
          readyMonitoring.konsumen ||
          '',
        products,
        quantity,
        satuan: products[0]?.unit || project.satuan || 'Unit',
        deadline: project.deadline || project.tgl_akhir || readyMonitoring.deadline || readyMonitoring.tgl_akhir || '',
        priority: project.priority || project.prioritas || readyMonitoring.priority || readyMonitoring.prioritas || 'Medium',
        progress: 0,
        project_monitoring_id: readyMonitoring.id || '',
        source_collection: MASTER_PROJECT_COLLECTION,
        source_document_id: project.id,
        related_monitoring_ids: relatedMonitoring.map((item) => item.id).filter(Boolean),
        items: getProjectItems({ ...project, items: normalizedItems }),
      }
    })
}

const syncPlanningRows = () => {
  const sourceByProjectId = new Map()
  masterProjectRows.value.forEach((project) => {
    sourceByProjectId.set(project.project_id, project)
    sourceByProjectId.set(project.id, project)
    sourceByProjectId.set(project.master_project_doc_id, project)
  })
  const generatedRows = planningRows.value.map((planning) =>
    normalizePlanningRow(planning, sourceByProjectId.get(planning.project_id)),
  )
  const generatedProjectIds = new Set(generatedRows.map((planning) => planning.project_id).filter(Boolean))
  const candidateRows = masterProjectRows.value.filter(
    (project) => !isPlanningGenerated(project, generatedProjectIds),
  )

  rows.value = [...generatedRows, ...candidateRows]
  filteredProjectOptions.value = candidateRows.map(mapApprovedOption)
  refreshSchedulePlanningOptions()
}

const findMasterProduk = (item) => {
  const produkId = item.produk_id || item.product_id || item.id_produk
  if (produkId) {
    const byId = produkRows.value.find((produk) => produk.id === produkId)
    if (byId) return byId
  }

  const kodeProduk = normalizeText(item.kode_produk || item.kode_barang)
  if (kodeProduk) {
    const byCode = produkRows.value.find((produk) => normalizeText(produk.kode_produk) === kodeProduk)
    if (byCode) return byCode
  }

  const namaProduk = normalizeText(item.nama_produk || item.produk || item.deskripsi || item.nama_barang)
  if (!namaProduk) return null
  return produkRows.value.find(
    (produk) => normalizeText(produk.nama_produk || produk.nama || produk.label) === namaProduk,
  )
}

const mapApprovedOption = (row) => {
  const items = getProjectItems(row)
  return {
    label: `${row.project_id || row.id} - ${row.project_name || '-'}${items.length > 1 ? ` +${items.length - 1} item` : ''}`,
    value: row.id,
    item: row,
  }
}

const refreshApprovedOptions = (needle = '') => {
  const searchText = normalizeText(needle)
  const generatedProjectIds = new Set(planningRows.value.map((planning) => planning.project_id).filter(Boolean))
  filteredProjectOptions.value = masterProjectRows.value
    .filter((row) => !isPlanningGenerated(row, generatedProjectIds))
    .filter((row) => {
      return (
        !searchText ||
        [
          row.project_id,
          row.project_number,
          row.project_name,
          row.customer_name,
          formatProducts(row.products),
        ]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(searchText))
      )
    })
    .map(mapApprovedOption)
}

const filterApproved = (value, update) => {
  update(() => refreshApprovedOptions(value || ''))
}

const findDepartemenOption = (id, name) =>
  departemenOptions.value.find((option) => option.value === id) ||
  departemenOptions.value.find((option) => option.item.nama_departemen === name)

const normalizeDepartemenSelection = (selection) => {
  const selectedOptions = (Array.isArray(selection) ? selection : selection ? [selection] : []).filter(Boolean)
  const isAllSelected = selectedOptions.some((option) => option.value === '__ALL_DEPARTEMEN__')
  const baseOptions = isAllSelected
    ? departemenRows.value.map((item) => ({ label: item.label, value: item.id, item }))
    : selectedOptions.filter((option) => option.value !== '__ALL_DEPARTEMEN__')

  const seen = new Set()
  const route = baseOptions
    .map((option, index) => {
      const item = option?.item || option
      const id = item?.id || item?.value || option?.value || ''
      if (!id || seen.has(id)) return null
      seen.add(id)
      return {
        id,
        value: id,
        nama_departemen: item?.nama_departemen || item?.label || option?.label || '',
        kode_departemen: item?.kode_departemen || '',
        label: option?.label || item?.nama_departemen || item?.label || '',
        urutan: index + 1,
        status: index === 0 ? 'Menunggu Produksi' : 'Menunggu Routing',
        is_new: index === 0,
      }
    })
    .filter(Boolean)

  return { isAllSelected, route }
}

const handleDepartemenSelected = (option) => {
  const { isAllSelected, route } = normalizeDepartemenSelection(option)
  const firstDepartemen = route[0] || null

  form.value.all_departemen = isAllSelected
  form.value.routing_mode = isAllSelected ? 'all' : route.length > 1 ? 'routing' : 'single'
  form.value.route_departemen = route
  form.value.current_route_index = 0
  form.value.current_departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.current_departemen_nama = isAllSelected ? 'ALL DEPARTEMEN' : firstDepartemen?.nama_departemen || ''
  form.value.departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.departemen_nama = isAllSelected
    ? 'ALL DEPARTEMEN'
    : route.map((item) => item.nama_departemen).join(' -> ')
  form.value.departemen_kode = isAllSelected ? 'ALL' : firstDepartemen?.kode_departemen || ''
}

const normalizeDepartment = (department = {}, index = 0) => {
  const departmentId =
    department.department_id ||
    department.departemen_id ||
    department.id ||
    department.value ||
    department.department_key ||
    department.kode_departemen ||
    ''
  const departmentName =
    department.department_name ||
    department.department_label ||
    department.departemen_nama ||
    department.nama_departemen ||
    department.name ||
    department.label ||
    departmentId ||
    `Departemen ${index + 1}`

  return {
    department_id: String(departmentId || departmentName).trim(),
    department_name: String(departmentName).trim(),
  }
}

const uniqueDepartments = (departments = []) => {
  const seen = new Set()
  return departments
    .map(normalizeDepartment)
    .filter((department) => {
      if (!department.department_id || seen.has(department.department_id)) return false
      seen.add(department.department_id)
      return true
    })
}

const assignedDepartmentsFor = (row = {}) => {
  const explicitDepartments = [
    ...(Array.isArray(row.assigned_departments) ? row.assigned_departments : []),
    ...(Array.isArray(row.route_departemen) ? row.route_departemen : []),
    ...(Array.isArray(row.target_departemen) ? row.target_departemen : []),
  ]

  if (row.tujuan_departemen?.id || row.tujuan_departemen?.nama_departemen) {
    explicitDepartments.push(row.tujuan_departemen)
  }

  if (row.departemen_id || row.departemen_nama) {
    explicitDepartments.push({
      department_id: row.departemen_id,
      department_name: row.departemen_nama,
    })
  }

  return uniqueDepartments(explicitDepartments)
}

const handleApprovedSelected = (option) => {
  const project = option?.item || option
  if (!project) return

  const selectedItem = getProjectItems(project)[0] || {}
  const produk = findMasterProduk(selectedItem)

  form.value.project_id = project.project_id || getProjectRefId(project)
  form.value.project_name = project.project_name || getProjectName(project, form.value.project_id)
  form.value.project_item_id = selectedItem.project_item_id || project.project_item_id || selectedItem.item_id || ''
  form.value.project_monitoring_id = project.project_monitoring_id || selectedItem.project_monitoring_id || ''
  form.value.nomor_spk = project.project_number || getProjectNumber(project)
  form.value.no_so = project.project_number || getProjectNumber(project)
  form.value.project = form.value.project_name
  form.value.customer_id = project.customer_id || ''
  form.value.customer_nama = project.customer_name || project.customer_nama || project.customer || ''
  form.value.customer = form.value.customer_nama
  form.value.produk_id = produk?.id || selectedItem.produk_id || project.produk_id || ''
  form.value.kode_produk = produk?.kode_produk || selectedItem.kode_produk || project.kode_produk || ''
  form.value.nama_produk =
    produk?.nama_produk ||
    produk?.nama ||
    selectedItem.nama_produk ||
    selectedItem.deskripsi ||
    formatProducts(project.products) ||
    ''
  form.value.item_produksi = form.value.nama_produk
  form.value.qty_target = Number(project.quantity || selectedItem.qty || 0)
  form.value.qty = form.value.qty_target
  form.value.satuan = produk?.satuan || selectedItem.satuan || project.satuan || 'Unit'
  form.value.prioritas = project.priority || 'Medium'
  form.value.priority = form.value.prioritas
  form.value._source_project = project

  const departemenOption = findDepartemenOption(
    project.departemen_id || project.tujuan_departemen?.id,
    project.departemen_nama || project.tujuan_departemen?.nama_departemen,
  )
  if (departemenOption) {
    form.value.departemen_obj = [departemenOption]
    handleDepartemenSelected([departemenOption])
  }
}

const buildPayload = () => {
  const statusPlanning = 'planned'

  return {
    planning_number: form.value.no_planning,
    no_planning: form.value.no_planning,
    nomor_planning: form.value.no_planning,
    project_id: form.value.project_id,
    status: statusPlanning,
    assigned_departments: uniqueDepartments(form.value.route_departemen || []),
    assigned_ic: form.value.assigned_ic || form.value.ic || '',
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  refreshApprovedOptions()
  formDialog.value = true
}

const openGenerateDialog = (row) => {
  editingId.value = null
  form.value = defaultForm()
  form.value.approved_obj = mapApprovedOption(row)
  handleApprovedSelected(form.value.approved_obj)
  formDialog.value = true
}

const savePlanning = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()
    const project = form.value._source_project || form.value.approved_obj?.item

    if (!project?.master_project_doc_id) {
      $q.notify({ type: 'warning', message: 'Pilih master project yang valid.' })
      return
    }

    await createPlanningFromProject(project, payload)
    $q.notify({ type: 'positive', message: 'Planning produksi berhasil digenerate' })

    formDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan planning produksi' })
  } finally {
    submitting.value = false
  }
}

const planningNumber = (row = {}) =>
  row.planning_number || row.no_planning || row.nomor_planning || planningIdOf(row) || '-'

const isApprovedPlanning = (row = {}) =>
  normalizeStatus(row.planning_status || row.status_planning || row.status) === 'approved'

const approvePlanning = async (row) => {
  if (!row?.id || isApprovedPlanning(row)) return

  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, row.id), {
      status: 'approved',
      approved_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    $q.notify({ type: 'positive', message: 'Planning produksi berhasil diapprove' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal approve planning produksi' })
  }
}

const planningIdOf = (row = {}) => row.planning_id || row.id || row.source_document_id || ''

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const normalizeScheduleRows = (planning = {}) => {
  if (!planning) return []
  const planningId = planningIdOf(planning)
  return (Array.isArray(planning.production_schedule) ? planning.production_schedule : [])
    .map((row, index) => ({
      key: row.key || `${planningId}_${row.date || index + 1}`,
      planning_id: planningId,
      day: Number(row.day || index + 1),
      date: row.date || '',
      customer: row.customer || planning.customer_name || planning.customer_nama || planning.customer || '',
      product: row.product || formatProducts(planning.products),
      target_qty: Number(row.target_qty ?? row.target_quantity ?? 0),
      actual_qty: Number(row.actual_qty ?? row.actual_quantity ?? 0),
      status: row.status || 'not_started',
    }))
    .sort((a, b) => Number(a.day || 0) - Number(b.day || 0))
}

const generateScheduleRows = (planning = {}) => {
  const totalQuantity = Math.max(0, Number(planning.quantity || planning.qty_target || planning.qty || 0))
  const deadlineValue = toDateInputValue(planning.deadline)
  if (!totalQuantity || !deadlineValue) return []

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(`${deadlineValue}T00:00:00`)
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
  const dailyTarget = Math.ceil(totalQuantity / totalDays)
  const customer = planning.customer_name || planning.customer_nama || planning.customer || ''
  const product = formatProducts(planning.products)
  const planningId = planningIdOf(planning)

  return Array.from({ length: totalDays }, (_, index) => {
    const date = toDateInputValue(addDays(startDate, index))
    const remainingQuantity = Math.max(0, totalQuantity - dailyTarget * index)
    return {
      key: `${planningId}_${date}`,
      planning_id: planningId,
      day: index + 1,
      date,
      customer,
      product,
      target_qty: Math.min(dailyTarget, remainingQuantity),
      actual_qty: 0,
      status: 'not_started',
    }
  }).filter((row) => row.target_qty > 0)
}

const generateScheduleForPlanning = async (planning) => {
  if (!planning?.id) return
  const scheduleRows = generateScheduleRows(planning)
  if (!scheduleRows.length) {
    $q.notify({ type: 'warning', message: 'Quantity dan deadline wajib tersedia untuk generate schedule.' })
    return
  }

  scheduleSaving.value = true
  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, planning.id), {
      production_schedule: scheduleRows,
      schedule_generated_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    $q.notify({ type: 'positive', message: 'Schedule produksi berhasil digenerate' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal generate schedule produksi' })
  } finally {
    scheduleSaving.value = false
  }
}

const saveScheduleRow = async (row) => {
  const planning = selectedScheduleRow.value
  if (!planning?.id || !row?.key) return

  const nextScheduleRows = normalizeScheduleRows(planning).map((item) =>
    item.key === row.key
      ? {
          ...item,
          target_qty: Number(row.target_qty || 0),
          actual_qty: Number(row.actual_qty || 0),
          status: row.status || 'not_started',
        }
      : item,
  )

  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, planning.id), {
      production_schedule: nextScheduleRows,
      updated_at: serverTimestamp(),
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan schedule produksi' })
  }
}

const progressDepartmentId = (progress = {}) =>
  String(progress.department_id || progress.departemen_id || progress.department_key || progress.id || '').trim()

const normalizeProgressRow = (progress = {}, fallbackDepartment = {}) => {
  const department = normalizeDepartment({
    department_id: progressDepartmentId(progress) || fallbackDepartment.department_id,
    department_name:
      progress.department_name ||
      progress.nama_departemen ||
      progress.department_label ||
      fallbackDepartment.department_name,
  })
  const targetQty = Number(progress.target_qty ?? progress.target_quantity ?? 0)
  const actualQty = Number(progress.actual_qty ?? progress.actual_quantity ?? 0)
  const computedProgress = targetQty > 0 ? Math.min(100, Math.round((actualQty / targetQty) * 100)) : 0
  const progressPercent = Number(progress.progress_percent ?? computedProgress)

  return {
    id: progress.id || `${progress.project_id || ''}_${department.department_id}`,
    project_id: progress.project_id || '',
    planning_id: progress.planning_id || '',
    department_id: department.department_id,
    department_name: department.department_name,
    target_qty: targetQty,
    actual_qty: actualQty,
    progress_percent: progressPercent,
    status: normalizePlanningStatus(progress.status, progressPercent),
  }
}

const progressRowsForProject = (row = {}) => {
  const projectId = row.project_id || ''
  const planningId = planningIdOf(row)
  return departmentProgressRows.value.filter(
    (item) =>
      (projectId && item.project_id === projectId) ||
      (planningId && item.planning_id === planningId),
  )
}

const departmentProgressFor = (row = {}) => {
  const assignedDepartments = assignedDepartmentsFor(row)
  const progressRows = progressRowsForProject(row).map((progress) => normalizeProgressRow(progress))
  const progressByDepartment = new Map(progressRows.map((item) => [item.department_id, item]))

  if (!assignedDepartments.length) return progressRows

  return assignedDepartments.map((department) => {
    const progress = progressByDepartment.get(department.department_id)
    if (progress) return progress

    return normalizeProgressRow(
      {
        project_id: row.project_id || '',
        planning_id: planningIdOf(row),
        department_id: department.department_id,
        department_name: department.department_name,
        target_qty: 0,
        actual_qty: 0,
        progress_percent: 0,
        status: 'not_started',
      },
      department,
    )
  })
}

const projectProgress = (row = {}) => {
  const progressRows = departmentProgressFor(row)
  if (progressRows.some((item) => item.id)) {
    const total = progressRows.reduce((sum, item) => sum + Number(item.progress_percent || 0), 0)
    return Math.round(total / progressRows.length)
  }

  return Number(row.progress_percent ?? row.progress ?? 0)
}

const normalizePlanningStatus = (status, progress = 0) => {
  const normalized = normalizeStatus(status)
  if (progress >= 100) return 'done'
  if (progress > 0) return 'in_progress'
  if (['done', 'in_progress', 'approved', 'planned', 'not_started'].includes(normalized)) return normalized
  if (['draft', 'scheduled', 'on progress', 'selesai'].includes(normalized)) {
    if (normalized === 'selesai') return 'done'
    if (normalized === 'on progress') return 'in_progress'
    return 'planned'
  }
  return normalized || 'not_started'
}

const formatPlanningStatus = (status) => {
  const labels = {
    not_started: 'Not Started',
    planned: 'Planned',
    approved: 'Approved',
    in_progress: 'In Progress',
    done: 'Done',
  }
  return labels[normalizeStatus(status)] || status || '-'
}

const formatDepartmentProgress = (row = {}) => {
  if (!row.is_generated) return 'Belum digenerate'

  const progressRows = departmentProgressFor(row)
  if (!progressRows.length) return 'Belum ada progress departemen'

  return progressRows
    .map((item) => `${item.department_name}: ${Number(item.progress_percent || 0)}%`)
    .join(' | ')
}

const listenPlanning = () => {
  errorMessage.value = ''
  if (unsubscribePlanning) unsubscribePlanning()

  unsubscribePlanning = listenPlanningProduksi(
    (nextPlanningRows) => {
      planningRows.value = nextPlanningRows
      syncPlanningRows()
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

const listenDepartmentProgressRows = () => {
  if (unsubscribeDepartmentProgress) unsubscribeDepartmentProgress()

  unsubscribeDepartmentProgress = listenDepartmentProgress(
    (nextRows) => {
      departmentProgressRows.value = nextRows
      syncPlanningRows()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat progress departemen' })
    },
  )
}

const listenDepartemenOptions = () => {
  loadingDepartemen.value = true
  if (unsubscribeDepartemen) unsubscribeDepartemen()

  unsubscribeDepartemen = listenMasterDepartemen(
    (options) => {
      departemenRows.value = options
      loadingDepartemen.value = false
    },
    (error) => {
      console.error(error)
      loadingDepartemen.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat departemen manufacturing' })
    },
  )
}

const listenApprovedOptions = () => {
  loading.value = true
  loadingProjects.value = true
  if (unsubscribeProjects) unsubscribeProjects()

  unsubscribeProjects = listenMasterProjectSources(
    (nextRows) => {
      masterProjectRows.value = nextRows
      syncPlanningRows()
      loading.value = false
      loadingProjects.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      loadingProjects.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat project manufacturing' })
    },
  )
}

const listenProdukOptions = () => {
  if (unsubscribeProduk) unsubscribeProduk()

  unsubscribeProduk = listenMasterProduk(
    (nextRows) => {
      produkRows.value = nextRows
      refreshApprovedOptions()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk manufacturing' })
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
    not_started: 'grey-7',
    planned: 'blue-grey-7',
    approved: 'teal-8',
    in_progress: 'orange-9',
    done: 'green-10',
  }
  return colors[normalizeStatus(status)] || 'grey-6'
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

const formatProducts = (products = []) => {
  if (!Array.isArray(products) || !products.length) return '-'
  return products.map((item) => item.product_name || item.name || item.nama_produk || '-').join(', ')
}

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

onMounted(() => {
  listenPlanning()
  listenDepartmentProgressRows()
  listenDepartemenOptions()
  listenProdukOptions()
  listenApprovedOptions()
})

onUnmounted(() => {
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeDepartmentProgress) unsubscribeDepartmentProgress()
  if (unsubscribeDepartemen) unsubscribeDepartemen()
  if (unsubscribeProjects) unsubscribeProjects()
  if (unsubscribeProduk) unsubscribeProduk()
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

.detail-card {
  border-color: #dfe8df;
  border-radius: 18px;
  overflow: hidden;
}

.planning-dialog {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.planning-dialog-form {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 16px 24px;
}

.planning-dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.dialog-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 2;
  border-top: 1px solid #dfe8df;
}

@media (max-width: 599px) {
  .dialog-header {
    align-items: flex-start;
    padding: 14px 16px;
  }

  .planning-dialog-body {
    padding: 16px;
  }

  .dialog-footer {
    gap: 8px;
  }

  .dialog-footer :deep(.q-btn) {
    flex: 1;
  }
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
