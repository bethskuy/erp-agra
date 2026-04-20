<template>
  <q-page class="flex flex-center bg-grey-1 q-pa-xl">
    <div class="full-width" style="max-width: 900px">
      <div class="text-center q-mb-xl">
        <q-img src="icons/logo-agra.png" style="width: 100px; height: 100px" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-blue-grey-7 tracking-widest">
          AGRA ABHINAYA PERKASA
        </div>
        <div class="q-mt-lg">
          <div class="text-h4 text-weight-bolder text-blue-grey-10">
            Selamat Datang, {{ authStore.user?.nama || 'User' }}!
          </div>
          <div class="text-subtitle1 text-grey-6 q-mt-sm">
            Anda login sebagai:
            <span class="text-primary text-weight-bold">{{ authStore.user?.role || 'Staff' }}</span>
          </div>
        </div>
      </div>

      <div class="row justify-center q-mb-xl">
        <q-input
          v-model="searchQuery"
          outlined
          rounded
          placeholder="Cari modul aplikasi..."
          class="full-width"
          style="max-width: 500px"
          bg-color="transparent"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" class="q-ml-sm" />
          </template>
        </q-input>
      </div>

      <div class="row q-col-gutter-xl justify-center q-mt-md">
        <div v-for="app in filteredApps" :key="app.id" class="col-4 col-sm-3 col-md-2">
          <div
            v-if="canShow(app)"
            class="column items-center cursor-pointer transition-all hover-scale"
            @click="$router.push(app.path)"
          >
            <q-card
              flat
              bordered
              class="app-card flex flex-center shadow-1"
              :class="`bg-${app.bgColor} text-${app.color}`"
            >
              <q-icon :name="app.icon" size="48px" />
            </q-card>
            <div class="text-center q-mt-md text-weight-bold text-blue-grey-9">
              {{ app.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const apps = ref([])
const searchQuery = ref('')

const filteredApps = computed(() => {
  return apps.value.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const setupDefaultModuls = async () => {
  const querySnapshot = await getDocs(collection(db, 'modul'))
  if (querySnapshot.empty) {
    const batch = writeBatch(db)
    const defaultData = [
      {
        name: 'Konstruksi',
        icon: 'engineering',
        color: 'blue-10',
        bgColor: 'blue-1',
        path: '/konstruksi/dashboard',
        aksesKey: 'konstruksi',
      },
      {
        name: 'Absensi',
        icon: 'badge',
        color: 'green-10',
        bgColor: 'green-1',
        path: '/absensi/dashboard',
        aksesKey: 'absensi',
      },
      {
        name: 'Manufacture',
        icon: 'factory',
        color: 'teal-10',
        bgColor: 'teal-1',
        path: '/manufaktur/dashboard',
        aksesKey: 'manufaktur',
      },
      {
        name: 'Modul Aset',
        icon: 'inventory',
        color: 'orange-10',
        bgColor: 'orange-1',
        path: '#',
        aksesKey: 'aset',
      },
      {
        name: 'Management Karyawan',
        icon: 'people',
        color: 'purple-10',
        bgColor: 'purple-1',
        path: '/management-karyawan/dashboard',
        aksesKey: 'admin',
      },
    ]
    defaultData.forEach((m) => batch.set(doc(collection(db, 'modul')), m))
    await batch.commit()
  }
}

onMounted(async () => {
  await setupDefaultModuls()
  onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})

const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin') return authStore.user.role === 'Admin'
  return authStore.userAkses?.includes(app.aksesKey) || false
}
</script>

<style scoped>
/* Kartu diperbesar menjadi 110px */
.app-card {
  width: 110px;
  height: 110px;
  border-radius: 28px !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: translateY(-8px);
}

.hover-scale:hover .app-card {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
