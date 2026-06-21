<template>
  <q-page class="neo-page-bg q-pa-md q-pa-lg font-inter">
    <!-- Decorative Floating Neo-Brutalist Shapes -->
    <div class="neo-decorations-container">
      <div class="neo-shape neo-shape--circle-1"></div>
      <div class="neo-shape neo-shape--circle-2"></div>
      <div class="neo-shape neo-shape--square-1"></div>
      <div class="neo-shape neo-shape--square-2"></div>
      <div class="neo-shape neo-shape--star-1">★</div>
      <div class="neo-shape neo-shape--star-2">★</div>
      <div class="neo-shape neo-shape--triangle-1">▲</div>
      <div class="neo-shape neo-shape--triangle-2">▲</div>
      <div class="neo-shape neo-shape--cross-1">+</div>
      <div class="neo-shape neo-shape--cross-2">+</div>
      <div class="neo-shape neo-shape--cross-3">+</div>
      <div class="neo-shape neo-shape--blob-1"></div>
    </div>

    <div class="premium-container q-mx-auto">
      <!-- ========================================== -->
      <!-- HEADER SECTION                             -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl header-entrance">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-indigo-50 text-indigo-6 q-mr-sm neo-avatar-border">
              <q-icon name="campaign" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pemberitahuan Umum
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            Pusat siaran informasi dan pengumuman penting untuk seluruh karyawan.
          </div>
        </div>

        <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
          <q-btn
            unelevated
            color="primary"
            icon="add_alert"
            label="BUAT PEMBERITAHUAN BARU"
            class="neo-btn text-weight-bolder q-px-lg q-py-sm"
            @click="bukaDialogBuat"
          />
        </div>
      </div>

      <!-- ========================================== -->
      <!-- LIVE BROADCAST PREVIEW BANNER              -->
      <!-- ========================================== -->
      <div
        v-if="activePemberitahuan.length > 0"
        class="q-mb-xl table-entrance"
      >
        <div class="text-caption text-weight-bold text-blue-grey-6 uppercase letter-spacing-1 q-mb-sm flex items-center">
          <q-icon name="visibility" color="primary" size="20px" class="q-mr-sm" /> 
          Live Preview Tampilan Karyawan
        </div>
        <q-card
          flat
          class="neo-card overflow-hidden relative-position animate-fade-in"
          style="background: #fff7ed !important; border: 3px solid #0f172a !important; box-shadow: 4px 4px 0px #0f172a !important;"
        >
          <q-card-section class="q-pa-md q-pa-sm-lg relative-position">
            <div class="row items-center no-wrap">
              <!-- Left Megaphone Icon Container -->
              <div class="q-mr-md relative-position">
                <div class="tech-icon-container text-white rounded-12 flex flex-center" style="background: #f97316; border: 2.5px solid #0f172a; box-shadow: 2px 2px 0px #0f172a; width: 50px; height: 50px;">
                  <q-icon name="campaign" size="30px" class="floating-icon" />
                </div>
              </div>

              <!-- Main Carousel Content -->
              <div class="col overflow-hidden">
                <div class="row items-center q-gutter-x-sm q-mb-xs">
                  <div class="tech-live-tag" style="background: #ffedd5; border: 1.5px solid #0f172a; border-radius: 6px; font-weight: 800; color: #ea580c; display: inline-flex; align-items: center; gap: 5px;">
                    <span class="live-dot" style="background-color: #ef4444; width: 6px; height: 6px; border-radius: 50%;"></span>
                    PENGUMUMAN RESMI
                  </div>
                  <span class="tech-brand-sub font-mono text-weight-bold" style="font-size: 10px; color: #475569;">• AGR.SECURE // BROADCAST SYSTEM</span>
                </div>

                <q-carousel
                  v-model="activeAnnouncementSlide"
                  transition-prev="scale"
                  transition-next="scale"
                  swipeable
                  animated
                  infinite
                  autoplay
                  :autoplay-timeout="6000"
                  class="bg-transparent text-slate-800 q-pa-none no-shadow announcement-carousel"
                  height="65px"
                  :navigation="activePemberitahuan.length > 1"
                  navigation-icon="fiber_manual_record"
                  navigation-color="orange-8"
                  arrows
                  :arrows-color="activePemberitahuan.length > 1 ? 'orange-9' : 'transparent'"
                >
                  <q-carousel-slide
                    v-for="(item, idx) in activePemberitahuan"
                    :key="item.id"
                    :name="idx"
                    class="q-pa-none flex column justify-center"
                  >
                    <div
                      class="text-subtitle2 text-weight-bolder text-slate-900 ellipsis tracking-tight"
                      style="font-size: 14.5px"
                    >
                      <q-icon name="shield" size="16px" class="q-mr-xs text-orange-8" />{{
                        item.judul
                      }}
                    </div>
                    <div
                      class="text-caption text-slate-700 ellipsis-2-lines line-height-tight q-mt-xs font-medium"
                      style="font-size: 11.5px; max-width: 90%"
                    >
                      {{ item.isi }}
                    </div>
                  </q-carousel-slide>
                </q-carousel>
              </div>
            </div>
          </q-card-section>
          <!-- Custom Brutalist Progress Line at bottom -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #0f172a; z-index: 10;">
            <div style="height: 100%; background: #ea580c; width: 0%; animation: progressRun 6s infinite linear;"></div>
          </div>
        </q-card>
      </div>

      <!-- ========================================== -->
      <!-- MAIN TABLE SECTION                         -->
      <!-- ========================================== -->
      <q-card flat class="neo-card overflow-hidden table-entrance q-mb-xl">
        <!-- Filter Toolbar -->
        <q-card-section
          class="bg-white q-pa-lg neo-table-toolbar row items-center justify-between"
        >
          <div class="text-h6 text-weight-bolder text-blue-grey-9 flex items-center">
            <q-icon name="format_list_bulleted" color="primary" class="q-mr-sm" />
            Daftar Pemberitahuan
          </div>
          <div class="col-12 col-md-4 q-mt-md q-md-mt-none">
            <q-input
              outlined
              dense
              v-model="search"
              placeholder="Cari judul pengumuman..."
              class="rounded-input bg-grey-1"
              color="primary"
            >
              <template v-slot:prepend><q-icon name="search" color="blue-grey-4" /></template>
            </q-input>
          </div>
        </q-card-section>

        <!-- Data Table -->
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :filter="search"
          :loading="loading"
          class="premium-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-blue-grey-8 uppercase letter-spacing-1 bg-grey-1"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <q-td key="no" class="text-center text-weight-bold">{{
                props.rowIndex + 1
              }}</q-td>

              <q-td key="judul" class="text-left text-weight-bold text-blue-grey-10 text-subtitle2">
                {{ props.row.judul }}
              </q-td>

              <q-td key="isi" class="text-left">
                <div class="ellipsis text-blue-grey-7" style="max-width: 250px">
                  {{ props.row.isi }}
                  <q-tooltip class="bg-blue-grey-9 text-body2" style="max-width: 300px">{{
                    props.row.isi
                  }}</q-tooltip>
                </div>
              </q-td>

              <q-td
                key="dipublikasikan"
                class="text-center font-mono text-weight-medium text-blue-grey-8"
              >
                {{ formatTanggal(props.row.tgl_publikasi) }}
              </q-td>

              <q-td
                key="kadaluarsa"
                class="text-center font-mono text-weight-medium text-blue-grey-8"
              >
                {{ formatTanggal(props.row.tgl_kadaluarsa) }}
              </q-td>

              <q-td key="status" class="text-center">
                <q-badge
                  :color="cekStatus(props.row.tgl_kadaluarsa) === 'Aktif' ? 'teal-1' : 'red-1'"
                  :text-color="cekStatus(props.row.tgl_kadaluarsa) === 'Aktif' ? 'teal-9' : 'red-9'"
                  class="q-px-sm q-py-xs text-weight-bold rounded-6 shadow-1 uppercase tracking-wide"
                >
                  {{ cekStatus(props.row.tgl_kadaluarsa) }}
                </q-badge>
              </q-td>

              <q-td
                key="pembuat"
                class="text-center text-caption text-weight-bold text-blue-grey-6"
              >
                <div class="row items-center justify-center no-wrap">
                  <q-icon name="account_circle" size="xs" class="q-mr-xs" />
                  {{ props.row.pembuat }}
                </div>
              </q-td>

              <q-td key="aksi" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  class="neo-delete-btn"
                  size="sm"
                  @click="hapusPengumuman(props.row.id)"
                >
                  <q-tooltip class="bg-negative">Hapus</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="indigo">
              <q-spinner-dots size="50px" color="indigo" />
              <div class="text-indigo q-mt-md text-weight-medium">Memuat pengumuman...</div>
            </q-inner-loading>
          </template>

          <template v-slot:no-data>
            <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
              <q-icon size="4em" name="campaign" class="q-mb-md opacity-50" />
              <div class="text-h6 text-weight-bold">Tidak Ada Pemberitahuan</div>
              <div class="text-caption">Belum ada informasi yang disiarkan ke karyawan.</div>
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- ========================================== -->
      <!-- MODAL BUAT PEMBERITAHUAN BARU              -->
      <!-- ========================================== -->
      <q-dialog v-model="dialogForm" persistent backdrop-filter="blur(5px)">
        <q-card
          style="width: 600px; max-width: 95vw"
          class="neo-card overflow-hidden flex column"
        >
          <q-form @submit.prevent="simpanPengumuman" class="column full-height" style="margin: 0">
            <!-- HEADER MODAL -->
            <q-card-section class="row items-center q-pb-md q-pt-lg q-px-lg neo-table-toolbar bg-white">
              <div class="row items-center col">
                <div class="bg-indigo-50 text-indigo-6 q-pa-sm rounded-8 q-mr-md neo-avatar-border">
                  <q-icon name="add_alert" size="24px" />
                </div>
                <div>
                  <div class="text-h6 text-weight-bolder text-blue-grey-10 line-height-tight">
                    Buat Siaran Baru
                  </div>
                  <div class="text-caption text-blue-grey-5 font-mono text-weight-bold q-mt-xs">
                    Informasi akan langsung terlihat oleh karyawan.
                  </div>
                </div>
              </div>
              <q-btn
                icon="close"
                flat
                round
                dense
                v-close-popup
                color="blue-grey-4"
                class="bg-grey-2 neo-delete-btn"
                style="width: 28px; height: 28px;"
              />
            </q-card-section>

            <!-- BODY MODAL -->
            <q-card-section class="q-px-lg q-py-sm scroll" style="max-height: 60vh">
              <div class="q-gutter-y-md">
                <!-- Judul -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Judul Pemberitahuan
                  </div>
                  <q-input
                    outlined
                    v-model="form.judul"
                    placeholder="Contoh: Libur Nasional Idul Fitri"
                    color="primary"
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Judul wajib diisi']"
                  >
                    <template v-slot:prepend><q-icon name="title" color="blue-grey-4" /></template>
                  </q-input>
                </div>

                <!-- Isi -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Isi Pesan
                  </div>
                  <q-input
                    outlined
                    v-model="form.isi"
                    type="textarea"
                    rows="4"
                    placeholder="Tulis rincian pengumuman di sini..."
                    color="primary"
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Isi pesan wajib diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="article" color="blue-grey-4"
                    /></template>
                  </q-input>
                </div>

                <!-- Tanggal Kadaluarsa -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Berlaku Sampai (Kadaluarsa)
                  </div>
                  <q-input
                    outlined
                    v-model="form.tgl_kadaluarsa"
                    type="date"
                    color="primary"
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Tanggal kadaluarsa wajib diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="event_busy" color="blue-grey-4"
                    /></template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <!-- FOOTER MODAL (STICKY DI BAWAH) -->
            <q-card-actions align="right" class="bg-grey-1 q-px-lg q-pb-lg q-pt-md border-top">
              <q-btn
                flat
                label="BATAL"
                color="blue-grey-6"
                v-close-popup
                class="text-weight-bold rounded-8 q-px-md"
              />
              <q-btn
                unelevated
                label="PUBLIKASIKAN SEKARANG"
                color="primary"
                type="submit"
                class="neo-btn text-weight-bolder q-px-xl q-py-sm"
                :loading="saving"
                icon="send"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { date, useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(true)
const saving = ref(false)
const search = ref('')
const rows = ref([])

// Active slide for live preview banner
const activeAnnouncementSlide = ref(0)

// Active announcements for live preview banner
const activePemberitahuan = computed(() => {
  return rows.value.filter(row => cekStatus(row.tgl_kadaluarsa) === 'Aktif')
})

// Dialog State
const dialogForm = ref(false)
const form = ref({
  judul: '',
  isi: '',
  tgl_kadaluarsa: '',
})

// Current User dari LocalStorage (Sebagai Pembuat)
const currentUser = ref('Admin')

const columns = [
  { name: 'no', label: 'NO', align: 'center', field: 'no', style: 'width: 50px;' },
  { name: 'judul', label: 'JUDUL PEMBERITAHUAN', align: 'left', field: 'judul', sortable: true },
  { name: 'isi', label: 'ISI PESAN', align: 'left', field: 'isi' },
  {
    name: 'dipublikasikan',
    label: 'DIPUBLIKASIKAN',
    align: 'center',
    field: 'tgl_publikasi',
    sortable: true,
  },
  {
    name: 'kadaluarsa',
    label: 'KADALUARSA',
    align: 'center',
    field: 'tgl_kadaluarsa',
    sortable: true,
  },
  { name: 'status', label: 'STATUS', align: 'center', field: 'status' },
  { name: 'pembuat', label: 'DIBUAT OLEH', align: 'center', field: 'pembuat' },
  { name: 'aksi', label: 'AKSI', align: 'center', field: 'aksi' },
]

// ==============================================================
// BUG FIXED: SISTEM FORMAT TANGGAL FAIL-SAFE (ANTI-CRASH)
// ==============================================================
const formatTanggal = (val) => {
  try {
    if (!val) return '-'

    let d = null
    // Deteksi jika val adalah objek Timestamp Firestore
    if (val && typeof val.toDate === 'function') {
      d = val.toDate()
    } else {
      // Deteksi jika val adalah string/number biasa
      d = new Date(val)
    }

    // Jika parsing gagal, kembalikan teks aslinya agar tidak crash
    if (!d || isNaN(d.getTime())) return String(val)

    return date.formatDate(d, 'DD MMM YYYY HH:mm', {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    })
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return '-'
  }
}

// HELPER: Cek apakah pengumuman masih aktif atau sudah lewat tanggal
const cekStatus = (tglKadaluarsa) => {
  try {
    if (!tglKadaluarsa) return 'Aktif'
    const hariIni = new Date()
    hariIni.setHours(0, 0, 0, 0)
    const kadaluarsa = new Date(tglKadaluarsa)

    if (isNaN(kadaluarsa.getTime())) return 'Aktif' // Bypass jika format aneh

    if (kadaluarsa < hariIni) return 'Kadaluarsa'
    return 'Aktif'
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return 'Aktif'
  }
}

let unsubscribeData = null

// ==============================================================
// LOAD DATA REAL-TIME DENGAN TRY-CATCH
// ==============================================================
const loadData = () => {
  loading.value = true // Pastikan loading menyala saat mulai
  const qData = query(collection(db, 'pemberitahuan'), orderBy('tgl_publikasi', 'desc'))

  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      try {
        rows.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } catch (error) {
        console.error('Gagal menyusun data:', error)
      } finally {
        // APAPUN YANG TERJADI, LOADING HARUS DIMATIKAN!
        loading.value = false
      }
    },
    (error) => {
      console.error('Gagal load pemberitahuan:', error)
      loading.value = false
      $q.notify({ color: 'negative', message: 'Koneksi ke server terputus.' })
    },
  )
}

