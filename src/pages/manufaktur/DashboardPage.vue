<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10">Manufacture Overview</div>
        <div class="text-subtitle1 text-grey-6">Monitoring lantai produksi dan operasional.</div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card flat class="stat-card shadow-sm" :style="{ borderLeft: `6px solid ${stat.hex}` }">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">{{ stat.title }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ stat.value }}</div>
            </div>
            <q-icon :name="stat.icon" size="30px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: 'WO Berjalan', value: '8', icon: 'settings_suggest', color: 'teal-10', hex: '#00796b' },
  {
    title: 'Mesin Aktif',
    value: '12/15',
    icon: 'precision_manufacturing',
    color: 'primary',
    hex: '#1976d2',
  },
  { title: 'Defect Rate', value: '1.2%', icon: 'warning', color: 'negative', hex: '#c10015' },
  {
    title: 'Target Hari Ini',
    value: '95%',
    icon: 'track_changes',
    color: 'orange',
    hex: '#f2c037',
  },
])
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.stat-card {
  border-radius: 12px;
}
</style>
