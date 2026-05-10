<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         HEADER SECTION
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
              Monitoring Proyek
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Executive Dashboard & Tracking Pekerjaan</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau realisasi pekerjaan, timeline, dan status penyelesaian proyek secara real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Proyek -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TOTAL PROYEK
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ combinedProjects.length }}
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="domain" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Proyek Berjalan -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                SEDANG BERJALAN
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-blue-8">
                {{ countByStatus('On Progress') }}
              </div>
            </div>
            <div
              class="bg-blue-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="trending_up" color="blue-8" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Proyek Selesai -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                PROYEK SELESAI
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                {{ countByStatus('Selesai') }}
              </div>
            </div>
            <div
              class="bg-green-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="task_alt" color="positive" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Valuasi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
              >
                TOTAL VALUASI
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(totalValuation) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari Proyek atau Klien..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="primary" @click="fetchData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA
         ===================================================================================== -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="combinedProjects"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="searchQuery"
        binary-state-sort
        class="monitoring-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
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

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openUpdateDialog(props.row)"
          >
            <q-td key="proyek">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
                  icon="foundation"
                  class="q-mr-md shadow-sm"
                />
                <div>
                  <div
                    class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                  >
                    {{ props.row.nama }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase text-weight-medium">
                    Klien: {{ props.row.konsumen || 'Internal' }}
                  </div>
                </div>
              </div>
            </q-td>

            <q-td key="timeline">
              <div class="text-weight-medium text-blue-grey-9">{{ formatTimeline(props.row) }}</div>
            </q-td>

            <q-td key="progress">
              <div class="full-width">
                <div class="row items-center justify-between q-mb-xs">
                  <q-chip
                    dense
                    :color="getStatusColor(props.row.status).bg"
                    :text-color="getStatusColor(props.row.status).text"
                    class="text-weight-bold font-10 uppercase q-ma-none shadow-sm"
                  >
                    {{ props.row.status || 'Perencanaan' }}
                  </q-chip>
                  <span class="text-caption text-primary text-weight-bolder"
                    >{{ props.row.progress || 0 }}%</span
                  >
                </div>
                <q-linear-progress
                  :value="(props.row.progress || 0) / 100"
                  size="8px"
                  rounded
                  color="primary"
                  track-color="blue-1"
                />
              </div>
            </q-td>

            <q-td key="valuasi" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ formatCompact(props.row.total_omzet) }}
              </div>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                unelevated
                rounded
                color="indigo-10"
                icon="update"
                label="Update"
                size="sm"
                class="q-px-md text-weight-bold shadow-2 btn-hover"
                @click="openUpdateDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="find_in_page" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data proyek tidak ditemukan.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG UPDATE PROGRESS
         ===================================================================================== -->
    <q-dialog v-model="showUpdateDialog" persistent backdrop-filter="blur(4px)">
      <q-card
        style="width: 500px; max-width: 95vw"
        class="rounded-20 shadow-24 bg-grey-2 column no-wrap"
      >
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            Update Progres Pekerjaan
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="saveProgress"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="q-pa-lg">
          <q-card flat bordered class="rounded-12 bg-white shadow-1 border-subtle q-mb-md">
            <q-card-section class="text-center">
              <div class="text-h6 text-weight-black text-indigo-10 leading-tight q-mb-xs">
                {{ selectedProject?.nama }}
              </div>
              <div class="text-caption text-grey-7 uppercase tracking-widest text-weight-bold">
                Klien: {{ selectedProject?.konsumen || 'Internal' }}
              </div>
            </q-card-section>
          </q-card>

          <q-card
            flat
            bordered
            class="rounded-12 bg-white shadow-1 border-subtle q-pa-lg q-gutter-y-lg"
          >
            <div>
              <div class="label-req q-mb-sm">Status Proyek Saat Ini</div>
              <q-select
                outlined
                dense
                v-model="formUpdate.status"
                :options="['Perencanaan', 'On Progress', 'Tertunda', 'Selesai']"
                bg-color="white"
                class="text-weight-bold"
              >
                <template v-slot:selected>
                  <q-chip
                    dense
                    :color="getStatusColor(formUpdate.status).bg"
                    :text-color="getStatusColor(formUpdate.status).text"
                    class="text-weight-bold q-ma-none uppercase font-10"
                  >
                    {{ formUpdate.status }}
                  </q-chip>
                </template>
              </q-select>
            </div>

            <div>
              <div class="row justify-between items-end q-mb-sm">
                <div class="label-req">Persentase Selesai Fisik</div>
                <div class="text-h5 text-weight-black text-primary">{{ formUpdate.progress }}%</div>
              </div>
              <q-slider
                v-model="formUpdate.progress"
                :min="0"
                :max="100"
                color="primary"
                track-size="10px"
                thumb-size="28px"
                class="q-mt-sm"
              />
            </div>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const rawProjects = ref([])
