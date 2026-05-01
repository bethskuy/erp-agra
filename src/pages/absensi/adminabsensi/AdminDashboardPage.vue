<template>
  <q-page class="bg-blue-grey-1 q-pa-md">
    <!-- STATS CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4" v-for="stat in stats" :key="stat.title">
        <q-card flat class="rounded-12 shadow-1">
          <q-card-section class="row items-center no-wrap">
            <q-avatar
              :icon="stat.icon"
              :color="stat.color + '-1'"
              :text-color="stat.color"
              size="48px"
            />
            <div class="q-ml-md">
              <div class="text-caption text-grey-6 text-weight-bold uppercase">
                {{ stat.title }}
              </div>
              <div class="text-h5 text-weight-bolder text-blue-grey-10">{{ stat.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- MAIN MONITORING TABLE -->
    <q-card flat class="rounded-16 shadow-2 overflow-hidden bg-white">
      <q-card-section class="bg-blue-grey-10 text-white row items-center q-pa-md">
        <q-icon name="monitor_heart" size="sm" />
        <div class="text-subtitle1 text-weight-bold q-ml-md uppercase tracking-widest">
          Monitoring Presensi Real-Time
        </div>
        <q-space />
        <q-input
          v-model="search"
          placeholder="Cari nama karyawan..."
          dark
          dense
          borderless
          class="bg-white-10 q-px-md rounded-borders"
        >
          <template v-slot:append><q-icon name="search" /></template>
        </q-input>
      </q-card-section>

      <q-table
        :rows="filteredRows"
        :columns="columns"
        flat
        :pagination="{ rowsPerPage: 10 }"
        class="modern-table"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="foto" class="text-center">
              <q-avatar
                size="45px"
                class="shadow-1 border-white cursor-pointer"
                @click="showZoom(props.row.foto_selfie)"
              >
                <q-img :src="props.row.foto_selfie || 'https://cdn.quasar.dev/img/avatar.png'" />
              </q-avatar>
            </q-td>
            <q-td key="nama" class="text-weight-bold text-blue-grey-10">{{
              props.row.nama_karyawan
            }}</q-td>
            <q-td key="checkin" class="text-center">
              <q-badge outline color="positive" class="text-weight-bold">{{
                formatWaktu(props.row.waktu_masuk)
              }}</q-badge>
            </q-td>
            <q-td key="checkout" class="text-center">
              <q-badge
                outline
                :color="props.row.waktu_pulang ? 'negative' : 'grey-5'"
                class="text-weight-bold"
              >
                {{ formatWaktu(props.row.waktu_pulang) }}
              </q-badge>
            </q-td>
            <q-td key="lembur" class="text-center">
              <!-- LOGIKA OVERTIME OTOMATIS (OPSI 1) -->
              <q-badge
                :color="props.row.total_lembur > 0 ? 'orange-9' : 'grey-4'"
                :text-color="props.row.total_lembur > 0 ? 'white' : 'grey-7'"
                class="q-px-md q-py-xs text-weight-bolder"
              >
                {{ props.row.total_lembur }} Menit
              </q-badge>
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { date } from 'quasar'

const search = ref('')
const rows = ref([])
const SHIFT_END = '17:00' // Jam pulang Shift 1

const columns = [
  { name: 'foto', label: 'FOTO', align: 'center' },
  { name: 'nama', label: 'NAMA KARYAWAN', align: 'left' },
  { name: 'checkin', label: 'MASUK', align: 'center' },
  { name: 'checkout', label: 'PULANG', align: 'center' },
  { name: 'lembur', label: 'OVERTIME', align: 'center' },
  { name: 'status', label: 'STATUS', align: 'center' },
]

const stats = computed(() => [
  { title: 'Total Hadir', value: rows.value.length, icon: 'groups', color: 'primary' },
  {
    title: 'Lembur Hari Ini',
    value: rows.value.filter((r) => r.total_lembur > 0).length,
    icon: 'timer',
    color: 'orange',
  },
  {
    title: 'Di Luar Area',
    value: rows.value.filter((r) => r.nama_tempat === 'AREA TESTING').length,
    icon: 'wrong_location',
    color: 'negative',
  },
])

// LOGIKA OTOMATIS: Menghitung lembur berdasarkan selisih jam pulang
const calculateOvertime = (pulangTs) => {
  if (!pulangTs) return 0
  const d = pulangTs.toDate()
  const [h, m] = SHIFT_END.split(':')
  const shiftEndObj = new Date(d)
  shiftEndObj.setHours(h, m, 0, 0)

  const diffMs = d - shiftEndObj
  const diffMins = Math.floor(diffMs / 60000)
  return diffMins > 15 ? diffMins : 0 // Toleransi 15 menit
}

const getStatusColor = (s) => (s === 'Selesai' ? 'positive' : s === 'Hadir' ? 'primary' : 'orange')
const formatWaktu = (ts) => (ts ? date.formatDate(ts.toDate(), 'HH:mm') : '--:--')

onMounted(() => {
  const startDay = new Date()
  startDay.setHours(0, 0, 0, 0)
  const q = query(collection(db, 'absensi'), orderBy('waktu_masuk', 'desc'))

  onSnapshot(q, (snap) => {
    rows.value = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        ...d,
        total_lembur: calculateOvertime(d.waktu_pulang),
      }
    })
  })
})

const filteredRows = computed(() =>
  rows.value.filter((r) => r.nama_karyawan.toLowerCase().includes(search.value.toLowerCase())),
)
</script>
