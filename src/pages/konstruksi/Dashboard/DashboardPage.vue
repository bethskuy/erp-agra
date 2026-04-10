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
          >. Ada 3 proyek butuh perhatian segera.
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
        <q-card flat class="stat-card shadow-sm" :style="{ borderLeft: `6px solid ${stat.hex}` }">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-7 text-uppercase text-weight-bolder">
                {{ stat.title }}
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ stat.value }}</div>
              <div class="text-caption text-positive text-weight-bold">
                <q-icon name="trending_up" /> {{ stat.diff }}%
                <span class="text-grey-6 text-weight-light">vs bulan lalu</span>
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                :icon="stat.icon"
                :text-color="stat.color"
                :bg-color="stat.bgColor"
                size="56px"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders q-mb-lg shadow-sm">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-bold text-indigo-10">AKSES CEPAT MODUL</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-md q-pa-md">
            <div class="col-6 col-sm-3" v-for="menu in shortcuts" :key="menu.label">
              <q-btn
                stack
                flat
                class="full-width q-pa-md shortcut-btn text-grey-9 border-light"
                :to="menu.to"
                no-caps
              >
                <q-icon
                  :name="menu.icon"
                  :style="{ color: menu.hex }"
                  size="36px"
                  class="q-mb-sm"
                />
                <div class="text-weight-bold">{{ menu.label }}</div>
                <div class="text-caption text-grey-6">{{ menu.sub }}</div>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="rounded-borders shadow-sm">
          <q-card-section class="row items-center">
            <div class="text-subtitle1 text-weight-bold text-indigo-10">STATUS PROYEK BERJALAN</div>
            <q-space />
            <q-btn flat dense color="primary" label="Lihat Semua" no-caps />
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="p in activeProjects" :key="p.name" class="q-py-md">
              <q-item-section avatar>
                <q-circular-progress
                  show-value
                  font-size="10px"
                  :value="p.progress"
                  size="50px"
                  :thickness="0.2"
                  :color="p.progress > 70 ? 'positive' : 'indigo'"
                  track-color="grey-3"
                  class="text-weight-bold"
                >
                  {{ p.progress }}%
                </q-circular-progress>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle1">{{ p.name }}</q-item-label>
                <q-item-label caption>{{ p.location }} • PM: {{ p.pm }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-caption text-grey-7 q-mb-xs">Est. Selesai</div>
                <q-badge :label="p.deadline" color="grey-2" text-color="grey-9" class="q-pa-xs" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders q-mb-lg bg-white shadow-sm overflow-hidden">
          <div class="bg-indigo-10 q-pa-md text-white">
            <div class="text-subtitle2 opacity-80 uppercase">Total Saldo Kas/Bank</div>
            <div class="text-h4 text-weight-bolder">Rp 1.420.000.000</div>
          </div>
          <q-card-section class="q-pa-md">
            <div class="row justify-between q-mb-sm">
              <div class="text-grey-7">Piutang Owner</div>
              <div class="text-weight-bold text-positive">Rp 850.000.000</div>
            </div>
            <div class="row justify-between">
              <div class="text-grey-7">Hutang Supplier</div>
              <div class="text-weight-bold text-negative">Rp 320.000.000</div>
            </div>
            <q-separator class="q-my-md" />
            <q-btn
              outline
              color="indigo-10"
              label="Laporan Keuangan Lengkap"
              class="full-width"
              no-caps
            />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="rounded-borders shadow-sm">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-indigo-10">LOG AKTIVITAS</div>
          </q-card-section>
          <q-list dense>
            <q-item v-for="log in logs" :key="log.id" class="q-mb-sm">
              <q-item-section avatar>
                <q-icon
                  :name="log.icon"
                  :color="log.color"
                  bg-color="grey-2"
                  class="q-pa-sm rounded-borders"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ log.title }}</q-item-label>
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
import { ref } from 'vue'

const currentDate = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const stats = ref([
  {
    title: 'Proyek Aktif',
    value: '12',
    icon: 'foundation',
    color: 'indigo',
    hex: '#3f51b5',
    bgColor: 'indigo-1',
    diff: 12,
  },
  {
    title: 'Anggaran RAP',
    value: 'Rp 4.2M',
    icon: 'payments',
    color: 'green',
    hex: '#4caf50',
    bgColor: 'green-1',
    diff: 5,
  },
  {
    title: 'Hutang Jatuh Tempo',
    value: '8 Invoice',
    icon: 'warning',
    color: 'orange',
    hex: '#ff9800',
    bgColor: 'orange-1',
    diff: 2,
  },
  {
    title: 'Pekerja Lapangan',
    value: '145 Orang',
    icon: 'engineering',
    color: 'blue-grey',
    hex: '#607d8b',
    bgColor: 'blue-grey-1',
    diff: 8,
  },
])

const shortcuts = ref([
  {
    label: 'Penawaran',
    sub: 'Marketing',
    icon: 'campaign',
    hex: '#3f51b5',
    to: '/konstruksi/marketing/penawaran',
  },
  {
    label: 'Input RAB',
    sub: 'Perencanaan',
    icon: 'architecture',
    hex: '#4caf50',
    to: '/konstruksi/perencanaan/boq',
  },
  {
    label: 'Terima Barang',
    sub: 'Logistik',
    icon: 'inventory',
    hex: '#ff9800',
    to: '/konstruksi/gudang/penerimaan',
  },
  {
    label: 'Invoice',
    sub: 'Keuangan',
    icon: 'description',
    hex: '#e91e63',
    to: '/konstruksi/keuangan/invoicing',
  },
])

const activeProjects = ref([
  {
    name: 'Villa Modern Canggu',
    location: 'Canggu, Bali',
    pm: 'Bpk. Wayan',
    progress: 85,
    deadline: '15 Mei 2026',
  },
  {
    name: 'Agra Town House B',
    location: 'Renon, Denpasar',
    pm: 'Bpk. Agus',
    progress: 42,
    deadline: '20 Des 2026',
  },
  {
    name: 'Ruko Renon Square',
    location: 'Denpasar',
    pm: 'Bpk. Made',
    progress: 15,
    deadline: '10 Jan 2027',
  },
])

const logs = ref([
  {
    id: 1,
    title: 'Invoice INV-001 Lunas',
    time: '10 menit yang lalu',
    icon: 'check_circle',
    color: 'positive',
  },
  {
    id: 2,
    title: 'Material Semen Masuk (100 Sak)',
    time: '1 jam yang lalu',
    icon: 'inventory',
    color: 'orange',
  },
  {
    id: 3,
    title: 'Update Progress Proyek Canggu',
    time: '3 jam yang lalu',
    icon: 'trending_up',
    color: 'indigo',
  },
])
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.stat-card:hover {
  transform: scale(1.02);
}
.shortcut-btn {
  border-radius: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}
.shortcut-btn:hover {
  background: #f5f7ff;
  border-color: #3f51b5;
  transform: translateY(-3px);
}
.rounded-borders {
  border-radius: 12px;
}
.border-light {
  border: 1px solid #f0f0f0;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
