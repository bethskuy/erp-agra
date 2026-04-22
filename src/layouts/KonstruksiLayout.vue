<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-indigo-10 text-white">
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
        <q-avatar color="white" text-color="primary" class="text-weight-bold">
          {{ userData?.nama?.charAt(0) || 'A' }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="bg-white">
      <div class="column fit">
        <q-scroll-area class="col">
          <q-list padding class="text-grey-9 text-weight-medium">
            <!-- DASHBOARD: Sekarang menggunakan checkPermission('dashboard') -->
            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              active-class="bg-blue-1 text-primary"
            >
              <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
              <q-item-section>DASHBOARD</q-item-section>
            </q-item>

            <!-- DATA MASTER -->
            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'marketing/customer',
                  'master/supplier',
                  'master/barang-list',
                  'master/barang-kategori',
                  'master/satuan',
                ])
              "
              icon="grid_view"
              label="DATA MASTER"
              header-class="text-weight-bold text-primary"
              default-opened
            >
              <q-list class="q-pl-sm">
                <!-- Data Rekanan -->
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  label="Data Rekanan"
                  header-class="text-grey-8"
                  :header-inset-level="0.1"
                >
                  <q-item
                    v-if="checkPermission('marketing/customer')"
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
                    v-if="checkPermission('master/supplier')"
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

                <!-- Data Barang -->
                <q-expansion-item
                  v-if="
                    hasSectionAccess([
                      'master/barang-list',
                      'master/barang-kategori',
                      'master/satuan',
                    ])
                  "
                  label="Data Barang"
                  header-class="text-grey-8"
                  :header-inset-level="0.1"
                >
                  <q-item
                    v-if="checkPermission('master/barang-list')"
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
                    v-if="checkPermission('master/barang-kategori')"
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
                    v-if="checkPermission('master/satuan')"
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

            <q-separator v-if="isModulActive" q-my-sm inset />

            <!-- MARKETING -->
            <q-expansion-item
              v-if="hasSectionAccess(['marketing/penawaran', 'marketing/approval-penawaran'])"
              icon="campaign"
              label="MARKETING"
              header-class="text-weight-bold text-grey-8"
              default-opened
            >
              <q-list class="q-pl-sm">
                <q-item
                  v-if="checkPermission('marketing/penawaran')"
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
                  v-if="checkPermission('marketing/approval-penawaran')"
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

            <q-separator v-if="isModulActive" q-my-sm inset />

            <!-- PROYEK -->
            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'master/proyek-data',
                  'master/proyek-kategori',
                  'pelaksanaan/spk-mandor',
                ])
              "
              icon="foundation"
              label="PROYEK"
              header-class="text-weight-bold text-grey-8"
              default-opened
            >
              <q-expansion-item
                v-if="hasSectionAccess(['master/proyek-data', 'master/proyek-kategori'])"
                label="DATA PROYEK"
                header-class="text-grey-7"
                :header-inset-level="0.1"
                default-opened
              >
                <q-item
                  v-if="checkPermission('master/proyek-data')"
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
                  v-if="checkPermission('master/proyek-kategori')"
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

              <q-expansion-item
                v-if="checkPermission('pelaksanaan/spk-mandor')"
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
            </q-expansion-item>

            <q-separator v-if="isModulActive" q-my-sm inset />

            <!-- GUDANG -->
            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              active-class="bg-blue-1 text-primary"
            >
              <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
              <q-item-section class="text-weight-bold">GUDANG</q-item-section>
            </q-item>

            <q-separator v-if="isModulActive" q-my-sm inset />

            <!-- PEMBELIAN -->
            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
// eslint-disable-next-line no-unused-vars
import { db, auth } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const leftDrawerOpen = ref(false)
const pendingApprovalCount = ref(0)
const userData = ref(null)
let unsubscribeUser = null
let unsubscribeApproval = null

const isModulActive = computed(() => {
  if (authStore.user?.role === 'Super Admin') return true
  const moduleInfo = userData.value?.permissions_detail?.find((m) => m.id === 'konstruksi')
  return moduleInfo?.isActive || false
})

const checkPermission = (menuPath) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  const targetId = `/konstruksi_${menuPath}`.replace(/\//g, '_')
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  return menu ? menu.lihat : false
}

const hasSectionAccess = (menuPaths) => {
  if (authStore.user?.role === 'Super Admin') return true
  return menuPaths.some((path) => checkPermission(path))
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }

  const qApproval = query(collection(db, 'penawaran'), where('status', '==', 'Pending'))
  unsubscribeApproval = onSnapshot(qApproval, (snapshot) => {
    pendingApprovalCount.value = snapshot.size
  })
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
  if (unsubscribeApproval) unsubscribeApproval()
})
</script>

<style scoped>
.text-primary {
  color: var(--q-primary) !important;
}
.bg-blue-1 {
  background-color: #e3f2fd !important;
}
.shadow-2 {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
