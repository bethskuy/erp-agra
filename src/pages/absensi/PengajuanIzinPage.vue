<template>
  <q-page class="bg-blue-grey-1 q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-xl-11">
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

        <!-- STATISTIK -->
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

        <!-- FORM & TABLE -->
        <div class="column q-gutter-y-xl">
          <q-card flat class="rounded-16 shadow-card bg-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-lg">
                <div class="bg-primary rounded-8 q-pa-xs q-mr-md shadow-2">
                  <q-icon name="add_task" color="white" size="sm" />
                </div>
                <div class="text-h6 text-weight-bold text-blue-grey-9">Buat Permohonan Baru</div>
              </div>

              <q-form @submit="onSubmit" class="q-gutter-y-md">
                <div class="row q-col-gutter-md">
                  <q-select
                    outlined
                    v-model="form.jenis"
                    :options="optionsJenis"
                    label="Jenis Pengajuan"
                    stack-label
                    emit-value
                    map-options
                    class="col-12 col-md-6 rounded-input"
                    :rules="[(val) => !!val || 'Wajib pilih jenis']"
                  >
                    <template v-slot:prepend><q-icon name="style" color="primary" /></template>
                  </q-select>

                  <q-input
                    outlined
                    v-model="dateRangeLabel"
                    label="Rentang Tanggal"
                    stack-label
                    readonly
                    class="col-12 col-md-6 rounded-input cursor-pointer"
                    @click="$refs.qDateProxy.show()"
                  >
                    <template v-slot:prepend
                      ><q-icon name="calendar_today" color="primary"
                    /></template>
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.range" range minimal emit-immediately color="primary">
                        <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                          <q-btn label="Pilih" color="primary" unelevated v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-input>
                </div>

                <q-input
                  outlined
                  v-model="form.alasan"
                  type="textarea"
                  label="Alasan Detail"
                  stack-label
                  placeholder="Rincikan alasan Anda..."
                  class="rounded-input"
                  rows="2"
                  :rules="[(val) => !!val || 'Wajib diisi']"
                >
                  <template v-slot:prepend><q-icon name="description" color="primary" /></template>
                </q-input>

                <div class="row q-col-gutter-md">
                  <q-input
                    outlined
                    v-model="form.docUrl"
                    label="URL Dokumen Pendukung (Opsional)"
                    stack-label
                    placeholder="Link surat dokter/foto"
                    class="col-12 col-md-6 rounded-input"
                  >
                    <template v-slot:prepend><q-icon name="link" color="primary" /></template>
                  </q-input>

                  <q-select
                    outlined
                    v-model="form.delegasi"
                    :options="optionsKaryawan"
                    label="Delegasikan ke Karyawan Lain (Opsional)"
                    stack-label
                    class="col-12 col-md-6 rounded-input"
                  >
                    <template v-slot:prepend><q-icon name="person_add" color="primary" /></template>
                  </q-select>
                </div>

                <div class="row justify-center q-pt-md">
                  <q-btn
                    unelevated
                    color="primary"
                    label="Ajukan Cuti/Izin"
                    icon="send"
                    class="q-px-xl q-py-md rounded-12 shadow-btn text-weight-bold"
                    :loading="submitting"
                    type="submit"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- SECTION 3: DAFTAR PENGAJUAN -->
          <q-card flat class="rounded-16 shadow-card bg-white overflow-hidden">
            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-lg">
                <div class="bg-blue-grey-9 rounded-8 q-pa-xs q-mr-md shadow-2">
                  <q-icon name="format_list_bulleted" color="white" size="sm" />
                </div>
                <div class="text-h6 text-weight-bold text-blue-grey-9">Daftar Pengajuan Anda</div>
              </div>

              <q-table
                :rows="rows"
                :columns="columns"
                row-key="id"
                flat
                :loading="loading"
                :pagination="{ rowsPerPage: 10 }"
                class="modern-table border-grey"
              >
                <template v-slot:header="props">
                  <q-tr :props="props" class="bg-blue-grey-2 text-blue-grey-10">
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
                  <q-tr :props="props">
                    <q-td key="no" class="text-center">{{ props.rowIndex + 1 }}</q-td>
                    <q-td key="jenis" class="text-center">
                      <q-chip
                        dense
                        :color="getJenisColor(props.row.jenis_pengajuan)"
                        text-color="white"
                        size="xs"
                        class="text-weight-bold uppercase"
                      >
                        {{ props.row.jenis_pengajuan }}
                      </q-chip>
                    </q-td>
                    <q-td key="mulai" class="text-center">{{
                      formatDate(props.row.tanggal_mulai)
                    }}</q-td>
                    <q-td key="selesai" class="text-center">{{
                      formatDate(props.row.tanggal_selesai)
                    }}</q-td>
                    <q-td key="alasan" class="text-center">
                      <div class="ellipsis text-caption" style="max-width: 150px">
                        {{ props.row.alasan }}
                        <q-tooltip>{{ props.row.alasan }}</q-tooltip>
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
                        type="a"
                        :href="props.row.dokumen_url"
                        target="_blank"
                      />
                      <span v-else class="text-grey-4">-</span>
                    </q-td>
                    <q-td key="delegasi" class="text-center text-caption">{{
                      props.row.delegasi || '-'
                    }}</q-td>
                    <q-td key="status" class="text-center">
                      <q-badge
                        rounded
                        :color="getStatusColor(props.row.status_approval)"
                        class="q-px-md q-py-xs text-weight-bold uppercase"
                      >
                        {{ props.row.status_approval || 'Pending' }}
                      </q-badge>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
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
const currentUserName = ref('User')

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
  { name: 'no', label: 'No', align: 'center' },
  { name: 'jenis', label: 'Jenis', align: 'center' },
  { name: 'mulai', label: 'Mulai', align: 'center' },
  { name: 'selesai', label: 'Akhir', align: 'center' },
  { name: 'alasan', label: 'Alasan', align: 'center' },
  { name: 'lampiran', label: 'Lampiran', align: 'center' },
  { name: 'delegasi', label: 'Delegasi', align: 'center' },
  { name: 'status', label: 'Status', align: 'center' },
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

