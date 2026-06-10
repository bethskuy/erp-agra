<template>
  <q-page class="jabatan-page font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
        <div class="text-h4 text-weight-bolder text-pink-7 font-pro">Master Jabatan 🏷️</div>
        <div class="text-subtitle2 text-pink-5">
          Kelola daftar jabatan dan role operasional perusahaan
        </div>
      </div>
      <q-btn
        color="pink-6"
        icon="add"
        label="Tambah Jabatan Baru 🧸"
        @click="openDialog()"
        unelevated
        class="cute-btn-pink q-px-lg font-pro"
      />
    </div>

    <!-- SEARCH & FILTER AREA -->
    <q-card flat class="cute-search-card q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari nama jabatan..."
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="pink-6" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space class="gt-sm" />
          <div class="text-caption text-pink-5 text-weight-bold q-pr-md">
            Total Kategori:
            <span class="text-weight-bold text-pink-7 font-pro" style="font-size: 15px;">{{ jabatanList.length }}</span> Role
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <div class="mac-card q-mb-lg">
      <div class="mac-header">
        <div class="dots-row">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="mac-title">🏷️ DATABASE JABATAN / ROLE 🏷️</div>
      </div>
      <q-table
        :rows="jabatanList"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
        binary-state-sort
        class="jabatan-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-blue-grey-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Row Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <q-td key="namaJabatan" :props="props">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="32px"
                  color="blue-1"
                  text-color="primary"
                  class="q-mr-md text-weight-bold"
                >
                  {{ props.row.namaJabatan?.charAt(0) }}
                </q-avatar>
                <div class="text-weight-bold text-blue-grey-9 text-subtitle1">
                  {{ props.row.namaJabatan }}
                </div>
              </div>
            </q-td>

            <q-td key="actions" :props="props" class="text-center">
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  icon="edit"
                  color="blue-8"
                  size="sm"
                  @click="editJabatan(props.row)"
                >
                  <q-tooltip>Ubah Nama Jabatan</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="deleteJabatan(props.row)"
                >
                  <q-tooltip>Hapus Jabatan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="layers_clear" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data jabatan belum tersedia</div>
          </div>
        </template>
      </q-table>
    </div>

    <!-- MODERN DIALOG FORM -->
    <q-dialog v-model="showDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 450px; max-width: 90vw" class="cute-dialog-card overflow-hidden">
        <q-card-section class="q-pa-none">
          <div class="mac-header row items-center justify-between no-wrap">
            <div class="dots-row col-auto">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="mac-title col text-center text-weight-bold text-pink-7">🏷️ {{ form.id ? 'Ubah' : 'Tambah' }} Jabatan</div>
            <q-btn icon="close" flat round dense v-close-popup color="pink-7" class="col-auto bg-pink-1" size="sm" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveJabatan" class="q-gutter-y-lg">
            <div class="text-subtitle2 text-grey-7">
              Silakan masukkan nama kategori jabatan yang baru untuk sistem AGRA ERP.
            </div>

            <q-input
              outlined
              v-model="form.namaJabatan"
              label="Nama Jabatan / Role"
              placeholder="Contoh: Site Manager, Supervisor, dll."
              lazy-rules
              :rules="[(val) => !!val || 'Nama jabatan tidak boleh kosong']"
              class="text-weight-medium"
              autofocus
            >
              <template v-slot:prepend><q-icon name="work_outline" color="pink-6" /></template>
            </q-input>

            <div class="row justify-end q-mt-xl q-gutter-sm border-top-dashed q-pt-md">
              <q-btn label="Batalkan" flat color="pink-6" v-close-popup class="cute-btn-main font-pro" />
              <q-btn
                label="Simpan Jabatan ✨"
                type="submit"
                color="pink-6"
                unelevated
                :loading="loading"
                class="cute-btn-pink font-pro"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const jabatanList = ref([])
const showDialog = ref(false)
const filter = ref('')
const form = ref({ id: null, namaJabatan: '' })

const columns = [
  {
    name: 'namaJabatan',
    label: 'NAMA KATEGORI JABATAN',
    field: 'namaJabatan',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'AKSI PENGELOLAAN', field: 'actions', align: 'center' },
]

const openDialog = () => {
  form.value = { id: null, namaJabatan: '' }
  showDialog.value = true
}

