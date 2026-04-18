<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title class="text-weight-bolder">
          AGRA <span class="text-weight-light">ERP</span>
          <q-badge align="top" color="orange-9" class="q-ml-sm shadow-2 text-weight-bold">
            KONSTRUKSI
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
              to="/konstruksi/dashboard"
              active-class="bg-blue-1 text-primary"
            >
              <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
              <q-item-section>DASHBOARD</q-item-section>
            </q-item>
          </q-list>

          <q-expansion-item
            icon="grid_view"
            label="DATA MASTER"
            header-class="text-weight-bold text-primary"
            default-opened
          >
            <q-list class="q-pl-sm">
              <q-expansion-item
                label="Data Rekanan"
                header-class="text-grey-8"
                :header-inset-level="0.1"
              >
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/customer"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>Customer</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/master/supplier"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>Data Supplier</q-item-section>
                </q-item>
              </q-expansion-item>

              <q-expansion-item
                label="Data Barang"
                header-class="text-grey-8"
                :header-inset-level="0.1"
              >
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/master/barang-list"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>List Barang</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/master/barang-kategori"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>Kategori Barang</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/master/satuan"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>Data Satuan</q-item-section>
                </q-item>
              </q-expansion-item>
            </q-list>
          </q-expansion-item>

          <q-separator q-my-sm inset />

          <q-expansion-item
            icon="campaign"
            label="MARKETING"
            header-class="text-weight-bold text-grey-8"
            default-opened
          >
            <q-list class="q-pl-sm">
              <q-item
                clickable
                v-ripple
                to="/konstruksi/marketing/penawaran"
                :inset-level="0.4"
                active-class="text-primary bg-blue-1"
              >
                <q-item-section avatar side
                  ><q-icon name="circle" size="6px" color="grey-4"
                /></q-item-section>
                <q-item-section>Penawaran</q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                to="/konstruksi/marketing/approval-penawaran"
                :inset-level="0.4"
                active-class="text-primary bg-blue-1"
              >
                <q-item-section avatar side
                  ><q-icon name="circle" size="6px" color="grey-4"
                /></q-item-section>
                <q-item-section>Approval Penawaran</q-item-section>
                <q-item-section side v-if="pendingApprovalCount > 0">
                  <q-badge
                    color="orange-9"
                    text-color="white"
                    floating
                    class="text-weight-bold shadow-2"
                  >
                    {{ pendingApprovalCount }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-separator q-my-sm inset />

          <q-expansion-item
            icon="foundation"
            label="PROYEK"
            header-class="text-weight-bold text-grey-8"
            default-opened
          >
            <q-expansion-item
              label="DATA PROYEK"
              header-class="text-grey-7"
              :header-inset-level="0.1"
              default-opened
            >
              <q-item
                clickable
                v-ripple
                to="/konstruksi/master/proyek-data"
                class="q-pl-xl"
                active-class="text-primary bg-blue-1"
              >
                <q-item-section avatar side
                  ><q-icon name="circle" size="6px" color="grey-4"
                /></q-item-section>
                <q-item-section>Data Proyek</q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                to="/konstruksi/master/proyek-kategori"
                class="q-pl-xl"
                active-class="text-primary bg-blue-1"
              >
                <q-item-section avatar side
                  ><q-icon name="circle" size="6px" color="grey-4"
                /></q-item-section>
                <q-item-section>Kategori Proyek</q-item-section>
              </q-item>
            </q-expansion-item>
            <q-list class="q-pl-sm">
              <q-expansion-item
                label="PELAKSANAAN"
                header-class="text-grey-7"
                :header-inset-level="0.1"
                default-opened
              >
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pelaksanaan/spk-mandor"
                  class="q-pl-xl"
                  active-class="text-primary bg-blue-1"
                >
                  <q-item-section avatar side
                    ><q-icon name="circle" size="6px" color="grey-4"
                  /></q-item-section>
                  <q-item-section>SPK Mandor / Pekerja</q-item-section>
                </q-item>
              </q-expansion-item>
            </q-list>
          </q-expansion-item>

          <q-separator q-my-sm inset />

          <q-item clickable v-ripple to="/konstruksi/gudang" active-class="bg-blue-1 text-primary">
            <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
            <q-item-section class="text-weight-bold">GUDANG</q-item-section>
          </q-item>

          <q-separator q-my-sm inset />

          <q-expansion-item
            icon="shopping_cart"
            label="PEMBELIAN"
            header-class="text-weight-bold text-grey-8"
            default-opened
          >
            <q-list class="q-pl-sm">
              <q-item
                clickable
                v-ripple
                to="/konstruksi/pembelian/pesanan"
                :inset-level="0.2"
                active-class="text-primary bg-blue-1"
              >
                <q-item-section avatar side
                  ><q-icon name="circle" size="6px" color="grey-4"
                /></q-item-section>
                <q-item-section>Pesanan Pembelian (PO)</q-item-section>
              </q-item>
              <div style="height: 60px"></div>
            </q-list>
          </q-expansion-item>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

// Deklarasi variabel yang sebelumnya menyebabkan error
const leftDrawerOpen = ref(false)
const pendingApprovalCount = ref(0)
let unsubscribe = null

onMounted(() => {
  const q = query(collection(db, 'penawaran'), where('status', '==', 'Pending'))
  unsubscribe = onSnapshot(q, (snapshot) => {
    pendingApprovalCount.value = snapshot.size
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>
