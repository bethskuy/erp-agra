<template>
  <q-page class="bg-grey-1 q-pa-lg pt-md-xl">
    <div class="container q-mx-auto">
      <div class="row justify-center q-mb-lg">
        <div class="col-12 text-center">
          <h4 class="text-weight-bold text-blue-grey-9 q-my-none">
            Selamat Datang, {{ authStore.user?.nama || 'User' }}!
          </h4>
          <p class="text-grey-6">
            Anda login sebagai:
            <span class="text-primary text-weight-bold">{{ authStore.user?.role || 'Staff' }}</span>
          </p>
        </div>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <div v-for="app in apps" :key="app.id" class="col-4 col-sm-3 col-md-2 flex justify-center">
          <div
            v-if="canShow(app)"
            class="app-wrapper cursor-pointer"
            @click="$router.push(app.path)"
          >
            <q-card
              flat
              bordered
              class="app-card flex flex-center shadow-1"
              :class="`bg-${app.bgColor} text-${app.color}`"
            >
              <q-icon :name="app.icon" size="44px" />
            </q-card>
            <div class="app-label text-center q-mt-md text-weight-bold text-grey-9">
              {{ app.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, getDocs, writeBatch, doc } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const apps = ref([])

// FUNGSI UNTUK AUTO-CREATE KOLEKSI 'modul' JIKA BELUM ADA
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
  // Tarik data secara real-time
  onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})

const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin') return authStore.user.role === 'Admin'
  return authStore.userAkses.includes(app.aksesKey)
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  width: 130px;
}
.app-wrapper:hover {
  transform: translateY(-5px);
}
.app-card {
  width: 100px;
  height: 100px;
  border-radius: 28px !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
