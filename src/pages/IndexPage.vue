<template>
  <q-page class="bg-grey-1 q-pa-lg pt-md-xl">
    <div class="container q-mx-auto">
      <div class="row justify-center q-mb-xl q-pb-md">
        <div class="col-12 col-md-8 text-center q-mb-lg">
          <div
            class="text-h3 text-weight-bolder text-grey-10 q-mb-sm tracking-tighter uppercase logo-text"
          >
            Agra <span class="text-primary">ERP</span>
          </div>
          <div class="text-subtitle1 text-grey-6 q-mb-xl opacity-80 font-weight-light">
            Sistem Informasi Internal & Manajemen Proyek
          </div>

          <div class="search-container">
            <q-input
              v-model="searchQuery"
              placeholder="Cari modul aplikasi..."
              outlined
              rounded
              bg-color="white"
              class="search-box-modern shadow-soft"
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" size="20px" class="q-ml-sm" />
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" size="18px" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <transition-group name="app-list">
          <div
            v-for="app in filteredApps"
            :key="app.id"
            class="col-4 col-sm-3 col-md-2 flex justify-center"
          >
            <div
              class="app-wrapper cursor-pointer"
              :class="{ 'is-draft': app.draft }"
              @click="handleAppClick(app)"
            >
              <q-card
                flat
                bordered
                class="app-card flex flex-center shadow-1"
                :class="`bg-${app.bgColor} text-${app.color}`"
              >
                <q-icon :name="app.icon" size="44px" />

                <q-badge
                  v-if="app.draft"
                  color="orange-9"
                  text-color="white"
                  label="SOON"
                  class="soon-badge"
                />

                <div class="hover-overlay"></div>
              </q-card>

              <div class="app-label text-center q-mt-md text-weight-bold text-grey-9">
                {{ app.name }}
              </div>
            </div>
          </div>
        </transition-group>

        <div v-if="filteredApps.length === 0" class="col-12 text-center q-pa-xl">
          <q-icon name="manage_search" size="80px" color="grey-4" />
          <div class="text-h6 text-grey-5 q-mt-md font-light">
            Modul "{{ searchQuery }}" tidak ditemukan
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const searchQuery = ref('')

// DATA MODUL UPDATE: Konstruksi, Absensi, Aset, Arsip, Company Setting
const apps = ref([
  {
    id: 1,
    name: 'Konstruksi',
    icon: 'engineering',
    color: 'blue-10',
    bgColor: 'blue-1',
    path: '/konstruksi/dashboard',
    draft: false,
  },
  {
    id: 2,
    name: 'Absensi',
    icon: 'badge',
    color: 'green-10',
    bgColor: 'green-1',
    path: '/absensi/dashboard',
    draft: false,
  },
  // DATA MODUL UPDATE: Tambahkan objek ini ke dalam array apps
  {
    id: 7,
    name: 'Manufacture',
    icon: 'factory',
    color: 'teal-10',
    bgColor: 'teal-1',
    path: '/manufaktur/dashboard',
    draft: false,
  },
  // {
  //   id: 3,
  //   name: 'Modul Aset',
  //   icon: 'inventory',
  //   color: 'orange-10',
  //   bgColor: 'orange-1',
  //   path: '#',
  //   draft: true,
  // },
  // {
  //   id: 4,
  //   name: 'Modul Arsip',
  //   icon: 'folder_shared',
  //   color: 'indigo-10',
  //   bgColor: 'indigo-1',
  //   path: '#',
  //   draft: true,
  // },
  // {
  //   id: 5,
  //   name: 'Company Setting',
  //   icon: 'settings_applications',
  //   color: 'blue-grey-10',
  //   bgColor: 'blue-grey-1',
  //   path: '#',
  //   draft: true,
  // },
  {
    id: 6,
    name: 'Management Karyawan & Hak Akses',
    icon: 'people',
    color: 'purple-10',
    bgColor: 'purple-1',
    path: '/management-karyawan/dashboard',
    draft: false,
  },
])

const filteredApps = computed(() => {
  const s = searchQuery.value.toLowerCase()
  return apps.value.filter((a) => a.name.toLowerCase().includes(s))
})

const handleAppClick = (app) => {
  if (app.draft) {
    // Dialog Maintenance untuk modul SOON
    $q.dialog({
      title: '<div class="text-primary text-weight-bold">Informasi Sistem</div>',
      message: `Mohon maaf, modul <b>${app.name}</b> sedang dalam tahap maintenance atau pengembangan. Silakan coba lagi nanti.`,
      html: true,
      ok: { label: 'Mengerti', color: 'primary', flat: true },
      persistent: false,
    })
  } else {
    router.push(app.path)
  }
}
</script>

<style scoped>
.container {
  max-width: 1100px;
}

.logo-text {
  font-size: 3.5rem;
}

/* SEARCH BAR */
.search-container {
  max-width: 480px;
  margin: 0 auto;
}

.search-box-modern :deep(.q-field__control) {
  height: 50px;
  background: white !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid #eef0f2;
}

/* APP MODUL WRAPPER */
.app-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 130px; /* Lebar ditambah agar teks tidak tumpang tindih */
}

.app-wrapper:hover {
  transform: translateY(-10px);
}

.app-card {
  width: 100px;
  height: 100px;
  border-radius: 28px !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: visible; /* Penting agar badge bisa muncul di pojok luar */
  transition: all 0.3s ease;
}

.app-wrapper:hover .app-card {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(25, 118, 210, 0.2);
}

/* BADGE SOON: Pojok kanan atas ikon */
.soon-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.app-label {
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-top: 15px; /* Jarak dari ikon ke teks label */
  line-height: 1.2;
}

.is-draft .app-card {
  filter: grayscale(0.8);
  opacity: 0.7;
}

/* ANIMASI LIST */
.app-list-enter-active,
.app-list-leave-active {
  transition: all 0.4s ease;
}
.app-list-enter-from,
.app-list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.tracking-tighter {
  letter-spacing: -2px;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
