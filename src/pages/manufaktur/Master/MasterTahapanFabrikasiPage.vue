<template>
  <q-page
    class="master-produksi-page q-pa-md q-pa-lg-lg"
    :class="{ 'form-workspace-page': formPageOpen }"
  >
    <template v-if="formPageOpen">
      <div class="enterprise-workspace-shell">
        <div class="form-page-header row items-start justify-between q-mb-lg">
          <div class="col">
            <q-btn
              flat
              dense
              color="green-10"
              icon="arrow_back"
              label="Kembali ke Daftar Tahapan"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">{{ formPageTitle }}</div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs form-page-subtitle">
              Atur urutan tahapan kerja workshop untuk routing fabrikasi berbasis proyek.
            </div>
          </div>
          <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none">
            <q-chip
              color="green-10"
              text-color="white"
              icon="precision_manufacturing"
              class="text-weight-bold"
            >
              {{ selectedId ? 'EDIT MODE' : 'CREATE MODE' }}
            </q-chip>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveRow">
          <q-card flat bordered class="enterprise-form-card">
            <q-card-section class="form-section-header">
              <div class="text-h6 text-weight-bold text-green-10">Informasi Tahapan Fabrikasi</div>
              <div class="text-caption text-grey-7">
                Data tahapan menjadi referensi routing, SPK Produksi, dan monitoring pekerjaan.
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.kode_tahapan"
                    outlined
                    label="Kode Tahapan"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.nama_tahapan"
                    outlined
                    label="Nama Tahapan"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model.number="form.urutan"
                    outlined
                    type="number"
                    min="1"
                    label="Urutan"
                    :rules="[(val) => Number(val) > 0 || 'Urutan wajib lebih dari 0']"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.estimasi_waktu"
                    outlined
                    label="Estimasi Waktu"
                    hint="Contoh: 4 jam, 1 hari"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-select
                    v-model="form.status"
                    :options="statusOptions"
                    outlined
                    label="Status"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <div class="qc-toggle-panel row items-center full-height">
                    <q-toggle
                      v-model="form.qc_required"
                      color="green-10"
                      label="QC wajib pada tahapan ini"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="form-action-bar q-mt-lg">
            <q-card-section class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps @click="closeFormPage" />
              <q-btn
                unelevated
                label="Simpan Tahapan"
                color="green-10"
                icon="save"
                no-caps
                type="submit"
                :loading="saving"
              />
            </q-card-section>
          </q-card>
        </q-form>
      </div>
    </template>

    <template v-else>
    <div class="page-header row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-green-10">Master Tahapan Fabrikasi</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Urutan tahapan kerja workshop untuk pekerjaan fabrikasi berbasis proyek.
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Tahapan"
        no-caps
        class="q-mt-md q-mt-md-none"
        @click="openFormPage()"
      />
    </div>

    <q-card flat bordered class="filter-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari kode tahapan, nama tahapan, urutan, atau estimasi..."
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
              {{ filteredRows.length }} TAHAPAN
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card">
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
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
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

        <template #body-cell-qc_required="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              :color="props.row.qc_required ? 'orange-8' : 'grey-6'"
              text-color="white"
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

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn flat round dense color="green-10" icon="edit" @click="openFormPage(props.row)">
              <q-tooltip>Edit tahapan</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus tahapan</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="precision_manufacturing" size="28px" class="q-mr-sm" />
            Belum ada data tahapan fabrikasi.
          </div>
        </template>
      </q-table>
    </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'master_tahapan_fabrikasi'
const WORKSPACE_BODY_CLASS = 'manufacturing-master-form-workspace'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('Semua')
const formPageOpen = ref(false)
const selectedId = ref(null)
let unsubscribeRows = null

const emptyForm = () => ({
  kode_tahapan: '',
  nama_tahapan: '',
  urutan: 1,
  estimasi_waktu: '',
  qc_required: false,
  status: 'Aktif',
})

