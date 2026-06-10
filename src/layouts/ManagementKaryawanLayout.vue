<template>
  <q-layout view="lHh Lpr lFf" class="cute-layout-bg">
    <!-- Header Utama -->
    <q-header borderless class="cute-header text-white shadow-2">
      <q-toolbar class="q-py-xs">
        <!-- Mac Dots on Header (Left) - Hidden on extra small screen -->
        <div class="gt-xs q-mr-md flex items-center" style="gap: 6px;">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>

        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" class="cute-menu-toggle-btn" />
        <q-toolbar-title class="text-weight-bolder font-pro text-shadow-cute">
          🌸 ADMIN <span class="text-weight-light text-pink-2">MANAGEMENT</span> 🌸
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="home" to="/" class="q-mr-sm home-btn-cute">
          <q-tooltip class="bg-pink-7 text-white font-pro text-weight-bold">Kembali ke Beranda 🏠</q-tooltip>
        </q-btn>

        <q-avatar size="34px" color="white" text-color="pink-7" class="text-weight-bold cute-avatar-mini cursor-pointer">
          {{ authStore.user?.nama?.charAt(0) || 'A' }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigasi -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="cute-drawer">
      <div class="column fit">
        <!-- Profile Section Card wrapper -->
        <div class="q-pa-md profile-box">
          <div class="cute-profile-card q-pa-md">
            <div class="row items-center q-gutter-md no-wrap">
              <q-avatar size="50px" color="pink-6" text-color="white" class="cute-avatar relative-position">
                {{ authStore.user?.nama?.charAt(0) || 'A' }}
                <!-- Pulsing active green dot -->
                <span class="profile-pulse-dot"></span>
              </q-avatar>
              <div class="col overflow-hidden">
                <div class="text-weight-bold text-subtitle2 text-pink-7 font-pro ellipsis leading-tight">
                  {{ authStore.user?.nama || 'Administrator' }}
                </div>
                <div class="text-caption text-pink-4 text-weight-bolder ellipsis flex items-center q-mt-xs">
                  <span class="q-mr-xs">🧸</span> {{ authStore.user?.role || 'Super Admin' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu List -->
        <q-scroll-area class="col">
          <q-list class="q-px-sm q-py-sm">
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-pink-4 tracking-widest text-weight-bolder flex items-center">
              <span class="q-mr-xs">🌸</span> NAVIGASI UTAMA <span class="q-ml-xs">🌸</span>
            </div>

            <!-- Menu Dashboard -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/dashboard"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar class="cute-icon-section">
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section class="text-weight-bold">DASHBOARD ADMIN</q-item-section>
            </q-item>

            <!-- Menu Data Karyawan -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/karyawan"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar class="cute-icon-section">
                <q-icon name="group" />
              </q-item-section>
              <q-item-section class="text-weight-bold">DATA KARYAWAN</q-item-section>
            </q-item>

            <q-separator spaced inset class="bg-pink-1 q-my-sm" style="height: 2px;" />
            
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-pink-4 tracking-widest text-weight-bolder flex items-center">
              <span class="q-mr-xs">🌸</span> PENGATURAN <span class="q-ml-xs">🌸</span>
            </div>

            <!-- Menu Hak Akses Spesifik -->
            <q-item
              clickable
              v-ripple
              to="/management-karyawan/akses"
              class="menu-item q-mb-xs"
              active-class="menu-item-active"
            >
              <q-item-section avatar class="cute-icon-section">
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section class="text-weight-bold">HAK AKSES SPESIFIK</q-item-section>
            </q-item>

            <!-- Master Data Expansion -->
            <q-expansion-item
              icon="folder_special"
              label="MASTER DATA"
              class="menu-expansion q-mb-xs"
              header-class="text-weight-bold"
            >
              <q-list class="q-pl-md">
                <q-item
                  clickable
                  v-ripple
                  to="/management-karyawan/master/jabatan"
                  class="sub-menu-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar side>
                    <q-icon name="circle" size="8px" color="pink-4" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold">Kategori Jabatan/Role</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-scroll-area>

        <!-- Footer Version -->
        <div class="q-pa-md text-center version-box">
          <div class="cute-version-badge font-pro">
            🧸 AGRA ERP v2.5.0
          </div>
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');

.font-pro {
  font-family: 'Fredoka', sans-serif;
}

.cute-layout-bg {
  background-color: #fff5f6 !important;
}

.text-shadow-cute {
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.15);
}

.cute-header {
  background: linear-gradient(90deg, #db2777 0%, #ec4899 100%) !important;
  border-bottom: 3.5px solid #ffccd5;
  box-shadow: 0 4px 15px rgba(219, 39, 119, 0.15) !important;
}

.cute-menu-toggle-btn {
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
}

.home-btn-cute {
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: rotate(-8deg) scale(1.05);
  }
}

.cute-avatar-mini {
  border: 2px solid #ffccd5;
  box-shadow: 0 2px 4px rgba(219, 39, 119, 0.1);
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.08) rotate(5deg);
    border-color: #ffffff;
  }
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid transparent;
}
.dot.red { background-color: #ff5f56; border-color: #e0443e; }
.dot.yellow { background-color: #ffbd2e; border-color: #dea123; }
.dot.green { background-color: #27c93f; border-color: #1aab29; }

.cute-drawer {
  background-color: #fff0f2 !important;
  border-right: 3.5px solid #ffb7c5 !important;
}

.profile-box {
  background: #fff0f2 !important;
  border-bottom: 2px dashed #ffccd5;
}

.cute-profile-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 18px;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cute-profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-avatar {
  border: 2.5px solid #ffb7c5;
}

.profile-pulse-dot {
  width: 12px;
  height: 12px;
  background-color: #27c93f;
  border: 2px solid #ffffff;
  border-radius: 50%;
  animation: pulse-glow-green 2s infinite ease-in-out;
  position: absolute;
  bottom: -2px;
  right: -2px;
}

@keyframes pulse-glow-green {
  0% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.6);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 5px rgba(39, 201, 63, 0);
  }
  100% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(39, 201, 63, 0);
  }
}

