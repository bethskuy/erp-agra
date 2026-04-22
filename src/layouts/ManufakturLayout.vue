<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-teal-10 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          Agra ERP <span class="text-weight-light">| Manufacture</span>
        </q-toolbar-title>

        <q-btn flat dense round icon="home" @click="$router.push('/')" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-teal-10 text-weight-bold q-pt-md">
          NAVIGASI SISTEM
        </q-item-label>

        <q-item clickable v-ripple to="/manufaktur/dashboard" active-class="text-teal-10 bg-teal-1">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator q-my-sm />

        <q-expansion-item
          icon="precision_manufacturing"
          label="Produksi"
          default-opened
          header-class="text-weight-bold"
        >
          <q-item clickable v-ripple to="/manufaktur/work-order" class="q-ml-md">
            <q-item-section avatar><q-icon name="assignment" /></q-item-section>
            <q-item-section>Work Order</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/production-steps" class="q-ml-md">
            <q-item-section avatar><q-icon name="format_list_numbered" /></q-item-section>
            <q-item-section>Production Steps</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/production-result" class="q-ml-md">
            <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
            <q-item-section>Production Result</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          icon="warehouse"
          label="Gudang"
          default-opened
          header-class="text-weight-bold"
        >
          <q-item clickable v-ripple to="/manufaktur/gudang/monitoring" class="q-ml-md">
            <q-item-section avatar><q-icon name="analytics" /></q-item-section>
            <q-item-section>Monitoring Stok</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/gudang/barang-masuk" class="q-ml-md">
            <q-item-section avatar><q-icon name="input" /></q-item-section>
            <q-item-section>Barang Masuk</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          icon="settings"
          label="Master Data"
          default-opened
          header-class="text-weight-bold"
        >
          <q-item clickable v-ripple to="/manufaktur/master/bom" class="q-ml-md">
            <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
            <q-item-section>BOM (Resep)</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/master/material" class="q-ml-md">
            <q-item-section avatar><q-icon name="category" /></q-item-section>
            <q-item-section>Material Data</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.text-teal-10 {
  color: #004d40;
}
.bg-teal-10 {
  background: #004d40;
}
.bg-teal-1 {
  background: #e0f2f1;
}

/* Styling link aktif agar berwarna hijau khas Agra ERP */
.q-item.q-router-link--active {
  color: #004d40;
  background: #e0f2f1;
  font-weight: bold;
}
</style>
