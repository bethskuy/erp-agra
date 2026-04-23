<template>
  <q-page class="bg-blue-grey-1 q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-xl-10">
        <!-- HEADER PAGE -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-auto">
            <h4 class="text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-1">
              Pengajuan Cuti & Izin
            </h4>
            <div class="text-subtitle1 text-grey-7 q-mt-xs">
              Manajemen permohonan ketidakhadiran karyawan secara terpusat.
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
            <q-card flat bordered class="rounded-16 bg-white shadow-sm">
              <q-card-section class="row items-center q-py-sm q-px-md">
                <q-avatar size="42px" color="primary" text-color="white" class="shadow-2">
                  {{ currentUserName ? currentUserName.substring(0, 1).toUpperCase() : 'U' }}
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-weight-bold text-blue-grey-9">{{ currentUserName }}</div>
                  <div class="text-caption text-grey-6 text-uppercase">AGRA - KARYAWAN</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- SECTION 1: STATISTIK CUTI -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <div class="col-12 col-sm-4" v-for="(stat, index) in leaveStats" :key="index">
            <q-card flat class="rounded-16 shadow-card overflow-hidden full-height">
              <q-card-section class="row items-center no-wrap">
                <div class="col-auto">
                  <q-avatar
                    :icon="stat.icon"
                    :color="stat.color + '-1'"
                    :text-color="stat.color"
                    size="56px"
                  />
                </div>
                <div class="col q-ml-md">
                  <div class="text-subtitle2 text-grey-7 text-uppercase letter-spacing-1">
                    {{ stat.label }}
                  </div>
                  <div
                    class="text-h4 text-weight-bolder"
                    :class="'text-' + (stat.textColor || stat.color)"
                  >
                    {{ stat.value }} <span class="text-subtitle1 text-weight-medium">Hari</span>
                  </div>
                </div>
              </q-card-section>
              <q-separator inset v-if="stat.showProgress" />
              <q-card-section v-if="stat.showProgress" class="q-py-sm">
                <q-linear-progress
                  :value="stat.progress"
                  :color="stat.color"
                  class="rounded-borders"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-xl">
          <!-- SECTION 2: FORM PENGAJUAN (KIRI) -->
          <div class="col-12 col-lg-5">
            <q-card flat class="rounded-16 shadow-card bg-white sticky-form">
              <q-card-section class="q-pa-lg">
                <div class="row items-center q-mb-lg">
                  <div class="bg-primary rounded-8 q-pa-xs q-mr-md shadow-2">
                    <q-icon name="add_task" color="white" size="sm" />
                  </div>
                  <div class="text-h6 text-weight-bold text-blue-grey-9">Buat Permohonan Baru</div>
                </div>

                <q-form @submit="onSubmit" class="q-gutter-y-lg">
                  <q-select
                    outlined
                    v-model="form.jenis"
                    :options="optionsJenis"
                    label="Jenis Pengajuan"
                    stack-label
                    emit-value
                    map-options
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Wajib memilih jenis pengajuan']"
                  >
                    <template v-slot:prepend><q-icon name="style" color="primary" /></template>
                  </q-select>

                  <q-input
                    outlined
                    v-model="dateRangeLabel"
                    label="Rentang Tanggal"
                    stack-label
                    readonly
                    class="rounded-input cursor-pointer"
                    @click="$refs.qDateProxy.show()"
                  >
                    <template v-slot:prepend
                      ><q-icon name="calendar_today" color="primary"
                    /></template>
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.range" range minimal emit-immediately color="primary">
                        <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                          <q-btn label="Batal" color="grey" flat v-close-popup />
                          <q-btn label="Pilih" color="primary" unelevated v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-input>

                  <q-input
                    outlined
                    v-model="form.alasan"
                    type="textarea"
                    label="Alasan Detail"
                    stack-label
                    placeholder="Tuliskan alasan pengajuan Anda secara rinci..."
                    class="rounded-input"
                    rows="3"
                    :rules="[(val) => !!val || 'Alasan harus diisi']"
                  >
                    <template v-slot:prepend
                      ><q-icon name="description" color="primary"
                    /></template>
                  </q-input>

                  <q-input
                    outlined
                    v-model="form.docUrl"
                    label="Tautan Dokumen"
                    stack-label
                    placeholder="Contoh: Link surat dokter"
                  >
                    <template v-slot:prepend
                      ><q-icon name="attach_file" color="primary"
                    /></template>
                  </q-input>

                  <q-select
                    outlined
                    v-model="form.delegasi"
                    :options="optionsKaryawan"
                    label="Delegasi Tugas"
                    stack-label
                    placeholder="Pilih rekan kerja pengganti sementara"
                    class="rounded-input"
                  >
                    <template v-slot:prepend><q-icon name="groups" color="primary" /></template>
                  </q-select>

                  <div class="q-pt-md">
                    <q-btn
                      unelevated
                      color="primary"
                      label="Kirim Pengajuan"
                      icon="send"
                      class="full-width q-py-md rounded-12 shadow-btn text-weight-bold"
                      :loading="submitting"
                      type="submit"
                    />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>

          <!-- SECTION 3: DAFTAR PENGAJUAN (KANAN) -->
          <div class="col-12 col-lg-7">
            <q-card flat class="rounded-16 shadow-card bg-white full-height overflow-hidden">
              <q-card-section class="q-pa-lg">
                <div class="row items-center justify-between q-mb-lg">
                  <div class="row items-center">
                    <div class="bg-blue-grey-9 rounded-8 q-pa-xs q-mr-md shadow-2">
                      <q-icon name="list_alt" color="white" size="sm" />
                    </div>
                    <div class="text-h6 text-weight-bold text-blue-grey-9">Riwayat Pengajuan</div>
                  </div>
                  <q-btn
                    flat
                    round
                    icon="refresh"
                    color="grey-7"
                    @click="loadMyRequestData"
                    :loading="loading"
                  />
                </div>

                <q-table
                  :rows="rows"
                  :columns="columns"
                  row-key="id"
                  flat
                  :loading="loading"
                  :pagination="{ rowsPerPage: 7 }"
                  class="modern-table no-border"
                >
                  <template v-slot:header="props">
                    <q-tr :props="props" class="bg-blue-grey-1 text-blue-grey-9">
                      <q-th
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        class="text-weight-bolder"
                      >
                        {{ col.label }}
                      </q-th>
                    </q-tr>
                  </template>

                  <template v-slot:body="props">
                    <q-tr :props="props" class="hover-row">
                      <q-td key="no" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
                      <q-td key="jenis" class="text-center">
                        <q-chip
                          dense
                          :color="getJenisColor(props.row.jenis_pengajuan)"
                          text-color="white"
                          class="q-px-md text-weight-bold text-uppercase"
                          size="xs"
                        >
                          {{ props.row.jenis_pengajuan }}
                        </q-chip>
                      </q-td>
                      <q-td key="mulai" class="text-center">
                        <div class="text-weight-bold text-blue-grey-10 text-caption">
                          {{ formatDate(props.row.tanggal_mulai) }}
                        </div>
                      </q-td>
                      <q-td key="selesai" class="text-center">
                        <div class="text-weight-bold text-blue-grey-10 text-caption">
                          {{ formatDate(props.row.tanggal_selesai) }}
                        </div>
                      </q-td>
                      <q-td key="status" class="text-center">
                        <q-badge
                          rounded
                          :color="getStatusColor(props.row.status_approval)"
                          class="q-px-md q-py-xs text-weight-bold letter-spacing-1 text-uppercase"
                        >
                          {{ props.row.status_approval }}
                        </q-badge>
                      </q-td>
                    </q-tr>
                  </template>

                  <template v-slot:no-data>
                    <div class="full-width text-center q-pa-xl">
                      <q-icon name="cloud_off" size="56px" color="grey-3" />
                      <div class="text-grey-5 q-mt-md text-weight-medium">
                        Belum ada pengajuan yang tercatat.
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const submitting = ref(false)
const rows = ref([])
const currentUserName = ref('KARYAWAN')