.version-box {
  background: #fff0f2 !important;
  border-top: 2px dashed #ffccd5;
}

.cute-version-badge {
  display: inline-block;
  background-color: #fff1f2;
  border: 2px dashed #fda4af;
  color: #db2777;
  font-weight: 700;
  font-size: 11px;
  padding: 6px 16px;
  border-radius: 50px;
  box-shadow: 0 3px 0px #fecdd3;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.05);
    background-color: #ffe4e6;
  }
}

.cute-icon-section {
  min-width: 40px !important;
  color: #db2777;
}

.menu-item {
  border-radius: 14px;
  color: #db2777;
  font-family: 'Fredoka', sans-serif;
  transition: all 0.2s ease;
  margin: 6px 12px;
  border: 2.5px solid transparent;

  &:hover {
    background-color: #ffe4e6;
    color: #e11d48;
    border-color: #fda4af;
    .cute-icon-section {
      color: #e11d48;
    }
  }
}

.menu-item-active {
  background-color: #fff1f2 !important;
  color: #e11d48 !important;
  border: 2.5px solid #fda4af !important;
  box-shadow: 0 5px 0px #fda4af !important;
  transform: translateY(-2px);
  
  .cute-icon-section {
    color: #e11d48 !important;
  }
}

.menu-expansion {
  border-radius: 14px;
  margin: 6px 12px;
  color: #db2777;
  font-family: 'Fredoka', sans-serif;
  border: 2.5px solid transparent;
  transition: all 0.2s ease;

  :deep(.q-item) {
    border-radius: 14px;
    min-height: 48px;
    border: 2.5px solid transparent;
    
    &:hover {
      background-color: #ffe4e6;
      color: #e11d48;
      border-color: #fda4af;
      .q-item__section--avatar {
        color: #e11d48;
      }
    }
  }

  :deep(.q-item--active) {
    background-color: #fff1f2 !important;
    color: #e11d48 !important;
    border-color: #fda4af !important;
  }
}

.sub-menu-item {
  border-radius: 10px;
  margin: 3px 12px 3px 24px;
  min-height: 38px;
  font-size: 0.85rem;
  color: #db2777;
  font-family: 'Fredoka', sans-serif;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    color: #e11d48;
    background-color: #ffe4e6;
    border-color: #fda4af;
  }
}

.sub-menu-item-active {
  color: #e11d48 !important;
  background-color: #fff1f2 !important;
  border: 2px solid #fda4af !important;
  box-shadow: 0 3px 0px #fecdd3 !important;
  transform: translateY(-1px);
}

.tracking-widest {
  letter-spacing: 0.15em;
}

.text-pink-2 {
  color: #fbcfe8 !important;
}
</style>
