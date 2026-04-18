<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="q-ml-sm">
        <div class="text-h5 text-weight-bold text-blue-grey-9">
          Hak Akses: {{ modulName.toUpperCase() }}
        </div>
        <div class="text-caption text-grey-7">Atur izin akses user untuk modul ini</div>
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">Pilih Fitur yang Dapat Diakses</div>

        <div class="q-gutter-y-lg">
          <div v-for="(group, groupName) in currentMenu" :key="groupName">
            <div class="text-weight-bold text-primary q-mb-sm">{{ groupName }}</div>
            <div class="row q-col-gutter-md">
              <div v-for="menu in group" :key="menu.id" class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="q-pa-sm">
                  <q-checkbox v-model="akses[menu.id]" :label="menu.label" color="primary" />
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <div class="q-mt-xl text-right">
          <q-btn label="Simpan Perubahan" color="primary" @click="simpanAkses" unelevated />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()
const modulName = computed(() => route.params.modul)

// 1. Menu Konstruksi
const menuKonstruksi = {
  'Data Master': [
    { id: 'customer', label: 'Customer' },
    { id: 'supplier', label: 'Data Supplier' },
    { id: 'barang_list', label: 'List Barang' },
    { id: 'barang_kategori', label: 'Kategori Barang' },
    { id: 'satuan', label: 'Data Satuan' },
  ],
  Marketing: [
    { id: 'penawaran', label: 'Penawaran' },
    { id: 'approval_penawaran', label: 'Approval Penawaran' },
  ],
  Proyek: [
    { id: 'data_proyek', label: 'Data Proyek' },
    { id: 'kategori_proyek', label: 'Kategori Proyek' },
    { id: 'spk_mandor', label: 'SPK Mandor / Pekerja' },
  ],
  'Gudang & Pembelian': [
    { id: 'gudang', label: 'Gudang' },
    { id: 'po', label: 'Pesanan Pembelian (PO)' },
  ],
}

// 2. Menu Absensi
const menuAbsensi = {
  Absensi: [
    { id: 'dashboard_absensi', label: 'Dashboard Absensi' },
    { id: 'riwayat_absensi', label: 'Riwayat Absensi' },
  ],
}

// 3. Menu Manufaktur
const menuManufaktur = {
  Produksi: [
    { id: 'wo', label: 'Work Order' },
    { id: 'jadwal_produksi', label: 'Jadwal Produksi' },
  ],
  Inventaris: [
    { id: 'stok_material', label: 'Stok Material' },
    { id: 'bom', label: 'Bill of Materials' },
  ],
}

// Logika pemilih menu dinamis berdasarkan parameter URL
const currentMenu = computed(() => {
  const modul = modulName.value ? modulName.value.toLowerCase() : ''

  if (modul === 'absensi') return menuAbsensi
  if (modul === 'manufacture' || modul === 'manufaktur') return menuManufaktur

  return menuKonstruksi
})

const akses = ref({})

const initAkses = () => {
  akses.value = {}
  Object.values(currentMenu.value).forEach((group) => {
    group.forEach((menu) => {
      akses.value[menu.id] = false
    })
  })
}

const simpanAkses = () => {
  $q.notify({ type: 'positive', message: `Hak akses ${modulName.value} berhasil diperbarui!` })
  console.log('Data akses yang tersimpan:', akses.value)
}

// Re-inisialisasi otomatis saat modul di URL berubah
watch(modulName, initAkses)
onMounted(initAkses)
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
