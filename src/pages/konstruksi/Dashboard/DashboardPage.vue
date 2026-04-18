<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10">
          Hello, Agra Team
          <span class="text-h5 text-weight-light text-grey-7">| Project Overview</span>
        </div>
        <div class="text-subtitle1 text-grey-6">
          Hari ini adalah <span class="text-weight-bold">{{ currentDate }}</span
          >. Monitoring terpusat untuk efisiensi konstruksi Anda.
        </div>
      </div>
      <div class="col-12 col-md-3 text-right">
        <q-btn
          color="indigo-10"
          icon="add"
          to="/konstruksi/master/proyek-data"
          label="Proyek Baru"
          unelevated
          no-caps
          class="q-px-md q-py-sm rounded-borders"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card
          flat
          class="stat-card shadow-sm cursor-pointer"
          :style="{ borderLeft: `6px solid ${stat.hex}` }"
          @click="$router.push(stat.to)"
        >
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">{{ stat.title }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ stat.value }}</div>
            </div>
            <q-icon :name="stat.icon" :color="stat.color" size="2rem" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders">
          <q-card-section
            ><div class="text-h6 text-weight-bold">Progress Proyek Aktif</div></q-card-section
          >
          <q-list separator>
            <q-item v-for="p in activeProjects" :key="p.id" class="q-py-md">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ p.nama_proyek }}</q-item-label>
                <q-item-label caption>{{ p.lokasi }}</q-item-label>
              </q-item-section>
              <q-item-section side style="width: 150px">
                <q-linear-progress
                  :value="(p.progress || 0) / 100"
                  size="10px"
                  rounded
                  color="primary"
                />
                <div class="text-caption q-mt-xs">{{ p.progress }}% Selesai</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders fit">
          <q-card-section
            ><div class="text-h6 text-weight-bold">Aktivitas Terkini</div></q-card-section
          >
          <q-list separator>
            <q-item v-for="log in logs" :key="log.id" clickable v-ripple :to="log.to">
              <q-item-section avatar><q-icon :name="log.icon" :color="log.color" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ log.title }}</q-item-label>
                <q-item-label caption>{{ log.time }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

const currentDate = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const stats = ref([
  {
    title: 'Proyek Aktif',
    value: '0',
    icon: 'business',
    color: 'primary',
    hex: '#1976D2',
    to: '/konstruksi/master/proyek-data',
  },
  {
    title: 'Stok Kritis',
    value: '0',
    icon: 'warning',
    color: 'red',
    hex: '#F44336',
    to: '/konstruksi/gudang',
  },
])

const activeProjects = ref([])
const logs = ref([])

const fetchData = async () => {
  // 1. Fetch Proyek
  const projSnap = await getDocs(collection(db, 'proyek'))
  activeProjects.value = projSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  stats.value[0].value = projSnap.size.toString()

  // 2. Fetch Stok Kritis (Integrasi dengan Gudang)
  const stokSnap = await getDocs(collection(db, 'stok_barang'))
  const kritis = stokSnap.docs.filter((d) => d.data().jumlah < 10).length
  stats.value[1].value = kritis.toString()

  // 3. Fetch Log Aktivitas
  const logSnap = await getDocs(
    query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'), limit(5)),
  )
  logs.value = logSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

onMounted(fetchData)
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.stat-card {
  border-radius: 16px;
  transition: 0.3s;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
