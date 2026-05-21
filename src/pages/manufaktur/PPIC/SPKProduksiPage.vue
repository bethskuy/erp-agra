<template>
  <q-page class="spk-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10">SPK Fabrikasi</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Surat perintah kerja fabrikasi dari quotation approved menuju routing tahapan workshop.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh"
          no-caps
          :loading="loading"
          class="bg-white shadow-1"
          @click="loadSpk"
        />
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Buat SPK"
          no-caps
          class="q-px-lg"
          @click="openDialog()"
        />
      </div>
    </div>

    <q-card flat bordered class="filter-card bg-white q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari nomor SPK, material, tim, tahapan, atau status..."
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
              label="Status"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} SPK
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
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk }}
              <div class="text-caption text-grey-6">{{ formatDate(props.row.deadline) }}</div>
            </q-td>
            <q-td key="material" :props="props">
              <div class="text-weight-bold">{{ props.row.nama_material || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_material || '-' }}</div>
            </q-td>
            <q-td key="tim" :props="props">
              <div class="text-weight-bold">{{ props.row.tim_produksi || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.jabatan_tim || '-' }}</div>
            </q-td>
            <q-td key="tahapan" :props="props">
              <div class="text-weight-bold">{{ props.row.tahapan_fabrikasi || '-' }}</div>
              <div class="text-caption text-grey-6">Routing {{ props.row.urutan_tahapan || '-' }}</div>
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
                  :value="Number(props.row.progress || 0) / 100"
                  :color="progressColor(props.row.progress)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="status_pekerjaan" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status_pekerjaan)"
                class="status-chip"
              >
                {{ props.row.status_pekerjaan }}
              </q-chip>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <q-btn flat round dense color="green-10" icon="edit" @click="openDialog(props.row)">
                <q-tooltip>Edit SPK</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="description" size="28px" class="q-mr-sm" />
            Belum ada SPK fabrikasi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="spk-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">Workflow: Quotation Approved -> SPK Fabrikasi -> Routing Tahapan -> Produksi -> QC -> Finished</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveSpk">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="form.nomor_spk" outlined dense readonly label="Nomor SPK Otomatis" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.deadline" outlined dense type="date" label="Target Deadline" :rules="[required]" />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.material_id"
                  :options="materialOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="Material"
                  :loading="loadingMasterMaterial"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tim_produksi_id"
                  :options="timOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="Tim Produksi"
                  :loading="loadingMasterTim"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tahapan_fabrikasi_id"
                  :options="tahapanOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="Tahapan Fabrikasi Aktif"
                  :loading="loadingMasterTahapan"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.status_pekerjaan"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status Pekerjaan"
                  :rules="[required]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="form.progress"
                  outlined
                  dense
                  type="number"
                  min="0"
                  max="100"
                  label="Progress (%)"
                  :rules="[(val) => Number(val) >= 0 && Number(val) <= 100 || 'Progress wajib 0-100']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model.number="form.qty_target" outlined dense type="number" min="0" label="Qty Target" />
              </div>
              <div class="col-12">
                <q-input v-model="form.catatan" outlined dense type="textarea" autogrow label="Catatan SPK" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn unelevated rounded color="green-10" icon="save" label="Simpan SPK" no-caps type="submit" :loading="saving" />
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

const COLLECTION_NAME = 'spk_fabrikasi'
const $q = useQuasar()
const rows = ref([])
const masterMaterials = ref([])
const masterTahapan = ref([])
const masterTim = ref([])
const loading = ref(false)
const loadingMasterMaterial = ref(true)
const loadingMasterTahapan = ref(true)
const loadingMasterTim = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('all')
const dialogOpen = ref(false)
const editingId = ref(null)
let unsubscribeRows = null
let unsubscribeMaterials = null
let unsubscribeTahapan = null
let unsubscribeTim = null

const statusOptions = ['Quotation Approved', 'SPK Fabrikasi', 'Routing Tahapan', 'Produksi', 'QC', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const generateSpkNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `SPK-FAB-${year}${month}${day}-${String(Date.now()).slice(-5)}`
}

const defaultForm = () => ({
  nomor_spk: generateSpkNumber(),
  material_id: '',
  tim_produksi_id: '',
  tahapan_fabrikasi_id: '',
  deadline: '',
  status_pekerjaan: 'SPK Fabrikasi',
  progress: 0,
  qty_target: 0,
  catatan: '',
})

