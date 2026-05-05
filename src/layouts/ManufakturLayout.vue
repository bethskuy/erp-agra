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

          <q-btn round flat icon="apps">
            <q-menu transition-show="scale" transition-hide="scale" :offset="[0, 15]">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-overline text-grey-7 q-mb-md">Modul Agra ERP</div>
                <div class="row q-col-gutter-md">
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
            v-if="checkPermission('dashboard')"
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

          <!-- MARKETING SYSTEM SECTION -->
          <q-item-label header class="text-overline text-grey-6">MARKETING SYSTEM</q-item-label>
          <q-expansion-item
            v-if="hasSectionAccess(['penawaran', 'penawaran-approval'])"
            icon="campaign"
            label="PENAWARAN"
            header-class="text-weight-medium"
            default-opened
          >
            <q-item
              v-if="checkPermission('penawaran')"
              clickable
              v-ripple
              to="/manufaktur/penawaran"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section avatar><q-icon name="description" size="xs" /></q-item-section>
              <q-item-section>Quotation</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('penawaran-approval')"
              clickable
              v-ripple
              to="/manufaktur/penawaran-approval"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section avatar><q-icon name="verified" size="xs" /></q-item-section>
              <q-item-section>Approval Penawaran</q-item-section>
              <q-item-section side v-if="pendingCount > 0">
                <q-badge color="orange-9" rounded :label="pendingCount" class="animate-bounce" />
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator q-my-sm />
          <q-item-label header class="text-overline text-grey-6">OPERASIONAL</q-item-label>

          <!-- SALES -->
          <q-expansion-item
            v-if="checkPermission('sales/po-customer')"
            icon="shopping_cart"
            label="SALES"
            header-class="text-weight-medium"
          >
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
            v-if="
              hasSectionAccess([
                'produksi/proses-produksi/incoming',
                'produksi/proses-packing-page',
              ])
            "
            icon="precision_manufacturing"
            label="PRODUKSI"
            header-class="text-weight-medium"
          >
            <q-item
              v-if="checkPermission('produksi/proses-produksi/incoming')"
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
              v-if="checkPermission('produksi/proses-packing-page')"
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
            v-if="
              hasSectionAccess([
                'proses-packing/check-hole',
                'proses-packing/check-pin',
                'proses-packing/check-tapping',
                'proses-packing/packing-final',
                'proses-packing/visual-check',
              ])
            "
            icon="inventory_2"
            label="PROSES PACKING"
            header-class="text-weight-medium"
          >
            <q-item
              v-if="checkPermission('proses-packing/check-hole')"
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-hole"
              active-class="active-menu"
              class="q-pl-xl"
              dense
              ><q-item-section>Check Hole</q-item-section></q-item
            >
            <q-item
              v-if="checkPermission('proses-packing/check-pin')"
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-pin"
              active-class="active-menu"
              class="q-pl-xl"
              dense
              ><q-item-section>Check Pin GoNoGo</q-item-section></q-item
            >
            <q-item
              v-if="checkPermission('proses-packing/check-tapping')"
              clickable
              v-ripple
              to="/manufaktur/proses-packing/check-tapping"
              active-class="active-menu"
              class="q-pl-xl"
              dense
              ><q-item-section>Check Tapping</q-item-section></q-item
            >
            <q-item
              v-if="checkPermission('proses-packing/packing-final')"
              clickable
              v-ripple
              to="/manufaktur/proses-packing/packing-final"
              active-class="active-menu"
              class="q-pl-xl"
              dense
              ><q-item-section>Packing Final</q-item-section></q-item
            >
            <q-item
              v-if="checkPermission('proses-packing/visual-check')"
              clickable
              v-ripple
              to="/manufaktur/proses-packing/visual-check"
              active-class="active-menu"
              class="q-pl-xl"
              dense
              ><q-item-section>Visual Check</q-item-section></q-item
            >
          </q-expansion-item>

          <q-separator q-my-sm />
          <q-item-label header class="text-overline text-grey-6">LOGISTIK & FINANCE</q-item-label>

          <!-- GUDANG SECTION (FIXED: Cuma Stok Gudang) -->
          <q-expansion-item icon="inventory_2" label="GUDANG" default-opened expand-separator>
            <q-item
              clickable
              to="/manufaktur/gudang"
              dense
              class="q-pl-lg"
              active-class="bg-green-8 text-white"
            >
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>Stok Gudang</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- WAREHOUSE LAMA -->
          <q-expansion-item
            v-if="checkPermission('warehouse/outgoing-check')"
            icon="warehouse"
            label="WAREHOUSE"
            header-class="text-weight-medium"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/warehouse/outgoing-check"
              active-class="active-menu"
              class="q-pl-xl"
              dense
            >
              <q-item-section avatar><q-icon name="fact_check" size="xs" /></q-item-section>
              <q-item-section>Outgoing Check</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- DELIVERY -->
          <q-expansion-item
            v-if="checkPermission('delivery/surat-jalan')"
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
            v-if="checkPermission('finance/invoice')"
            icon="account_balance_wallet"
            label="FINANCE"
            header-class="text-weight-medium"
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

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const leftDrawerOpen = ref(false)
const pendingCount = ref(0)
const userData = ref(null)
let unsub = null
let unsubUser = null

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const checkPermission = (path) => {
  if (!path) return true
  return true
}

const hasSectionAccess = (menuPaths) => {
  if (authStore.user?.role === 'Super Admin') return true
  return menuPaths.some((path) => checkPermission(path))
}

onMounted(() => {
  const q = query(collection(db, 'penawaran_manufaktur'), where('status', '==', 'Pending'))
  unsub = onSnapshot(q, (snap) => {
    pendingCount.value = snap.size
  })

  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      userData.value = snapshot.empty ? null : snapshot.docs[0].data()
    })
  }
})

onUnmounted(() => {
  if (unsub) unsub()
  if (unsubUser) unsubUser()
})
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
.animate-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}
</style>
