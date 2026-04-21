<template>
  <q-layout view="lHh Lpr lFf">
    <!-- SIDEBAR -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <!-- DASHBOARD -->
        <q-item clickable v-ripple to="/manufaktur/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <!-- PRODUKSI -->
        <q-expansion-item icon="precision_manufacturing" label="Produksi" expand-separator>
          <q-item clickable v-ripple to="/manufaktur/work-order">
            <q-item-section>Work Order</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/manufaktur/production-steps">
            <q-item-section>Production Steps</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/manufaktur/production-result">
            <q-item-section>Production Result</q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- 🔥 MASTER (INI YANG KAMU BUTUH) -->
        <q-expansion-item icon="inventory" label="Master Data" expand-separator>
          <q-item clickable v-ripple to="/manufaktur/material">
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section>Material</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/manufaktur/bom">
            <q-item-section avatar>
              <q-icon name="build" />
            </q-item-section>
            <q-item-section>BOM</q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <!-- HEADER -->
    <q-header elevated class="bg-teal-8 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Agra ERP - Manufacture</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
const leftDrawerOpen = ref(true)
</script>
