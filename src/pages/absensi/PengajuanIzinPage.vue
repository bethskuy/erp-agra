<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER & USER INFO               -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-7">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm">
              <q-icon name="edit_calendar" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pengajuan Cuti & Izin
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            Pusat manajemen permohonan ketidakhadiran, delegasi tugas, dan izin resmi karyawan.
          </div>
        </div>

        <!-- User Badge -->
        <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
          <q-card
            flat
            class="rounded-16 bg-white shadow-soft border-grey hover-scale transition-smooth cursor-pointer"
          >
            <q-card-section class="row items-center q-py-sm q-px-md no-wrap">
              <div class="col-auto">
                <q-avatar size="46px" color="blue-1" text-color="primary" class="shadow-1">
                  <img v-if="userData.fotoUrl" :src="userData.fotoUrl" />
                  <span v-else class="text-weight-bold">{{
                    userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'U'
                  }}</span>
                </q-avatar>
              </div>

              <!-- BUG FIXED: Ellipsis dihapus, white-space normal agar nama bisa turun baris -->
              <div class="col q-ml-md" style="max-width: 250px">
                <div
                  class="text-weight-bolder text-blue-grey-10 text-uppercase letter-spacing-tight"
                  style="
                    word-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                    line-height: 1.2;
                  "
                >
                  {{ userData.nama || 'Memuat...' }}
                </div>
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-xs"
                  style="line-height: 1.1; font-size: 11px"
                >
                  {{ userData.jabatan || userData.role || 'KARYAWAN' }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 2: STATISTIK BENTO CARDS            -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-4" v-for="(stat, index) in leaveStats" :key="index">
          <q-card
            flat
            class="bento-card bg-white full-height q-pa-md transition-smooth hover-scale relative-position overflow-hidden"
          >
            <!-- Background Icon Watermark -->
            <q-icon
              :name="stat.icon"
              size="100px"
              :color="stat.color + '-1'"
              class="absolute-bottom-right opacity-50"
              style="margin: -20px -20px 0 0"
            />

            <div class="row items-center no-wrap relative-position z-content">
              <div
                class="ios-icon-box q-mr-md"
                :class="'bg-' + stat.color + '-50 text-' + stat.color + '-6'"
              >
                <q-icon :name="stat.icon" size="28px" />
              </div>
              <div class="col">
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                >
                  {{ stat.label }}
                </div>
                <div
                  class="text-h4 text-weight-black line-height-tight"
                  :class="'text-' + (stat.textColor || stat.color + '-7')"
                >
                  {{ stat.value }}
                  <span class="text-subtitle1 text-weight-bold opacity-50">Hari</span>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div v-if="stat.showProgress" class="q-mt-lg relative-position z-content">
              <q-linear-progress
                :value="stat.progress"
                :color="stat.color + '-5'"
                track-color="grey-2"
                size="6px"
                class="rounded-borders"
              />
            </div>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 3: FORMULIR PENGAJUAN (WIZARD STYLE)-->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-5">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg border-bottom-light row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">Buat Permohonan</div>
                <div class="text-caption text-blue-grey-5 text-weight-medium">
                  Lengkapi formulir pengajuan di bawah ini.
                </div>
              </div>
              <q-avatar
                color="blue-50"
                text-color="primary"
                icon="post_add"
                size="42px"
                class="rounded-12"
              />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit="onSubmit" class="q-gutter-y-lg">
                <!-- Jenis & Tanggal -->
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jenis Izin / Cuti
                    </div>
                    <q-select
                      outlined
                      v-model="form.jenis"
                      :options="optionsJenis"
                      emit-value
                      map-options
                      class="rounded-input bg-grey-1"
                      color="primary"
                      placeholder="Pilih jenis ketidakhadiran"
                      :rules="[(val) => !!val || 'Wajib pilih jenis']"
                    >
                      <template v-slot:prepend
                        ><q-icon name="style" color="blue-grey-4"
                      /></template>
                    </q-select>
                  </div>

                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Rentang Waktu
                    </div>
                    <q-input
                      outlined
                      v-model="dateRangeLabel"
                      readonly
                      class="rounded-input bg-grey-1 cursor-pointer"
                      color="primary"
                      placeholder="Pilih rentang tanggal"
                      @click="$refs.qDateProxy.show()"
                    >
                      <template v-slot:prepend
                        ><q-icon name="calendar_today" color="blue-grey-4"
                      /></template>
                      <template v-slot:append
                        ><q-icon name="edit_calendar" color="primary" size="xs"
                      /></template>

                      <q-popup-proxy
                        ref="qDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                        backdrop-filter="blur(4px)"
                      >
                        <q-date
                          v-model="form.range"
                          range
                          minimal
                          emit-immediately
                          color="primary"
                          class="shadow-soft rounded-16"
                        >
                          <div class="row items-center justify-end q-gutter-sm q-pa-sm border-top">
                            <q-btn
                              label="SELESAI PILIH TANGGAL"
                              color="primary"
                              unelevated
                              class="full-width rounded-8 text-weight-bold"
                              v-close-popup
                            />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-input>
                  </div>
                </div>

                <!-- Alasan -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Alasan Detail
                  </div>
                  <q-input
                    outlined
                    v-model="form.alasan"
                    type="textarea"
                    placeholder="Rincikan alasan Anda dengan jelas..."
                    class="rounded-input bg-grey-1"
                    color="primary"
                    rows="3"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  >
                    <template v-slot:prepend><q-icon name="notes" color="blue-grey-4" /></template>
                  </q-input>
                </div>

                <!-- Dokumen & Delegasi -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Opsi Tambahan
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        outlined
                        v-model="form.docUrl"
                        placeholder="Link GDrive Dokumen"
                        class="rounded-input bg-grey-1"
                        color="primary"
                      >
                        <template v-slot:prepend
                          ><q-icon name="link" color="blue-grey-4"
                        /></template>
                        <q-tooltip class="bg-blue-grey-9"
                          >Tautkan surat dokter atau dokumen pendukung</q-tooltip
                        >
                      </q-input>
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-select
                        outlined
                        v-model="form.delegasi"
                        :options="optionsKaryawan"
                        placeholder="Delegasi Tugas"
                        class="rounded-input bg-grey-1"
                        color="primary"
                      >
                        <template v-slot:prepend
                          ><q-icon name="person_add" color="blue-grey-4"
                        /></template>
                        <q-tooltip class="bg-blue-grey-9"
                          >Pilih rekan kerja untuk delegasi tugas</q-tooltip
                        >
                      </q-select>
                    </div>
                  </div>
                </div>

                <!-- Tombol Submit -->
                <div class="q-pt-sm">
                  <q-btn
                    unelevated
                    color="primary"
                    label="KIRIM PENGAJUAN SEKARANG"
                    icon="send"
                    class="full-width q-py-md rounded-16 shadow-soft-primary text-weight-bolder text-subtitle1 transition-smooth"
                    :loading="submitting"
                    type="submit"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- ========================================== -->
        <!-- BAGIAN 4: TABEL RIWAYAT PENGAJUAN          -->
        <!-- ========================================== -->
        <div class="col-12 col-lg-7">
          <q-card flat class="bento-card bg-white full-height overflow-hidden">
            <q-card-section class="q-pa-lg border-bottom-light row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">Daftar Pengajuan Saya</div>
                <div class="text-caption text-blue-grey-5 text-weight-medium">
                  Status permohonan yang telah diajukan.
                </div>
              </div>
              <q-badge
                color="blue-grey-1"
                text-color="blue-grey-8"
                class="text-weight-bold q-px-sm q-py-xs rounded-6 border-grey"
              >
                Riwayat Personal
              </q-badge>
            </q-card-section>

            <q-table
              :rows="rows"
              :columns="columns"
              row-key="id"
              flat
              :loading="loading"
              :pagination="{ rowsPerPage: 10 }"
              class="premium-table"
              card-class="bg-transparent"
            >
              <!-- Header Styling -->
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-slate-50">
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

              <!-- Body Styling -->
              <template v-slot:body="props">
                <q-tr :props="props" class="hover-effect">
                  <q-td key="no" class="text-center text-blue-grey-4 text-weight-bold">{{
                    props.rowIndex + 1
                  }}</q-td>

                  <q-td key="jenis" class="text-left">
                    <div class="row items-center no-wrap">
                      <div
                        class="type-indicator q-mr-sm"
                        :class="getJenisBg(props.row.jenis_pengajuan)"
                      ></div>
                      <div class="text-weight-bold text-blue-grey-9 text-subtitle2">
                        {{ props.row.jenis_pengajuan }}
                      </div>
                    </div>
                  </q-td>

                  <q-td key="mulai" class="text-center">
                    <span class="text-weight-medium text-blue-grey-8">{{
                      formatDate(props.row.tanggal_mulai)
                    }}</span>
                  </q-td>

                  <q-td key="selesai" class="text-center">
                    <span class="text-weight-medium text-blue-grey-8">{{
                      formatDate(props.row.tanggal_selesai)
                    }}</span>
                  </q-td>

                  <q-td key="alasan" class="text-left">
                    <div class="ellipsis text-blue-grey-7" style="max-width: 180px">
                      {{ props.row.alasan }}
                      <q-tooltip class="bg-blue-grey-9">{{ props.row.alasan }}</q-tooltip>
                    </div>
                  </q-td>

                  <q-td key="lampiran" class="text-center">
                    <q-btn
                      v-if="props.row.dokumen_url"
                      flat
                      round
                      color="primary"
                      icon="link"
                      size="sm"
                      class="bg-blue-50 transition-smooth"
                      type="a"
                      :href="props.row.dokumen_url"
                      target="_blank"
                    >
                      <q-tooltip>Buka Dokumen</q-tooltip>
                    </q-btn>
                    <span v-else class="text-grey-4 font-mono">-</span>
                  </q-td>

                  <q-td key="delegasi" class="text-center">
                    <q-badge
                      v-if="props.row.delegasi"
                      outline
                      color="blue-grey-5"
                      class="rounded-6 bg-grey-1 text-weight-bold"
                    >
                      {{ props.row.delegasi }}
                    </q-badge>
                    <span v-else class="text-grey-4 font-mono">-</span>
                  </q-td>

                  <q-td key="status" class="text-right">
                    <q-badge
                      :color="getStatusColor(props.row.status_approval) + '-1'"
                      :text-color="getStatusColor(props.row.status_approval) + '-9'"
                      class="q-px-md q-py-xs text-weight-bolder uppercase rounded-8 shadow-1"
                    >
                      <q-icon
                        :name="getStatusIcon(props.row.status_approval)"
                        size="12px"
                        class="q-mr-xs"
                      />
                      {{ props.row.status_approval || 'Pending' }}
                    </q-badge>
                  </q-td>
                </q-tr>
              </template>

              <!-- No Data State -->
              <template v-slot:no-data>
                <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                  <q-icon size="4em" name="fact_check" class="q-mb-md opacity-50" />
                  <div class="text-h6 text-weight-bold">Belum Ada Pengajuan</div>
                  <div class="text-caption">Anda belum pernah mengajukan cuti atau izin.</div>
                </div>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const submitting = ref(false)
const rows = ref([])

// State Dinamis Terintegrasi
const userData = ref({
  nama: 'Memuat...',
  jabatan: 'Karyawan',
  role: 'Staff',
  fotoUrl: '',
  email: '',
})

const form = ref({
  jenis: null,
  range: { from: null, to: null },
  alasan: '',
  docUrl: '',
  delegasi: null,
})

const optionsJenis = [
  { label: 'Cuti Tahunan', value: 'Cuti Tahunan' },
  { label: 'Izin Sakit', value: 'Izin Sakit' },
  { label: 'Izin Mendadak', value: 'Izin' },
]

const optionsKaryawan = ['Ilham Fahyono', 'Ihmawan Wira', 'Budi Santoso', 'Agung Nugroho']

const columns = [
  { name: 'no', label: 'NO', align: 'center' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'left' },
  { name: 'mulai', label: 'MULAI', align: 'center' },
  { name: 'selesai', label: 'AKHIR', align: 'center' },
  { name: 'alasan', label: 'ALASAN', align: 'left' },
  { name: 'lampiran', label: 'LAMPIRAN', align: 'center' },
  { name: 'delegasi', label: 'DELEGASI', align: 'center' },
  { name: 'status', label: 'STATUS', align: 'right' },
]

const usedDays = computed(() => {
  let total = 0
  rows.value.forEach((row) => {
    if (row.status_approval === 'Approved' || row.status_approval === 'Selesai') {
      const start = new Date(row.tanggal_mulai)
      const end = new Date(row.tanggal_selesai)
      total += Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
    }
  })
  return total
})

// MENGUBAH WARNA AGAR COCOK DENGAN CLASS bg-{color}-50 DI TEMPLATE
const leaveStats = computed(() => [
  {
    label: 'Total Saldo Tahunan',
    value: 12,
    icon: 'account_balance_wallet',
    color: 'indigo',
    showProgress: false,
  },
  {
    label: 'Telah Digunakan',
    value: usedDays.value,
    icon: 'event_busy',
    color: 'orange',
    showProgress: true,
    progress: usedDays.value / 12,
  },
  {
    label: 'Sisa Saldo Cuti',
    value: Math.max(0, 12 - usedDays.value),
    icon: 'verified',
    color: 'teal', // Diubah menjadi teal agar selaras dengan warna hijau kebiruan Quasar
    showProgress: true,
    progress: (12 - usedDays.value) / 12,
    textColor: 'teal-7',
  },
])

const dateRangeLabel = computed(() => {
  const r = form.value.range
  if (!r) return ''
  return typeof r === 'string' ? r : r.from ? `${r.from} — ${r.to}` : ''
})

const formatDate = (d) => (d ? date.formatDate(d, 'DD MMM YYYY') : '-')

// HELPER WARNA UNTUK STATUS & JENIS
const getStatusColor = (s) => {
  const st = s ? s.toLowerCase() : 'pending'
  if (st === 'pending') return 'orange'
  if (st === 'approved') return 'teal'
  return 'red'
}

const getStatusIcon = (s) => {
  const st = s ? s.toLowerCase() : 'pending'
  if (st === 'pending') return 'schedule'
  if (st === 'approved') return 'check_circle'
  return 'cancel'
}

const getJenisBg = (j) => {
  if (j === 'Izin Sakit') return 'bg-red-4'
  if (j === 'Cuti Tahunan') return 'bg-indigo-4'
  return 'bg-blue-grey-4'
}

const onSubmit = async () => {
  submitting.value = true
  try {
    const range = form.value.range
    const start = typeof range === 'string' ? range : range?.from
    const end = typeof range === 'string' ? range : range?.to
    if (!start) throw new Error('Harap pilih rentang tanggal pada formulir.')

    const namaKaryawan = (userData.value.nama || 'USER').toUpperCase()

    await addDoc(collection(db, 'pengajuan'), {
      nama_karyawan: namaKaryawan,
      jenis_pengajuan: form.value.jenis,
      tanggal_mulai: start,
      tanggal_selesai: end || start,
      alasan: form.value.alasan,
      dokumen_url: form.value.docUrl,
      delegasi: form.value.delegasi,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    })

    $q.notify({
      color: 'positive',
      message: 'Pengajuan Berhasil Dikirim!',
      position: 'top',
      icon: 'check_circle',
      classes: 'rounded-12 text-weight-bold',
    })
    form.value = {
      jenis: null,
      range: { from: null, to: null },
      alasan: '',
      docUrl: '',
      delegasi: null,
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: e.message, classes: 'rounded-12 text-weight-bold' })
  } finally {
    submitting.value = false
  }
}