const rawSpks = ref([])

// Dialog State
const showUpdateDialog = ref(false)
const selectedProject = ref(null)
const formUpdate = ref({ status: 'Perencanaan', progress: 0 })

let unsubProyek = null
let unsubSpk = null

const columns = [
  { name: 'proyek', align: 'left', label: 'IDENTITAS PROYEK', field: 'nama', sortable: true },
  {
    name: 'timeline',
    align: 'left',
    label: 'TIMELINE PELAKSANAAN',
    field: 'start_date',
    sortable: true,
  },
  {
    name: 'progress',
    align: 'left',
    label: 'STATUS & KEMAJUAN',
    field: 'progress',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'valuasi',
    align: 'right',
    label: 'VALUASI KONTRAK',
    field: 'total_omzet',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'UPDATE', field: 'id' },
]

// Fetch Data Real-time
const fetchData = () => {
  loading.value = true

  // Ambil Data Proyek
  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    rawProjects.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })

  // Ambil Data SPK untuk kalkulasi timeline & omzet
  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    rawSpks.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// Computed: Gabungkan data Proyek dengan kalkulasi dari SPK
const combinedProjects = computed(() => {
  return rawProjects.value
    .map((proj) => {
      // Cari semua SPK yang terkait dengan proyek ini
      const relatedSpks = rawSpks.value.filter((spk) => spk.projectId === proj.id)

      // Kalkulasi Total Omzet
      const totalOmzet = relatedSpks.reduce((sum, spk) => sum + (spk.nilai_total || 0), 0)

      // Cari Tgl Mulai Paling Awal & Tgl Selesai Paling Akhir
      let startDate = null
      let endDate = null
      relatedSpks.forEach((spk) => {
        if (spk.tgl_mulai) {
          const d = new Date(spk.tgl_mulai)
          if (!startDate || d < startDate) startDate = d
        }
        if (spk.tgl_akhir) {
          const d = new Date(spk.tgl_akhir)
          if (!endDate || d > endDate) endDate = d
        }
      })

      return {
        ...proj,
        total_omzet: totalOmzet,
        start_date: startDate,
        end_date: endDate,
        progress: proj.progress || 0,
        status: proj.status || 'Perencanaan',
      }
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
})

// Kalkulasi KPI
const totalValuation = computed(() => {
  return combinedProjects.value.reduce((sum, p) => sum + (p.total_omzet || 0), 0)
})

const countByStatus = (status) => {
  return combinedProjects.value.filter((p) => p.status === status).length
}

// Dialog Logic
const openUpdateDialog = (proj) => {
  selectedProject.value = proj
  formUpdate.value = {
    status: proj.status || 'Perencanaan',
    progress: proj.progress || 0,
  }
  showUpdateDialog.value = true
}

const saveProgress = async () => {
  submitting.value = true
  try {
    const projRef = doc(db, 'proyek', selectedProject.value.id)
    await updateDoc(projRef, {
      status: formUpdate.value.status,
      progress: formUpdate.value.progress,
      updatedAt: serverTimestamp(),
    })
    $q.notify({ type: 'positive', message: 'Kemajuan proyek berhasil diperbarui!' })
    showUpdateDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal mengupdate proyek.' })
  } finally {
    submitting.value = false
  }
}

// Utils
const formatTimeline = (proj) => {
  if (!proj.start_date && !proj.end_date) return 'Belum ada SPK'
  const formatOpt = { day: 'numeric', month: 'short', year: 'numeric' }
  const startStr = proj.start_date ? proj.start_date.toLocaleDateString('id-ID', formatOpt) : '?'
  const endStr = proj.end_date ? proj.end_date.toLocaleDateString('id-ID', formatOpt) : '?'
  return `${startStr} - ${endStr}`
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' Miliar'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Juta'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Perencanaan':
      return { bg: 'grey-3', text: 'grey-8' }
    case 'On Progress':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Tertunda':
      return { bg: 'red-2', text: 'red-9' }
    case 'Selesai':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
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
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Table Styling */
.monitoring-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeUp {
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
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
</style>
