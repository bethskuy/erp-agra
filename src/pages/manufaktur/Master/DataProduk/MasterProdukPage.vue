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
              label="Kembali ke Daftar Produk"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">{{ formPageTitle }}</div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs form-page-subtitle">
              Lengkapi referensi produk fabrikasi untuk SPK Produksi, planning, dan finished goods.
            </div>
          </div>
          <div class="col-12 col-sm-auto q-mt-md q-mt-sm-none">
            <q-chip color="green-10" text-color="white" icon="inventory" class="text-weight-bold">
              {{ selectedId ? 'EDIT MODE' : 'CREATE MODE' }}
            </q-chip>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveRow">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-xl-8">
              <q-card flat bordered class="enterprise-form-card">
              <q-card-section class="form-section-header">
                <div class="text-h6 text-weight-bold text-green-10">Informasi Produk</div>
                <div class="text-caption text-grey-7">
                  Data utama produk untuk pekerjaan fabrikasi custom dan item finished goods.
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.kode_produk"
                      outlined
                      label="Kode Produk"
                      :rules="[required]"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.nama_produk"
                      outlined
                      label="Nama Produk"
                      :rules="[required]"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.kategori_produk"
                      outlined
                      label="Kategori Produk"
                      :rules="[required]"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.jenis_fabrikasi"
                      outlined
                      label="Jenis Fabrikasi"
                      :rules="[required]"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="form.satuan" outlined label="Satuan" :rules="[required]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.number="form.estimasi_waktu"
                      outlined
                      type="number"
                      min="0"
                      label="Estimasi Waktu (hari)"
                      :rules="[(val) => Number(val) >= 0 || 'Estimasi waktu wajib valid']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
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
          </div>

            <div class="col-12 col-xl-4">
              <q-card flat bordered class="enterprise-form-card side-form-card">
              <q-card-section class="form-section-header">
                <div class="text-h6 text-weight-bold text-green-10">Foto Produk</div>
                <div class="text-caption text-grey-7">Preview referensi visual produk fabrikasi.</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pa-lg">
                <div class="column items-center q-gutter-md">
                  <q-avatar rounded size="220px" class="image-preview image-preview--large">
                    <q-img v-if="imagePreview" :src="imagePreview" :ratio="1" fit="cover" />
                    <q-icon v-else name="image" color="grey-5" size="64px" />
                  </q-avatar>
                  <q-file
                    v-model="fotoFile"
                    outlined
                    accept="image/*"
                    label="Upload Foto Produk"
                    clearable
                    max-file-size="3145728"
                    class="full-width"
                    @update:model-value="handleFotoChange"
                    @rejected="notify('negative', 'Ukuran foto maksimal 3 MB.')"
                  >
                    <template #prepend>
                      <q-icon name="photo_camera" color="green-10" />
                    </template>
                  </q-file>
                </div>
              </q-card-section>
            </q-card>
            </div>
          </div>

          <q-card flat bordered class="form-action-bar q-mt-lg">
            <q-card-section class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps @click="closeFormPage" />
              <q-btn
                unelevated
                label="Simpan Produk"
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
        <div class="text-h4 text-weight-bolder text-green-10">Master Produk</div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Referensi produk fabrikasi untuk SPK Produksi, planning, dan finished goods.
        </div>
      </div>

      <q-btn
        unelevated
        rounded
        color="green-10"
        icon="add"
        label="Tambah Produk"
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
              placeholder="Cari kode, nama produk, kategori, jenis fabrikasi, atau satuan..."
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
              {{ filteredRows.length }} PRODUK
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

        <template #body-cell-foto_produk="props">
          <q-td :props="props">
            <q-avatar rounded size="48px" class="product-thumb">
              <q-img
                v-if="props.row.foto_produk"
                :src="props.row.foto_produk"
                :ratio="1"
                fit="cover"
              />
              <q-icon v-else name="image" color="grey-5" size="24px" />
            </q-avatar>
          </q-td>
        </template>

        <template #body-cell-nama_produk="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
          </q-td>
        </template>

        <template #body-cell-estimasi_waktu="props">
          <q-td :props="props">
            {{ props.row.estimasi_waktu ? `${props.row.estimasi_waktu} hari` : '-' }}
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
              <q-tooltip>Edit produk</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Hapus produk</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada data produk.
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
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from 'src/boot/firebase'

const COLLECTION_NAME = 'master_produk'
const WORKSPACE_BODY_CLASS = 'manufacturing-master-form-workspace'

const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('Semua')
const formPageOpen = ref(false)
const selectedId = ref(null)
const fotoFile = ref(null)
const imagePreview = ref('')
let objectPreviewUrl = null
let unsubscribeRows = null

