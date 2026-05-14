<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- HEADER SECTION                             -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-indigo-50 text-indigo-6 q-mr-sm">
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
            color="indigo-6"
            icon="add_alert"
            label="BUAT PEMBERITAHUAN BARU"
            class="rounded-12 text-weight-bolder shadow-soft-primary transition-smooth hover-scale q-px-lg q-py-sm"
            @click="bukaDialogBuat"
          />
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MAIN TABLE SECTION                         -->
      <!-- ========================================== -->
      <q-card flat class="bento-card bg-white overflow-hidden shadow-soft q-mb-xl">
        <!-- Filter Toolbar -->
        <q-card-section
          class="bg-white q-pa-lg border-bottom-light row items-center justify-between"
        >
          <div class="text-h6 text-weight-bolder text-blue-grey-9 flex items-center">
            <q-icon name="format_list_bulleted" color="indigo-5" class="q-mr-sm" />
            Daftar Pemberitahuan
          </div>
          <div class="col-12 col-md-4 q-mt-md q-md-mt-none">
            <q-input
              outlined
              dense
              v-model="search"
              placeholder="Cari judul pengumuman..."
              class="rounded-input bg-grey-1"
              color="indigo"
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
            <q-tr :props="props" class="bg-slate-50">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bolder text-blue-grey-8 uppercase letter-spacing-1"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" class="hover-effect">
              <q-td key="no" class="text-center text-weight-bold text-blue-grey-5">{{
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
                  :color="cekStatus(props.row.tgl_kadaluarsa) === 'Aktif' ? 'teal-5' : 'red-5'"
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
                  color="negative"
                  class="hover-scale transition-smooth bg-red-50"
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
          class="rounded-24 bg-white overflow-hidden shadow-soft flex column"
        >
          <q-form @submit.prevent="simpanPengumuman" class="column full-height" style="margin: 0">
            <!-- HEADER MODAL -->
            <q-card-section class="row items-center q-pb-md q-pt-lg q-px-lg">
              <div class="row items-center col">
                <div class="bg-indigo-50 text-indigo-6 q-pa-sm rounded-8 q-mr-md">
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
                class="bg-grey-1 transition-smooth hover-scale"
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
                    color="indigo"
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
                    color="indigo"
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
                    color="indigo"
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
            <q-card-actions align="right" class="bg-slate-50 q-px-lg q-pb-lg q-pt-md border-top">
              <q-btn
                flat
                label="BATAL"
                color="blue-grey-6"
                v-close-popup
                class="text-weight-bold rounded-8 q-px-md transition-smooth hover-scale"
              />
              <q-btn
                unelevated
                label="PUBLIKASIKAN SEKARANG"
                color="indigo-6"
                type="submit"
                class="text-weight-bolder rounded-12 q-px-xl shadow-soft-primary transition-smooth hover-scale q-py-sm"
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
import { ref, onMounted, onUnmounted } from 'vue'
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
.border-top {
  border-top: 1px solid #f1f5f9;
}
.opacity-50 {
  opacity: 0.5;
}

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(79, 70, 229, 0.5) !important;
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

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
}
.hover-scale:hover {
  transform: scale(1.05);
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

.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

/* TABLE STYLING: Premium */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 14px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}
</style>
