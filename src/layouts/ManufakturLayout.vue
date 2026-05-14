<template>
  <q-layout view="lHh Lpr lFf">
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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="272"
      class="sidebar-drawer bg-white"
    >
      <div class="sidebar-profile row items-center no-wrap border-bottom">
        <q-avatar size="40px" color="teal-10" text-color="white" class="text-weight-bold"
          >R</q-avatar
        >
        <div class="sidebar-profile__meta">
          <div class="sidebar-profile__name">Refqi Obeth Sudiarma...</div>
          <div class="sidebar-profile__role">Super Admin</div>
        </div>
      </div>

      <q-scroll-area style="height: calc(100% - 72px)" class="sidebar-scroll">
        <q-list class="menu-list">
          <q-item-label header class="section-title">UTAMA</q-item-label>
          <q-item
            v-if="checkPermission('dashboard')"
            clickable
            v-ripple
            to="/manufaktur/dashboard"
            active-class="active-menu"
            class="menu-item nav-item"
          >
            <q-item-section avatar class="menu-icon"><q-icon name="dashboard" /></q-item-section>
            <q-item-section class="menu-text">Dashboard</q-item-section>
          </q-item>

          <q-separator class="sidebar-separator" />

          <q-item-label header class="section-title">MARKETING SYSTEM</q-item-label>

          <q-expansion-item
            v-if="hasSectionAccess(['penawaran', 'penawaran-approval'])"
            icon="campaign"
            label="Penawaran"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
            default-opened
          >
            <q-item
              v-if="checkPermission('penawaran')"
              clickable
              v-ripple
              to="/manufaktur/penawaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="description" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Quotation</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('penawaran-approval')"
              clickable
              v-ripple
              to="/manufaktur/penawaran-approval"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="verified" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Approval Penawaran</q-item-section>
              <q-item-section side v-if="pendingCount > 0">
                <q-badge color="orange-9" rounded :label="pendingCount" class="animate-bounce" />
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item-label header class="section-title">MASTER DATA</q-item-label>

          <q-expansion-item
            icon="dataset"
            label="Master"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-list>
              <q-item
                clickable
                v-ripple
                to="/manufaktur/marketing/customer"
                active-class="active-menu"
                class="submenu-item master-child-item"
                dense
              >
                <q-item-section avatar class="submenu-icon">
                  <q-icon name="person_outline" size="xs" />
                </q-item-section>
                <q-item-section class="submenu-text">Customer</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                to="/manufaktur/master/supplier"
                active-class="active-menu"
                class="submenu-item master-child-item"
                dense
              >
                <q-item-section avatar class="submenu-icon">
                  <q-icon name="local_shipping" size="xs" />
                </q-item-section>
                <q-item-section class="submenu-text">Data Supplier</q-item-section>
              </q-item>

              <q-expansion-item
                icon="inventory_2"
                label="Data Barang"
                header-class="submenu-group master-child-group"
                expand-icon-class="nav-expand-icon"
                dense
              >
                <q-list>
                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/barang-list"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="list_alt" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">List Barang</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/barang-kategori"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="category" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Kategori Barang</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/satuan"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="straighten" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Data Satuan</q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item
            icon="inventory_2"
            label="Gudang"
            default-opened
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              to="/manufaktur/gudang"
              dense
              class="submenu-item"
              active-class="active-menu"
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="inventory_2" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Stok Gudang</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator class="sidebar-separator" />
          <q-item-label header class="section-title">OPERASIONAL</q-item-label>

          <q-expansion-item
            v-if="checkPermission('sales/po-customer')"
            icon="shopping_cart"
            label="Sales"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/sales/po-customer"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="receipt_long" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">PO Customer</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'ppic/planning-produksi',
                'ppic/work-order',
                'ppic/jadwal-produksi',
                'ppic/material-requirement',
                'ppic/routing-produksi',
                'ppic/monitoring-ppic',
              ])
            "
            icon="assignment"
            label="PPIC"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('ppic/planning-produksi')"
              clickable
              v-ripple
              to="/manufaktur/ppic/planning-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="assignment" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Planning Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/work-order')"
              clickable
              v-ripple
              to="/manufaktur/ppic/work-order"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="description" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">SPK Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/jadwal-produksi')"
              clickable
              v-ripple
              to="/manufaktur/ppic/jadwal-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="event_note" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Jadwal Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/material-requirement')"
              clickable
              v-ripple
              to="/manufaktur/ppic/material-requirement"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Material Requirement</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/routing-produksi')"
              clickable
              v-ripple
              to="/manufaktur/ppic/routing-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="route" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Tahapan Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/monitoring-ppic')"
              clickable
              v-ripple
              to="/manufaktur/ppic/monitoring-ppic"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="monitoring" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring PPIC</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'produksi/line-produksi',
                'produksi/monitoring-produksi',
                'produksi/qc-produksi',
                'produksi/packing-produksi',
                'produksi/ready-delivery',
              ])
            "
            icon="precision_manufacturing"
            label="Produksi"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('produksi/line-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/line-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="precision_manufacturing" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Proses Fabrikasi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/monitoring-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/monitoring-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="monitoring" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/qc-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/qc-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="fact_check" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">QC Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/packing-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/packing-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Packing Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/ready-delivery')"
              clickable
              v-ripple
              to="/manufaktur/produksi/ready-delivery"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="local_shipping" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Ready Delivery</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator class="sidebar-separator" />
          <q-item-label header class="section-title">LOGISTIK & FINANCE</q-item-label>

          <q-expansion-item
            v-if="hasSectionAccess(['warehouse/incoming-material', 'warehouse/outgoing-check'])"
            icon="warehouse"
            label="Warehouse"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('warehouse/incoming-material')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/incoming-material"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Incoming Material</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('warehouse/outgoing-check')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/outgoing-check"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="fact_check" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Outgoing Check</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="checkPermission('delivery/surat-jalan')"
            icon="local_shipping"
            label="Delivery"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/delivery/surat-jalan"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="local_shipping" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Surat Jalan</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="checkPermission('finance/invoice')"
            icon="account_balance_wallet"
            label="Finance"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/finance/invoice"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="request_quote" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Invoice Customer</q-item-section>
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
  border-bottom: 1px solid #edf1f0;
}
.sidebar-drawer {
  color: #22312f;
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-drawer :deep(.q-drawer) {
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-profile {
  min-height: 72px;
  padding: 12px 16px;
  gap: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfa 100%);
}
.sidebar-profile__meta {
  min-width: 0;
  line-height: 1.2;
}
.sidebar-profile__name {
  max-width: 184px;
  overflow: hidden;
  color: #17211f;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-profile__role {
  margin-top: 3px;
  color: #6a7a76;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.sidebar-scroll {
  background: #fbfcfc;
}
.menu-list {
  padding: 8px 8px 14px;
}
.section-title {
  min-height: auto;
  padding: 13px 10px 6px;
  color: #7b8b86;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  line-height: 1;
}
.sidebar-separator {
  margin: 8px 8px 2px;
  background: #edf1f0;
}
.menu-item {
  min-height: 36px;
  margin: 1px 4px;
  padding: 0 10px;
  border-radius: 8px;
  color: #354541;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.menu-item:hover,
.submenu-item:hover,
:deep(.submenu-group:hover),
:deep(.nav-group:hover) {
  background: #edf7f3;
  color: #004d40;
}
.menu-item:hover,
.submenu-item:hover {
  transform: translateX(1px);
}
.menu-icon,
.submenu-icon {
  min-width: 30px;
  padding-right: 8px;
  color: inherit;
}
.menu-icon :deep(.q-icon) {
  font-size: 19px;
}
.menu-text,
.submenu-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.submenu-item {
  min-height: 32px;
  margin: 1px 4px 1px 20px;
  padding: 0 10px;
  border-radius: 8px;
  color: #42524e;
  font-size: 12.5px;
  font-weight: 550;
  letter-spacing: 0;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.submenu-icon {
  min-width: 24px;
  padding-right: 7px;
  color: #7a8a86;
}
.submenu-item:hover .submenu-icon {
  color: #006b59;
}
:deep(.submenu-group) {
  min-height: 32px;
  margin: 1px 4px 1px 20px;
  padding: 0 10px;
  border-radius: 8px;
  color: #42524e;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
:deep(.submenu-group .q-item__section--avatar) {
  min-width: 24px;
  padding-right: 7px;
  color: #7a8a86;
}
:deep(.submenu-group .q-item__label) {
  min-width: 0;
  overflow: hidden;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.q-expansion-item--expanded > .submenu-group) {
  color: #004d40;
  background: #f2f8f5;
}
:deep(.q-expansion-item--expanded > .submenu-group .q-item__section--avatar) {
  color: #006b59;
}
.master-child-item {
  margin-left: 20px;
}
:deep(.master-child-group) {
  margin-left: 20px;
}
.master-grandchild-item {
  margin-left: 38px;
}
:deep(.nav-group) {
  min-height: 36px;
  margin: 1px 4px;
  padding: 0 10px;
  border-radius: 8px;
  color: #263936;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}
:deep(.nav-group .q-item__section--avatar) {
  min-width: 30px;
  padding-right: 8px;
  color: #60716d;
}
:deep(.nav-group .q-item__label) {
  line-height: 1.1;
}
:deep(.nav-expand-icon) {
  color: #8a9894;
  font-size: 18px;
}
:deep(.q-expansion-item__content) {
  padding: 2px 0 4px;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease;
}
:deep(.q-expansion-item--expanded > .nav-group) {
  color: #004d40;
  background: #f2f8f5;
}
:deep(.q-expansion-item--expanded > .nav-group .q-item__section--avatar) {
  color: #006b59;
}
.active-menu {
  color: white !important;
  background: linear-gradient(135deg, #004d40 0%, #00705c 100%) !important;
  border-radius: 9px !important;
  box-shadow: 0 8px 20px rgba(0, 77, 64, 0.2);
  font-weight: 750;
}
.active-menu .submenu-icon,
.active-menu .menu-icon {
  color: white !important;
}
.text-overline {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
}
.animate-bounce {
  animation: bounce 2.2s infinite;
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
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}
</style>
