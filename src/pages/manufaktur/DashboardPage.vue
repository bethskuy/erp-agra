<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Dashboard</div>
        <div class="text-subtitle2 text-grey-6">Ringkasan aktivitas produksi & inventori</div>
      </div>
      <q-btn round flat icon="notifications" color="teal-10">
        <q-badge floating color="red" rounded />
      </q-btn>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-md-4">
        <q-card
          flat
          class="rounded-borders shadow-sm no-border-left-accent-blue cursor-pointer"
          @click="$router.push('/manufaktur/work-order')"
        >
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-grey-7 text-subtitle1">Produksi Aktif</div>
              <div class="text-h3 text-weight-bold">{{ totalActiveProduction }}</div>
            </div>
            <div class="col-auto">
              <q-icon name="precision_manufacturing" size="44px" color="blue-8" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions class="bg-blue-1 text-blue-8 text-caption">
            Lihat Work Order
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card
          flat
          class="rounded-borders shadow-sm no-border-left-accent-red cursor-pointer"
          @click="$router.push('/manufaktur/gudang/monitoring')"
        >
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-grey-7 text-subtitle1">Stok Kritis</div>
              <div class="text-h3 text-weight-bold">{{ totalCriticalStock }}</div>
            </div>
            <div class="col-auto">
              <q-icon name="warning_amber" size="44px" color="red-8" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions class="bg-red-1 text-red-8 text-caption">
            Re-order Material Sekarang
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card
          flat
          class="rounded-borders shadow-sm no-border-left-accent-teal cursor-pointer"
          @click="$router.push('/manufaktur/master/bom')"
        >
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-grey-7 text-subtitle1">Total Resep (BOM)</div>
              <div class="text-h3 text-weight-bold">{{ totalBOM }}</div>
            </div>
            <div class="col-auto">
              <q-icon name="receipt_long" size="44px" color="teal-8" />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions class="bg-teal-1 text-teal-8 text-caption">
            Kelola Master BOM
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6 text-teal-10">Monitoring Progress Produksi</div>
        <q-btn flat round icon="more_vert" color="grey-7" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-xl flex flex-center" style="min-height: 200px">
        <div class="text-center">
          <q-icon name="analytics" size="80px" color="grey-4" />
          <div class="text-grey-6 q-mt-md text-subtitle1">Aktivitas Terkini Produksi</div>
          <div class="text-caption text-grey-5">Update operasional lapangan & gudang</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
// Menghapus 'where' dan 'query' yang tidak terpakai agar tidak error ESLint
import { collection, getDocs } from 'firebase/firestore'

const totalActiveProduction = ref(0)
const totalCriticalStock = ref(0)
const totalBOM = ref(0)

const fetchDashboardData = async () => {
  try {
    // 1. Ambil data Work Orders
    const woSnap = await getDocs(collection(db, 'work_orders'))
    // Filter manual: Hitung yang statusnya bukan 'Selesai'
    totalActiveProduction.value = woSnap.docs.filter(
      (doc) => doc.data().status !== 'Selesai',
    ).length

    // 2. Ambil data Materials
    const materialSnap = await getDocs(collection(db, 'materials'))
    // Filter manual: Hitung stok yang <= 10 (angka 10 bisa abang ganti sesuai kebutuhan)
    totalCriticalStock.value = materialSnap.docs.filter((doc) => doc.data().stok <= 10).length

    // 3. Ambil data BOM
    const bomSnap = await getDocs(collection(db, 'boms'))
    totalBOM.value = bomSnap.docs.length
  } catch (error) {
    console.error('Gagal mengambil data dashboard:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.no-border-left-accent-blue {
  border-left: 6px solid #1976d2;
}
.no-border-left-accent-red {
  border-left: 6px solid #d32f2f;
}
.no-border-left-accent-teal {
  border-left: 6px solid #004d40;
}
.text-teal-10 {
  color: #004d40;
}
</style>