const bukaDialogBuat = () => {
  // Set default kadaluarsa (H+7 hari dari sekarang)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  form.value = {
    judul: '',
    isi: '',
    tgl_kadaluarsa: date.formatDate(nextWeek, 'YYYY-MM-DD'),
  }
  dialogForm.value = true
}

const simpanPengumuman = async () => {
  saving.value = true
  try {
    await addDoc(collection(db, 'pemberitahuan'), {
      judul: form.value.judul,
      isi: form.value.isi,
      tgl_publikasi: serverTimestamp(),
      tgl_kadaluarsa: form.value.tgl_kadaluarsa,
      pembuat: currentUser.value,
    })

    $q.notify({ color: 'positive', message: 'Pemberitahuan berhasil disiarkan!', icon: 'campaign' })
    dialogForm.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal menyiarkan pemberitahuan.' })
  } finally {
    saving.value = false
  }
}

const hapusPengumuman = (id) => {
  $q.dialog({
    title: 'Hapus Pengumuman',
    message: 'Pengumuman yang dihapus akan hilang dari layar karyawan. Lanjutkan?',
    cancel: true,
    persistent: true,
    ok: { flat: true, color: 'negative', label: 'Hapus Permanen' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show()
      await deleteDoc(doc(db, 'pemberitahuan', id))
      $q.notify({ color: 'primary', message: 'Pengumuman berhasil dihapus.', icon: 'delete' })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    } finally {
      $q.loading.hide()
    }
  })
}