const form = ref(defaultForm())
const required = (val) => !!val || 'Field wajib diisi'

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'material', align: 'left', label: 'Material', field: 'nama_material', sortable: true },
  { name: 'tim', align: 'left', label: 'Tim Produksi', field: 'tim_produksi', sortable: true },
  { name: 'tahapan', align: 'left', label: 'Tahapan Aktif', field: 'tahapan_fabrikasi', sortable: true },
  { name: 'progress', align: 'left', label: 'Progress', field: 'progress', sortable: true },
  { name: 'status_pekerjaan', align: 'center', label: 'Status', field: 'status_pekerjaan', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const materialOptions = computed(() =>
  masterMaterials.value.map((item) => ({
    label: `${item.kode_material ? `${item.kode_material} - ` : ''}${item.nama_material}`,
    value: item.id,
    item,
  })),
)

const tahapanOptions = computed(() =>
  masterTahapan.value.map((item) => ({
    label: `${item.urutan ? `${item.urutan}. ` : ''}${item.nama_tahapan}`,
    value: item.id,
    item,
  })),
)

const timOptions = computed(() =>
  masterTim.value.map((item) => ({
    label: `${item.nama}${item.jabatan ? ` - ${item.jabatan}` : ''}`,
    value: item.id,
    item,
  })),
)

const selectedMaterial = computed(
  () => materialOptions.value.find((option) => option.value === form.value.material_id)?.item,
)
const selectedTahapan = computed(
  () => tahapanOptions.value.find((option) => option.value === form.value.tahapan_fabrikasi_id)?.item,
)
const selectedTim = computed(
  () => timOptions.value.find((option) => option.value === form.value.tim_produksi_id)?.item,
)

const dialogTitle = computed(() => (editingId.value ? 'Edit SPK Fabrikasi' : 'Buat SPK Fabrikasi'))

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_pekerjaan === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_material,
        row.kode_material,
        row.tim_produksi,
        row.tahapan_fabrikasi,
        row.status_pekerjaan,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesSearch
  })
})

const buildPayload = () => ({
  nomor_spk: form.value.nomor_spk,
  material_id: form.value.material_id,
  kode_material: selectedMaterial.value?.kode_material || form.value.kode_material || '',
  nama_material: selectedMaterial.value?.nama_material || form.value.nama_material || '',
  satuan: selectedMaterial.value?.satuan || form.value.satuan || '',
  tim_produksi_id: form.value.tim_produksi_id,
  tim_produksi: selectedTim.value?.nama || form.value.tim_produksi || '',
  jabatan_tim: selectedTim.value?.jabatan || form.value.jabatan_tim || '',
  area_kerja: selectedTim.value?.area_kerja || form.value.area_kerja || '',
  tahapan_fabrikasi_id: form.value.tahapan_fabrikasi_id,
  tahapan_fabrikasi: selectedTahapan.value?.nama_tahapan || form.value.tahapan_fabrikasi || '',
  urutan_tahapan: Number(selectedTahapan.value?.urutan || form.value.urutan_tahapan || 0),
  deadline: form.value.deadline,
  status_pekerjaan: form.value.status_pekerjaan,
  progress: Math.min(Math.max(Number(form.value.progress || 0), 0), 100),
  qty_target: Number(form.value.qty_target || 0),
  catatan: form.value.catatan,
  workflow: ['Quotation Approved', 'SPK Fabrikasi', 'Routing Tahapan', 'Produksi', 'QC', 'Finished'],
  updated_at: serverTimestamp(),
})

const openDialog = (row = null) => {
  editingId.value = row?.id || null
  form.value = row
    ? {
        ...defaultForm(),
        ...row,
        progress: Number(row.progress || 0),
        qty_target: Number(row.qty_target || 0),
      }
    : defaultForm()
  dialogOpen.value = true
}

const saveSpk = async () => {
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'SPK fabrikasi berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'SPK fabrikasi berhasil dibuat' })
    }
    dialogOpen.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan SPK fabrikasi' })
  } finally {
    saving.value = false
  }
}

const loadSpk = () => {
  loading.value = true
  if (unsubscribeRows) unsubscribeRows()
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((spkDoc) => ({ id: spkDoc.id, ...spkDoc.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat SPK fabrikasi' })
    },
  )
}

const loadMasterData = () => {
  loadingMasterMaterial.value = true
  loadingMasterTahapan.value = true
  loadingMasterTim.value = true
  unsubscribeMaterials = onSnapshot(
    query(collection(db, 'master_material'), orderBy('nama_material', 'asc')),
    (snapshot) => {
      masterMaterials.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterMaterial.value = false
    },
  )
  unsubscribeTahapan = onSnapshot(
    query(collection(db, 'master_tahapan_fabrikasi'), orderBy('urutan', 'asc')),
    (snapshot) => {
      masterTahapan.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterTahapan.value = false
    },
  )
  unsubscribeTim = onSnapshot(
    query(collection(db, 'master_tim_produksi'), orderBy('nama', 'asc')),
    (snapshot) => {
      masterTim.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.status !== 'Nonaktif')
      loadingMasterTim.value = false
    },
  )
}

const statusColor = (status) => {
  const colors = {
    'Quotation Approved': 'blue-grey-7',
    'SPK Fabrikasi': 'green-10',
    'Routing Tahapan': 'deep-purple-6',
    Produksi: 'orange-9',
    QC: 'indigo-7',
    Finished: 'positive',
  }
  return colors[status] || 'grey-6'
}

const progressColor = (value) => {
  const progress = Number(value || 0)
  if (progress >= 100) return 'positive'
  if (progress >= 70) return 'green-10'
  if (progress >= 35) return 'orange-9'
  return 'blue-grey-6'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  loadSpk()
  loadMasterData()
})

onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeMaterials) unsubscribeMaterials()
  if (unsubscribeTahapan) unsubscribeTahapan()
  if (unsubscribeTim) unsubscribeTim()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.filter-card,
.table-card,
.spk-dialog {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.dialog-header {
  background: #1b5e20;
  color: white;
  padding: 16px 20px;
}

.spk-dialog {
  max-width: 95vw;
  width: 860px;
}

.table-head {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
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
  min-width: 112px;
}
</style>
