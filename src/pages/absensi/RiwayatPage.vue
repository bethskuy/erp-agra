<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <div class="row items-center justify-between q-mb-xl">
          <div>
            <div class="text-h4 text-weight-bolder text-grey-9">Riwayat Presensi</div>
            <div class="text-subtitle1 text-grey-7">
              Halo, <span class="text-primary text-weight-bold">{{ userName }}</span
              >! Berikut adalah catatan aktivitasmu.
            </div>
          </div>
          <q-btn flat round color="primary" icon="help_outline" class="bg-white shadow-1">
            <q-tooltip>Butuh bantuan laporan?</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-4">
            <q-card flat class="rounded-borders shadow-1 bg-white">
              <q-card-section class="q-pa-sm">
                <q-input
                  borderless
                  v-model="filterBulan"
                  label="Pilih Periode"
                  dense
                  readonly
                  class="q-px-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_month" color="primary" />
                  </template>
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="filterBulan"
                      mask="MMMM YYYY"
                      minimal
                      emit-immediately
                      default-view="Years"
                      years-in-month-view
                      @update:model-value="loadDataByFilter"
                      v-close-popup
                    />
                  </q-popup-proxy>
                </q-input>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-2">
            <q-btn
              unelevated
              color="primary"
              icon="refresh"
              label="Sync"
              class="full-width full-height rounded-borders shadow-2"
              :loading="loading"
              @click="loadDataByFilter"
            />
          </div>
        </div>

        <q-card flat class="rounded-borders shadow-3 overflow-hidden bg-white">
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            class="modern-table"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-primary text-white">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="hover-row">
                <q-td key="no" class="text-center">{{ props.rowIndex + 1 }}</q-td>
                <q-td key="tanggal" class="text-center">
                  <div class="text-weight-bold text-grey-9">{{ props.row.tanggal }}</div>
                </q-td>
                <q-td key="jamIn" class="text-center">
                  <q-chip outline color="positive" text-color="white" icon="login" dense>
                    {{ formatWaktu(props.row.waktu_masuk) }}
                  </q-chip>
                </q-td>
                <q-td key="jamOut" class="text-center">
                  <q-chip outline color="negative" text-color="white" icon="logout" dense>
                    {{ formatWaktu(props.row.waktu_pulang) }}
                  </q-chip>
                </q-td>
                <q-td key="totalJam" class="text-center">
                  <div class="text-primary text-weight-bolder">
                    {{ hitungDurasi(props.row.waktu_masuk, props.row.waktu_pulang) }}
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width text-center q-pa-xl">
                <q-icon name="history_toggle_off" size="56px" color="grey-4" />
                <div class="text-grey-6 q-mt-md">Wah, belum ada data presensi di bulan ini.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { date } from 'quasar'

const loading = ref(false)
const filterBulan = ref(date.formatDate(Date.now(), 'MMMM YYYY'))
const rows = ref([])
const userName = ref('Karyawan') // Default awal

// --- LOGIKA AMBIL NAMA DINAMIS ---
const getDynamicName = () => {
  // 1. Coba ambil dari localStorage (biasanya disimpan pas login)
  const savedUser = localStorage.getItem('user_data')
  if (savedUser) {
    const parsed = JSON.parse(savedUser)
    userName.value = parsed.nama || parsed.displayName || 'Karyawan'
  }
  // 2. Jika kamu pakai Firebase Auth secara langsung, bisa pakai:
  // const user = getAuth().currentUser; if(user) userName.value = user.displayName;
}

const columns = [
  { name: 'no', label: 'INDEX', align: 'center', field: 'no' },
  { name: 'tanggal', label: 'HARI & TANGGAL', align: 'center', field: 'tanggal' },
  { name: 'jamIn', label: 'MASUK', align: 'center', field: 'waktu_masuk' },
  { name: 'jamOut', label: 'PULANG', align: 'center', field: 'waktu_pulang' },
  { name: 'totalJam', label: 'DURASI KERJA', align: 'center', field: 'total' },
]

const loadDataByFilter = async () => {
  loading.value = true
  rows.value = []
  try {
    const [monthName, year] = filterBulan.value.split(' ')
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]
    const monthIndex = months.indexOf(monthName)

    const startOfMonth = new Date(parseInt(year), monthIndex, 1)
    const endOfMonth = new Date(parseInt(year), monthIndex + 1, 1)

    const q = query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(startOfMonth)),
      where('waktu_masuk', '<', Timestamp.fromDate(endOfMonth)),
      orderBy('waktu_masuk', 'desc'),
    )

    const querySnapshot = await getDocs(q)
    rows.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Gagal load data:', error)
  } finally {
    loading.value = false
  }
}

const formatWaktu = (ts) => {
  if (!ts) return '--:--'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const hitungDurasi = (startTs, endTs) => {
  if (!startTs || !endTs) return '-'
  const start = startTs.toDate ? startTs.toDate() : new Date(startTs)
  const end = endTs.toDate ? endTs.toDate() : new Date(endTs)
  const diffMs = end - start
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffMins = Math.floor((diffMs % 3600000) / 60000)
  return `${diffHrs}j ${diffMins}m`
}

onMounted(() => {
  getDynamicName()
  loadDataByFilter()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-3 {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}
.modern-table {
  border: none;
}
.hover-row:hover {
  background-color: #f1f5f9 !important;
  transition: 0.3s;
}
.font-digital {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
