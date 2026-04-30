<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-teal-10 text-white">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold">
          AGRA <span class="text-weight-light">ERP</span>
        </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round flat icon="notifications">
            <q-badge color="red" floating>2</q-badge>
          </q-btn>

          <!-- TOMBOL APPS DENGAN POP-UP MODUL (Sesuai image_d79bf1.png & image_d793f1.png) -->
          <q-btn round flat icon="apps">
            <q-menu transition-show="scale" transition-hide="scale" :offset="[0, 15]">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-overline text-grey-7 q-mb-md">Modul Agra ERP</div>

                <div class="row q-col-gutter-md">
                  <!-- Modul Aset -->
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="orange-9"
                      icon="inventory_2"
                      label="Modul Aset"
                      class="full-width text-capitalize"
                      to="/aset"
                    />
                  </div>
                  <!-- Management Karyawan -->
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="deep-purple"
                      icon="groups"
                      label="Karyawan"
                      class="full-width text-capitalize"
                      to="/karyawan"
                    />
                  </div>
                  <!-- Manufacture -->
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="teal-10"
                      icon="factory"
                      label="Manufacture"
                      class="full-width text-capitalize"
                      to="/manufaktur/dashboard"
                    />
                  </div>
                  <!-- Absensi -->
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="green-7"
                      icon="badge"
                      label="Absensi"
                      class="full-width text-capitalize"
                      to="/absensi"
                    />
                  </div>
                  <!-- Konstruksi -->
                  <div class="col-4 text-center">
                    <q-btn
                      stack
                      color="blue-1"
                      text-color="primary"
                      icon="engineering"
                      label="Konstruksi"
                      class="full-width text-capitalize shadow-0"
                      to="/konstruksi"
                    />
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Tombol Kembali ke Menu Utama -->
                <q-btn
                  outline
                  color="primary"
                  icon="home"
                  label="Kembali ke Menu Utama"
                  class="full-width rounded-borders"
                  to="/"
                />
              </div>
            </q-menu>
          </q-btn>

          <q-btn round flat>
            <q-avatar size="32px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR / DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-white">
      <!-- SECTION PROFIL USER -->
      <div class="q-pa-md row items-center q-gutter-md border-bottom">
        <q-avatar size="56px" color="teal-10" text-color="white" class="text-weight-bold"
          >R</q-avatar
        >
        <div>
          <div class="text-weight-bold">Refqi Obeth Sudiarma...</div>
          <div class="text-caption text-grey-7 text-uppercase">Super Admin</div>
        </div>
      </div>

      <q-scroll-area style="height: calc(100% - 100px)">
        <q-list padding>
          <q-item-label header class="text-overline text-grey-6">UTAMA</q-item-label>
          <q-item
            clickable
            v-ripple
            to="/manufaktur/dashboard"
            active-class="active-menu"
            class="menu-item"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>DASHBOARD</q-item-section>
          </q-item>

          <q-separator q-my-sm />
          <q-item-label header class="text-overline text-grey-6">OPERASIONAL</q-item-label>

          <!-- SALES -->
          <q-expansion-item icon="shopping_cart" label="SALES" header-class="text-weight-medium">
            <q-item
              clickable
              v-ripple
              to="/manufaktur/sales/quotation"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Quotation</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/sales/po-customer"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>PO Customer</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- PRODUKSI -->
          <q-expansion-item
            icon="precision_manufacturing"
            label="PRODUKSI"
            header-class="text-weight-medium"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/produksi/proses-produksi/incoming"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Incoming Material</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/produksi/proses-packing-page"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Monitoring Packing</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- PROSES PACKING -->
          <q-expansion-item
            icon="inventory_2"
            label="PROSES PACKING"
            header-class="text-weight-medium"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-hole"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Check Hole</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-pin"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Check Pin GoNoGo</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-tapping"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Check Tapping</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/proses-packing/packing-final"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Packing Final</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              to="/manufaktur/proses-packing/visual-check"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Visual Check</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator q-my-sm />
          <q-item-label header class="text-overline text-grey-6">LOGISTIK & FINANCE</q-item-label>

          <!-- WAREHOUSE -->
          <q-expansion-item icon="warehouse" label="WAREHOUSE" header-class="text-weight-medium">
            <q-item
              clickable
              v-ripple
              to="/manufaktur/warehouse/outgoing-check"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Outgoing Check</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- DELIVERY -->
          <q-expansion-item
            icon="local_shipping"
            label="DELIVERY"
            header-class="text-weight-medium"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/delivery/surat-jalan"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Surat Jalan</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- FINANCE -->
          <q-expansion-item
            icon="account_balance_wallet"
            label="FINANCE"
            header-class="text-weight-medium"
            default-opened
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/finance/invoice"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section>Invoice Customer</q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- MAIN CONTAINER -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.bg-teal-10 {
  background: #004d40 !important;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
.menu-item {
  margin: 2px 12px;
  border-radius: 8px;
}
.active-menu {
  color: white !important;
  background: #004d40 !important;
  border-radius: 0 24px 24px 0 !important;
  margin-left: 0 !important;
  margin-right: 12px !important;
}
.text-overline {
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1px;
}
</style>
