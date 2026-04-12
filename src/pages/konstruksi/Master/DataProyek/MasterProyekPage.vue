<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Proyek</div>
        <div class="text-caption text-grey-7">
          Daftar database proyek konstruksi (Cloud Firestore).
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Proyek"
          no-caps
          class="rounded-borders"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
        :loading="loading"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari proyek...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="props.value === 'Aktif' ? 'green' : 'orange-9'"
              class="q-px-sm text-weight-bold"
              >{{ props.value }}</q-badge
            >
          </q-td>
        </template>
        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusProyek(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="showAddDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-grey-9 q-py-sm bordered">
          <q-toolbar-title class="text-weight-bold">{{
            isEditMode ? 'Edit Proyek' : 'Tambah Proyek'
          }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-lg scroll" style="max-height: 85vh">
          <div class="row q-col-gutter-xl justify-center">
            <div class="col-12 col-md-5 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">
                  Nomor Proyek <span class="text-negative">*</span>
                </div>
                <q-input
                  outlined
                  dense
                  v-model="form.nomor"
                  placeholder="PRJ-001"
                  bg-color="white"
                  :readonly="isEditMode"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">
                  Nama Proyek <span class="text-negative">*</span>
                </div>
                <q-input outlined dense v-model="form.nama" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Konsumen</div>
                <q-select
                  outlined
                  dense
                  v-model="form.konsumen"
                  :options="optionsKonsumen"
                  label="- Pilih -"
                  bg-color="white"
                  emit-value
                  map-options
                >
                  <template v-slot:after>
                    <q-btn
                      round
                      dense
                      flat
                      color="primary"
                      icon="add_circle"
                      @click="quickAddKonsumen"
                    />
                  </template>
                </q-select>
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Kategori</div>
                <q-select
                  outlined
                  dense
                  v-model="form.kategori"
                  :options="optionsKategori"
                  label="- Pilih -"
                  bg-color="white"
                  emit-value
                  map-options
                >
                  <template v-slot:after>
                    <q-btn
                      round
                      dense
                      flat
                      color="primary"
                      icon="add_circle"
                      @click="quickAddKategori"
                    />
                  </template>
                </q-select>
              </div>
            </div>

            <div class="col-12 col-md-5 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Provinsi</div>
                <q-select
                  outlined
                  dense
                  v-model="selectedProvinsi"
                  :options="listProvinsi"
                  label="Pilih Provinsi"
                  bg-color="white"
                  option-label="name"
                  @update:model-value="onProvinsiChange"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Kota</div>
                <q-select
                  outlined
                  dense
                  v-model="selectedKota"
                  :options="listKota"
                  label="Pilih Kota"
                  bg-color="white"
                  option-label="name"
                  :disable="!selectedProvinsi"
                  @update:model-value="onKotaChange"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Alamat</div>
                <q-input
                  outlined
                  dense
                  v-model="form.alamat"
                  type="textarea"
                  rows="2"
                  bg-color="white"
                />
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-subtitle2 q-mb-xs">Mulai</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.tgl_mulai"
                    type="date"
                    bg-color="white"
                    @update:model-value="hitungDurasi"
                  />
                  <div class="text-caption text-orange text-weight-bold q-mt-xs">
                    Durasi: {{ durasiText }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-subtitle2 q-mb-xs">Selesai</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.tgl_akhir"
                    type="date"
                    bg-color="white"
                    @update:model-value="hitungDurasi"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            class="q-px-xl"
            :loading="submitting"
            @click="simpanProyek"
            :label="isEditMode ? 'Update' : 'Simpan'"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const loading = ref(false)
const submitting = ref(false)
const filter = ref('')
const showAddDialog = ref(false)
const isEditMode = ref(false)
const durasiText = ref('0 hari')

// State Wilayah
const listProvinsi = ref([])
const listKota = ref([])
const selectedProvinsi = ref(null)
const selectedKota = ref(null)

const formDefault = {
  nomor: '',
  nama: '',
  konsumen: null,
  kategori: null,
  provinsi: '',
  kota: '',
  alamat: '',
  tgl_mulai: '',
  tgl_akhir: '',
  status: 'Aktif',
}

const form = ref({ ...formDefault })
const rows = ref([])
const optionsKonsumen = ref([])
const optionsKategori = ref([])

const columns = [
  { name: 'kode', align: 'left', label: 'NOMOR', field: 'nomor', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA PROYEK', field: 'nama', sortable: true },
  { name: 'lokasi', align: 'left', label: 'KOTA', field: 'kota' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

// --- WILAYAH API ---
const fetchProvinsi = async () => {
  try {
    const res = await axios.get('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
    listProvinsi.value = res.data
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    console.error('Gagal ambil provinsi')
  }
}

const onProvinsiChange = async (val) => {
  selectedKota.value = null
  form.value.provinsi = val.name
  try {
    const res = await axios.get(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${val.id}.json`,
    )
    listKota.value = res.data
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    console.error('Gagal ambil kota')
  }
}

const onKotaChange = (val) => {
  form.value.kota = val.name
}

// --- MASTER DATA LINKS ---
const fetchReferences = async () => {
  try {
    const snapKonsumen = await getDocs(query(collection(db, 'konsumen'), orderBy('nama', 'asc')))
    optionsKonsumen.value = snapKonsumen.docs.map((d) => ({
      label: d.data().nama,
      value: d.data().nama,
    }))

    const snapKategori = await getDocs(
      query(collection(db, 'kategori_proyek'), orderBy('nama', 'asc')),
    )
    optionsKategori.value = snapKategori.docs.map((d) => d.data().nama)
  } catch (e) {
    console.error(e)
  }
}

const quickAddKonsumen = () => {
  $q.dialog({
    title: 'Tambah Konsumen Baru',
    message: 'Masukkan nama konsumen/perusahaan',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
    persistent: true,
  }).onOk(async (data) => {
    if (!data) return
    try {
      await addDoc(collection(db, 'konsumen'), {
        nama: data,
        email: '-',
        createdAt: serverTimestamp(),
      })
      await fetchReferences()
      form.value.konsumen = data
      $q.notify({ color: 'positive', message: 'Konsumen ditambahkan' })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal simpan' })
    }
  })
}

const quickAddKategori = () => {
  $q.dialog({
    title: 'Tambah Kategori Baru',
    message: 'Contoh: Infrastruktur, Gedung, dll',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
    persistent: true,
  }).onOk(async (data) => {
    if (!data) return
    try {
      await addDoc(collection(db, 'kategori_proyek'), { nama: data, createdAt: serverTimestamp() })
      await fetchReferences()
      form.value.kategori = data
      $q.notify({ color: 'positive', message: 'Kategori ditambahkan' })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal simpan' })
    }
  })
}

// --- CRUD PROYEK ---
const fetchProyek = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'proyek'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Gagal ambil data' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProyek()
  fetchReferences()
  fetchProvinsi()
})

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  selectedProvinsi.value = null
  selectedKota.value = null
  showAddDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...data }
  // Manual set label untuk provinsi/kota agar muncul di UI
  selectedProvinsi.value = { name: data.provinsi }
  selectedKota.value = { name: data.kota }
  showAddDialog.value = true
  hitungDurasi()
}

const hitungDurasi = () => {
  if (form.value.tgl_mulai && form.value.tgl_akhir) {
    const start = new Date(form.value.tgl_mulai)
    const end = new Date(form.value.tgl_akhir)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    durasiText.value = diff > 0 ? `${diff} hari` : '0 hari'
  }
}

const simpanProyek = async () => {
  if (!form.value.nama || !form.value.nomor) {
    $q.notify({ color: 'negative', message: 'Nomor dan Nama wajib diisi' })
    return
  }
  submitting.value = true
  try {
    const payload = { ...form.value, updatedAt: serverTimestamp() }
    if (isEditMode.value) {
      const docRef = doc(db, 'proyek', form.value.id)
      delete payload.id
      await updateDoc(docRef, payload)
    } else {
      await addDoc(collection(db, 'proyek'), { ...payload, createdAt: serverTimestamp() })
    }
    showAddDialog.value = false
    fetchProyek()
    $q.notify({ color: 'positive', message: 'Berhasil!' })
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Gagal simpan' })
  } finally {
    submitting.value = false
  }
}

const hapusProyek = (data) => {
  $q.dialog({ title: 'Hapus', message: `Hapus ${data.nama}?`, cancel: true }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'proyek', data.id))
      fetchProyek()
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal' })
    }
  })
}
</script>