const form = ref({
  jenis: null,
  range: { from: null, to: null },
  alasan: '',
  docUrl: '',
  delegasi: null,
})

// --- DATA STATISTIK ---
const leaveStats = computed(() => [
  { label: 'Total Jatah', value: 12, icon: 'analytics', color: 'indigo', showProgress: false },
  {
    label: 'Telah Diambil',
    value: 2,
    icon: 'event_busy',
    color: 'orange',
    showProgress: true,
    progress: 2 / 12,
  },
  {
    label: 'Sisa Saldo',
    value: 10,
    icon: 'verified',
    color: 'positive',
    showProgress: true,
    progress: 10 / 12,
    textColor: 'green-9',
  },
])

// --- PILIHAN FORM ---
const optionsJenis = [
  { label: 'Cuti Tahunan', value: 'Cuti Tahunan' },
  { label: 'Izin Sakit', value: 'Izin Sakit' },
  { label: 'Cuti Alasan Penting', value: 'Izin Keluarga' },
  { label: 'Lain-lain', value: 'Lainnya' },
]

const optionsKaryawan = [
  { label: 'Ilham Fahyono', value: 'Ilham Fahyono' },
  { label: 'Ihmawan Wira', value: 'Ihmawan Wira' },
  { label: 'Budi Santoso', value: 'Budi Santoso' },
]

