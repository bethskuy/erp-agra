<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro relative-position" @click="spawnIcon($event)">
    <!-- EFEK ANIMASI KLIK (SPAWN ICONS) -->
    <div class="click-spawn-container">
      <transition-group name="spawn">
        <div
          v-for="icon in spawnedIcons"
          :key="icon.id"
          class="spawned-icon"
          :style="{
            left: icon.x + 'px',
            top: icon.y + 'px',
            '--rand-rotate': icon.rotate + 'deg',
            '--rand-color': icon.color,
            fontSize: icon.size + 'px',
          }"
        >
          <q-icon :name="icon.name" />
        </div>
      </transition-group>
    </div>

    <!-- EFEK LATAR BELAKANG ANIMASI MENGAMBANG (Warna-Warni Tosca, Kebureman Tipis & Elegan Sesuai Contoh) -->
    <div class="bg-animation-container">
      <q-icon name="engineering" class="floating-icon i-1" />
      <q-icon name="construction" class="floating-icon i-2" />
      <q-icon name="architecture" class="floating-icon i-3" />
      <q-icon name="location_city" class="floating-icon i-4" />
      <q-icon name="handyman" class="floating-icon i-5" />
      <q-icon name="apartment" class="floating-icon i-6" />
      <q-icon name="engineering" class="floating-icon i-7" />
      <q-icon name="hardware" class="floating-icon i-8" />
    </div>

    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print content-relative">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
          Kategori Proyek
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Klasifikasi Portofolio Proyek</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola parameter pengelompokan jenis pekerjaan untuk mempermudah filter laporan secara
          real-time.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <!-- Tombol Tambah: Ditambahkan loading state jika data user belum siap -->
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="brand-primary"
          icon="add_circle_outline"
          label="Tambah Kategori"
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover btn-tambah-responsive text-white text-weight-bold"
          @click="openAddDialog"
          :loading="userDataLoading"
        />
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card
      flat
      bordered
      class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative border-subtle"
    >
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
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
          <q-space />
          <div class="col-12 col-md-auto text-caption text-grey-6">
            Total Grup:
            <span class="text-weight-bold text-brand-primary">{{ rows.length }} Kategori</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative border-subtle"
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
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-brand-primary text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="onRowClick(null, props.row)"
          >
            <q-td key="nama">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="32px"
                  color="brand-light"
                  text-color="brand-primary"
                  icon="category"
                  class="q-mr-md shadow-sm"
                />
                <div class="text-weight-bolder text-subtitle2 text-blue-grey-10 text-uppercase">
                  {{ props.row.nama }}
                </div>
              </div>
            </q-td>
            <q-td key="keterangan" class="text-grey-7 italic">
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
                  icon="delete_outline"
                  size="sm"
                  @click="hapusKategori(props.row)"
                >
                  <q-tooltip>Hapus</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-6"
                  icon="chevron_right"
                  size="sm"
                  @click="onRowClick(null, props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="folder_off" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data kategori belum tersedia</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- VIEW 2: DETAIL KATEGORI -->
    <q-dialog v-model="showDetail" maximized transition-show="fade" transition-hide="fade">
      <q-card class="bg-grey-2 column no-wrap relative-position">
        <!-- Background Animation di dalam Detail Dialog -->
        <div class="bg-animation-container">
          <q-icon name="engineering" class="floating-icon i-1" />
          <q-icon name="construction" class="floating-icon i-2" />
          <q-icon name="architecture" class="floating-icon i-3" />
          <q-icon name="location_city" class="floating-icon i-4" />
          <q-icon name="handyman" class="floating-icon i-5" />
          <q-icon name="apartment" class="floating-icon i-6" />
          <q-icon name="engineering" class="floating-icon i-7" />
          <q-icon name="hardware" class="floating-icon i-8" />
        </div>

        <q-toolbar class="bg-brand-primary text-white q-py-md shadow-2 shrink content-relative">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">DETAIL KATEGORI</q-toolbar-title>
          <q-btn
            flat
            icon="edit"
            label="Edit Data"
            @click="openEditFromDetail"
            v-if="canAction('ubah')"
            class="gt-xs"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl content-relative">
          <div class="row justify-center" v-if="currentCategory">
            <div class="col-12 col-md-10 col-lg-8">
              <q-card
                flat
                bordered
                class="rounded-20 shadow-premium q-mb-xl bg-white overflow-hidden border-brand-thin"
              >
                <div class="row items-center">
                  <div
                    class="col-12 col-md-4 bg-brand-light flex flex-center q-pa-xl"
                    style="min-height: 250px"
                  >
                    <q-avatar
                      size="150px"
                      color="brand-primary"
                      text-color="white"
                      class="shadow-10 border-white-5"
                    >
                      <q-icon name="category" size="80px" />
                    </q-avatar>
                  </div>
                  <div class="col-12 col-md-8 q-pa-xl">
                    <div class="text-overline text-brand-primary text-bold tracking-widest">
                      KATEGORI MASTER
                    </div>
                    <div class="text-h3 text-weight-black text-brand-primary q-mb-xs uppercase">
                      {{ currentCategory.nama }}
                    </div>
                    <div class="text-caption text-grey-6 flex items-center q-mt-md">
                      <q-icon name="fingerprint" class="q-mr-xs" /> ID Sistem:
                      {{ currentCategory.id }}
                    </div>
                  </div>
                </div>
              </q-card>

              <q-card
                flat
                bordered
                class="rounded-20 shadow-sm bg-white overflow-hidden border-brand-thin"
              >
                <q-card-section
                  class="bg-brand-light text-brand-secondary text-weight-bold uppercase letter-spacing-1"
                >
                  <q-icon name="notes" class="q-mr-sm" /> Deskripsi & Catatan
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-xl">
                  <div class="text-body1 text-grey-9 leading-relaxed" style="white-space: pre-wrap">
                    {{ currentCategory.keterangan || 'Tidak ada deskripsi tambahan.' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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
        <!-- Background Animation di dalam Form Dialog -->
        <div class="bg-animation-container">
          <q-icon name="engineering" class="floating-icon i-1" />
          <q-icon name="construction" class="floating-icon i-2" />
          <q-icon name="architecture" class="floating-icon i-3" />
          <q-icon name="location_city" class="floating-icon i-4" />
          <q-icon name="handyman" class="floating-icon i-5" />
          <q-icon name="apartment" class="floating-icon i-6" />
          <q-icon name="engineering" class="floating-icon i-7" />
          <q-icon name="hardware" class="floating-icon i-8" />
        </div>

        <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 shrink content-relative">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'PEMBARUAN DATA KATEGORI' : 'REGISTRASI KATEGORI BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="brand-primary"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3 text-white"
            @click="simpanKategori"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl content-relative">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1 border-brand-thin">
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
                >
                  <q-icon name="settings_suggest" class="q-mr-sm" /> KONFIGURASI PARAMETER
                </div>

                <div class="q-gutter-y-lg">
                  <div>
                    <div class="label-req">
                      Nama Kategori Proyek <span class="text-negative">*</span>
                    </div>
                    <q-input
                      outlined
                      v-model="form.nama"
                      placeholder="Contoh: Konstruksi Sipil, Infrastruktur..."
                      bg-color="white"
                      autofocus
                      class="text-weight-bold text-h6"
                      stack-label
                    />
                  </div>

                  <div>
                    <div class="label-req">Keterangan / Ruang Lingkup</div>
                    <q-input
                      outlined
                      v-model="form.keterangan"
                      type="textarea"
                      rows="6"
                      placeholder="Berikan penjelasan mengenai jenis proyek..."
                      bg-color="white"
                      stack-label
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const filter = ref('')
const loading = ref(true)
const userDataLoading = ref(true)
const submitting = ref(false)
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const currentCategory = ref(null)
const userData = ref(null)

const formDefault = { nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])

let unsubscribeUser = null
let unsubscribeKategori = null

// ==========================================
// ANIMASI KLIK & MENGAMBANG
// ==========================================
const spawnedIcons = ref([])
let spawnIdCounter = 0
const clickIcons = [
  'construction',
  'engineering',
  'handyman',
  'architecture',
  'foundation',
  'precision_manufacturing',
  'carpenter',
  'plumbing',
  'electrical_services',
  'hardware',
]

const spawnIcon = (e) => {
  const target = e.target
  if (
    target.closest('button') ||
    target.closest('.q-btn') ||
    target.closest('input') ||
    target.closest('.q-field') ||
    target.closest('.q-dialog') ||
    target.closest('.q-table') ||
    target.closest('.q-card')
  ) {
    return
  }

  const iconName = clickIcons[Math.floor(Math.random() * clickIcons.length)]
  const colors = ['#36ada3', '#2a8b83', '#56c2b9', '#f29c1f', '#e67e22', '#e74c3c']
  const randColor = colors[Math.floor(Math.random() * colors.length)]
  const randRotate = Math.floor(Math.random() * 90) - 45
  const randSize = Math.floor(Math.random() * 25) + 35

  const newIcon = {
    id: spawnIdCounter++,
    x: e.clientX,
    y: e.clientY,
    name: iconName,
    color: randColor,
    rotate: randRotate,
    size: randSize,
  }

  spawnedIcons.value.push(newIcon)

  setTimeout(() => {
    spawnedIcons.value = spawnedIcons.value.filter((i) => i.id !== newIcon.id)
  }, 1400)
}
// ==========================================

const columns = [
  { name: 'nama', align: 'left', label: 'IDENTITAS KATEGORI', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'PENJELASAN SINGKAT', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'id' },
]

/**
 * LOGIKA IZIN AKSES (SATPAM)
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_master_proyek-kategori'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const onRowClick = (evt, row) => {
  currentCategory.value = row
  showDetail.value = true
}

const fetchKategori = () => {
  loading.value = true
  const q = query(collection(db, 'kategori_proyek'), orderBy('nama', 'asc'))
  unsubscribeKategori = onSnapshot(
    q,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Fetch Kategori Error:', err)
      loading.value = false
    },
  )
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
      userDataLoading.value = false
    })
  } else {
    userDataLoading.value = false
  }
  fetchKategori()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
  if (unsubscribeKategori) unsubscribeKategori()
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

const openEditFromDetail = () => {
  form.value = JSON.parse(JSON.stringify(currentCategory.value))
  isEditMode.value = true
  showDetail.value = false
  showDialog.value = true
}

const simpanKategori = async () => {
  if (!form.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama kategori wajib diisi', position: 'top' })
    return
  }
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

    // NOTIFIKASI BERHASIL DISIMPAN PREMIUM (HIJAU PASTEL DENGAN PROGRESS BAR & CLOSE BUTTON)
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Kategori proyek berhasil diperbarui dan disinkronkan ke sistem.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (e) {
    console.error('Save Error:', e)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi data: ' + e.message })
  } finally {
    submitting.value = false
  }
}

const hapusKategori = (data) => {
  // DIALOG KONFIRMASI HAPUS PREMIUM (BATAL - OUTLINED GREY, YA, HAPUS - RED FILLED SHADOW)
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Apakah Anda yakin ingin menghapus kategori <b>${data.nama}</b>?<br/><span class="text-grey-7 text-caption block q-mt-xs">Tindakan ini bersifat permanen dan data tidak dapat dikembalikan lagi.</span>`,
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
      await deleteDoc(doc(db, 'kategori_proyek', data.id))

      // NOTIFIKASI HAPUS PREMIUM (MERAH DENGAN PROGRESS BAR & CLOSE BUTTON)
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Kategori proyek telah dihapus secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error('Delete Error:', e)
    }
  })
}
</script>

<style scoped>
.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15); /* Soft Teal accent */
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important; /* Soft Teal border */
}
.border-white-5 {
  border: 5px solid white;
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* RESPONSIVE TOMBOL HP MEMBENTANG */
@media (max-width: 599px) {
  .btn-tambah-responsive {
    width: 100% !important;
  }
}

/* OVERRIDE WARNA LAMA (INDIGO) MENJADI BRAND COLOR BARU (TEAL) */
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

.kategori-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.03) !important;
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
  font-size: 11px;
  font-weight: 700;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.leading-relaxed {
  line-height: 1.6;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.shrink {
  flex: 0 0 auto;
}
.content-relative {
  position: relative;
  z-index: 1;
}

/* ===== ANIMASI BACKGROUND (FLOATING TEAL DENGAN BLUR HALUS) ===== */
.bg-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  bottom: -150px;
  animation: floatUp linear infinite;
  opacity: 0.15;
  filter: blur(1.5px); /* Kebureman tipis dan lembut sesuai contoh */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Posisi dan durasi masing-masing ikon mengambang */
.i-1 {
  left: 10%;
  font-size: 100px;
  animation-duration: 25s;
  animation-delay: 0s;
  color: #36ada3;
}
.i-2 {
  left: 30%;
  font-size: 70px;
  animation-duration: 35s;
  animation-delay: 5s;
  color: #f29c1f;
}
.i-3 {
  left: 60%;
  font-size: 120px;
  animation-duration: 40s;
  animation-delay: 12s;
  color: #e74c3c;
}
.i-4 {
  left: 80%;
  font-size: 85px;
  animation-duration: 30s;
  animation-delay: 2s;
  color: #56c2b9;
}
.i-5 {
  left: 15%;
  font-size: 90px;
  animation-duration: 28s;
  animation-delay: 15s;
  color: #e67e22;
}
.i-6 {
  left: 45%;
  font-size: 110px;
  animation-duration: 45s;
  animation-delay: 8s;
  color: #2a8b83;
}
.i-7 {
  left: 75%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 20s;
  color: #f29c1f;
}
.i-8 {
  left: 25%;
  font-size: 95px;
  animation-duration: 32s;
  animation-delay: 25s;
  color: #e74c3c;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

/* ===== CLICK SPAWN ICONS (MEMANCAR REAKTIF) ===== */
.click-spawn-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.spawned-icon {
  position: absolute;
  color: var(--rand-color);
  transform-origin: center;
  pointer-events: none;
  animation: spawnBurst 1.4s ease-out forwards;
}

@keyframes spawnBurst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -100%) scale(1.2) rotate(var(--rand-rotate));
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -180%) scale(0.5) rotate(calc(var(--rand-rotate) * 1.5));
    opacity: 0;
  }
}

.spawn-enter-active,
.spawn-leave-active {
  transition: all 1.4s ease;
}
</style>