const leaveStats = computed(() => [
  { label: 'Total Jatah', value: 12, icon: 'analytics', color: 'indigo', showProgress: false },
  {
    label: 'Telah Diambil',
    value: usedDays.value,
    icon: 'event_busy',
    color: 'orange',
    showProgress: true,
    progress: usedDays.value / 12,
  },
  {
    label: 'Sisa Saldo',
    value: Math.max(0, 12 - usedDays.value),
    icon: 'verified',
    color: 'positive',
    showProgress: true,
    progress: (12 - usedDays.value) / 12,
    textColor: 'green-9',
  },
])

const dateRangeLabel = computed(() => {
  const r = form.value.range
  if (!r) return 'Pilih Rentang Waktu'
  return typeof r === 'string' ? r : r.from ? `${r.from} — ${r.to}` : 'Pilih Rentang Waktu'
})

const formatDate = (d) => (d ? date.formatDate(d, 'DD MMM YYYY') : '-')
const getStatusColor = (s) => {
  const st = s ? s.toLowerCase() : 'pending'
  if (st === 'pending') return 'orange-8'
  if (st === 'approved') return 'positive'
  return 'negative'
}
const getJenisColor = (j) =>
  j === 'Izin Sakit' ? 'red-5' : j === 'Cuti Tahunan' ? 'blue-6' : 'blue-grey-6'

const onSubmit = async () => {
  submitting.value = true
  try {
    const range = form.value.range
    const start = typeof range === 'string' ? range : range?.from
    const end = typeof range === 'string' ? range : range?.to
    if (!start) throw new Error('Pilih tanggal!')

    await addDoc(collection(db, 'pengajuan'), {
      nama_karyawan: currentUserName.value,
      jenis_pengajuan: form.value.jenis,
      tanggal_mulai: start,
      tanggal_selesai: end || start,
      alasan: form.value.alasan,
      dokumen_url: form.value.docUrl,
      delegasi: form.value.delegasi,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    })

    $q.notify({ color: 'positive', message: 'Pengajuan Berhasil!', position: 'top' })
    form.value = {
      jenis: null,
      range: { from: null, to: null },
      alasan: '',
      docUrl: '',
      delegasi: null,
    }
  } catch (e) {
    $q.notify({ color: 'negative', message: e.message })
  } finally {
    submitting.value = false
  }
}

let unsubscribe = null
onMounted(() => {
  const saved = localStorage.getItem('agra_erp_session')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      currentUserName.value = parsed.nama || 'User Agra'
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      currentUserName.value = 'User Agra'
    }
  }

  const q = query(
    collection(db, 'pengajuan'),
    where('nama_karyawan', '==', currentUserName.value),
    orderBy('created_at', 'desc'),
  )
  unsubscribe = onSnapshot(
    q,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    () => {
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
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
  box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.3) !important;
}
.modern-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.border-grey {
  border: 1px solid #e0e0e0;
}
.uppercase {
  text-transform: uppercase;
}
</style>
