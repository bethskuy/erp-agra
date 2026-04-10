<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Konsumen</div>
        <div class="text-caption text-grey-7">Kelola database pelanggan dan dokumen legalitas.</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Konsumen"
          no-caps
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1 text-grey-9">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari konsumen...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
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
              @click="confirmHapus(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="fade" transition-hide="fade">
      <q-card style="width: 1100px; max-width: 95vw; border-radius: 4px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-grey-8">
            {{ isEditMode ? 'Edit Konsumen' : 'Tambah Konsumen' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-md" />

        <q-card-section class="q-pa-md scroll" style="max-height: 80vh">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6 q-gutter-y-lg">
              <div>
                <q-badge
                  color="blue-grey-3"
                  class="q-pa-sm q-mb-md text-subtitle2 text-weight-bold rounded-borders"
                  >Umum</q-badge
                >
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="label-req">Nama Konsumen <span class="text-negative">*</span></div>
                    <q-input
                      outlined
                      dense
                      v-model="form.nama"
                      placeholder="pt. XXXXXX"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req">Email <span class="text-negative">*</span></div>
                    <q-input
                      outlined
                      dense
                      v-model="form.email"
                      placeholder="ex@domain.com"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">No. HP</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.kontak"
                      placeholder="08XXXXXXXXXX"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">No. NPWP</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.npwp"
                      placeholder="NPWP ..."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">Provinsi</div>
                    <q-select
                      outlined
                      dense
                      v-model="form.provinsi"
                      :options="['Jawa Barat', 'Jakarta', 'Banten']"
                      label="- Pilih Provinsi -"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">Kota</div>
                    <q-select
                      outlined
                      dense
                      v-model="form.kota"
                      :options="['Bandung', 'Bekasi', 'Tangerang']"
                      label="Pilih Kota"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12">
                    <div class="label-req q-mt-sm">Area Bisnis</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.area_bisnis"
                      placeholder="Area of Business.."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12">
                    <div class="label-req q-mt-sm">Alamat</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.alamat"
                      type="textarea"
                      rows="2"
                      placeholder="address.."
                      bg-color="white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <q-badge
                  color="blue-grey-3"
                  class="q-pa-sm q-mb-md text-subtitle2 text-weight-bold rounded-borders"
                  >Penanggung Jawab</q-badge
                >
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="label-req">Nama</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.pj_nama"
                      placeholder="Pic Name..."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req">Email</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.pj_email"
                      placeholder="ex@domain.com"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">No. HP</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.pj_hp"
                      placeholder="08XXXXXXXXXX"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mt-sm">No. NPWP</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.pj_npwp"
                      placeholder="NPWP..."
                      bg-color="white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-lg">
              <div>
                <q-badge
                  color="blue-grey-3"
                  class="q-pa-sm q-mb-md text-subtitle2 text-weight-bold rounded-borders"
                  >Bank</q-badge
                >
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="label-req">No. Rek Bank</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.bank_norek"
                      placeholder="XXXX XXXX XXXX XXXX"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req">Bank</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.bank_nama"
                      placeholder="bank name.."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12">
                    <div class="label-req q-mt-sm">Atas Nama Rekening</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.bank_atasnama"
                      placeholder="john doe..."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12">
                    <div class="label-req q-mt-sm">Cabang</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.bank_cabang"
                      placeholder="Bank Branch..."
                      bg-color="white"
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      outlined
                      dense
                      v-model="form.bank_info"
                      type="textarea"
                      rows="2"
                      placeholder="other info..."
                      class="q-mt-sm"
                      bg-color="white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <q-badge
                  color="blue-grey-3"
                  class="q-pa-sm q-mb-md text-subtitle2 text-weight-bold rounded-borders"
                  >Legalitas & Dokumen</q-badge
                >
                <q-separator class="q-mb-md" />
                <div class="q-gutter-y-md">
                  <div>
                    <div class="label-req">NPWP</div>
                    <q-file outlined dense v-model="file_npwp" label="Choose File">
                      <template v-slot:prepend><q-icon name="attach_file" /></template>
                    </q-file>
                    <div class="text-caption text-grey-6">Max File Size 2MB</div>
                  </div>
                  <div>
                    <div class="label-req">Dokumen K3</div>
                    <q-file outlined dense v-model="file_k3" label="Choose File">
                      <template v-slot:prepend><q-icon name="attach_file" /></template>
                    </q-file>
                    <div class="text-caption text-grey-6">Max File Size 2MB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
          <q-btn unelevated label="Tutup" color="negative" v-close-popup no-caps class="q-px-lg" />
          <q-btn
            unelevated
            label="Simpan"
            color="positive"
            @click="simpanKonsumen"
            no-caps
            class="q-px-lg"
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
const showDialog = ref(false)
const isEditMode = ref(false)

// File upload states
const file_npwp = ref(null)
const file_k3 = ref(null)

const formDefault = {
  id: null,
  nama: '',
  email: '',
  kontak: '',
  npwp: '',
  provinsi: null,
  kota: null,
  area_bisnis: '',
  alamat: '',
  pj_nama: '',
  pj_email: '',
  pj_hp: '',
  pj_npwp: '',
  bank_norek: '',
  bank_nama: '',
  bank_atasnama: '',
  bank_cabang: '',
  bank_info: '',
}

const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KONSUMEN', field: 'nama', sortable: true },
  { name: 'email', align: 'left', label: 'EMAIL', field: 'email' },
  { name: 'kontak', align: 'left', label: 'KONTAK', field: 'kontak' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    nama: 'PT. Agra Jaya Konstruksi',
    email: 'contact@agrajaya.com',
    kontak: '021555666',
    npwp: '01.234.567.8-000.000',
    provinsi: 'Jawa Barat',
    kota: 'Bandung',
    alamat: 'Kawasan Industri Agra Block C',
    pj_nama: 'Andi PIC',
    bank_nama: 'BCA',
    bank_norek: '8800992211',
  },
])

// --- BUKA DIALOG TAMBAH ---
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  file_npwp.value = null
  file_k3.value = null
  showDialog.value = true
}

// --- BUKA DIALOG EDIT ---
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

// --- SIMPAN ---
const simpanKonsumen = () => {
  if (!form.value.nama || !form.value.email) {
    $q.notify({ color: 'negative', message: 'Nama dan Email wajib diisi!', icon: 'warning' })
    return
  }

  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    if (idx !== -1) rows.value[idx] = { ...form.value }
    $q.notify({ color: 'positive', message: 'Data Konsumen berhasil diperbarui' })
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
    $q.notify({ color: 'positive', message: 'Data Konsumen berhasil ditambahkan' })
  }

  showDialog.value = false
}

// --- HAPUS ---
const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Data',
    message: `Hapus data konsumen <b>${row.nama}</b>?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== row.id)
    $q.notify({ color: 'positive', message: 'Data berhasil dihapus', icon: 'delete' })
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.label-req {
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 4px;
}
.scroll {
  overflow-y: auto;
}
</style>
