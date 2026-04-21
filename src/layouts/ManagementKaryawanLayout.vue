<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header Utama -->
    <q-header elevated class="bg-blue-grey-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Admin - Management Karyawan</q-toolbar-title>
        <q-btn flat round icon="home" to="/" />
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigasi -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>MENU ADMINISTRASI</q-item-label>

        <!-- Menu Dashboard -->
        <q-item clickable v-ripple to="/management-karyawan/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard Admin</q-item-section>
        </q-item>

        <!-- Menu Data Karyawan -->
        <q-item clickable v-ripple to="/management-karyawan/karyawan">
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>Data Karyawan</q-item-section>
        </q-item>

        <!-- Menu Hak Akses Spesifik -->
        <q-item clickable v-ripple to="/management-karyawan/akses">
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>Hak Akses Spesifik</q-item-section>
        </q-item>

        <!-- Master Data -->
        <q-expansion-item icon="folder_special" label="Master Data">
          <q-item clickable v-ripple to="/management-karyawan/master/jabatan" class="q-pl-xl">
            <q-item-section avatar>
              <q-icon name="badge" />
            </q-item-section>
            <q-item-section>Kategori Jabatan/Role</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- Container untuk Konten Halaman -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

// State untuk mengontrol drawer
const leftDrawerOpen = ref(false)

// Fungsi untuk toggle drawer
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
/* Menandai menu yang sedang aktif secara visual */
.q-item.q-router-link--active {
  color: #1976d2;
  background: #e3f2fd;
  border-right: 4px solid #1976d2;
}

/* Efek hover pada list item */
.q-item:hover {
  background-color: #f5f5f5;
}
</style>
