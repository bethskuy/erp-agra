<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Kategori Proyek</div>
        <div class="text-caption text-grey-7">
          Master Data - Kelola pengelompokan jenis proyek PT AGRA.
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Kategori"
          class="btn-radius shadow-2"
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
        class="customer-table"
        @row-click="onRowClick"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari kategori...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
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
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-primary text-white q-py-md">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-center uppercase text-bold"
            >Detail Kategori Proyek</q-toolbar-title
          >
          <q-btn flat label="Tutup" v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center" v-if="currentCategory">
            <div class="col-12 col-md-8 col-lg-6">
              <q-card
                flat
                bordered
                class="q-pa-xl q-mb-md bg-white shadow-1 text-center rounded-borders"
              >
                <q-avatar
                  size="100px"
                  color="blue-1"
                  text-color="primary"
                  icon="category"
                  class="q-mb-md"
                />
                <div class="text-h3 text-weight-bolder text-primary uppercase q-mb-sm">
                  {{ currentCategory.nama }}
                </div>
                <div class="text-grey-7 italic">ID: {{ currentCategory.id }}</div>
              </q-card>

              <q-card flat bordered class="bg-white q-pa-lg rounded-borders shadow-1">
                <div class="text-bold text-primary q-mb-md uppercase">Deskripsi Kategori</div>
                <q-separator q-mb-md />
                <div class="bg-grey-1 q-pa-lg rounded-borders bordered" style="min-height: 200px">
                  <div
                    class="text-body1 text-grey-9"
                    style="white-space: pre-wrap; line-height: 1.6"
                  >
                    {{
                      currentCategory.keterangan ||
                      'Tidak ada deskripsi tambahan untuk kategori ini.'
                    }}
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered-bottom">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase">
            {{ isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </q-toolbar-title>
          <div style="width: 48px"></div>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6 q-gutter-y-lg">
              <div>
                <div class="label-req">Nama Kategori <span class="text-negative">*</span></div>
                <q-input
                  outlined
                  dense
                  v-model="form.nama"
                  placeholder="Contoh: Infrastruktur, Sipil, dll"
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
                  placeholder="Berikan deskripsi kategori..."
                  bg-color="white"
                />
              </div>

              <div class="row items-center justify-end q-gutter-x-md q-pt-lg">
                <q-btn flat label="Batal" color="grey-7" v-close-popup class="btn-radius q-px-lg" />
                <q-btn
                  unelevated
                  color="primary"
                  label="Simpan Kategori"
                  :loading="submitting"
                  @click="simpanKategori"
                  class="btn-radius q-px-xl shadow-2"
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
import { db } from 'src/boot/firebase'
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

const $q = useQuasar()
const filter = ref('')
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const currentCategory = ref(null)

const formDefault = { nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  {
    name: 'keterangan',
    align: 'left',
    label: 'KETERANGAN',
    field: 'keterangan',
    format: (val) => (val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '-'),
  },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const onRowClick = (evt, row) => {
  currentCategory.value = row
  showDetail.value = true
}

const fetchKategori = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'kategori_proyek'), orderBy('nama', 'asc'))
    const snap = await getDocs(q)
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
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
  if (!form.value.nama) return
  submitting.value = true
  try {
    const payload = {
      nama: form.value.nama,
      keterangan: form.value.keterangan || '',
      updatedAt: serverTimestamp(),
    }
    if (isEditMode.value) {
      await updateDoc(doc(db, 'kategori_proyek', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'kategori_proyek'), payload)
    }
    showDialog.value = false
    fetchKategori()
    $q.notify({ color: 'positive', message: 'Kategori Berhasil Disimpan' })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const hapusKategori = (data) => {
  $q.dialog({
    title: 'Hapus',
    message: `Hapus kategori ${data.nama}?`,
    cancel: true,
    ok: { color: 'negative' },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'kategori_proyek', data.id))
    fetchKategori()
  })
}
</script>

<style scoped>
.label-req {
  font-size: 11px;
  font-weight: 700;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.btn-radius {
  border-radius: 8px;
}
.rounded-borders {
  border-radius: 12px;
}
.bordered-bottom {
  border-bottom: 1px solid #eee;
}
.customer-table :deep(tbody tr) {
  cursor: pointer;
}
.customer-table :deep(tbody tr:hover) {
  background-color: #f0f4f8 !important;
}
</style>
