<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- HEADER SECTION                             -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-orange-50 text-orange-6 q-mr-sm">
              <q-icon name="edit_calendar" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pusat Persetujuan Cuti & Izin
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            Kelola dan evaluasi permohonan ketidakhadiran karyawan dengan cepat dan efisien.
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TABEL 1: MENUNGGU PERSETUJUAN (PENDING)    -->
      <!-- ========================================== -->
      <div class="q-mb-md flex items-center">
        <q-icon name="pending_actions" color="orange-6" size="sm" class="q-mr-sm" />
        <span class="text-h6 text-weight-bold text-blue-grey-9 tracking-wide"
          >Menunggu Keputusan</span
        >
        <q-badge color="orange-6" class="q-ml-sm rounded-6 text-weight-bold shadow-1">{{
          pendingRows.length
        }}</q-badge>
      </div>

      <q-card flat class="bento-card bg-white overflow-hidden shadow-soft q-mb-xl">
        <q-table
          :rows="pendingRows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          class="premium-table"
          :pagination="{ rowsPerPage: 10 }"
          hide-bottom
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-orange-50">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-orange-9 uppercase letter-spacing-1"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <!-- Kolom Info Karyawan -->
              <q-td key="karyawan" class="text-left">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="42px"
                    :color="getRandomColor(props.row.nama_karyawan)"
                    text-color="white"
                    class="q-mr-md text-weight-bold shadow-1"
                  >
                    {{ getInitial(props.row.nama_karyawan) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bolder text-blue-grey-10 text-uppercase">
                      {{ props.row.nama_karyawan }}
                    </div>
                    <div class="text-caption text-blue-grey-5 font-mono text-weight-medium">
                      NIK: {{ getNik(props.row.nama_karyawan) }}
                    </div>
                  </div>
                </div>
              </q-td>

              <!-- Kolom Jenis Pengajuan -->
              <q-td key="jenis" class="text-center">
                <q-badge
                  outline
                  :color="getJenisColor(props.row.jenis_pengajuan)"
                  class="q-px-sm q-py-xs rounded-6 text-weight-bold bg-white"
                >
                  {{ props.row.jenis_pengajuan }}
                </q-badge>
              </q-td>

              <!-- Kolom Tanggal Pelaksanaan -->
              <q-td key="tanggal" class="text-center">
                <div class="text-weight-bold text-blue-grey-8">
                  {{ formatDate(props.row.tanggal_mulai) }}
                </div>
                <div v-if="props.row.tanggal_mulai !== props.row.tanggal_selesai">
                  <q-icon name="arrow_downward" color="grey-5" size="xs" class="q-my-xs" />
                  <div class="text-weight-bold text-blue-grey-8">
                    {{ formatDate(props.row.tanggal_selesai) }}
                  </div>
                </div>
              </q-td>

              <!-- Kolom Alasan & Lampiran (UI DIUPDATE SESUAI REFERENSI) -->
              <q-td key="alasan" class="text-left">
                <div
                  class="text-body2 text-blue-grey-9 text-weight-medium line-height-tight q-mb-sm"
                  style="max-width: 220px; white-space: normal"
                >
                  {{ props.row.alasan }}
                </div>

                <!-- Tombol Lampiran & Delegasi -->
                <div class="row q-gutter-x-sm items-center">
                  <!-- Jika Ada Lampiran -->
                  <q-btn
                    v-if="props.row.dokumen_url"
                    unelevated
                    color="blue-6"
                    label="Lihat Bukti"
                    icon="file_present"
                    class="rounded-6 text-weight-bold q-px-sm shadow-soft-primary transition-smooth hover-scale"
                    size="sm"
                    :href="props.row.dokumen_url"
                    target="_blank"
                  />
                  <!-- Jika Tidak Ada Lampiran -->
                  <q-btn
                    v-else
                    unelevated
                    color="grey-3"
                    text-color="grey-6"
                    label="Tanpa Bukti"
                    icon="description"
                    class="rounded-6 text-weight-bold q-px-sm"
                    size="sm"
                    disable
                  />

                  <q-badge
                    v-if="props.row.delegasi"
                    color="blue-50"
                    text-color="primary"
                    class="q-py-xs q-px-sm rounded-6 text-weight-bold"
                  >
                    <q-icon name="person_add" size="14px" class="q-mr-xs" />
                    {{ props.row.delegasi.split(' ')[0] }}
                  </q-badge>
                </div>
              </q-td>

              <!-- Kolom Aksi (UI DIUPDATE SESUAI REFERENSI IMAGE) -->
              <q-td key="aksi" class="text-center">
                <div class="row items-center justify-center no-wrap">
                  <!-- Tombol TERIMA Hijau (Gaya Tumpuk) -->
                  <q-btn
                    unelevated
                    color="green-6"
                    class="rounded-8 shadow-soft-positive transition-smooth hover-scale q-px-md q-py-xs"
                    @click="updateStatus(props.row.id, 'Approved')"
                  >
                    <div class="column items-center">
                      <q-icon name="check" size="24px" class="text-white text-weight-bolder" />
                      <span
                        class="text-white text-weight-bolder tracking-wide"
                        style="font-size: 11px"
                        >TERIMA</span
                      >
                    </div>
                  </q-btn>

                  <!-- Tombol X Merah Polos -->
                  <q-btn
                    flat
                    round
                    icon="close"
                    color="red-8"
                    size="18px"
                    class="q-ml-sm transition-smooth hover-scale text-weight-bolder"
                    @click="updateStatus(props.row.id, 'Rejected')"
                  >
                    <q-tooltip class="bg-negative text-weight-bold">Tolak Pengajuan</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="orange">
              <q-spinner-dots size="50px" color="orange" />
              <div class="text-orange q-mt-md text-weight-medium">
                Memuat antrean persetujuan...
              </div>
            </q-inner-loading>
          </template>

          <template v-slot:no-data>
            <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
              <q-icon size="4em" name="task_alt" class="q-mb-md opacity-50" color="green-4" />
              <div class="text-h6 text-weight-bold text-blue-grey-6">Semua Bersih!</div>
              <div class="text-caption">
                Tidak ada antrean cuti/izin yang menunggu persetujuan saat ini.
              </div>
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- ========================================== -->
      <!-- TABEL 2: SELESAI (APPROVED / REJECTED)     -->
      <!-- ========================================== -->
      <div class="q-mb-md q-mt-xl flex items-center">
        <q-icon name="history" color="blue-grey-5" size="sm" class="q-mr-sm" />
        <span class="text-h6 text-weight-bold text-blue-grey-8 tracking-wide"
          >Riwayat Keputusan</span
        >
      </div>

      <q-card flat class="bento-card bg-white overflow-hidden shadow-soft">
        <q-table
          :rows="completedRows"
          :columns="columnsHistory"
          row-key="id"
          flat
          :loading="loading"
          class="premium-table"
          :pagination="{ rowsPerPage: 5 }"
          :rows-per-page-options="[5, 10, 20, 0]"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-slate-50 border-bottom-light">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-blue-grey-6 uppercase letter-spacing-1"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <!-- Kolom Info Karyawan -->
              <q-td key="karyawan" class="text-left">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    :color="getRandomColor(props.row.nama_karyawan)"
                    text-color="white"
                    class="q-mr-md text-weight-bold shadow-1 opacity-80"
                  >
                    {{ getInitial(props.row.nama_karyawan) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-blue-grey-9 text-uppercase">
                      {{ props.row.nama_karyawan }}
                    </div>
                    <div class="text-caption text-blue-grey-4 font-mono">
                      NIK: {{ getNik(props.row.nama_karyawan) }}
                    </div>
                  </div>
                </div>
              </q-td>

              <!-- Kolom Jenis Pengajuan -->
              <q-td key="jenis" class="text-center">
                <div class="text-weight-bold text-blue-grey-7">{{ props.row.jenis_pengajuan }}</div>
              </q-td>

              <!-- Kolom Tanggal Pelaksanaan -->
              <q-td key="tanggal" class="text-center">
                <span class="font-mono text-blue-grey-8 text-weight-medium">{{
                  formatDate(props.row.tanggal_mulai)
                }}</span>
                <span
                  v-if="props.row.tanggal_mulai !== props.row.tanggal_selesai"
                  class="font-mono text-blue-grey-8 text-weight-medium"
                >
                  <q-icon name="arrow_forward" size="10px" class="q-mx-xs text-grey-5" />
                  {{ formatDate(props.row.tanggal_selesai) }}
                </span>
              </q-td>

              <!-- Kolom Status -->
              <q-td key="status" class="text-center">
                <q-badge
                  :color="props.row.status_approval === 'Approved' ? 'teal-5' : 'red-5'"
                  class="q-px-md q-py-sm text-weight-bold rounded-8 shadow-1"
                >
                  <q-icon
                    :name="props.row.status_approval === 'Approved' ? 'check_circle' : 'cancel'"
                    size="xs"
                    class="q-mr-xs"
                  />
                  {{ props.row.status_approval === 'Approved' ? 'DISETUJUI' : 'DITOLAK' }}
                </q-badge>
              </q-td>

              <!-- Kolom Aksi (Hanya Hapus Riwayat) -->
              <q-td key="aksi" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="blue-grey-3"
                  class="hover-text-negative transition-smooth"
                  @click="hapusData(props.row.id)"
                >
                  <q-tooltip class="bg-negative">Hapus Riwayat</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row items-center q-pa-xl justify-center text-blue-grey-4">
              <q-icon size="2em" name="history" class="q-mr-sm" />
              <div class="text-weight-medium">Belum ada riwayat persetujuan.</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(true)
const allData = ref([])
const karyawanMap = ref({})

// Custom Columns untuk Pending (Lebih Detail)
const columns = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL PELAKSANAAN', align: 'center', field: 'tanggal_mulai' },
  { name: 'alasan', label: 'ALASAN & LAMPIRAN', align: 'left', field: 'alasan' },
  { name: 'aksi', label: 'KEPUTUSAN', align: 'center', field: 'aksi' },
]

// Custom Columns untuk History (Lebih Ringkas)
const columnsHistory = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL PELAKSANAAN', align: 'center', field: 'tanggal_mulai' },
  { name: 'status', label: 'STATUS FINAL', align: 'center', field: 'status_approval' },
  { name: 'aksi', label: 'HAPUS', align: 'center', field: 'aksi' },
]

// Pisahkan Data (Pending vs Selesai)
const pendingRows = computed(() => {
  return allData.value.filter((d) => d.status_approval === 'Pending')
})

const completedRows = computed(() => {
  return allData.value.filter((d) => d.status_approval !== 'Pending')
})

// UI Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return date.formatDate(d, 'DD MMM YYYY')
}

const getInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const getRandomColor = (name) => {
  if (!name) return 'primary'
  const colors = [
    'blue-6',
    'teal-6',
    'indigo-5',
    'deep-purple-5',
    'cyan-7',
    'light-blue-7',
    'pink-6',
  ]
  const index = name.length % colors.length
  return colors[index]
}

const getJenisColor = (jenis) => {
  if (!jenis) return 'primary'
  const j = jenis.toLowerCase()
  if (j.includes('sakit')) return 'negative'
  if (j.includes('tahunan')) return 'info'
  if (j.includes('melahirkan')) return 'pink-5'
  return 'primary'
}

const getNik = (nama) => {
  if (!nama) return '-'
  return karyawanMap.value[nama.toUpperCase()] || 'Tidak Tersedia'
}

let unsubscribeData = null

// Load NIK dari Master Karyawan
const loadKaryawan = async () => {
  try {
    const snap = await getDocs(collection(db, 'karyawan'))
    snap.forEach((doc) => {
      const data = doc.data()
      if (data.nama) {
        karyawanMap.value[data.nama.toUpperCase()] = data.nik || 'Tidak Tersedia'
      }
    })
  } catch (error) {
    console.error('Gagal load NIK Karyawan', error)
  }
}

// Load Data Pengajuan Realtime
const loadDataRealtime = () => {
  const qData = query(collection(db, 'pengajuan'), orderBy('created_at', 'desc'))
  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      allData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Gagal fetch realtime pengajuan: ', err)
      loading.value = false
    },
  )
}

