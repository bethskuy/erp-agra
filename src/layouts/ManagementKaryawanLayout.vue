<template>
  <q-layout view="lHh Lpr lFf" class="bg-blue-grey-1">
    <!-- Header Utama -->
    <q-header borderless class="bg-blue-grey-10 text-white shadow-2">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bolder">
          ADMIN <span class="text-weight-light text-blue-grey-3">MANAGEMENT</span>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="home" to="/" class="q-mr-sm">
          <q-tooltip>Kembali ke Beranda</q-tooltip>
        </q-btn>

        <q-avatar size="32px" color="white" text-color="blue-grey-10" class="text-weight-bold">
          {{ authStore.user?.nama?.charAt(0) || 'A' }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigasi -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="bg-white">
      <div class="column fit">
        <!-- Profile Section -->
        <div class="q-pa-lg bg-blue-grey-1 text-blue-grey-10 border-bottom-soft">
          <div class="row items-center q-gutter-md">
            <q-avatar size="60px" color="blue-grey-10" text-color="white" class="shadow-3">
              {{ authStore.user?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ authStore.user?.nama || 'Administrator' }}
              </div>
              <div class="text-caption text-blue-grey-5 ellipsis">
                {{ authStore.user?.role || 'Super Admin' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Menu List -->
        <q-scroll-area class="col">
          <q-list class="q-px-sm q-py-md">
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-grey-6 tracking-widest">
              NAVIGASI UTAMA
            </div>

            <!-- Menu Dashboard -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/dashboard"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section class="text-weight-medium">DASHBOARD ADMIN</q-item-section>
            </q-item>

            <!-- Menu Data Karyawan -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/karyawan"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="group" />
              </q-item-section>
              <q-item-section class="text-weight-medium">DATA KARYAWAN</q-item-section>
            </q-item>

            <q-separator spaced inset class="bg-grey-3" />
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-grey-6 tracking-widest">
              PENGATURAN
            </div>

            <!-- Menu Hak Akses Spesifik -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/akses"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section class="text-weight-medium">HAK AKSES SPESIFIK</q-item-section>
            </q-item>

            <!-- Master Data -->
            <q-expansion-item
              icon="folder_special"
              label="MASTER DATA"
              class="menu-expansion q-mb-xs"
              header-class="text-weight-medium"
            >
              <q-list class="q-pl-lg">
                <q-item
                  clickable
                  v-ripple
                  to="/management-karyawan/master/jabatan"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar side>
                    <q-icon name="circle" size="6px" color="grey-4" />
                  </q-item-section>
                  <q-item-section>Kategori Jabatan/Role</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-scroll-area>

        <!-- Footer Version -->
        <div class="q-pa-md text-center border-top-soft">
          <div class="text-caption text-grey-5 text-weight-light">AGRA ERP v2.5.0</div>
        </div>
      </div>
    </q-drawer>

    <!-- Container untuk Konten Halaman -->
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
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="scss" scoped>
.menu-item {
  border-radius: 10px;
  color: #546e7a;
  transition: all 0.3s ease;
  margin: 0 10px 4px 10px;

  &:hover {
    background-color: #f1f5f9;
    color: var(--q-primary);
  }
}

.menu-item-active {
  background-color: #eceff1 !important;
  color: #263238 !important;
  font-weight: 700 !important;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 10px;
    bottom: 10px;
    width: 4px;
    background: #263238;
    border-radius: 0 4px 4px 0;
  }
}

.menu-expansion {
  border-radius: 10px;
  margin: 0 10px;
  color: #546e7a;

  :deep(.q-item) {
    border-radius: 10px;
    min-height: 48px;
  }
}

.sub-menu-item {
  border-radius: 8px;
  margin-bottom: 2px;
  min-height: 40px;
  font-size: 0.9rem;
  color: #78909c;
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

.border-top-soft {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tracking-widest {
  letter-spacing: 0.15em;
}

.text-blue-grey-3 {
  color: #b0bec5;
}
</style>
