<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="text-weight-bolder">
          AGRA <span class="text-weight-light">ERP</span>
          <q-badge align="top" color="positive" class="q-ml-sm shadow-2 text-weight-bold">
            ABSENSI
          </q-badge>
        </q-toolbar-title>
        <q-space />
        <q-btn flat round icon="apps" to="/" class="q-mr-sm" />
        <q-avatar color="white" text-color="primary" class="text-weight-bold">A</q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="bg-white">
      <div class="column fit">
        <q-scroll-area class="col">
          <q-list padding class="text-grey-9 text-weight-medium">
            <q-item
              clickable
              v-ripple
              to="/absensi/dashboard"
              active-class="bg-blue-1 text-primary"
            >
              <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
              <q-item-section>DASHBOARD ABSENSI</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/absensi/riwayat" active-class="bg-blue-1 text-primary">
              <q-item-section avatar><q-icon name="history" /></q-item-section>
              <q-item-section>RIWAYAT ABSENSI</q-item-section>
            </q-item>

            <q-separator q-my-sm inset />

            <q-item clickable v-ripple to="/">
              <q-item-section avatar><q-icon name="arrow_back" color="orange-9" /></q-item-section>
              <q-item-section class="text-orange-9">KEMBALI KE PORTAL</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
// Logic Firebase milik temanmu dihapus di sini karena ini layout khusus absensi
</script>

<style scoped>
.q-item:hover {
  background-color: #f0f7ff;
  color: var(--q-primary);
}
.q-item.q-router-link--active {
  background-color: #e3f2fd;
  font-weight: bold;
}
</style>
