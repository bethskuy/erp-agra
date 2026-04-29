<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <!-- Header -->
    <q-header borderless class="bg-indigo-10 text-white shadow-1">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap">
            <div class="row items-center no-wrap text-h6 text-md-h5">
              <span class="q-mr-xs tracking-tighter">AGRA</span>
              <span class="text-weight-light text-indigo-2">ERP</span>
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- NOTIFIKASI -->
        <q-btn flat round icon="notifications" class="q-mr-xs">
          <q-badge color="red" floating v-if="pendingApprovalCount > 0">
            {{ pendingApprovalCount }}
          </q-badge>
        </q-btn>

        <!-- APP LAUNCHER -->
        <q-btn flat round icon="apps" class="q-mr-xs">
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

        <!-- USER AVATAR (Interactive Menu) -->
        <q-btn flat round no-caps class="q-ml-xs">
          <q-avatar
            size="32px"
            color="white"
            text-color="indigo-10"
            class="text-weight-bold shadow-1"
          >
            {{ userData?.nama?.charAt(0) || 'A' }}
          </q-avatar>

          <!-- Dropdown Menu Profile -->
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="shadow-10 rounded-12 overflow-hidden"
          >
            <q-list style="min-width: 220px" class="q-pa-sm">
              <q-item class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    color="indigo-1"
                    text-color="indigo-10"
                    class="text-weight-bold shadow-sm"
                  >
                    {{ userData?.nama?.charAt(0) || 'A' }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-indigo-10">{{
                    userData?.nama || 'Administrator'
                  }}</q-item-label>
                  <q-item-label caption class="text-blue-grey-6">{{
                    authStore.user?.role || 'Staff User'
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <!-- FIX: Sekarang memunculkan kotak dialog profil -->
              <q-item clickable v-ripple class="rounded-borders" @click="showProfileDialog = true">
                <q-item-section avatar
                  ><q-icon name="person_outline" color="blue-grey-7" size="20px"
                /></q-item-section>
                <q-item-section class="text-weight-medium">Profil Saya</q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <q-item
                clickable
                v-ripple
                class="rounded-borders text-negative"
                @click="handleLogout"
              >
                <q-item-section avatar><q-icon name="logout" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">KELUAR SISTEM</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="295" class="bg-white" elevation="10">
      <div class="column fit">
        <!-- Drawer Header -->
        <div class="q-pa-lg bg-indigo-1 text-indigo-10 border-bottom-soft">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="indigo-10" text-color="white" class="shadow-2">
              {{ userData?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div
                class="text-caption text-grey-7 ellipsis text-uppercase tracking-widest"
                style="font-size: 10px"
              >
                {{ authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area class="col">
          <q-list class="q-py-md">
            <div class="q-px-md q-pt-sm q-pb-sm text-overline text-grey-6 tracking-widest">
              UTAMA
            </div>

            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" size="22px" />
              </q-item-section>
              <q-item-section class="text-weight-bold">DASHBOARD</q-item-section>
            </q-item>

            <!-- DATA MASTER (LEVEL 1) -->
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
              header-class="text-weight-bold"
              default-opened
            >
              <q-list>
                <!-- Data Rekanan (LEVEL 2) -->
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  icon="groups"
                  label="Data Rekanan"
                  header-class="text-blue-grey-9 text-weight-bold"
                  dense
                  class="level-2-expansion"
                >
                  <q-list>
                    <!-- Sub-Menu Items (LEVEL 3) -->
                    <q-item
                      v-if="checkPermission('marketing/customer')"
                      clickable
                      v-ripple
                      to="/konstruksi/marketing/customer"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar>
                        <q-icon name="person_outline" size="18px" />
                      </q-item-section>
                      <q-item-section>Customer</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/supplier')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/supplier"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar>
                        <q-icon name="local_shipping" size="18px" />
                      </q-item-section>
                      <q-item-section>Data Supplier</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <!-- Data Barang (LEVEL 2) -->
                <q-expansion-item
                  v-if="
                    hasSectionAccess([
                      'master/barang-list',
                      'master/barang-kategori',
                      'master/satuan',
                    ])
                  "
                  icon="inventory_2"
                  label="Data Barang"
                  header-class="text-blue-grey-9 text-weight-bold"
                  dense
                  class="level-2-expansion"
                >
                  <q-list>
                    <q-item
                      v-if="checkPermission('master/barang-list')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-list"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar>
                        <q-icon name="list_alt" size="18px" />
                      </q-item-section>
                      <q-item-section>List Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/barang-kategori')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-kategori"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar>
                        <q-icon name="category" size="18px" />
                      </q-item-section>
                      <q-item-section>Kategori Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/satuan')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/satuan"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar>
                        <q-icon name="straighten" size="18px" />
                      </q-item-section>
                      <q-item-section>Data Satuan</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator spaced inset class="bg-grey-3 q-my-md" />
            <div class="q-px-md q-pt-sm q-pb-sm text-overline text-grey-6 tracking-widest">
              OPERASIONAL
            </div>

            <!-- MARKETING -->
            <q-expansion-item
              v-if="hasSectionAccess(['marketing/penawaran', 'marketing/approval-penawaran'])"
              icon="campaign"
              label="MARKETING"
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  v-if="checkPermission('marketing/penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/penawaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="request_quote" size="20px" />
                  </q-item-section>
                  <q-item-section>Penawaran</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('marketing/approval-penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/approval-penawaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="fact_check" size="20px" />
                  </q-item-section>
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
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  v-if="checkPermission('master/proyek-data')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-data"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="apartment" size="20px" />
                  </q-item-section>
                  <q-item-section>Data Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('master/proyek-kategori')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-kategori"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="account_tree" size="20px" />
                  </q-item-section>
                  <q-item-section>Kategori Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('pelaksanaan/spk-mandor')"
                  clickable
                  v-ripple
                  to="/konstruksi/pelaksanaan/spk-mandor"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="engineering" size="20px" />
                  </q-item-section>
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
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="warehouse" size="22px" />
              </q-item-section>
              <q-item-section class="text-weight-bold uppercase">GUDANG & LOGISTIK</q-item-section>
            </q-item>

            <!-- PEMBELIAN -->
            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
              icon="shopping_cart"
              label="PEMBELIAN"
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="receipt_long" size="20px" />
                  </q-item-section>
                  <q-item-section>Pesanan Pembelian (PO)</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 100px"></div>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <!-- DIALOG PROFIL SAYA (MODERN BOX) -->
    <q-dialog v-model="showProfileDialog" backdrop-filter="blur(4px)">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-20 overflow-hidden shadow-24">
        <q-card-section class="bg-indigo-10 text-white q-pa-xl text-center relative-position">
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            class="absolute-top-right q-ma-md opacity-70"
          />
          <q-avatar size="100px" class="shadow-10 border-white-3 q-mb-md">
            <img :src="userData?.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>
          <div class="text-h5 text-weight-black">{{ userData?.nama || 'Administrator' }}</div>
          <div class="text-subtitle2 opacity-80 uppercase tracking-widest q-mt-xs">
            {{ authStore.user?.role || 'Staff' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-list class="q-gutter-y-sm">
            <q-item class="bg-grey-1 rounded-borders">
              <q-item-section avatar><q-icon name="fingerprint" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-weight-bold text-grey-7 uppercase font-10"
                  >ID Karyawan (NIK)</q-item-label
                >
                <q-item-label class="text-weight-bold">{{ userData?.nik || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="bg-grey-1 rounded-borders">
              <q-item-section avatar><q-icon name="email" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-weight-bold text-grey-7 uppercase font-10"
                  >Email Sistem</q-item-label
                >
                <q-item-label class="text-weight-medium">{{ userData?.email || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="bg-grey-1 rounded-borders">
              <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-weight-bold text-grey-7 uppercase font-10"
                  >No. Telepon / WA</q-item-label
                >
                <q-item-label class="text-weight-medium">{{ userData?.hp || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- <q-btn
            unelevated
            color="indigo-10"
            label="EDIT PROFIL LENGKAP"
            icon="edit"
            class="full-width q-mt-lg rounded-borders text-weight-bold"
            to="#"
            v-close-popup
          /> -->
        </q-card-section>
      </q-card>
    </q-dialog>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, db } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const leftDrawerOpen = ref(false)
const showProfileDialog = ref(false) // State untuk kotak dialog
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

const handleLogout = () => {
  $q.dialog({
    title: '<span class="text-indigo-10 text-weight-bold">Konfirmasi Keluar</span>',
    message: 'Apakah Anda yakin ingin mengakhiri sesi AGRA ERP ini?',
    html: true,
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: { unelevated: true, label: 'Ya, Keluar', color: 'negative', rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await signOut(auth)
      $q.notify({
        color: 'positive',
        message: 'Logout Berhasil. Sampai jumpa!',
        icon: 'check_circle',
        position: 'top',
      })
      router.push('/login')
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal Logout: ' + e.message })
    }
  })
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
  border-radius: 0 25px 25px 0;
  color: #546e7a;
  transition: all 0.3s ease;
  margin: 0 12px 4px 0;
  font-size: 13.5px;
  &:hover {
    background-color: rgba(26, 35, 126, 0.04);
    color: #1a237e;
  }
}

.menu-item-active {
  background-color: #e8eaf6 !important;
  color: #1a237e !important;
  font-weight: 800 !important;
  border-right: 5px solid #1a237e;
}

.menu-expansion {
  border-radius: 0 25px 25px 0;
  margin: 0 12px 4px 0;
  color: #37474f;
  :deep(.q-item) {
    border-radius: 0 25px 25px 0;
    min-height: 50px;
  }
}

/* LEVEL 2 INDENTATION */
.level-2-expansion {
  margin-bottom: 2px;
  :deep(.q-item) {
    padding-left: 42px !important;
    min-height: 44px;
    border-radius: 0 25px 25px 0;
  }
  :deep(.q-item__section--avatar) {
    min-width: 40px;
  }
}

.level-2-item {
  border-radius: 0 25px 25px 0;
  margin-bottom: 2px;
  min-height: 42px;
  padding-left: 42px;
  font-size: 13.5px;
  color: #546e7a;
  transition: all 0.2s ease;
  &:hover {
    color: #1a237e;
    background-color: #f5f5f5;
  }
}

/* LEVEL 3 INDENTATION */
.level-3-item {
  border-radius: 0 25px 25px 0;
  margin-bottom: 2px;
  min-height: 38px;
  padding-left: 72px;
  font-size: 13px;
  color: #607d8b;
  transition: all 0.2s ease;
  &:hover {
    color: #1a237e;
    background-color: #f5f5f5;
  }
  :deep(.q-item__section--avatar) {
    min-width: 32px;
  }
}

.sub-menu-item-active {
  color: #1a237e !important;
  font-weight: 700;
  background-color: rgba(26, 35, 126, 0.05) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.text-indigo-2 {
  color: #c5cae9;
}

.tracking-widest {
  letter-spacing: 0.12em;
}

.uppercase {
  text-transform: uppercase;
}

.rounded-12 {
  border-radius: 12px;
}
.rounded-20 {
  border-radius: 20px;
}
.font-10 {
  font-size: 10px;
}
.border-white-3 {
  border: 3px solid white;
}
</style>
