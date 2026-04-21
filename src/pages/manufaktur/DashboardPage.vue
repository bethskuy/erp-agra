<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Dashboard Manufaktur</div>
        <div class="text-subtitle2 text-grey-6">Monitoring produksi & efisiensi real-time</div>
      </div>
      <q-btn flat round icon="refresh" color="teal-10" @click="fetchStats" />
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-blue-6 text-white rounded-borders shadow-sm">
          <q-card-section>
            <div class="text-subtitle2">Work Order</div>
            <div class="text-h3 text-weight-bold">{{ stats.totalWO }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-orange-8 text-white rounded-borders shadow-sm">
          <q-card-section>
            <div class="text-subtitle2">Sedang Proses</div>
            <div class="text-h3 text-weight-bold">{{ stats.prosesWO }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-green-7 text-white rounded-borders shadow-sm">
          <q-card-section>
            <div class="text-subtitle2">Rata-rata Progress</div>
            <div class="text-h3 text-weight-bold">{{ stats.avgProgress }}%</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="bg-teal-7 text-white rounded-borders shadow-sm">
          <q-card-section>
            <div class="text-subtitle2">Selesai</div>
            <div class="text-h3 text-weight-bold">{{ stats.selesaiWO }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat class="rounded-borders shadow-sm q-pa-lg">
      <div class="text-h6 text-weight-bold q-mb-md">Status Produksi (Live)</div>

      <div class="q-mb-md">
        <div class="row justify-between">
          <span>Pending (Antrean)</span>
          <span class="text-weight-bold">{{ stats.pendingWO }} WO</span>
        </div>
        <q-linear-progress
          :value="stats.pendingWO / stats.totalWO || 0"
          color="grey-6"
          size="15px"
          rounded
          class="q-mt-xs"
        />
      </div>

      <div class="q-mb-md">
        <div class="row justify-between">
          <span>Proses Produksi</span>
          <span class="text-weight-bold">{{ stats.prosesWO }} WO</span>
        </div>
        <q-linear-progress
          :value="stats.prosesWO / stats.totalWO || 0"
          color="orange"
          size="15px"
          rounded
          class="q-mt-xs"
        />
      </div>

      <div class="q-mb-md">
        <div class="row justify-between">
          <span>Selesai / QC Pass</span>
          <span class="text-weight-bold">{{ stats.selesaiWO }} WO</span>
        </div>
        <q-linear-progress
          :value="stats.selesaiWO / stats.totalWO || 0"
          color="positive"
          size="15px"
          rounded
          class="q-mt-xs"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const stats = ref({
  totalWO: 0,
  prosesWO: 0,
  pendingWO: 0,
  selesaiWO: 0,
  avgProgress: 0,
})

const fetchStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'work_orders'))
    const data = querySnapshot.docs.map((doc) => doc.data())

    const total = data.length
    const pending = data.filter((d) => d.status === 'Pending').length
    const proses = data.filter((d) => d.status === 'Proses').length
    const selesai = data.filter((d) => d.status === 'Selesai').length

    // Hitung rata-rata progress
    const totalProgress = data.reduce((acc, curr) => acc + (curr.progress || 0), 0)
    const avg = total > 0 ? Math.round(totalProgress / total) : 0

    stats.value = {
      totalWO: total,
      pendingWO: pending,
      prosesWO: proses,
      selesaiWO: selesai,
      avgProgress: avg,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.shadow-sm {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
</style>
