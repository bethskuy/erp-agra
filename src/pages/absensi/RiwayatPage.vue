<template>
  <q-page padding class="bg-grey-2">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-10">
        <div class="row items-center q-mb-md">
          <q-btn flat round icon="arrow_back" color="primary" @click="$router.back()" />
          <div class="text-h5 text-weight-bolder q-ml-sm text-grey-9">RIWAYAT ABSENSI</div>
          <q-space />
          <q-btn
            outline
            color="primary"
            icon="print"
            label="Cetak Laporan"
            class="rounded-borders"
          />
        </div>

        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-white rounded-borders shadow-1">
              <q-card-section>
                <div class="text-caption text-uppercase text-weight-bold text-grey-6">
                  Total Hadir
                </div>
                <div class="text-h4 text-weight-bolder text-primary">{{ rows.length }}</div>
                <div class="text-caption text-positive text-weight-bold">
                  <q-icon name="check_circle" /> Data Terverifikasi
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-white rounded-borders shadow-1">
              <q-card-section>
                <div class="text-caption text-uppercase text-weight-bold text-grey-6">
                  Rata-rata Masuk
                </div>
                <div class="text-h4 text-weight-bolder text-orange-9">08:05</div>
                <div class="text-caption text-grey text-italic">Bulan April 2026</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="bg-white rounded-borders shadow-1">
              <q-card-section>
                <div class="text-caption text-uppercase text-weight-bold text-grey-6">
                  Lokasi Terakhir
                </div>
                <div class="text-h4 text-weight-bolder text-green-9">AKTIF</div>
                <div class="text-caption text-grey text-weight-bold truncate">
                  <q-icon name="place" size="xs" />
                  {{ rows[0]?.nama_tempat || 'Mencari lokasi...' }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card flat bordered class="shadow-2 rounded-borders overflow-hidden">
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-grey-1">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold text-grey-8"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body-cell-tanggal="props">
              <q-td :props="props">
                <div class="text-weight-bold">{{ props.value }}</div>
                <div class="text-caption text-primary items-center row">
                  <q-icon name="location_on" size="xs" class="q-mr-xs" />
                  {{ props.row.nama_tempat || 'Lokasi Terdeteksi' }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-jamIn="props">
              <q-td :props="props">
                <div class="row items-center justify-center no-wrap">
                  <q-icon name="login" color="positive" size="xs" class="q-mr-xs" />
                  <span class="text-weight-bold text-h6 text-primary">{{
                    formatWaktu(props.row.waktu_masuk)
                  }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-jamOut="props">
              <q-td :props="props">
                <div class="row items-center justify-center no-wrap">
                  <q-icon name="logout" color="negative" size="xs" class="q-mr-xs" />
                  <span class="text-weight-bold text-h6 text-negative">{{
                    formatWaktu(props.row.waktu_pulang)
                  }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value === 'Selesai' ? 'positive' : 'orange'"
                  text-color="white"
                  dense
                  class="text-weight-bolder q-px-md"
                >
                  {{ props.value === 'Selesai' ? 'SELESAI' : 'HADIR' }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-aksi="props">
              <q-td :props="props">
                <q-btn flat round color="grey-6" icon="more_vert">
                  <q-menu auto-close>
                    <q-list style="min-width: 120px">
                      <q-item clickable @click="lihatPeta(props.row)">
                        <q-item-section avatar
                          ><q-icon name="map" color="primary"
                        /></q-item-section>
                        <q-item-section>Lihat Lokasi</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-td>
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
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const loading = ref(true)
const rows = ref([])

const columns = [
  { name: 'tanggal', label: 'TANGGAL & LOKASI', field: 'tanggal', align: 'left', sortable: true },
  { name: 'jamIn', label: 'JAM MASUK', field: 'waktu_masuk', align: 'center' },
  { name: 'jamOut', label: 'JAM PULANG', field: 'waktu_pulang', align: 'center' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' },
  { name: 'aksi', label: 'OPSI', field: 'aksi', align: 'center' },
]

const formatWaktu = (ts) => {
  if (!ts) return '--:--'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const lihatPeta = (row) => {
  if (row.koordinat_masuk) {
    const { lat, lng } = row.koordinat_masuk
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }
}

onMounted(() => {
  const q = query(collection(db, 'absensi'), orderBy('waktu_masuk', 'desc'))
  onSnapshot(q, (snapshot) => {
    rows.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  })
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-2 {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
