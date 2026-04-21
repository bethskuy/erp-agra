<template>
  <q-page class="bg-blue-grey-1 q-pa-md">
    <!-- VIEW 1: LIST KARYAWAN -->
    <template v-if="currentView === 'list'">
      <div class="text-h5 text-weight-bold q-mb-md text-blue-grey-10">
        Management Role Akses Spesifik
      </div>

      <q-card flat bordered class="shadow-2">
        <q-table
          :rows="karyawanList"
          :columns="columns"
          row-key="id"
          flat
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="cursor-pointer hover-bg"
              @click="handleEditAkses(props.row)"
            >
              <q-td key="no">{{ props.pageIndex + 1 }}</q-td>
              <q-td key="nik">{{ props.row.nik }}</q-td>
              <q-td key="nama" class="text-weight-medium text-primary">
                {{ props.row.nama }}
              </q-td>
              <q-td key="jabatan">{{ props.row.jabatan }}</q-td>
              <q-td key="hak_modul">
                <div class="row q-gutter-xs">
                  <q-badge v-for="mod in props.row.akses" :key="mod" color="blue-grey-7" dense>
                    {{ mod.toUpperCase() }}
                  </q-badge>
                  <span v-if="!props.row.akses?.length">-</span>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- VIEW 2: DETAIL MATRIX AKSES -->
    <template v-else>
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="blue-grey-8"
          @click="currentView = 'list'"
          class="q-mr-sm"
        />
        <div class="text-h5 text-weight-bold text-blue-grey-10">Management Role Akses Spesifik</div>
      </div>

      <!-- Informasi Karyawan -->
      <div class="bg-white q-pa-md rounded-borders shadow-1 q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey-7">NIK</div>
            <div class="text-subtitle1 text-weight-bold">{{ selectedKaryawan.nik }}</div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey-7">Nama Karyawan</div>
            <div class="text-subtitle1 text-weight-bold">{{ selectedKaryawan.nama }}</div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="text-caption text-grey-7">Jabatan</div>
            <div class="text-subtitle1 text-weight-bold text-primary">
              {{ selectedKaryawan.jabatan }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Simpan -->
      <div class="row justify-end q-mb-md">
        <q-btn
          @click="handleSave"
          color="teal-8"
          class="q-px-xl text-weight-bold shadow-3"
          unelevated
          :loading="loading"
          style="border-radius: 25px"
        >
          <div class="row items-center no-wrap">
            <span style="font-style: italic">SIMPAN</span>
          </div>
        </q-btn>
      </div>

      <!-- Tabel Matrix dengan Sistem Dropdown -->
      <q-card flat bordered class="overflow-hidden">
        <div class="q-pa-sm bg-grey-2 text-weight-bold text-blue-grey-9 border-bottom">
          Hak Akses Matrix Table (Berdasarkan Modul)
        </div>

        <q-list separator>
          <q-expansion-item
            v-for="(modul, mIdx) in matrixAkses"
            :key="modul.id"
            group="matrix-group"
            header-class="bg-grey-1 text-weight-bold"
            expand-separator
          >
            <template v-slot:header>
              <q-item-section avatar>
                <div class="text-weight-bold text-grey-7">#{{ mIdx + 1 }}</div>
              </q-item-section>
              <q-item-section>
                <div class="row items-center no-wrap">
                  <q-icon name="folder" color="blue-grey-4" class="q-mr-sm" />
                  <div class="text-weight-bolder text-uppercase">{{ modul.label }}</div>
                </div>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center no-wrap">
                  <span class="text-caption q-mr-sm">Module Status</span>
                  <q-toggle v-model="modul.isActive" color="primary" @click.stop />
                </div>
              </q-item-section>
            </template>

            <q-card>
              <q-markup-table
                flat
                bordered
                square
                wrap-cells
                class="matrix-table no-shadow no-border"
              >
                <thead>
                  <tr class="bg-grey-3">
                    <th class="text-left" style="padding-left: 20px">MODUL / MENU</th>
                    <th class="text-center" style="width: 80px">Lihat</th>
                    <th class="text-center" style="width: 80px">Buat</th>
                    <th class="text-center" style="width: 80px">Ubah</th>
                    <th class="text-center" style="width: 80px">Hapus</th>
                    <th class="text-center" style="width: 80px">Approve</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="menu in modul.menus"
                    :key="menu.id"
                    :class="!modul.isActive ? 'text-grey-4' : ''"
                  >
                    <td class="text-left">
                      <div
                        class="row items-center no-wrap"
                        :style="{ paddingLeft: menu.level * 15 + 'px' }"
                      >
                        <div class="text-grey-7 q-mr-sm">{{ '>>' }}</div>
                        <div
                          :class="
                            menu.level === 1
                              ? 'text-weight-bold text-uppercase'
                              : 'text-uppercase text-caption'
                          "
                        >
                          {{ menu.label }}
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <q-checkbox v-model="menu.lihat" :disable="!modul.isActive" color="primary" />
                    </td>
                    <td class="text-center">
                      <q-checkbox v-model="menu.buat" :disable="!modul.isActive" color="primary" />
                    </td>
                    <td class="text-center">
                      <q-checkbox v-model="menu.ubah" :disable="!modul.isActive" color="primary" />
                    </td>
                    <td class="text-center">
                      <q-checkbox v-model="menu.hapus" :disable="!modul.isActive" color="primary" />
                    </td>
                    <td class="text-center">
                      <q-checkbox
                        v-model="menu.approve"
                        :disable="!modul.isActive"
                        color="primary"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import routes from 'src/router/routes'

const $q = useQuasar()
const currentView = ref('list')
const karyawanList = ref([])
const selectedKaryawan = ref(null)
const loading = ref(false)
const matrixAkses = ref([])

/**
 * GENERATE MATRIX: Mengambil menu dari routes.js secara otomatis
 */
const generateMatrixFromRoutes = () => {
  const modulPaths = ['/konstruksi', '/absensi', '/manufaktur', '/management-karyawan']
  const filteredRoutes = routes.filter((r) => modulPaths.includes(r.path))

  return filteredRoutes.map((route) => {
    const label = route.path.replace('/', '').replace('-', ' ')
    const menus = []

    if (route.children) {
      route.children.forEach((child) => {
        if (!child.path || child.path === '') return
        const pathParts = child.path.split('/')
        // Label menu dari path terakhir
        const menuLabel = pathParts[pathParts.length - 1].replace('-', ' ').replace(/\/:id/, '')

        menus.push({
          id: `${route.path}_${child.path}`.replace(/\//g, '_'),
          label: menuLabel,
          level: pathParts.length,
          lihat: false,
          buat: false,
          ubah: false,
          hapus: false,
          approve: false,
        })
      })
    }

    return {
      id: route.path.replace('/', ''),
      label: label,
      isActive: false,
      menus: menus,
    }
  })
}

onMounted(() => {
  // Inisialisasi struktur awal
  matrixAkses.value = generateMatrixFromRoutes()

  onSnapshot(collection(db, 'karyawan'), (snapshot) => {
    karyawanList.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  })
})

const handleEditAkses = (karyawan) => {
  selectedKaryawan.value = karyawan
  const baseMatrix = generateMatrixFromRoutes()

  if (karyawan.permissions_detail) {
    const savedData = karyawan.permissions_detail
    baseMatrix.forEach((m) => {
      const savedModul = savedData.find((sm) => sm.id === m.id)
      if (savedModul) {
        m.isActive = savedModul.isActive
        m.menus.forEach((menu) => {
          const savedMenu = savedModul.menus.find((sm) => sm.id === menu.id)
          if (savedMenu) {
            menu.lihat = savedMenu.lihat
            menu.buat = savedMenu.buat
            menu.ubah = savedMenu.ubah
            menu.hapus = savedMenu.hapus
            menu.approve = savedMenu.approve
          }
        })
      }
    })
    matrixAkses.value = baseMatrix
  } else {
    // Inisialisasi isActive berdasarkan field 'akses' utama karyawan
    baseMatrix.forEach((m) => {
      m.isActive = karyawan.akses?.includes(m.id) || false
    })
    matrixAkses.value = baseMatrix
  }

  currentView.value = 'detail'
}

const handleSave = async () => {
  loading.value = true
  try {
    const karyawanRef = doc(db, 'karyawan', selectedKaryawan.value.id)

    // Status Modul yang aktif
    const activeModuls = matrixAkses.value.filter((m) => m.isActive).map((m) => m.id)

    await updateDoc(karyawanRef, {
      permissions_detail: JSON.parse(JSON.stringify(matrixAkses.value)),
      akses: activeModuls,
    })

    $q.notify({
      type: 'positive',
      message: 'Hak akses spesifik berhasil disimpan!',
    })
    currentView.value = 'list'
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal: ' + error.message })
  } finally {
    loading.value = false
  }
}

const columns = [
  { name: 'no', label: 'No', align: 'left', field: 'no' },
  { name: 'nik', label: 'NIK', align: 'left', field: 'nik', sortable: true },
  { name: 'nama', label: 'Nama Karyawan', align: 'left', field: 'nama', sortable: true },
  { name: 'jabatan', label: 'Jabatan', align: 'left', field: 'jabatan' },
  { name: 'hak_modul', label: 'Hak Modul', align: 'left', field: 'akses' },
]
</script>

<style scoped>
.matrix-table thead th {
  background-color: #757575 !important;
  color: white !important;
  font-weight: bold;
  text-transform: uppercase;
  border: 1px solid #e0e0e0;
}
.matrix-table tbody td {
  border: 1px solid #eeeeee;
}
.hover-bg:hover {
  background-color: #e3f2fd;
}
.border-bottom {
  border-bottom: 1px solid #dcdcdc;
}
.text-uppercase {
  text-transform: uppercase;
}
/* Memastikan dropdown tidak terlalu gemuk */
.q-expansion-item--expanded {
  margin-bottom: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>