onMounted(() => {
  // Ambil nama Admin yang sedang Login
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      currentUser.value = parsed.nama || 'Admin'
    } catch (e) {
      console.error(e)
    }
  }

  loadData()
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
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
}

/* NEO-BRUTALIST STYLING CORE */
.neo-page-bg {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
  min-height: 100vh;
}

.neo-card {
  background: #ffffff !important;
  border: 3px solid #0f172a !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-card:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2.5px solid #0f172a !important;
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

.neo-delete-btn {
  border: 1.5px solid #0f172a !important;
  background: #fee2e2 !important;
  color: #b91c1c !important;
  transition: all 0.2s ease;
}
.neo-delete-btn:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
  transform: scale(1.1);
}

.neo-table-toolbar {
  border-bottom: 2.5px solid #0f172a;
}

.neo-avatar-border {
  border: 2px solid #0f172a !important;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #0f172a !important;
  box-shadow: 2px 2px 0px #0f172a !important;
  background-color: #ffffff;
}
.rounded-input :deep(.q-field__marginal) {
  height: 50px;
}

/* TABLES STYLING */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  font-weight: 800 !important;
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
  border-bottom: 2.5px solid #0f172a !important;
  border-top: none;
  letter-spacing: 0.5px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  color: #0f172a !important;
  border-bottom: 1.5px solid #0f172a !important;
  transition: all 0.2s ease;
  padding-top: 16px;
  padding-bottom: 16px;
}

