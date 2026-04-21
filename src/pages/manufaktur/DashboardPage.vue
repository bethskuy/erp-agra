<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- HEADER -->
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold text-teal-10">Dashboard Manufaktur</div>
      <div class="text-subtitle2 text-grey-6">Monitoring produksi real-time</div>
    </div>

    <!-- 🔥 CARDS -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="card-modern bg-blue text-white">
          <q-card-section>
            <div class="text-subtitle2">Work Order</div>
            <div class="text-h3 text-weight-bold">{{ totalWO }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="card-modern bg-orange text-white">
          <q-card-section>
            <div class="text-subtitle2">Production Result</div>
            <div class="text-h3 text-weight-bold">{{ totalResult }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="card-modern bg-green text-white">
          <q-card-section>
            <div class="text-subtitle2">Rata-rata Progress</div>
            <div class="text-h3 text-weight-bold">{{ avgProgress }}%</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="card-modern bg-teal text-white">
          <q-card-section>
            <div class="text-subtitle2">Selesai</div>
            <div class="text-h3 text-weight-bold">{{ selesai }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 🔥 PROGRESS BAR -->
    <q-card class="card-modern">
      <q-card-section>
        <div class="text-h6 q-mb-md">Status Produksi</div>

        <div class="q-mb-md">
          <div class="text-caption">Pending</div>
          <q-linear-progress :value="pending / totalWO" color="grey" size="12px" rounded />
        </div>

        <div class="q-mb-md">
          <div class="text-caption">Proses</div>
          <q-linear-progress :value="proses / totalWO" color="orange" size="12px" rounded />
        </div>

        <div>
          <div class="text-caption">Selesai</div>
          <q-linear-progress :value="selesai / totalWO" color="green" size="12px" rounded />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// FIREBASE
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

// ================= STATE =================
const totalWO = ref(0)
const totalResult = ref(0)
const avgProgress = ref(0)

const pending = ref(0)
const proses = ref(0)
const selesai = ref(0)

// ================= LOAD DATA =================
const loadData = async () => {
  const woSnap = await getDocs(collection(db, 'work_orders'))
  const resultSnap = await getDocs(collection(db, 'production_results'))

  totalWO.value = woSnap.size
  totalResult.value = resultSnap.size

  const results = resultSnap.docs.map((d) => d.data())

  let totalProgress = 0

  pending.value = 0
  proses.value = 0
  selesai.value = 0

  woSnap.docs.forEach((doc) => {
    const data = doc.data()

    const totalHasil = results
      .filter((r) => r.work_order_id === doc.id)
      .reduce((sum, r) => sum + Number(r.jumlah_hasil || 0), 0)

    let progress = 0
    if (data.jumlah > 0) {
      progress = Math.min(100, Math.round((totalHasil / data.jumlah) * 100))
    }

    totalProgress += progress

    if (progress === 0) pending.value++
    else if (progress < 100) proses.value++
    else selesai.value++
  })

  avgProgress.value = totalWO.value ? Math.round(totalProgress / totalWO.value) : 0
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-modern {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
</style>
