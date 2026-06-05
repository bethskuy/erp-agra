<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper animate-fade">

      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md content-relative no-print">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Kategori Barang
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
              Klasifikasi & Pengelompokan
            </span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Kelola parameter pengelompokan material untuk mempermudah manajemen inventaris proyek.
          </div>
        </div>
      </div>

      <!-- SEARCH & SUMMARY CARD -->
      <q-card
        flat
        bordered
        class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative no-print"
      >
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari nama atau deskripsi kategori..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="brand-primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
              <div
                class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right"
              >
                Total Kategori:
                <span class="text-weight-bold text-brand-primary">{{ rows.length }} Grup</span>
              </div>

              <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                <q-btn
                  icon="add_box"
                  label="Tambah Kategori"
                  unelevated
                  rounded
                  no-caps
                  class="bg-brand-primary text-white full-width shadow-premium btn-hover text-weight-bold q-py-sm q-px-md"
                  @click="openAddDialog"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

    <!-- TABLE SECTION -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle content-relative"
    >
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="kategori-table"
      >
        <!-- Custom Header Menggunakan Teal -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-brand-primary text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-11 tracking-widest"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <q-td key="nama">
              <div class="row items-center no-wrap">
                <!-- Avatar Warna Warni Berdasarkan Nama -->
                <q-avatar
                  size="32px"
                  :style="{
                    backgroundColor: getAvatarColor(props.row.nama).bg,
                    color: getAvatarColor(props.row.nama).text,
                  }"
                  icon="folder"
                  class="q-mr-md shadow-sm"
                />
                <div class="text-weight-bold text-subtitle2 text-blue-grey-10 text-uppercase">
                  {{ props.row.nama }}
                </div>
              </div>
            </q-td>
            <q-td key="keterangan" class="text-grey-7">
              {{ props.row.keterangan || '-' }}
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  v-if="canAction('ubah')"
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Ubah Kategori</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_sweep"
                  size="sm"
                  @click="hapusKategori(props.row)"
                >
                  <q-tooltip>Hapus Kategori</q-tooltip>
                </q-btn>
                <q-badge
                  v-if="!canAction('ubah') && !canAction('hapus')"
                  color="grey-2"
                  text-color="grey-6"
                  label="No Access"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="low_priority" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Belum ada pengelompokan kategori</div>
          </div>
        </template>
      </q-table>
    </q-card>
    </div>

    <!-- FORM DIALOG (TAMBAH/EDIT) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap relative-position">


        <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 shrink content-relative">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'EDIT DATA KATEGORI' : 'TAMBAH KATEGORI BARU' }}
          </q-toolbar-title>

          <!-- Simpan Button untuk Desktop (gt-sm) -->
          <q-btn
            unelevated
            color="brand-primary"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3 gt-sm"
            @click="simpanKategori"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl content-relative">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <!-- Tombol Simpan untuk versi Mobile (Membentang Penuh) -->
              <div class="lt-md q-mb-md">
                <q-btn
                  unelevated
                  color="brand-primary"
                  label="SIMPAN DATA"
                  :loading="submitting"
                  rounded
                  class="full-width q-py-sm text-weight-bold shadow-3"
                  @click="simpanKategori"
                />
              </div>

              <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1 border-subtle">
                <!-- Header Tema Brand Light Teal -->
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center q-pa-sm rounded-borders bg-brand-light"
                >
                  <q-icon name="inventory" class="q-mr-sm" /> INFORMASI KATEGORI
                </div>

                <div class="q-gutter-y-lg">
                  <div>
                    <div class="label-req font-bold">
                      Nama Kategori Barang <span class="text-negative">*</span>
                    </div>
                    <q-input
                      outlined
                      v-model="form.nama"
                      placeholder="Contoh: Komsumtif, Material, Alat Berat..."
                      bg-color="white"
                      autofocus
                      class="text-weight-bold"
                    />
                  </div>

                  <div>
                    <div class="label-req font-bold">Keterangan / Deskripsi</div>
                    <q-input
                      outlined
                      v-model="form.keterangan"
                      type="textarea"
                      rows="4"
                      placeholder="Berikan penjelasan singkat mengenai kategori barang ini..."
                      bg-color="white"
                    />
                  </div>

                  <!-- Banner dengan Soft Teal -->
                  <q-banner
                    dense
                    class="rounded-borders q-pa-md q-mt-md bg-brand-light text-brand-secondary"
                  >
                    <template v-slot:avatar>
                      <q-icon name="info" color="brand-primary" />
                    </template>
                    <div class="text-caption leading-relaxed">
                      Kategori ini digunakan untuk mempermudah tim logistik dalam memfilter laporan
                      stok dan pengadaan barang proyek.
                    </div>
                  </q-banner>
                </div>
              </q-card>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(true)