const saveJabatan = async () => {
  loading.value = true
  try {
    if (form.value.id) {
      await updateDoc(doc(db, 'jabatan', form.value.id), {
        namaJabatan: form.value.namaJabatan,
        updated_at: new Date(),
      })
    } else {
      await addDoc(collection(db, 'jabatan'), {
        namaJabatan: form.value.namaJabatan,
        created_at: new Date(),
      })
    }
    $q.notify({
      type: 'positive',
      message: 'Data jabatan berhasil diperbarui!',
      position: 'top',
    })
    showDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Terjadi kesalahan: ' + e.message })
  } finally {
    loading.value = false
  }
}

const editJabatan = (data) => {
  form.value = { id: data.id, namaJabatan: data.namaJabatan }
  showDialog.value = true
}

const deleteJabatan = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus jabatan "${row.namaJabatan}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Hapus Sekarang', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'jabatan', row.id))
      $q.notify({
        color: 'info',
        message: 'Jabatan telah dihapus dari sistem',
        icon: 'delete',
      })
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus: ' + err.message })
    }
  })
}

onMounted(() => {
  onSnapshot(collection(db, 'jabatan'), (snapshot) => {
    jabatanList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');

.jabatan-page {
  padding: 16px;
  background-color: #ffe4e6; /* Cute pastel rose pink background */
  background-image: 
    radial-gradient(#ffd1dc 2px, transparent 2px), 
    radial-gradient(#ffd1dc 2px, transparent 2px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 600px) {
  .jabatan-page {
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .jabatan-page {
    padding: 32px 40px;
  }
}

.font-pro {
  font-family: 'Fredoka', sans-serif;
}

/* ==========================================
   CUTE SHADOWS, CARDS, BUBBLES
   ========================================== */
.cute-search-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 20px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-form-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-dialog-card {
  background: #ffffff;
  border: 3.5px solid #ffb7c5 !important;
  border-radius: 28px !important;
  box-shadow: 0 10px 0px #fecdd3 !important;
}

.border-top-dashed {
  border-top: 2px dashed #ffccd5;
}

/* ==========================================
   CUTE BUTTONS
   ========================================== */
.cute-btn-main {
  background-color: #fff1f2 !important;
  border: 2.5px solid #fda4af !important;
  border-radius: 50px !important;
  color: #db2777 !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ffe4e6 !important;
}
.cute-btn-main:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

.cute-btn-pink {
  background-color: #db2777 !important;
  border: 2.5px solid #be185d !important;
  border-radius: 50px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-pink:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ec4899 !important;
}
.cute-btn-pink:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

/* ==========================================
   MAC WINDOW SHELL CARDS
   ========================================== */
.mac-card {
  background: #ffffff;
  border: 3px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 10px 0px #fecdd3, 0 16px 30px rgba(225, 29, 72, 0.08) !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mac-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 0px #fecdd3, 0 20px 35px rgba(225, 29, 72, 0.12) !important;
}

.mac-header {
  background: #fff0f2;
  border-bottom: 3px solid #ffb7c5;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.dots-row {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid transparent;
}
.dot.red { background-color: #ff5f56; border-color: #e0443e; }
.dot.yellow { background-color: #ffbd2e; border-color: #dea123; }
.dot.green { background-color: #27c93f; border-color: #1aab29; }

.mac-title {
  width: 100%;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #db2777;
}

/* ==========================================
   TABLE CUSTOM STYLING
   ========================================== */
.jabatan-table {
  background-color: transparent !important;
}

.jabatan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff0f2 !important;
  color: #db2777 !important;
  font-family: 'Fredoka', sans-serif;
  font-weight: 800 !important;
  border-bottom: 3px solid #ffb7c5 !important;
}

.hover-bg:hover {
  background-color: rgba(219, 39, 119, 0.05) !important;
}

/* Inputs Scoped styling */
.jabatan-page :deep(.q-field--outlined .q-field__control) {
  border-radius: 14px;
  border-color: #ffb7c5;
  transition: all 0.2s ease;
}
.jabatan-page :deep(.q-field--outlined .q-field__control:hover) {
  border-color: #fda4af;
}
.jabatan-page :deep(.q-field--focused .q-field__control) {
  border-color: #db2777 !important;
  box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.15);
}

.jabatan-page :deep(.q-field__label) {
  color: #db2777;
  font-weight: 600;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
