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
              label="Kembali ke Daftar QC Checklist"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">{{ formPageTitle }}</div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs form-page-subtitle">
              Kelola standar pengecekan kualitas untuk proses fabrikasi dan pekerjaan workshop.
            </div>
          </div>
          <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none">
            <q-chip color="green-10" text-color="white" icon="fact_check" class="text-weight-bold">
              {{ selectedId ? 'EDIT MODE' : 'CREATE MODE' }}
            </q-chip>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveRow">
          <q-card flat bordered class="enterprise-form-card">
            <q-card-section class="form-section-header">
              <div class="text-h6 text-weight-bold text-green-10">Informasi QC Checklist</div>
              <div class="text-caption text-grey-7">
                Checklist ini menjadi referensi pemeriksaan QC pada pekerjaan fabrikasi proyek.
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.kode_qc" outlined label="Kode QC" :rules="[required]" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.nama_pengecekan"
                    outlined
                    label="Nama Pengecekan"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model="form.parameter"
                    outlined
                    label="Parameter"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input v-model="form.toleransi" outlined label="Toleransi" />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-select
                    v-model="form.satuan_id"
                    :options="filteredSatuanOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    use-input
                    input-debounce="0"
                    option-label="label"
                    option-value="value"
                    label="Satuan"
                    :loading="loadingSatuan"
                    :rules="[required]"
                    @filter="filterSatuanOptions"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-select
                    v-model="form.departemen_id"
                    :options="filteredDepartemenOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    use-input
                    input-debounce="0"
                    option-label="label"
                    option-value="value"
                    label="Departemen Terkait"
                    :loading="loadingDepartemen"
                    :rules="[required]"
                    @filter="filterDepartemenOptions"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-select
                    v-model="form.kategori_id"
                    :options="filteredKategoriOptions"
                    outlined
                    dense
                    emit-value
                    map-options
                    use-input
                    input-debounce="0"
                    option-label="label"
                    option-value="value"
                    label="Kategori Produk"
                    :loading="loadingKategori"
                    :rules="[required]"
                    @filter="filterKategoriOptions"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-select
                    v-model="form.tipe_pemeriksaan"
                    :options="tipePemeriksaanOptions"
                    outlined
                    dense
                    label="Tipe Pemeriksaan"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-md-6 col-xl-4">
                  <q-input
                    v-model.number="form.urutan_checklist"
                    outlined
                    dense
                    type="number"
                    min="1"
                    label="Urutan Checklist"
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
                  <q-toggle
                    v-model="form.wajib_foto_reject"
                    color="green-10"
                    label="Wajib foto reject"
                    class="q-mt-sm"
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
                label="Simpan Checklist"
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
        <div class="text-h4 text-weight-bolder text-green-10">Master QC Checklist</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Standar pengecekan kualitas untuk pekerjaan fabrikasi dan workshop.
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Checklist"
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
              placeholder="Cari kode, nama pengecekan, parameter, toleransi, atau satuan..."
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
              {{ filteredRows.length }} CHECKLIST
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

        <template #body-cell-nama_pengecekan="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">
              {{ props.row.nama_pengecekan || '-' }}
            </div>
            <div class="text-caption text-grey-6">{{ props.row.kode_qc || '-' }}</div>
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

        <template #body-cell-satuan_id="props">
          <q-td :props="props">{{ optionLabelById(satuanOptions, props.row.satuan_id, props.row.satuan) }}</q-td>
        </template>

        <template #body-cell-departemen_id="props">
          <q-td :props="props">
            {{ optionLabelById(departemenOptions, props.row.departemen_id, props.row.departemen_terkait) }}
          </q-td>
        </template>

        <template #body-cell-kategori_id="props">
          <q-td :props="props">
            {{ optionLabelById(kategoriOptions, props.row.kategori_id, props.row.kategori_produk) }}
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn flat round dense color="green-10" icon="edit" @click="openFormPage(props.row)">
              <q-tooltip>Edit checklist</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus checklist</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="fact_check" size="28px" class="q-mr-sm" />
            Belum ada data QC checklist.
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

