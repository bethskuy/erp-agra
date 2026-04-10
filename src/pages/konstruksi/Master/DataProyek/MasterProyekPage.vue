<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Proyek</div>
        <div class="text-caption text-grey-7">
          Daftar seluruh database proyek konstruksi Agra ERP.
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
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
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
            >
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn flat round color="blue" icon="edit" size="sm" @click="openEditDialog(props.row)">
              <q-tooltip>Edit Data</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusProyek(props.row)"
            >
              <q-tooltip>Hapus Data</q-tooltip>
            </q-btn>
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
          <q-toolbar-title class="text-weight-bold">
            {{ isEditMode ? 'Edit Proyek' : 'Tambah Proyek' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-card-section class="q-pa-lg scroll" style="max-height: 85vh">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Nomor</div>
                <q-input
                  outlined
                  dense
                  v-model="form.nomor"
                  placeholder="Generate otomatis"
                  bg-color="white"
                  :readonly="isEditMode"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Nama Proyek</div>
                <q-input outlined dense v-model="form.nama" bg-color="white" />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Konsumen</div>
                <q-select
                  outlined
                  dense
                  v-model="form.konsumen"
                  :options="optionsKonsumen"
                  label="- Pilih Kustomer -"
                  bg-color="white"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">Kategori</div>
                <q-select
                  outlined
                  dense
                  v-model="form.kategori"
                  :options="['Perumahan', 'Ruko', 'Gedung']"
                  label="Pilih Kategori"
                  bg-color="white"
                />
              </div>

              <div>
                <div class="text-subtitle2 q-mb-xs">No. HP</div>
                <q-input outlined dense v-model="form.no_hp" bg-color="white" />
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-subtitle2 q-mb-xs">Luas Tanah (m2)</div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model="form.luas_tanah"
                    bg-color="white"
                  />
                </div>
                <div class="col-6">
                  <div class="text-subtitle2 q-mb-xs">Luas Bangunan (m2)</div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model="form.luas_building"
                    bg-color="white"
                  />
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-md">
              <div>
                <div class="text-subtitle2 q-mb-xs">Provinsi</div>
                <q-select
                  outlined
                  dense
                  v-model="form.provinsi"
                  :options="['DKI Jakarta', 'Jawa Barat']"
                  label="Pilih Provinsi"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Kota</div>
                <q-select
                  outlined
                  dense
                  v-model="form.kota"
                  :options="['Jakarta Selatan', 'Bandung']"
                  label="Pilih Kota"
                  bg-color="white"
                />
              </div>
              <div>
                <div class="text-subtitle2 q-mb-xs">Alamat</div>
                <q-input
                  outlined
                  dense
                  v-model="form.alamat"
                  type="textarea"
                  rows="3"
                  bg-color="white"
                />
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-subtitle2 q-mb-xs">Tanggal Mulai</div>
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
                  <div class="text-subtitle2 q-mb-xs">Tanggal Berakhir</div>
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

        <q-separator />

        <q-card-actions align="right" class="bg-white q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="isEditMode ? 'Simpan Perubahan' : 'Simpan Data'"
            color="primary"
            class="q-px-lg"
            @click="simpanProyek"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const filter = ref('')
const showAddDialog = ref(false)
const isEditMode = ref(false)
const durasiText = ref('0 hari (0 minggu 0 hari)')

const formDefault = {
  id: null,
  nomor: '',
  nama: '',
  konsumen: null,
  kategori: null,
  no_hp: '',
  luas_tanah: '',
  luas_building: '',
  deskripsi: '',
  provinsi: null,
  kota: null,
  kecamatan: null,
  kelurahan: null,
  alamat: '',
  isSubParent: false,
  parent: null,
  tgl_mulai: '',
  tgl_akhir: '',
  status: 'Aktif',
}

const form = ref({ ...formDefault })
const optionsKonsumen = ['PT. Maju Bersama', 'CV. Agra Jaya', 'Dodi Kurniawan']

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA PROYEK', field: 'nama', sortable: true },
  { name: 'lokasi', align: 'left', label: 'LOKASI', field: 'lokasi' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  { id: 1, kode: 'PRJ-001', nama: 'Pembangunan Ruko Agra', lokasi: 'Jakarta', status: 'Aktif' },
  { id: 2, kode: 'PRJ-002', nama: 'Cluster Agra Green', lokasi: 'Depok', status: 'Aktif' },
])

// --- LOGIKA FUNGSI ---

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showAddDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  // Isi form dengan data dari baris tabel
  form.value = {
    ...formDefault,
    ...data,
    nomor: data.kode, // Karena di tabel kolomnya 'kode', di form 'nomor'
  }
  showAddDialog.value = true
  hitungDurasi()
}

const hapusProyek = (data) => {
  $q.dialog({
    title: 'Konfirmasi',
    message: `Yakin ingin menghapus proyek ${data.nama}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    rows.value = rows.value.filter((row) => row.id !== data.id)
    $q.notify({ color: 'positive', message: 'Data berhasil dihapus' })
  })
}

const hitungDurasi = () => {
  if (form.value.tgl_mulai && form.value.tgl_akhir) {
    const start = new Date(form.value.tgl_mulai)
    const end = new Date(form.value.tgl_akhir)
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(diffDays / 7)
    durasiText.value = `${diffDays} hari (${weeks} minggu ${diffDays % 7} hari)`
  } else {
    durasiText.value = '0 hari (0 minggu 0 hari)'
  }
}

const simpanProyek = () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Proyek wajib diisi!' })
    return
  }

  if (isEditMode.value) {
    // Cari index data yang mau di-update
    const index = rows.value.findIndex((r) => r.id === form.value.id)
    if (index !== -1) {
      rows.value[index] = {
        ...rows.value[index],
        nama: form.value.nama,
        lokasi: form.value.kota || rows.value[index].lokasi,
      }
    }
    $q.notify({ color: 'blue', message: 'Perubahan berhasil disimpan!' })
  } else {
    // Tambah data baru
    rows.value.unshift({
      id: Date.now(),
      kode: form.value.nomor || 'AUTO',
      nama: form.value.nama,
      lokasi: form.value.kota || 'N/A',
      status: 'Aktif',
    })
    $q.notify({ color: 'positive', message: 'Proyek baru berhasil ditambah!' })
  }

  showAddDialog.value = false
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.text-subtitle2 {
  font-size: 13px;
  color: #444;
  font-weight: 600;
}
</style>
