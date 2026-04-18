<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-blue-grey-9">Admin Dashboard</div>
        <div class="text-subtitle1 text-grey-6">
          Selamat datang kembali, Administrator. Kelola karyawan dan akses modul di sini.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card flat class="stat-card shadow-sm">
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-6 text-uppercase">{{ stat.title }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ stat.value }}</div>
            </div>
            <q-icon :name="stat.icon" size="30px" :color="stat.color" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section>
            <div class="text-h6 text-weight-bold text-blue-grey-9 q-mb-md">Karyawan Terbaru</div>
            <q-list separator>
              <q-item v-for="user in recentUsers" :key="user.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar color="blue-grey-1" text-color="blue-grey-9">{{
                    user.initial
                  }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ user.name }}</q-item-label>
                  <q-item-label caption>{{ user.role }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="blue-grey-2" text-color="black">{{ user.status }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section>
            <div class="text-h6 text-weight-bold text-blue-grey-9 q-mb-md">Modul Akses</div>
            <q-list>
              <q-item clickable v-ripple to="/management/akses/konstruksi">
                <q-item-section avatar><q-icon name="engineering" color="blue" /></q-item-section>
                <q-item-section>Konstruksi</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/management/akses/absensi">
                <q-item-section avatar><q-icon name="badge" color="green" /></q-item-section>
                <q-item-section>Absensi</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/management/akses/manufacture">
                <q-item-section avatar><q-icon name="factory" color="teal" /></q-item-section>
                <q-item-section>Manufacture</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: 'Total Karyawan', value: '45', icon: 'group', color: 'blue-grey-9' },
  { title: 'User Aktif', value: '42', icon: 'verified_user', color: 'positive' },
  { title: 'Modul Tersedia', value: '3', icon: 'apps', color: 'primary' },
  { title: 'Pending Approval', value: '2', icon: 'pending_actions', color: 'orange' },
])

const recentUsers = ref([
  { id: 1, name: 'Budi Santoso', initial: 'BS', role: 'Staff Konstruksi', status: 'Active' },
  { id: 2, name: 'Siti Aminah', initial: 'SA', role: 'Admin Absensi', status: 'Active' },
  { id: 3, name: 'Andi Wijaya', initial: 'AW', role: 'Manager Manufacture', status: 'Review' },
])
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.stat-card {
  border-radius: 12px;
}
</style>
