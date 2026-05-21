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
              label="Kembali ke Daftar Tim Produksi"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">{{ formPageTitle }}</div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs form-page-subtitle">
              Kelola personel workshop untuk pekerjaan fabrikasi berbasis proyek.
            </div>
          </div>
          <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none">
            <q-chip color="green-10" text-color="white" icon="groups" class="text-weight-bold">
              {{ selectedId ? 'EDIT MODE' : 'CREATE MODE' }}
            </q-chip>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveRow">
          <q-card flat bordered class="enterprise-form-card">
            <q-card-section class="form-section-header">
              <div class="text-h6 text-weight-bold text-green-10">Informasi Tim Produksi</div>
              <div class="text-caption text-grey-7">
                Data personel menjadi referensi assignment SPK Produksi dan monitoring pekerjaan.
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.nik" outlined label="NIK" :rules="[required]" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.nama" outlined label="Nama" :rules="[required]" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.jabatan" outlined label="Jabatan" :rules="[required]" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.skill" outlined label="Skill" :rules="[required]" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.area_kerja"
                    outlined
                    label="Area Kerja"
                    :rules="[required]"
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
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="form-action-bar q-mt-lg">
            <q-card-section class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps @click="closeFormPage" />
              <q-btn
                unelevated
                label="Simpan Tim Produksi"
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
        <div class="text-h4 text-weight-bolder text-green-10">Master Tim Produksi</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Data personel workshop untuk pekerjaan fabrikasi berbasis proyek.
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Tim"
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
              placeholder="Cari NIK, nama, jabatan, skill, atau area kerja..."
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
              {{ filteredRows.length }} PERSONEL
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

        <template #body-cell-nama="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.nik || '-' }}</div>
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
              <q-tooltip>Edit tim produksi</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus tim produksi</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="groups" size="28px" class="q-mr-sm" />
            Belum ada data tim produksi.
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

const COLLECTION_NAME = 'master_tim_produksi'
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
  nik: '',
  nama: '',
  jabatan: '',
  skill: '',
  area_kerja: '',
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
  { name: 'nama', label: 'Personel', field: 'nama', align: 'left', sortable: true },
  { name: 'jabatan', label: 'Jabatan', field: 'jabatan', align: 'left', sortable: true },
  { name: 'skill', label: 'Skill', field: 'skill', align: 'left', sortable: true },
  { name: 'area_kerja', label: 'Area Kerja', field: 'area_kerja', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const formPageTitle = computed(() =>
  selectedId.value ? 'Edit Tim Produksi' : 'Tambah Tim Produksi',
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
      [row.nik, row.nama, row.jabatan, row.skill, row.area_kerja]
        .join(' ')
        .toLowerCase()
        .includes(term)

    return matchesStatus && matchesSearch
  })
})

const notify = (type, message) => {
  $q.notify({ type, message, position: 'top-right', timeout: 2200 })
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
  nik: form.value.nik,
  nama: form.value.nama,
  jabatan: form.value.jabatan,
  skill: form.value.skill,
  area_kerja: form.value.area_kerja,
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
      notify('positive', 'Tim produksi berhasil diperbarui.')
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Tim produksi berhasil ditambahkan.')
    }
    closeFormPage()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan tim produksi.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Tim Produksi',
    message: `Hapus personel ${row.nama || row.nik}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      notify('positive', 'Tim produksi berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus tim produksi.')
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
      notify('negative', 'Gagal memuat data tim produksi.')
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

.status-chip {
  min-width: 72px;
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