// --- DEFINISI KOLOM TABEL ---
const columns = [
  { name: 'no', label: 'NO', align: 'center', field: 'no' },
  { name: 'jenis', label: 'KATEGORI', align: 'center', field: 'jenis_pengajuan' },
  { name: 'mulai', label: 'DARI', align: 'center', field: 'tanggal_mulai' },
  { name: 'selesai', label: 'SAMPAI', align: 'center', field: 'tanggal_selesai' },
  { name: 'status', label: 'STATUS', align: 'center', field: 'status_approval' },
]

// --- FORMATTING LOGIC ---
const dateRangeLabel = computed(() => {
  const r = form.value.range
  if (!r) return 'Pilih Rentang Waktu'
  if (typeof r === 'string') return r
  if (r.from && r.to) return `${r.from} — ${r.to}`
  if (r.from) return r.from
  return 'Pilih Rentang Waktu'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'DD MMM YYYY', {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  })
}

const getStatusColor = (status) => {
  if (status === 'Pending') return 'orange-8'
  if (status === 'Approved') return 'positive'
  if (status === 'Selesai') return 'blue-7'
  return 'negative'
}

const getJenisColor = (jenis) => {
  if (jenis === 'Izin Sakit') return 'red-5'
  if (jenis === 'Cuti Tahunan') return 'blue-6'
  return 'blue-grey-6'
}

// --- FIREBASE OPERATIONS ---
const onSubmit = async () => {
  submitting.value = true
  try {
    const range = form.value.range
    const start = typeof range === 'string' ? range : range ? range.from : null
    const end = typeof range === 'string' ? range : range ? range.to : null

    if (!start) {
      $q.notify({ color: 'warning', message: 'Tentukan rentang tanggal!' })
      submitting.value = false
      return
    }

    const dataToSave = {
      nama_karyawan: currentUserName.value,
      jenis_pengajuan: form.value.jenis,
      tanggal_mulai: start,
      tanggal_selesai: end || start,
      alasan: form.value.alasan,
      dokumen_url: form.value.docUrl,
      delegasi: form.value.delegasi,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    }

    await addDoc(collection(db, 'pengajuan'), dataToSave)

    $q.notify({
      color: 'positive',
      message: 'Permohonan Berhasil Dikirim!',
      icon: 'verified',
      position: 'top',
    })

    loadMyRequestData()
    // Reset Form
    form.value = {
      jenis: null,
      range: { from: null, to: null },
      alasan: '',
      docUrl: '',
      delegasi: null,
    }
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal mengirim data. Periksa koneksi.' })
  } finally {
    submitting.value = false
  }
}

const loadMyRequestData = async () => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'pengajuan'),
      where('nama_karyawan', '==', currentUserName.value),
      orderBy('created_at', 'desc'),
    )
    const snap = await getDocs(q)
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Gagal memuat data riwayat:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      currentUserName.value = parsed.nama || parsed.displayName || 'KARYAWAN'
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      currentUserName.value = 'KARYAWAN'
    }
  }
  loadMyRequestData()
})
</script>

<style scoped>
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}
.shadow-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}
.shadow-btn {
  box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.39) !important;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}

.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}

.modern-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.hover-row:hover {
  background-color: #f8fafc !important;
  transition: all 0.3s ease;
}

.sticky-form {
  position: sticky;
  top: 100px;
}

.modern-table :deep(td) {
  height: 60px;
}
</style>
