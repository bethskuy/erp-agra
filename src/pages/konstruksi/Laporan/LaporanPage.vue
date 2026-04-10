<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center q-mb-md">
      <q-icon name="inventory_2" color="grey-8" size="sm" class="q-mr-sm" />
      <div class="text-subtitle1 text-weight-bold text-grey-8 uppercase">Laporan Operasional</div>
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="(item, index) in operasional"
        :key="index"
        class="col-12 col-sm-6 col-md-3 col-lg-2"
      >
        <q-card
          v-ripple
          class="menu-card text-white cursor-pointer shadow-1"
          :style="{ backgroundColor: item.color }"
          :to="item.to"
        >
          <q-card-section class="column items-center justify-center full-height q-pa-md">
            <q-icon :name="item.icon" size="32px" class="q-mb-sm" />
            <div class="text-center text-weight-bold text-caption uppercase">{{ item.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row items-center q-mb-md">
      <q-icon name="account_balance_wallet" color="grey-8" size="sm" class="q-mr-sm" />
      <div class="text-subtitle1 text-weight-bold text-grey-8 uppercase">Keuangan & Akuntansi</div>
    </div>

    <div class="row q-col-gutter-md">
      <div v-for="(item, index) in keuangan" :key="index" class="col-12 col-sm-6 col-md-3 col-lg-2">
        <q-card
          v-ripple
          class="menu-card text-white cursor-pointer shadow-1"
          :style="{ backgroundColor: item.color }"
          :to="item.to"
        >
          <q-card-section class="column items-center justify-center full-height q-pa-md">
            <q-icon :name="item.icon" size="32px" class="q-mb-sm" />
            <div class="text-center text-weight-bold text-caption uppercase">{{ item.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Tambahkan properti 'to' pada setiap item
const operasional = [
  {
    label: 'Lap. Purchase Order',
    icon: 'shopping_cart',
    color: '#7b83eb',
    to: '/konstruksi/laporan/po',
  },
  {
    label: 'Lap. Outstanding PO',
    icon: 'assignment',
    color: '#9dcb5a',
    to: '/konstruksi/laporan/outstanding-po',
  },
  {
    label: 'Lap. Realisasi RAP',
    icon: 'trending_up',
    color: '#a089c8',
    to: '/konstruksi/laporan/rap',
  },
  {
    label: 'Lap. Proyek',
    icon: 'insert_chart',
    color: '#b6c6d2',
    to: '/konstruksi/laporan/proyek',
  },
  {
    label: 'Lap. Kartu Stok',
    icon: 'inventory_2',
    color: '#fba94b',
    to: '/konstruksi/laporan/stok',
  },
  {
    label: 'Lap. Pengeluaran Material',
    icon: 'local_shipping',
    color: '#f36262',
    to: '/konstruksi/laporan/material',
  },
  {
    label: 'Lap. Progress Pembangunan',
    icon: 'architecture',
    color: '#ff9871',
    to: '/konstruksi/laporan/progress',
  },
  { label: 'Lap. Upah Tukang', icon: 'payments', color: '#556d7a', to: '/konstruksi/laporan/upah' },
  { label: 'Lap. Perijinan', icon: 'gavel', color: '#8d6e63', to: '/konstruksi/laporan/legal' },
]

const keuangan = [
  {
    label: 'Lap. Kas Masuk',
    icon: 'account_balance',
    color: '#9dcb5a',
    to: '/konstruksi/laporan/kas-masuk',
  },
  {
    label: 'Lap. Kas Keluar',
    icon: 'money_off',
    color: '#f36262',
    to: '/konstruksi/laporan/kas-keluar',
  },
  { label: 'Lap. HPP', icon: 'calculate', color: '#ff9871', to: '/konstruksi/laporan/hpp' },
  { label: 'Lap. Utang', icon: 'wallet', color: '#86cfbc', to: '/konstruksi/laporan/hutang' },
  { label: 'Lap. Piutang', icon: 'groups', color: '#7691a0', to: '/konstruksi/laporan/piutang' },
  { label: 'Buku Besar', icon: 'book', color: '#5c6bc0', to: '/konstruksi/laporan/buku-besar' },
  { label: 'Cash Flow', icon: 'show_chart', color: '#9dcb5a', to: '/konstruksi/laporan/cashflow' },
  { label: 'Laba Rugi', icon: 'percent', color: '#a089c8', to: '/konstruksi/laporan/laba-rugi' },
  { label: 'Neraca', icon: 'app_registration', color: '#fba94b', to: '/konstruksi/laporan/neraca' },
]
</script>

<style scoped>
/* Styling tetep sama */
.menu-card {
  height: 110px;
  border-radius: 12px;
  transition: all 0.3s ease;
}
.menu-card:hover {
  transform: translateY(-5px);
  filter: brightness(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}
.text-caption {
  font-size: 10px;
  line-height: 1.2;
}
</style>