const form = ref(emptyForm())
const statusOptions = ['Aktif', 'Nonaktif']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const columns = [
  { name: 'nama_tahapan', label: 'Tahapan', field: 'nama_tahapan', align: 'left', sortable: true },
  { name: 'urutan', label: 'Urutan', field: 'urutan', align: 'right', sortable: true },
  { name: 'estimasi_waktu', label: 'Estimasi Waktu', field: 'estimasi_waktu', align: 'left', sortable: true },
  { name: 'qc_required', label: 'QC', field: 'qc_required', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const formPageTitle = computed(() =>
  selectedId.value ? 'Edit Tahapan Fabrikasi' : 'Tambah Tahapan Fabrikasi',
)

watch(formPageOpen, (isOpen) => {
  document.body.classList.toggle(WORKSPACE_BODY_CLASS, isOpen)
})

const filteredRows = computed(() => {
  const term = search.value.toLowerCase().trim()
  return rows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'Semua' || row.status === statusFilter.value
    const matchesSearch =
      !term ||
      [
        row.kode_tahapan,
        row.nama_tahapan,
        row.urutan,
        row.estimasi_waktu,
        row.qc_required ? 'wajib qc' : 'opsional',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)

    return matchesStatus && matchesSearch
  })
})

const notify = (type, message) => {
  $q.notify({
    type,
    message,
    position: 'top-right',
    timeout: 2200,
  })
}

const openFormPage = (row = null) => {
  selectedId.value = row?.id || null
  form.value = row ? { ...emptyForm(), ...row } : emptyForm()
  formPageOpen.value = true
}

const closeFormPage = () => {
  formPageOpen.value = false
  selectedId.value = null
  form.value = emptyForm()
}

const payloadFromForm = () => ({
  kode_tahapan: form.value.kode_tahapan,
  nama_tahapan: form.value.nama_tahapan,
  urutan: Number(form.value.urutan || 1),
  estimasi_waktu: form.value.estimasi_waktu,
  qc_required: Boolean(form.value.qc_required),
  status: form.value.status,
})

const saveRow = async () => {
  saving.value = true
  try {
    const payload = payloadFromForm()
    if (selectedId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedId.value), {
        ...payload,
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Tahapan fabrikasi berhasil diperbarui.')
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Tahapan fabrikasi berhasil ditambahkan.')
    }
    closeFormPage()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan tahapan fabrikasi.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Tahapan Fabrikasi',
    message: `Hapus tahapan ${row.nama_tahapan || row.kode_tahapan}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      notify('positive', 'Tahapan fabrikasi berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus tahapan fabrikasi.')
    }
  })
}

onMounted(() => {
  loading.value = true
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      notify('negative', 'Gagal memuat data tahapan fabrikasi.')
    },
  )
})

onUnmounted(() => {
  document.body.classList.remove(WORKSPACE_BODY_CLASS)
  if (unsubscribeRows) unsubscribeRows()
})
</script>

<style scoped>
.master-produksi-page {
  background: #f4f7f5;
  min-height: 100%;
}

.form-workspace-page {
  min-height: calc(100vh - 66px);
  padding: 24px 32px 32px !important;
}

.enterprise-workspace-shell {
  width: min(100%, 1680px);
  margin: 0 auto;
}

.form-page-header {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  padding: 22px 24px;
}

.form-page-subtitle {
  max-width: 920px;
}

.enterprise-form-shell {
  width: 100%;
}

.filter-card,
.table-card,
.enterprise-form-card,
.form-action-bar {
  border-radius: 8px;
  border-color: #dfe8df;
}

.enterprise-form-card,
.form-action-bar {
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(15, 60, 45, 0.06);
}

.form-section-header {
  background: #f8fbf8;
  padding: 18px 24px;
}

.qc-toggle-panel {
  min-height: 56px;
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  padding: 0 14px;
}

.status-chip {
  min-width: 78px;
  justify-content: center;
}

:global(body.manufacturing-master-form-workspace .app-layout--manufacture .sidebar-drawer),
:global(body.manufacturing-master-form-workspace .app-layout--manufacture .q-drawer),
:global(body.manufacturing-master-form-workspace .app-layout--manufacture .q-drawer__backdrop) {
  display: none !important;
}

:global(body.manufacturing-master-form-workspace .app-layout--manufacture .q-page-container) {
  padding-left: 0 !important;
  margin-left: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
}

:global(body.manufacturing-master-form-workspace .app-layout--manufacture .q-header) {
  left: 0 !important;
  width: 100vw !important;
}

@media (max-width: 700px) {
  .form-workspace-page {
    padding: 16px !important;
  }

  .form-page-header {
    padding: 18px;
  }
}
</style>