let unsubscribeData = null
let unsubscribeUser = null

onMounted(() => {
  // 1. SINKRONISASI DATA USER DARI LOKAL
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      userData.value = {
        nama: parsed.nama || 'User',
        jabatan: parsed.jabatan || parsed.role || 'Karyawan',
        role: parsed.role || 'Staff',
        email: parsed.email || '',
        fotoUrl: parsed.fotoUrl || parsed.foto_profil || '',
      }

      // 2. REAL-TIME LISTENER PROFILE DARI FIRESTORE
      if (userData.value.email) {
        const qUser = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        unsubscribeUser = onSnapshot(qUser, (snap) => {
          if (!snap.empty) {
            const data = snap.docs[0].data()
            userData.value = {
              ...userData.value,
              nama: data.nama || userData.value.nama,
              jabatan: data.jabatan || userData.value.jabatan,
              role: data.role || userData.value.role,
              fotoUrl: data.foto_profil || data.fotoUrl || userData.value.fotoUrl,
            }
          }
        })
      }
    } catch (e) {
      console.error('Error memuat sesi lokal:', e)
    }
  }

  // 3. AMBIL DAFTAR PENGAJUAN MILIK USER SAJA
  const searchName = (userData.value.nama || 'USER').toUpperCase()

  const qData = query(
    collection(db, 'pengajuan'),
    where('nama_karyawan', '==', searchName),
    orderBy('created_at', 'desc'),
  )

  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Gagal mengambil data pengajuan:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

/* GLOBAL TYPOGRAPHY */
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
.line-height-tight {
  line-height: 1.1;
}
.line-height-normal {
  line-height: 1.4;
}
.uppercase {
  text-transform: uppercase;
}

/* LAYOUTING & BENTO GRID */
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
.border-grey {
  border: 1px solid #e2e8f0;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.z-content {
  position: relative;
  z-index: 2;
}
.opacity-50 {
  opacity: 0.5;
}

/* SHADOWS & RADIUS */
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.06) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
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

/* ANIMATION */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-scale:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.1) !important;
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
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

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.rounded-input :deep(.q-field__control:hover) {
  border-color: #1976d2;
}

/* TABLE STYLING */
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
.type-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
