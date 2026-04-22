<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <!-- Header -->
    <q-header borderless class="bg-indigo-10 text-white shadow-1">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap">
            <!-- Brand Logo Area: Ukuran teks mengecil di HP -->
            <div class="row items-center no-wrap text-h6 text-md-h5">
              <span class="q-mr-xs">AGRA</span>
              <span class="text-weight-light text-indigo-2">ERP</span>
            </div>

            <!-- Badge Modul: Menjadi ikon saja di HP untuk hemat ruang -->
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- NOTIFIKASI -->
        <q-btn flat round icon="notifications" class="q-mr-xs">
          <q-badge color="red" floating v-if="pendingApprovalCount > 0">
            {{ pendingApprovalCount }}
          </q-badge>
        </q-btn>

        <!-- APP LAUNCHER (GOOGLE STYLE) -->
        <q-btn flat round icon="apps" class="q-mr-xs q-mr-sm-sm">
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="app-launcher-menu shadow-10"
          >
            <div class="q-pa-md bg-white" style="width: 320px; border-radius: 12px">
              <div class="text-overline q-px-sm q-pb-sm text-grey-7">Modul Agra ERP</div>

              <div class="row q-col-gutter-sm">
                <template v-for="app in apps" :key="app.id">
                  <div class="col-4" v-if="canShow(app)">
                    <q-btn
                      flat
                      stack
                      class="full-width app-btn"
                      :class="{ 'active-app': app.aksesKey === 'konstruksi' }"
                      no-caps
                      :to="app.path"
                    >
                      <q-icon :name="app.icon" :color="app.color || 'primary'" size="32px" />
                      <div class="app-label text-center">{{ app.name }}</div>
                    </q-btn>
                  </div>
                </template>
              </div>

              <q-separator class="q-my-md" />

              <q-btn
                outline
                color="primary"
                class="full-width text-weight-bold"
                icon="home"
                label="Kembali ke Menu Utama"
                to="/"
                no-caps
                rounded
              />
            </div>
          </q-menu>
        </q-btn>

        <!-- USER AVATAR -->
        <q-avatar
          size="30px"
          color="white"
          text-color="indigo-10"
          class="text-weight-bold cursor-pointer shadow-1"
        >
          {{ userData?.nama?.charAt(0) || 'A' }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="280" class="bg-white" elevation="10">
      <div class="column fit">
        <!-- Drawer Header / Profile Section -->
        <div class="q-pa-lg bg-indigo-1 text-indigo-10 border-bottom-soft">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="56px" color="indigo-10" text-color="white" class="shadow-2">
              {{ userData?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div class="text-caption text-grey-7 ellipsis">
                {{ authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area class="col">
          <q-list class="q-px-sm q-py-md">
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-grey-6">UTAMA</div>

            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section class="text-weight-medium">DASHBOARD</q-item-section>
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
              class="menu-expansion q-mb-xs"
              header-class="text-weight-medium"
              default-opened
            >
              <q-list class="q-pl-md">
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  label="Data Rekanan"
                  header-class="text-grey-8"
                  dense
                >
                  <q-item
                    v-if="checkPermission('marketing/customer')"
                    clickable
                    v-ripple
                    to="/konstruksi/marketing/customer"
                    class="sub-menu-item"
                    active-class="sub-menu-item-active"
                  >
                    <q-item-section>Customer</q-item-section>
                  </q-item>
                  <q-item
                    v-if="checkPermission('master/supplier')"
                    clickable
                    v-ripple
                    to="/konstruksi/master/supplier"
                    class="sub-menu-item"
                    active-class="sub-menu-item-active"
                  >
                    <q-item-section>Data Supplier</q-item-section>
                  </q-item>
                </q-expansion-item>

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
                  dense
                >
                  <q-item
                    v-if="checkPermission('master/barang-list')"
                    clickable
                    v-ripple
                    to="/konstruksi/master/barang-list"
                    class="sub-menu-item"
                    active-class="sub-menu-item-active"
                  >
                    <q-item-section>List Barang</q-item-section>
                  </q-item>
                  <q-item
                    v-if="checkPermission('master/barang-kategori')"
                    clickable
                    v-ripple
                    to="/konstruksi/master/barang-kategori"
                    class="sub-menu-item"
                    active-class="sub-menu-item-active"
                  >
                    <q-item-section>Kategori Barang</q-item-section>
                  </q-item>
                  <q-item
                    v-if="checkPermission('master/satuan')"
                    clickable
                    v-ripple
                    to="/konstruksi/master/satuan"
                    class="sub-menu-item"
                    active-class="sub-menu-item-active"
                  >
                    <q-item-section>Data Satuan</q-item-section>
                  </q-item>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator spaced inset class="bg-grey-3" />
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-grey-6">OPERASIONAL</div>

            <!-- MARKETING -->
            <q-expansion-item
              v-if="hasSectionAccess(['marketing/penawaran', 'marketing/approval-penawaran'])"
              icon="campaign"
              label="MARKETING"
              class="menu-expansion q-mb-xs"
              header-class="text-weight-medium"
            >
              <q-list class="q-pl-md">
                <q-item
                  v-if="checkPermission('marketing/penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/penawaran"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>Penawaran</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('marketing/approval-penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/approval-penawaran"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>Approval Penawaran</q-item-section>
                  <q-item-section side v-if="pendingApprovalCount > 0">
                    <q-badge color="orange-9" rounded>{{ pendingApprovalCount }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

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
              class="menu-expansion q-mb-xs"
              header-class="text-weight-medium"
            >
              <q-list class="q-pl-md">
                <q-item
                  v-if="checkPermission('master/proyek-data')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-data"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>Data Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('master/proyek-kategori')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-kategori"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>Kategori Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('pelaksanaan/spk-mandor')"
                  clickable
                  v-ripple
                  to="/konstruksi/pelaksanaan/spk-mandor"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>SPK Mandor / Pekerja</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- GUDANG -->
            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
              <q-item-section class="text-weight-medium">GUDANG</q-item-section>
            </q-item>

            <!-- PEMBELIAN -->
            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
              icon="shopping_cart"
              label="PEMBELIAN"
              class="menu-expansion q-mb-xs"
              header-class="text-weight-medium"
            >
              <q-list class="q-pl-md">
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section>Pesanan Pembelian (PO)</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 100px"></div>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const leftDrawerOpen = ref(false)
const pendingApprovalCount = ref(0)
const userData = ref(null)
const apps = ref([])
const currentAkses = ref([])

let unsubscribeUser = null
let unsubscribeApproval = null
let unsubscribeApps = null

const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin')
    return authStore.user.role === 'Admin' || authStore.user.role === 'Super Admin'
  return currentAkses.value.includes(app.aksesKey)
}

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
  unsubscribeApps = onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        userData.value = data
        currentAkses.value = data.akses || []
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
  if (unsubscribeApps) unsubscribeApps()
})
</script>

<style lang="scss" scoped>
/* Responsive Header Styles */
.responsive-badge {
  padding: 4px 8px;
  font-size: 10px;
  @media (min-width: 600px) {
    padding: 4px 10px;
    font-size: 12px;
  }
}

/* App Launcher Styles */
.app-launcher-menu {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.app-btn {
  border-radius: 8px;
  padding: 12px 4px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  min-height: 85px;
  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.active-app {
  background: #e8eaf6;
  border: 1px solid rgba(var(--q-primary), 0.1);
  .app-label {
    font-weight: 700;
    color: var(--q-primary);
  }
}

.app-label {
  font-size: 11px;
  margin-top: 8px;
  color: #444;
  font-weight: 500;
  line-height: 1.2;
}

/* Sidebar Navigation Styles */
.menu-item {
  border-radius: 8px;
  color: #616161;
  transition: all 0.3s ease;
  margin: 0 8px 4px 8px;
  &:hover {
    background-color: #f5f5f5;
    color: var(--q-primary);
  }
}

.menu-item-active {
  background-color: #e8eaf6 !important;
  color: var(--q-indigo-10) !important;
  font-weight: 700 !important;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 8px;
    bottom: 8px;
    width: 4px;
    background: var(--q-indigo-10);
    border-radius: 0 4px 4px 0;
  }
}

.menu-expansion {
  border-radius: 8px;
  margin: 0 8px;
  :deep(.q-item) {
    border-radius: 8px;
    min-height: 44px;
  }
}

.sub-menu-item {
  border-radius: 8px;
  margin-bottom: 2px;
  min-height: 35px;
  font-size: 0.9rem;
  color: #757575;
  transition: all 0.2s ease;
  &:hover {
    color: var(--q-primary);
    background-color: #fafafa;
  }
}

.sub-menu-item-active {
  color: var(--q-primary) !important;
  font-weight: 600;
  background-color: rgba(25, 118, 210, 0.05);
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.text-indigo-2 {
  color: #c5cae9;
}
</style>