const emptyForm = () => ({
  kode_produk: '',
  nama_produk: '',
  kategori_produk: '',
  jenis_fabrikasi: '',
  satuan: '',
  estimasi_waktu: 0,
  status: 'Aktif',
  foto_produk: '',
})

const form = ref(emptyForm())
const statusOptions = ['Aktif', 'Nonaktif']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const columns = [
  { name: 'foto_produk', label: 'Foto', field: 'foto_produk', align: 'center' },
  { name: 'nama_produk', label: 'Produk', field: 'nama_produk', align: 'left', sortable: true },
  {
    name: 'kategori_produk',
    label: 'Kategori',
    field: 'kategori_produk',
    align: 'left',
    sortable: true,
  },
  {
    name: 'jenis_fabrikasi',
    label: 'Jenis Fabrikasi',
    field: 'jenis_fabrikasi',
    align: 'left',
    sortable: true,
  },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left', sortable: true },
  {
    name: 'estimasi_waktu',
    label: 'Estimasi',
    field: 'estimasi_waktu',
    align: 'right',
    sortable: true,
  },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const formPageTitle = computed(() => (selectedId.value ? 'Edit Master Produk' : 'Tambah Master Produk'))

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
        row.kode_produk,
        row.nama_produk,
        row.kategori_produk,
        row.jenis_fabrikasi,
        row.satuan,
        row.estimasi_waktu,
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

const revokeObjectPreview = () => {
  if (objectPreviewUrl) {
    URL.revokeObjectURL(objectPreviewUrl)
    objectPreviewUrl = null
  }
}

const handleFotoChange = (file) => {
  revokeObjectPreview()
  if (file) {
    objectPreviewUrl = URL.createObjectURL(file)
    imagePreview.value = objectPreviewUrl
    return
  }
  imagePreview.value = form.value.foto_produk || ''
}

const openFormPage = (row = null) => {
  revokeObjectPreview()
  selectedId.value = row?.id || null
  form.value = row ? { ...emptyForm(), ...row } : emptyForm()
  fotoFile.value = null
  imagePreview.value = form.value.foto_produk || ''
  formPageOpen.value = true
}

const closeFormPage = () => {
  revokeObjectPreview()
  formPageOpen.value = false
  selectedId.value = null
  fotoFile.value = null
  imagePreview.value = ''
  form.value = emptyForm()
}

const uploadFotoProduk = async () => {
  if (!fotoFile.value) return form.value.foto_produk || ''

  const extension = fotoFile.value.name?.split('.').pop() || 'jpg'
  const cleanCode = form.value.kode_produk?.replace(/[^a-zA-Z0-9-_]/g, '-') || 'produk'
  const path = `manufaktur/master/produk/photos/${Date.now()}_${cleanCode}.${extension}`
  const fileRef = storageRef(storage, path)
  const snapshot = await uploadBytes(fileRef, fotoFile.value)
  return getDownloadURL(snapshot.ref)
}

const payloadFromForm = () => ({
  kode_produk: form.value.kode_produk,
  nama_produk: form.value.nama_produk,
  kategori_produk: form.value.kategori_produk,
  jenis_fabrikasi: form.value.jenis_fabrikasi,
  satuan: form.value.satuan,
  estimasi_waktu: Number(form.value.estimasi_waktu || 0),
  status: form.value.status,
  foto_produk: form.value.foto_produk || '',
})

const saveRow = async () => {
  saving.value = true
  try {
    const fotoProdukUrl = await uploadFotoProduk()
    form.value.foto_produk = fotoProdukUrl
    const payload = payloadFromForm()
    if (selectedId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedId.value), {
        ...payload,
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Produk berhasil diperbarui.')
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      notify('positive', 'Produk berhasil ditambahkan.')
    }
    fotoFile.value = null
    revokeObjectPreview()
    imagePreview.value = fotoProdukUrl
    closeFormPage()
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan produk.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Produk',
    message: `Hapus produk ${row.nama_produk || row.kode_produk}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      notify('positive', 'Produk berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus produk.')
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
      notify('negative', 'Gagal memuat data produk.')
    },
  )
})

onUnmounted(() => {
  document.body.classList.remove(WORKSPACE_BODY_CLASS)
  revokeObjectPreview()
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

.side-form-card {
  position: sticky;
  top: 88px;
}

.form-section-header {
  background: #f8fbf8;
  padding: 18px 24px;
}

.status-chip {
  min-width: 72px;
  justify-content: center;
}

.product-thumb,
.image-preview {
  background: #eef4ef;
  border: 1px solid #dfe8df;
}

.image-upload-panel {
  background: #f8fbf8;
  border: 1px dashed #b8d2bc;
  border-radius: 8px;
  padding: 14px;
}

.image-preview--large {
  width: min(220px, 100%);
  height: min(220px, 60vw);
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

@media (max-width: 1263px) {
  .side-form-card {
    position: static;
  }
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
