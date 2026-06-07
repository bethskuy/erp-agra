<template>
  <q-page class="manufactur-dashboard q-pa-lg">
    <div class="dashboard-heading q-mb-xl">
      <div class="text-overline text-green-2 text-weight-bold">MANUFAKTUR</div>
      <div class="text-h4 text-weight-bold text-white">Dashboard</div>
      <div class="text-body2 text-green-1">Ringkasan operasional produksi AGRA ERP</div>
    </div>
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-4" v-for="card in statCards" :key="card.title">
        <q-card
          flat
          class="manufactur-stat-card dashboard-stat-card"
          :style="`border-left: 6px solid ${card.color}`"
        >
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-7 text-weight-medium">{{ card.title }}</div>
              <q-skeleton v-if="loading" type="text" width="72px" height="48px" />
              <div v-else class="text-h3 text-weight-bold dashboard-counter">
                {{ card.value }}
              </div>
            </div>
            <q-icon
              :name="card.icon"
              size="44px"
              :color="card.iconColor"
              class="dashboard-stat-icon"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const totalActiveProduction = ref(0)
const totalCriticalStock = ref(0)
const totalBOM = ref(0)
const animatedActiveProduction = ref(0)
const animatedCriticalStock = ref(0)
const animatedBOM = ref(0)
const loading = ref(true)
const animationFrames = new Set()

const animateNumber = (source, target) => {
  watch(
    source,
    (nextValue, previousValue = 0) => {
      const start = Number(previousValue) || 0
      const end = Number(nextValue) || 0
      const duration = 650
      const startedAt = performance.now()

      const tick = (now) => {
        animationFrames.delete(activeFrame)
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        target.value = Math.round(start + (end - start) * eased)

        if (progress < 1) {
          activeFrame = requestAnimationFrame(tick)
          animationFrames.add(activeFrame)
        }
      }

      let activeFrame = requestAnimationFrame(tick)
      animationFrames.add(activeFrame)
    },
    { immediate: true },
  )
}

animateNumber(totalActiveProduction, animatedActiveProduction)
animateNumber(totalCriticalStock, animatedCriticalStock)
animateNumber(totalBOM, animatedBOM)

const statCards = ref([
  {
    title: 'Produksi Aktif',
    value: animatedActiveProduction,
    icon: 'precision_manufacturing',
    color: '#1976d2',
    iconColor: 'blue-8',
  },
  {
    title: 'Stok Kritis',
    value: animatedCriticalStock,
    icon: 'warning_amber',
    color: '#d32f2f',
    iconColor: 'red-8',
  },
  {
    title: 'Total Resep (BOM)',
    value: animatedBOM,
    icon: 'receipt_long',
    color: '#004d40',
    iconColor: 'teal-8',
  },
])

const fetchData = async () => {
  try {
    const wo = await getDocs(collection(db, 'work_orders'))
    totalActiveProduction.value = wo.docs.filter((d) => d.data().status !== 'Selesai').length
    const mat = await getDocs(collection(db, 'materials'))
    totalCriticalStock.value = mat.docs.filter((d) => Number(d.data().stok) <= 10).length
    const bom = await getDocs(collection(db, 'boms'))
    totalBOM.value = bom.size
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)
onUnmounted(() => {
  animationFrames.forEach((frame) => cancelAnimationFrame(frame))
  animationFrames.clear()
})
</script>

<style scoped>
.manufactur-dashboard {
  min-height: 100%;
}
.dashboard-heading {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(187, 247, 208, 0.22);
}
.dashboard-stat-card {
  position: relative;
  overflow: hidden;
}
.dashboard-stat-card::after {
  position: absolute;
  inset: auto 18px 14px auto;
  width: 78px;
  height: 78px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.12), transparent 66%);
  content: '';
}
.dashboard-counter {
  color: #0f172a;
  line-height: 1;
}
.dashboard-stat-icon {
  position: relative;
  z-index: 1;
  transition:
    transform 220ms ease,
    filter 220ms ease;
}
.dashboard-stat-card:hover .dashboard-stat-icon {
  transform: translate3d(0, -2px, 0) scale(1.04);
  filter: saturate(1.08);
}
</style>