.hover-effect:hover td {
  background-color: #e0f2fe !important;
}

.premium-table :deep(.q-badge) {
  border: 1.5px solid #0f172a !important;
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

/* ios icon box */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

/* Floating Shapes Background Styling */
.neo-decorations-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.neo-shape {
  position: absolute;
  user-select: none;
  transition: all 0.3s ease;
}

/* 1. Circle 1 - Indigo/Blue */
.neo-shape--circle-1 {
  width: 180px;
  height: 180px;
  border: 3px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.07);
  box-shadow: 5px 5px 0px rgba(59, 130, 246, 0.12);
  top: 8%;
  left: -20px;
  animation: drift-wobble-1 25s ease-in-out infinite;
}

/* 2. Circle 2 - Pink/Rose */
.neo-shape--circle-2 {
  width: 140px;
  height: 140px;
  border: 3px solid rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.07);
  box-shadow: 5px 5px 0px rgba(244, 63, 94, 0.12);
  top: 52%;
  right: 6%;
  animation: drift-wobble-2 22s ease-in-out infinite reverse;
}

/* 3. Square 1 - Orange */
.neo-shape--square-1 {
  width: 130px;
  height: 130px;
  border: 3px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.07);
  box-shadow: 5px 5px 0px rgba(245, 158, 11, 0.12);
  top: 65%;
  right: -30px;
  animation: drift-wobble-2 30s ease-in-out infinite;
}

