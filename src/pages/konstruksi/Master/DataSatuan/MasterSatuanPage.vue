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
    <div class="row items-center justify-between q-mb-xl content-relative no-print">
      <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
        <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
          Satuan Ukur (UoM)
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Konfigurasi Unit Material</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola parameter satuan ukuran untuk akurasi inventaris dan perhitungan teknis proyek
          secara real-time.
        </div>
      </div>

      <!-- RESPONSIVE BUTTONS AREA -->
      <div class="col-12 col-md-4">
        <div class="row justify-end">
          <div class="col-12 col-sm-auto" v-if="canAction('buat')">
            <q-btn
              color="brand-primary"
              icon="add_box"
              label="Tambah Satuan"
              unelevated
              rounded
              no-caps
              class="full-width q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
              @click="openAddDialog"
            />
          </div>
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
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari simbol atau keterangan satuan..."
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
          <div
            class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-right sm-text-left"
          >
            Total Unit:
            <span class="text-weight-bold text-brand-primary"
              >{{ rows.length }} Satuan Terdefinisi</span
            >
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
        class="satuan-table"
      >
        <!-- Custom Header Menggunakan Tosca -->
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
                  icon="straighten"
                  class="q-mr-md shadow-sm"
                />
                <div class="text-weight-bolder text-subtitle2 text-blue-grey-10">
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
                  <q-tooltip>Edit Satuan</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_sweep"
                  size="sm"
                  @click="confirmHapus(props.row)"
                >
                  <q-tooltip>Hapus Satuan</q-tooltip>
                </q-btn>
                <q-badge
                  v-if="!canAction('ubah') && !canAction('hapus')"
                  color="grey-2"
                  text-color="grey-6"
                  label="Akses Terbatas"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="format_list_bulleted" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Belum ada data satuan terdaftar</div>
          </div>
        </template>
      </q-table>
    </q-card>

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
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'EDIT SATUAN UKURAN' : 'TAMBAH SATUAN BARU' }}
          </q-toolbar-title>

          <!-- Simpan Button untuk Desktop (gt-sm) -->
          <q-btn
            unelevated
            color="brand-primary"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3 gt-sm text-white"
            @click="simpanKeFirestore"
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
                  class="full-width q-py-sm text-weight-bold shadow-3 text-white"
                  @click="simpanKeFirestore"
                />
              </div>

              <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1 border-subtle">
                <!-- Header Tema Brand Light Teal -->
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center q-pa-sm rounded-borders bg-brand-light"
                >
                  <q-icon name="settings_input_component" class="q-mr-sm" /> KONFIGURASI PARAMETER
                </div>

                <div class="q-gutter-y-lg">
                  <div>
                    <div class="label-req font-bold">
                      Simbol / Nama Satuan <span class="text-negative">*</span>
                    </div>
                    <q-input
                      outlined
                      v-model="form.nama"
                      placeholder="Contoh: m3, Kg, Sack, Ls..."
                      bg-color="white"
                      autofocus
                      class="text-weight-bold text-h6"
                    />
                  </div>

                  <div>
                    <div class="label-req font-bold">Deskripsi Satuan</div>
                    <q-input
                      outlined
                      v-model="form.keterangan"
                      placeholder="Contoh: Meter Kubik, Kilogram, Lump Sum..."
                      bg-color="white"
                      hint="Penjelasan lengkap mengenai satuan ini"
                    />
                  </div>

                  <!-- Banner dengan Soft Teal -->
                  <q-banner
                    dense
                    class="rounded-borders q-pa-md q-mt-md bg-brand-light text-brand-secondary"
                  >
                    <template v-slot:avatar>
                      <q-icon name="help_outline" color="brand-primary" />
                    </template>
                    <div class="text-caption leading-relaxed">
                      Satuan ini akan muncul secara otomatis sebagai pilihan <b>Unit (UoM)</b> pada
                      saat Anda mengelola Data Barang, Master Pekerjaan, dan AHSP.
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
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
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

const rows = ref([])
const formDefault = { id: null, nama: '', keterangan: '' }
const form = ref({ ...formDefault })

let unsubscribeUser = null
let unsubscribeData = null

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
  // Cegah animasi muncul bila yang diklik adalah komponen interaktif
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
  { name: 'nama', align: 'left', label: 'SIMBOL / SATUAN', field: 'nama', sortable: true },
  {
    name: 'keterangan',
    align: 'left',
    label: 'KETERANGAN LENGKAP',
    field: 'keterangan',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'aksi' },
]

/**
 * LOGIKA SATPAM: Mengecek izin aksi granular
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_master_satuan'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

/**
 * SINKRONISASI REAL-TIME
 */
onMounted(() => {
  // 1. Pantau Hak Akses User
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }

  // 2. Pantau Data Satuan (Real-time List)
  const qData = query(collection(db, 'master_satuan'), orderBy('nama', 'asc'))
  unsubscribeData = onSnapshot(
    qData,
    (snapshot) => {
      rows.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Listen Error:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
  if (unsubscribeData) unsubscribeData()
})

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showDialog.value = true
}

const simpanKeFirestore = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Simbol satuan wajib diisi!', position: 'top' })
    return
  }

  submitting.value = true
  try {
    const dataPayload = {
      nama: form.value.nama,
      keterangan: form.value.keterangan || '',
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value) {
      const docRef = doc(db, 'master_satuan', form.value.id)
      await updateDoc(docRef, dataPayload)
    } else {
      dataPayload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_satuan'), dataPayload)
    }
    showDialog.value = false

    // NOTIFIKASI SIMPAN SATUAN BARU PREMIUM (HIJAU TOSCA DENGAN PROGRESS BAR & CLOSE BUTTON)
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Data konfigurasi unit material telah tersimpan di database.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (error) {
    console.error('Save Error:', error)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan sistem: ' + error.message })
  } finally {
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  // DIALOG KONFIRMASI PREMIUM (BATAL - OUTLINED GREY, YA, HAPUS - RED FILLED SHADOW)
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Apakah Anda yakin ingin menghapus satuan <b>${row.nama}</b>?<br/><span class="text-grey-7 text-caption block q-mt-xs">Tindakan ini dapat memengaruhi relasi data barang, AHSP, dan estimasi biaya.</span>`,
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
      await deleteDoc(doc(db, 'master_satuan', row.id))

      // NOTIFIKASI HAPUS PREMIUM (MERAH DENGAN PROGRESS BAR & CLOSE BUTTON)
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Satuan unit material telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      $q.notify({ color: 'negative', message: 'Gagal menghapus data' })
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

/* ===== ANIMASI BACKGROUND (FLOATING TEAL & WARNA PASTEL SEGAR) ===== */
.bg-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none; /* Supaya ikon di background tidak bisa di-klik */
}

.floating-icon {
  position: absolute;
  bottom: -150px;
  animation: floatUp infinite linear;
  filter: blur(1.5px); /* Kebureman tipis dan estetik sesuai contoh */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Posisi random & Menggunakan warna-warna tosca/teal brand yang segar */
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
    opacity: 0.15; /* Sesuai dengan setelan opacity di floating-icon */
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

/* CLICK SPAWN ICONS */
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

/* QUASAR COMPONENT OVERRIDES */
:deep(.q-btn.bg-brand-primary) {
  background-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
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
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.satuan-table :deep(thead tr th) {
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