const COLLECTION_NAME = 'master_qc_checklist'
const SATUAN_COLLECTION = 'manufactur_master_satuan'
const DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const KATEGORI_COLLECTION = 'manufactur_master_kategori_barang'
const WORKSPACE_BODY_CLASS = 'manufacturing-master-form-workspace'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const loadingSatuan = ref(true)
const loadingDepartemen = ref(true)
const loadingKategori = ref(true)
const search = ref('')
const statusFilter = ref('Semua')
const formPageOpen = ref(false)
const selectedId = ref(null)
const satuanOptions = ref([])
const departemenOptions = ref([])
const kategoriOptions = ref([])
const filteredSatuanOptions = ref([])
const filteredDepartemenOptions = ref([])
const filteredKategoriOptions = ref([])
let unsubscribeRows = null
let unsubscribeSatuan = null
let unsubscribeDepartemen = null
let unsubscribeKategori = null

const emptyForm = () => ({
  kode_qc: '',
  nama_pengecekan: '',
  parameter: '',
  toleransi: '',
  satuan_id: '',
  departemen_id: '',
  kategori_id: '',
  tipe_pemeriksaan: 'Visual',
  wajib_foto_reject: false,
  urutan_checklist: null,
  status: 'Aktif',
})

const form = ref(emptyForm())
const statusOptions = ['Aktif', 'Nonaktif']
const tipePemeriksaanOptions = ['Visual', 'Dimensi', 'Fungsi', 'Safety', 'Finishing']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const columns = [
  { name: 'nama_pengecekan', label: 'Pengecekan', field: 'nama_pengecekan', align: 'left', sortable: true },
  { name: 'parameter', label: 'Parameter', field: 'parameter', align: 'left', sortable: true },
  { name: 'toleransi', label: 'Toleransi', field: 'toleransi', align: 'left', sortable: true },
  { name: 'satuan_id', label: 'Satuan', field: 'satuan_id', align: 'left', sortable: true },
  { name: 'departemen_id', label: 'Departemen', field: 'departemen_id', align: 'left', sortable: true },
  { name: 'kategori_id', label: 'Kategori Produk', field: 'kategori_id', align: 'left', sortable: true },
  { name: 'tipe_pemeriksaan', label: 'Tipe', field: 'tipe_pemeriksaan', align: 'left', sortable: true },
  { name: 'urutan_checklist', label: 'Urutan', field: 'urutan_checklist', align: 'right', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const formPageTitle = computed(() =>
  selectedId.value ? 'Edit QC Checklist' : 'Tambah QC Checklist',
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
        row.kode_qc,
        row.nama_pengecekan,
        row.parameter,
        row.toleransi,
        optionLabelById(satuanOptions.value, row.satuan_id, row.satuan),
        optionLabelById(departemenOptions.value, row.departemen_id, row.departemen_terkait),
        optionLabelById(kategoriOptions.value, row.kategori_id, row.kategori_produk),
        row.tipe_pemeriksaan,
      ]
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
  form.value = row
    ? {
        ...emptyForm(),
        ...row,
        satuan_id: row.satuan_id || findOptionValueByLabel(satuanOptions.value, row.satuan),
        departemen_id: row.departemen_id || findOptionValueByLabel(departemenOptions.value, row.departemen_terkait),
        kategori_id: row.kategori_id || findOptionValueByLabel(kategoriOptions.value, row.kategori_produk),
        wajib_foto_reject: !!row.wajib_foto_reject,
        urutan_checklist: row.urutan_checklist ?? null,
        tipe_pemeriksaan: row.tipe_pemeriksaan || 'Visual',
      }
    : emptyForm()
  formPageOpen.value = true
}

const closeFormPage = () => {
  formPageOpen.value = false
  selectedId.value = null
  form.value = emptyForm()
}

const payloadFromForm = () => ({
  kode_qc: form.value.kode_qc,
  nama_pengecekan: form.value.nama_pengecekan,
  parameter: form.value.parameter,
  toleransi: form.value.toleransi,
  satuan_id: form.value.satuan_id,
  departemen_id: form.value.departemen_id,
  kategori_id: form.value.kategori_id,
  tipe_pemeriksaan: form.value.tipe_pemeriksaan,
  wajib_foto_reject: !!form.value.wajib_foto_reject,
  urutan_checklist: Number(form.value.urutan_checklist || 0),
  status: form.value.status,
})

const optionLabelById = (options, value, fallback = '-') =>
  options.find((option) => option.value === value)?.label || fallback || '-'

const findOptionValueByLabel = (options, label) => {
  const normalized = String(label || '').trim().toLowerCase()
  if (!normalized) return ''
  return options.find((option) => option.label.toLowerCase() === normalized)?.value || ''
}

const filterOptionList = (allOptions, updateTarget) => (inputValue, update) => {
  update(() => {
    const needle = String(inputValue || '').trim().toLowerCase()
    updateTarget.value = !needle
      ? allOptions.value
      : allOptions.value.filter((option) => option.label.toLowerCase().includes(needle))
  })
}

const filterSatuanOptions = filterOptionList(satuanOptions, filteredSatuanOptions)
const filterDepartemenOptions = filterOptionList(departemenOptions, filteredDepartemenOptions)
const filterKategoriOptions = filterOptionList(kategoriOptions, filteredKategoriOptions)

const mapSatuanOption = (id, data) => ({
  label: data.nama || data.kode || id,
  value: id,
})

const mapDepartemenOption = (id, data) => ({
  label: data.nama_departemen || data.nama || id,
  value: id,
})

const mapKategoriOption = (id, data) => ({
  label: data.nama || data.nama_kategori || id,
  value: id,
})

const listenDropdownOptions = () => {
  unsubscribeSatuan = onSnapshot(
    query(collection(db, SATUAN_COLLECTION), orderBy('nama', 'asc')),
    (snapshot) => {
      satuanOptions.value = snapshot.docs.map((item) => mapSatuanOption(item.id, item.data()))
      filteredSatuanOptions.value = satuanOptions.value
      loadingSatuan.value = false
    },
    (error) => {
      console.error(error)
      loadingSatuan.value = false
      notify('negative', 'Gagal memuat satuan.')
    },
  )

  unsubscribeDepartemen = onSnapshot(
    query(collection(db, DEPARTEMEN_COLLECTION), orderBy('nama_departemen', 'asc')),
    (snapshot) => {
      departemenOptions.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.status !== 'Nonaktif')
        .map((item) => mapDepartemenOption(item.id, item))
      filteredDepartemenOptions.value = departemenOptions.value
      loadingDepartemen.value = false
    },
    (error) => {
      console.error(error)
      loadingDepartemen.value = false
      notify('negative', 'Gagal memuat departemen.')
    },
  )

  unsubscribeKategori = onSnapshot(
    query(collection(db, KATEGORI_COLLECTION), orderBy('nama', 'asc')),
    (snapshot) => {
      kategoriOptions.value = snapshot.docs.map((item) => mapKategoriOption(item.id, item.data()))
      filteredKategoriOptions.value = kategoriOptions.value
      loadingKategori.value = false
    },
    (error) => {
      console.error(error)
      loadingKategori.value = false
      notify('negative', 'Gagal memuat kategori produk.')
    },
  )
}

const saveRow = async () => {
  saving.value = true
  try {
    const payload = payloadFromForm()
    if (selectedId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedId.value), {
        ...payload,
        updated_at: serverTimestamp(),
      })
      notify('positive', 'QC checklist berhasil diperbarui.')
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      notify('positive', 'QC checklist berhasil ditambahkan.')
    }
    closeFormPage()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan QC checklist.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus QC Checklist',
    message: `Hapus checklist ${row.nama_pengecekan || row.kode_qc}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      notify('positive', 'QC checklist berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus QC checklist.')
    }
  })
}

onMounted(() => {
  loading.value = true
  listenDropdownOptions()
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      notify('negative', 'Gagal memuat data QC checklist.')
    },
  )
})

onUnmounted(() => {
  document.body.classList.remove(WORKSPACE_BODY_CLASS)
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeSatuan) unsubscribeSatuan()
  if (unsubscribeDepartemen) unsubscribeDepartemen()
  if (unsubscribeKategori) unsubscribeKategori()
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