/* 4. Square 2 - Lime */
.neo-shape--square-2 {
  width: 110px;
  height: 110px;
  border: 3px solid rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.07);
  box-shadow: 4px 4px 0px rgba(132, 204, 22, 0.12);
  top: 22%;
  left: 15%;
  animation: drift-wobble-1 27s ease-in-out infinite;
}

/* 5. Star 1 - Purple */
.neo-shape--star-1 {
  font-size: 130px;
  color: rgba(168, 85, 247, 0.22);
  text-shadow: 4px 4px 0px rgba(168, 85, 247, 0.12);
  top: 3%;
  right: 15%;
  animation: drift-diagonal-1 28s ease-in-out infinite reverse;
}

/* 6. Star 2 - Yellow */
.neo-shape--star-2 {
  font-size: 90px;
  color: rgba(234, 179, 8, 0.24);
  text-shadow: 3px 3px 0px rgba(234, 179, 8, 0.14);
  top: 85%;
  right: 25%;
  animation: drift-diagonal-2 20s ease-in-out infinite;
}

/* 7. Triangle 1 - Cyan */
.neo-shape--triangle-1 {
  font-size: 100px;
  color: rgba(6, 182, 212, 0.22);
  text-shadow: 4px 4px 0px rgba(6, 182, 212, 0.12);
  top: 40%;
  left: 8%;
  animation: drift-wobble-2 24s ease-in-out infinite reverse;
}

/* 8. Triangle 2 - Amber/Gold */
.neo-shape--triangle-2 {
  font-size: 80px;
  color: rgba(245, 158, 11, 0.22);
  text-shadow: 3px 3px 0px rgba(245, 158, 11, 0.12);
  top: 12%;
  left: 35%;
  animation: drift-diagonal-1 23s ease-in-out infinite;
}

/* 9. Cross 1 - Emerald Green */
.neo-shape--cross-1 {
  font-size: 110px;
  color: rgba(16, 185, 129, 0.22);
  text-shadow: 4px 4px 0px rgba(16, 185, 129, 0.12);
  top: 30%;
  right: 25%;
  animation: drift-diagonal-1 22s ease-in-out infinite;
}

