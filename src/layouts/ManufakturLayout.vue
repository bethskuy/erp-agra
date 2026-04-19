<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-teal-10">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Agra ERP - Manufacture</q-toolbar-title>
        <q-btn flat round icon="home" to="/" />
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>MENU UTAMA</q-item-label>

        <!-- DASHBOARD -->
        <q-item clickable v-ripple to="/manufaktur/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <!-- PRODUKSI (DROPDOWN) -->
        <q-expansion-item icon="precision_manufacturing" label="Produksi" expand-separator>
          <!-- WORK ORDER -->
          <q-item clickable v-ripple to="/manufaktur/work-order">
            <q-item-section>Work Order</q-item-section>
          </q-item>

          <!-- PRODUCTION STEPS -->
          <q-item clickable v-ripple to="/manufaktur/production-steps">
            <q-item-section>Production Steps</q-item-section>
          </q-item>

          <!-- PRODUCTION RESULT -->
          <q-item clickable v-ripple to="/manufaktur/production-result">
            <q-item-section>Production Result</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
</script>
