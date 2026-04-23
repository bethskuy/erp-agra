<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-teal-10 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          Agra ERP <span class="text-weight-light">| Manufacture</span>
        </q-toolbar-title>

        <q-btn flat dense round icon="notifications">
          <q-badge floating color="red" rounded />
        </q-btn>

        <q-btn flat dense round icon="apps">
          <q-menu transition-show="jump-down" transition-hide="jump-up" :offset="[0, 10]">
            <q-card style="min-width: 250px" class="q-pa-sm">
              <q-card-section>
                <div class="text-subtitle2 text-grey-7 q-mb-md text-center">Modul Agra ERP</div>
                <div class="row q-col-gutter-md">
                  <div class="col-4 text-center">
                    <q-btn stack flat color="teal-10" class="full-width" to="/manufaktur/dashboard">
                      <q-icon name="precision_manufacturing" size="30px" />
                      <div style="font-size: 10px">Manufacture</div>
                    </q-btn>
                  </div>
                  <div class="col-4 text-center">
                    <q-btn stack flat color="blue-8" class="full-width" to="/konstruksi/dashboard">
                      <q-icon name="engineering" size="30px" />
                      <div style="font-size: 10px">Konstruksi</div>
                    </q-btn>
                  </div>
                  <div class="col-4 text-center">
                    <q-btn stack flat color="purple-8" class="full-width" to="/management-karyawan">
                      <q-icon name="groups" size="30px" />
                      <div style="font-size: 10px">Karyawan</div>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="center">
                <q-btn
                  flat
                  label="Beranda Utama"
                  color="primary"
                  icon="home"
                  to="/"
                  class="full-width"
                />
              </q-card-actions>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-teal-10 text-weight-bold q-pt-md">
          NAVIGASI SISTEM
        </q-item-label>

        <q-item clickable v-ripple to="/manufaktur/dashboard" active-class="text-teal-10 bg-teal-1">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator q-my-sm />

        <q-expansion-item
          icon="precision_manufacturing"
          label="Produksi"
          default-opened
          header-class="text-weight-bold text-teal-10"
        >
          <q-item clickable v-ripple to="/manufaktur/work-order" class="q-ml-md">
            <q-item-section avatar><q-icon name="assignment" /></q-item-section>
            <q-item-section>Work Order</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/production-steps" class="q-ml-md">
            <q-item-section avatar><q-icon name="format_list_numbered" /></q-item-section>
            <q-item-section>Production Steps</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/produksi/quality-control" class="q-ml-md">
            <q-item-section avatar><q-icon name="fact_check" color="orange-8" /></q-item-section>
            <q-item-section>Quality Control (QC)</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/production-result" class="q-ml-md">
            <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
            <q-item-section>Production Result</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          icon="warehouse"
          label="Gudang & Logistik"
          header-class="text-weight-bold text-teal-10"
        >
          <q-item clickable v-ripple to="/manufaktur/gudang/monitoring" class="q-ml-md">
            <q-item-section avatar><q-icon name="analytics" /></q-item-section>
            <q-item-section>Monitoring Stok</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/gudang/material-request" class="q-ml-md">
            <q-item-section avatar><q-icon name="request_quote" color="blue-8" /></q-item-section>
            <q-item-section>Material Request</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/gudang/barang-masuk" class="q-ml-md">
            <q-item-section avatar><q-icon name="input" /></q-item-section>
            <q-item-section>Barang Masuk</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/manufaktur/gudang/delivery-order" class="q-ml-md">
            <q-item-section avatar><q-icon name="local_shipping" color="green-8" /></q-item-section>
            <q-item-section>Surat Jalan (DO)</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-expansion-item
          icon="insights"
          label="Costing & Analitik"
          header-class="text-weight-bold text-teal-10"
        >
          <q-item clickable v-ripple to="/manufaktur/analytics/hpp" class="q-ml-md">
            <q-item-section avatar><q-icon name="payments" color="red-8" /></q-item-section>
            <q-item-section>HPP Produksi</q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator q-my-sm />

        <q-expansion-item
          icon="settings"
          label="Master Data"
          header-class="text-weight-bold text-grey-8"
        >
          <q-item clickable v-ripple to="/manufaktur/master/proyek" class="q-ml-md">
            <q-item-section avatar><q-icon name="apartment" color="indigo" /></q-item-section>
            <q-item-section>Daftar Proyek</q-item-section>
          </q-item>
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

.q-item.q-router-link--active {
  color: #004d40;
  background: #e0f2f1;
  font-weight: bold;
  border-right: 4px solid #004d40;
}
</style>