/* 10. Cross 2 - Red/Rose */
.neo-shape--cross-2 {
  font-size: 90px;
  color: rgba(239, 68, 68, 0.22);
  text-shadow: 4px 4px 0px rgba(239, 68, 68, 0.12);
  top: 75%;
  left: 2%;
  animation: drift-diagonal-2 26s ease-in-out infinite;
}

/* 11. Cross 3 - Deep Indigo */
.neo-shape--cross-3 {
  font-size: 100px;
  color: rgba(99, 102, 241, 0.22);
  text-shadow: 4px 4px 0px rgba(99, 102, 241, 0.12);
  top: 90%;
  left: 40%;
  animation: drift-wobble-1 29s ease-in-out infinite;
}

/* 12. Blob 1 - Teal Organic Morphing Blob */
.neo-shape--blob-1 {
  width: 160px;
  height: 160px;
  border: 3px solid rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.07);
  box-shadow: 5px 5px 0px rgba(20, 184, 166, 0.12);
  top: 48%;
  left: 42%;
  animation: drift-blob 32s ease-in-out infinite;
}

/* KEYFRAMES FOR ORGANIC DRIFTING (AGAR.IO STYLE) */
@keyframes drift-wobble-1 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50% 50% 50% 50%;
  }
  25% {
    transform: translate(50px, -40px) scale(1.05) rotate(90deg);
    border-radius: 46% 54% 48% 52%;
  }
  50% {
    transform: translate(20px, -80px) scale(0.95) rotate(180deg);
    border-radius: 54% 46% 52% 48%;
  }
  75% {
    transform: translate(-40px, -30px) scale(1.02) rotate(270deg);
    border-radius: 48% 52% 54% 46%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 50% 50% 50% 50%;
  }
}

@keyframes drift-wobble-2 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 8px;
  }
  33% {
    transform: translate(-60px, -30px) scale(1.08) rotate(120deg);
    border-radius: 14px 8px 14px 8px;
  }
  66% {
    transform: translate(30px, -70px) scale(0.92) rotate(240deg);
    border-radius: 8px 14px 8px 14px;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 8px;
  }
}

@keyframes drift-diagonal-1 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(45px, 60px) rotate(180deg) scale(1.05);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

@keyframes drift-diagonal-2 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(-50px, -60px) rotate(-180deg) scale(0.95);
  }
  100% {
    transform: translate(0, 0) rotate(-360deg) scale(1);
  }
}

@keyframes drift-blob {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  33% {
    transform: translate(40px, -50px) scale(1.06) rotate(120deg);
    border-radius: 70% 30% 52% 48% / 60% 40% 70% 30%;
  }
  66% {
    transform: translate(-30px, 30px) scale(0.94) rotate(240deg);
    border-radius: 50% 50% 30% 70% / 50% 60% 40% 60%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
}

/* Entrance animation classes */
.header-entrance {
  animation: brutalist-bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.table-entrance {
  opacity: 0;
  animation: brutalist-bounce-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
}

@keyframes brutalist-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(35px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* VIEW SWITCHER ANIMATION */
.animate-fade-in {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* LIVE BROADCAST PREVIEW BANNER INTERNAL ELEMENTS */
.tech-icon-container {
  background: #f97316;
  border: 2.5px solid #0f172a;
  box-shadow: 2px 2px 0px #0f172a;
  z-index: 2;
  position: relative;
  transition: transform 0.3s ease;
}
.tech-icon-container:hover {
  transform: scale(1.05) rotate(-3deg);
}

.floating-icon {
  animation: floatIcon 3.5s infinite ease-in-out;
}
@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(-3deg);
  }
}

.tech-live-tag {
  background: #ffedd5;
  border: 1.5px solid #0f172a;
  border-radius: 6px;
  font-weight: 800;
  color: #ea580c;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  font-size: 10px;
}

.live-dot {
  background-color: #ef4444;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulseNeon 1.3s infinite ease-in-out;
}
@keyframes pulseNeon {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 4px #ef4444; }
  50% { opacity: 1; box-shadow: 0 0 12px #ef4444; }
}

.tech-brand-sub {
  font-size: 10px;
  color: #475569;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.announcement-carousel {
  height: 65px;
  overflow: hidden;
}

@keyframes progressRun {
  0% { width: 0%; }
  100% { width: 100%; }
}
</style>