const submitting = ref(false)
const userData = ref(null)
let unsubscribeUser = null

const formDefault = { nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])


// Fungsi Cerdas untuk mengacak warna Avatar berdasarkan Palet Pastel khas Teal Theme
const getAvatarColor = (name) => {
  if (!name) return { bg: '#e6f5f4', text: '#36ada3' }
  const colors = [
    { bg: '#e6f5f4', text: '#2a8b83' }, // Soft Teal
    { bg: '#FDF5D3', text: '#b39000' }, // Soft Yellow
    { bg: '#FCE1C6', text: '#c27d38' }, // Soft Peach
    { bg: '#C0DCF1', text: '#1565c0' }, // Soft Light Blue
    { bg: '#f3e5f5', text: '#7b1fa2' }, // Soft Purple
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'DESKRIPSI / KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'aksi' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_master_barang-kategori'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchKategori = async () => {
  if (!db) return
  loading.value = true
  try {
    const q = query(collection(db, 'kategori_barang'), orderBy('nama', 'asc'))
    const querySnapshot = await getDocs(q)
    rows.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal sinkron data cloud' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }
  fetchKategori()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})

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
    $q.notify({ color: 'negative', message: 'Nama kategori wajib diisi' })
    return
  }
  submitting.value = true
  try {
    if (isEditMode.value) {
      await updateDoc(doc(db, 'kategori_barang', form.value.id), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        updatedAt: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'kategori_barang'), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        createdAt: serverTimestamp(),
      })
    }
    showDialog.value = false
    fetchKategori()

    // NOTIFIKASI SIMPAN KATEGORI PREMIUM (HIJAU PREMIUM DENGAN PROGRESS BAR & CLOSE BUTTON)
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Data kategori barang telah tersimpan di database.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const hapusKategori = (data) => {
  // DIALOG KONFIRMASI PREMIUM SESUAI CONTOH KETIGA (BATAL - OUTLINED GREY, YA, HAPUS - RED FILLED SHADOW)
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Apakah Anda yakin ingin menghapus kategori <b>${data.nama}</b>?<br/><span class="text-grey-7 text-caption block q-mt-xs">Tindakan ini dapat memengaruhi relasi data barang.</span>`,
    html: true,
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      unelevated: true,
      class: 'q-px-lg text-weight-bold text-uppercase',
    },
    ok: {
      label: 'Ya, Hapus',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'kategori_barang', data.id))
      fetchKategori()

      // NOTIFIKASI HAPUS PREMIUM SESUAI CONTOH KEDUA (MERAH PREMIUM DENGAN PROGRESS BAR & CLOSE BUTTON)
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Kategori barang telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error(e)
    }
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.relative-position {
  position: relative;
}
.content-relative {
  position: relative;
  z-index: 1;
}

/* ===== GLOBAL THEME OVERRIDES (SAMA SEPERTI MASTER BARANG) ===== */
.bg-page {
  background-color: #f8fcfb;
}
.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #36ada3 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e6f5f4 !important; /* Soft Teal */
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important; /* Soft Teal border */
}

/* Page content wrapper */
.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* GRID TABLE HEADER TEAL */
.bg-gradient-table {
  background: linear-gradient(135deg, #36ada3 0%, #2a8b83 100%) !important;
}

.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.kategori-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.05);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: #e6f5f4 !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label-req {
  font-size: 13px;
  color: #444;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.block {
  display: block;
}
.leading-relaxed {
  line-height: 1.6;
}

/* Responsivitas untuk teks jumlah di HP */
@media (max-width: 599px) {
  .sm-text-left {
    text-align: left !important;
    margin-top: 8px;
  }
}
</style>
