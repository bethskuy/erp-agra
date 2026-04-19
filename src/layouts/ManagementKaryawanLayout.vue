<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-blue-grey-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Admin - Management Karyawan</q-toolbar-title>
        <q-btn flat round icon="home" to="/" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>MENU ADMINISTRASI</q-item-label>

        <q-item clickable v-ripple to="/management-karyawan/dashboard">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard Admin</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/management-karyawan/karyawan">
          <q-item-section avatar><q-icon name="group" /></q-item-section>
          <q-item-section>Data Karyawan</q-item-section>
        </q-item>

        <q-expansion-item icon="folder_special" label="Master Data">
          <q-item clickable v-ripple to="/management-karyawan/master/jabatan" class="q-pl-xl">
            <q-item-section avatar><q-icon name="badge" /></q-item-section>
            <q-item-section>Kategori Jabatan/Role</q-item-section>
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
</script>
