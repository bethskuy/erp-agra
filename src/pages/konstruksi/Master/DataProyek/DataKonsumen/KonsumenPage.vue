<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Konsumen</div>
        <div class="text-caption text-grey-7">
          Kelola database pelanggan dan dokumen legalitas (Cloud Firestore).
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Konsumen"
          no-caps
          class="btn-radius"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1 text-grey-9">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
        :loading="loading"
      >
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

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-white column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered">
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'Edit Data Konsumen' : 'Tambah Konsumen Baru' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none">
          <div class="row justify-center q-pt-xl q-px-md">
            <div class="col-12 col-md-10 col-lg-8">
              <div class="row q-col-gutter-xl">
                <div class="col-12 col-md-6 q-gutter-y-lg">
                  <div>
                    <div class="text-overline text-primary q-mb-sm">Informasi Umum</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <div class="label-req">
                          Nama Konsumen <span class="text-negative">*</span>
                        </div>
                        <q-input
                          outlined
                          dense
                          v-model="form.nama"
                          placeholder="PT. XXXXX"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Email <span class="text-negative">*</span></div>
                        <q-input
                          outlined
                          dense
                          v-model="form.email"
                          placeholder="email@domain.com"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">No. HP</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.kontak"
                          placeholder="08xxxxxxxx"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12">
                        <div class="label-req">No. NPWP</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.npwp"
                          placeholder="00.000.000.0-000.000"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Provinsi</div>
                        <q-select
                          outlined
                          dense
                          v-model="form.provinsi"
                          :options="['DKI Jakarta', 'Jawa Barat', 'Banten']"
                          label="- Pilih -"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Kota</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.kota"
                          placeholder="Nama Kota"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12">
                        <div class="label-req">Alamat Lengkap</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.alamat"
                          type="textarea"
                          rows="2"
                          bg-color="white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="text-overline text-primary q-mb-sm q-mt-md">Penanggung Jawab</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Nama PIC</div>
                        <q-input outlined dense v-model="form.pj_nama" bg-color="white" />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Email PIC</div>
                        <q-input outlined dense v-model="form.pj_email" bg-color="white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6 q-gutter-y-lg">
                  <div>
                    <div class="text-overline text-primary q-mb-sm">Informasi Perbankan</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <div class="label-req">No. Rekening</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.bank_norek"
                          placeholder="Nomor Rekening..."
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Nama Bank</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.bank_nama"
                          placeholder="BCA, Mandiri, dll"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="label-req">Atas Nama</div>
                        <q-input outlined dense v-model="form.bank_atasnama" bg-color="white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="text-overline text-primary q-mb-sm q-mt-md">
                      Legalitas & Dokumen
                    </div>
                    <div class="q-gutter-y-md">
                      <q-file outlined dense v-model="file_npwp" label="Upload NPWP">
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                      <q-file outlined dense v-model="file_k3" label="Upload Dokumen K3">
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                      </q-file>
                      <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md">
                        <template v-slot:avatar><q-icon name="info" /></template>
                        File disimpan secara lokal (Integrasi Firebase Storage segera).
                      </q-banner>
                    </div>
                  </div>

                  <div class="row items-center justify-end q-gutter-x-md q-pt-xl q-pb-xl">
                    <q-btn
                      flat
                      label="Batal"
                      color="grey-7"
                      v-close-popup
                      class="q-px-lg btn-radius"
                      no-caps
                    />
                    <q-btn
                      unelevated
                      color="primary"
                      label="Simpan Data"
                      :loading="loading"
                      @click="simpanKeFirestore"
                      class="q-px-xl btn-radius text-weight-bold shadow-2"
                      no-caps
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(false)

// File states
const file_npwp = ref(null)
const file_k3 = ref(null)

const formDefault = {
  nama: '',
  email: '',
  kontak: '',
  npwp: '',
  provinsi: null,
  kota: '',
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
const rows = ref([])

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KONSUMEN', field: 'nama', sortable: true },
  { name: 'email', align: 'left', label: 'EMAIL', field: 'email', sortable: true },
  { name: 'kontak', align: 'left', label: 'KONTAK', field: 'kontak' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const loadData = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'konsumen'), orderBy('nama', 'asc'))
    const snapshot = await getDocs(q)
    rows.value = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (error) {
    console.error('Fetch Error:', error)
    $q.notify({ color: 'negative', message: 'Gagal muat data cloud' })
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  file_npwp.value = null
  file_k3.value = null
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showDialog.value = true
}

const simpanKeFirestore = async () => {
  if (!form.value.nama || !form.value.email) {
    $q.notify({ color: 'negative', message: 'Nama dan Email wajib diisi!' })
    return
  }

  loading.value = true
  try {
    if (isEditMode.value) {
      const docRef = doc(db, 'konsumen', form.value.id)
      const updateData = { ...form.value, updatedAt: serverTimestamp() }
      delete updateData.id
      await updateDoc(docRef, updateData)
      $q.notify({ color: 'positive', message: 'Data diperbarui' })
    } else {
      await addDoc(collection(db, 'konsumen'), {
        ...form.value,
        createdAt: serverTimestamp(),
      })
      $q.notify({ color: 'positive', message: 'Data disimpan ke cloud' })
    }
    showDialog.value = false
    loadData()
  } catch (error) {
    console.error('Save Error:', error)
    $q.notify({ color: 'negative', message: 'Gagal simpan' })
  } finally {
    loading.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Data',
    message: `Hapus <b>${row.nama}</b> dari database?`,
    html: true,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'konsumen', row.id))
      $q.notify({ color: 'positive', message: 'Terhapus' })
      loadData()
    } catch (error) {
      console.error('Delete Error:', error)
      $q.notify({ color: 'negative', message: 'Gagal hapus' })
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.label-req {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}
.bordered {
  border-bottom: 1px solid #ececec;
}
.btn-radius {
  border-radius: 6px;
}
.text-overline {
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 700;
  opacity: 0.8;
}
</style>