// AKSI ADMIN: SETUJUI / TOLAK
const updateStatus = (id, newStatus) => {
  const statusIndo = newStatus === 'Approved' ? 'Setujui' : 'Tolak'
  const statusColor = newStatus === 'Approved' ? 'positive' : 'negative'

  $q.dialog({
    title: 'Konfirmasi Keputusan',
    message: `Apakah Anda yakin ingin <b>${statusIndo}</b> pengajuan ketidakhadiran ini?`,
    html: true,
    persistent: true,
    ok: {
      color: statusColor,
      label: 'Ya, Lanjutkan',
      unelevated: true,
      class: 'rounded-8 text-weight-bold',
    },
    cancel: { flat: true, color: 'blue-grey-6', class: 'text-weight-bold' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show()
      await updateDoc(doc(db, 'pengajuan', id), {
        status_approval: newStatus,
      })
      $q.notify({
        color: 'positive',
        message: `Pengajuan berhasil diproses!`,
        icon: 'check_circle',
      })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal memproses pengajuan.' })
    } finally {
      $q.loading.hide()
    }
  })
}

// AKSI ADMIN: HAPUS RIWAYAT
const hapusData = (id) => {
  $q.dialog({
    title: 'Hapus Riwayat',
    message: 'Data yang dihapus tidak dapat dikembalikan. Lanjutkan?',
    persistent: true,
    ok: { flat: true, color: 'negative', label: 'Hapus Permanen' },
    cancel: { flat: true, color: 'blue-grey-6', label: 'Batal' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show()
      await deleteDoc(doc(db, 'pengajuan', id))
      $q.notify({ color: 'primary', message: 'Riwayat berhasil dibersihkan.', icon: 'delete' })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    } finally {
      $q.loading.hide()
    }
  })
}

onMounted(async () => {
  await loadKaryawan()
  loadDataRealtime()
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.tracking-wide {
  letter-spacing: 0.5px;
}
.line-height-tight {
  line-height: 1.2;
}
.line-height-normal {
  line-height: 1.4;
}
.uppercase {
  text-transform: uppercase;
}

.premium-container {
  max-width: 1400px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-80 {
  opacity: 0.8;
}

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-positive {
  box-shadow: 0 8px 24px -8px rgba(33, 186, 69, 0.5) !important;
}
.rounded-24 {
  border-radius: 24px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-6 {
  border-radius: 6px;
}
.rounded-4 {
  border-radius: 4px;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
}
.hover-scale:hover {
  transform: scale(1.08);
}
.hover-text-negative:hover {
  color: #f44336 !important;
}

/* APPLE-STYLE ICONS */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

/* TABLE STYLING: Premium */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}
</style>
