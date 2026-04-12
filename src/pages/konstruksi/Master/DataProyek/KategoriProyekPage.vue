<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Kategori Proyek</div>
        <div class="text-caption text-grey-7">Master Data - Cloud Firestore</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Kategori"
          no-caps
          class="btn-radius"
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
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari...">
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
              @click="hapusKategori(props.row)"
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
            {{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none">
          <div class="row justify-center q-pt-xl q-px-md">
            <div class="col-12 col-md-8 col-lg-6 q-gutter-y-lg">
              <div>
                <div class="label-req">Nama Kategori <span class="text-negative">*</span></div>
                <q-input
                  outlined
                  dense
                  v-model="form.nama"
                  placeholder="Contoh: Infrastruktur, Perumahan, Sipil..."
                  bg-color="white"
                  autofocus
                />
              </div>

              <div>
                <div class="label-req">Keterangan / Deskripsi</div>
                <q-input
                  outlined
                  dense
                  v-model="form.keterangan"
                  type="textarea"
                  rows="6"
                  placeholder="Berikan penjelasan singkat mengenai kategori ini..."
                  bg-color="white"
                />
              </div>

              <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md">
                <template v-slot:avatar>
                  <q-icon name="info" color="blue-9" />
                </template>
                Kategori ini akan muncul sebagai pilihan saat membuat "Data Proyek" baru.
              </q-banner>

              <div class="row items-center justify-end q-gutter-x-md q-pt-lg q-pb-xl">
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
                  :loading="submitting"
                  @click="simpanKategori"
                  class="q-px-xl btn-radius text-weight-bold shadow-2"
                  no-caps
                />
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
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(false)
const submitting = ref(false)

const formDefault = { nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const fetchKategori = async () => {
  if (!db) return
  loading.value = true
  try {
    const q = query(collection(db, 'kategori_proyek'), orderBy('nama', 'asc'))
    const querySnapshot = await getDocs(q)
    rows.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchKategori)

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...data }
  showDialog.value = true
}

const simpanKategori = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama harus diisi' })
    return
  }
  submitting.value = true
  try {
    if (isEditMode.value) {
      await updateDoc(doc(db, 'kategori_proyek', form.value.id), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        updatedAt: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'kategori_proyek'), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        createdAt: serverTimestamp(),
      })
    }
    showDialog.value = false
    fetchKategori()
    $q.notify({ color: 'positive', message: 'Berhasil!' })
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const hapusKategori = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Hapus kategori ${data.nama}?`,
    cancel: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'kategori_proyek', data.id))
      fetchKategori()
    } catch (e) {
      console.error(e)
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
</style>
