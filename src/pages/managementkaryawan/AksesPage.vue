<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- VIEW 1: LIST KARYAWAN -->
    <template v-if="currentView === 'list'">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bolder text-blue-grey-10">Manajemen Hak Akses</div>
          <div class="text-subtitle2 text-grey-7">
            Konfigurasi izin modul dan fitur secara spesifik per karyawan
          </div>
        </div>
      </div>

      <!-- SEARCH BAR & STATS -->
      <q-card flat bordered class="q-mb-md shadow-1 rounded-borders">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari NIK, Nama, atau Jabatan..."
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space class="gt-sm" />
            <div class="text-caption text-grey-6 q-pr-md">
              Klik pada baris karyawan untuk mengatur izin spesifik
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <q-card flat bordered class="shadow-2 rounded-borders overflow-hidden">
        <q-table
          :rows="karyawanList"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          :pagination="{ rowsPerPage: 10 }"
          binary-state-sort
          class="akses-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-blue-grey-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="cursor-pointer hover-bg transition-all"
              @click="handleEditAkses(props.row)"
            >
              <q-td key="no" class="text-grey-6">{{ props.pageIndex + 1 }}</q-td>
              <q-td key="nik" class="text-weight-medium">{{ props.row.nik }}</q-td>
              <q-td key="nama">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="28px"
                    color="blue-1"
                    text-color="primary"
                    class="q-mr-sm text-weight-bold"
                  >
                    {{ props.row.nama?.charAt(0) }}
                  </q-avatar>
                  <div class="text-weight-bold text-primary">{{ props.row.nama }}</div>
                </div>
              </q-td>
              <q-td key="jabatan">
                <q-badge outline color="blue-grey-4" class="text-weight-medium">
                  {{ props.row.jabatan }}
                </q-badge>
              </q-td>
              <q-td key="hak_modul">
                <div class="row q-gutter-xs">
                  <q-badge
                    v-for="mod in props.row.akses"
                    :key="mod"
                    color="indigo-1"
                    text-color="indigo-10"
                    class="q-px-sm q-py-xs text-weight-bold border-subtle"
                  >
                    {{ mod.toUpperCase() }}
                  </q-badge>
                  <span v-if="!props.row.akses?.length" class="text-grey-4 italic text-caption"
                    >Belum ada modul</span
                  >
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- VIEW 2: DETAIL MATRIX AKSES -->
    <template v-else>
      <div class="row items-center justify-between q-mb-lg">
        <div class="row items-center">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="blue-grey-8"
            @click="currentView = 'list'"
            class="q-mr-md"
          />
          <div>
            <div class="text-h5 text-weight-bold text-blue-grey-10">Konfigurasi Hak Akses</div>
            <div class="text-caption text-grey-7">
              Atur izin CRUD dan Approve untuk setiap menu di dalam modul
            </div>
          </div>
        </div>

        <q-btn
          @click="handleSave"
          color="indigo-10"
          class="q-px-xl text-weight-bold shadow-4"
          unelevated
          rounded
          :loading="loading"
          icon="save"
          label="SIMPAN PERUBAHAN"
        />
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Sidebar Info Karyawan -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="rounded-borders sticky-card shadow-1">
            <q-card-section class="bg-blue-grey-10 text-white text-center q-pa-lg">
              <q-avatar size="100px" class="shadow-5 border-white-2 q-mb-md">
                <img :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
              </q-avatar>
              <div class="text-h6 text-weight-bold">{{ selectedKaryawan.nama }}</div>
              <div class="text-caption opacity-80">{{ selectedKaryawan.jabatan }}</div>
              <q-badge color="orange-9" class="q-mt-sm text-weight-bold">{{
                selectedKaryawan.nik
              }}</q-badge>
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="text-subtitle2 text-blue-grey-8 q-mb-sm">Ringkasan Modul Aktif:</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="mod in matrixAkses.filter((m) => m.isActive)"
                  :key="mod.id"
                  dense
                  color="blue-1"
                  text-color="primary"
                >
                  {{ mod.label }}
                </q-chip>
                <div
                  v-if="!matrixAkses.some((m) => m.isActive)"
                  class="text-caption text-grey-5 italic"
                >
                  Tidak ada modul aktif
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Matrix Editor -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="rounded-borders overflow-hidden shadow-2">
            <div
              class="q-pa-md bg-grey-2 text-weight-bold text-blue-grey-9 border-bottom flex items-center"
            >
              <q-icon name="rule" class="q-mr-sm" size="sm" />
              MATRIX OTORISASI MODUL & MENU
            </div>

            <q-list separator>
              <q-expansion-item
                v-for="(modul, mIdx) in matrixAkses"
                :key="modul.id"
                group="matrix-group"
                header-class="bg-white text-weight-bold"
                class="modul-expansion"
                expand-separator
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <div class="text-weight-bold text-grey-4 text-h6">0{{ mIdx + 1 }}</div>
                  </q-item-section>
                  <q-item-section>
                    <div class="row items-center no-wrap">
                      <q-icon
                        :name="modul.isActive ? 'folder_open' : 'folder_off'"
                        :color="modul.isActive ? 'primary' : 'grey-4'"
                        class="q-mr-md"
                        size="sm"
                      />
                      <div
                        class="text-subtitle1 text-weight-bolder text-uppercase"
                        :class="modul.isActive ? 'text-blue-grey-10' : 'text-grey-5'"
                      >
                        {{ modul.label }}
                      </div>
                    </div>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle
                      v-model="modul.isActive"
                      color="primary"
                      @click.stop
                      label="Aktifkan Modul"
                      left-label
                      class="text-weight-bold"
                    />
                  </q-item-section>
                </template>

                <q-card class="bg-grey-1">
                  <q-markup-table flat square wrap-cells class="matrix-table no-shadow">
                    <thead>
                      <tr class="bg-blue-grey-1 text-blue-grey-9">
                        <th class="text-left">MENU APLIKASI</th>
                        <th class="text-center" style="width: 70px">LIHAT</th>
                        <th class="text-center" style="width: 70px">BUAT</th>
                        <th class="text-center" style="width: 70px">UBAH</th>
                        <th class="text-center" style="width: 70px">HAPUS</th>
                        <th class="text-center" style="width: 70px">SETUJU</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="menu in modul.menus"
                        :key="menu.id"
                        :class="!modul.isActive ? 'text-grey-4 opacity-50' : 'hover-row'"
                      >
                        <td class="text-left">
                          <div
                            class="row items-center no-wrap"
                            :style="{ paddingLeft: (menu.level - 1) * 20 + 'px' }"
                          >
                            <q-icon
                              :name="
                                menu.level === 1 ? 'chevron_right' : 'subdirectory_arrow_right'
                              "
                              size="xs"
                              class="q-mr-xs text-grey-5"
                            />
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
                          <q-checkbox
                            v-model="menu.lihat"
                            :disable="!modul.isActive"
                            color="primary"
                            dense
                          />
                        </td>
                        <td class="text-center">
                          <q-checkbox
                            v-model="menu.buat"
                            :disable="!modul.isActive"
                            color="primary"
                            dense
                          />
                        </td>
                        <td class="text-center">
                          <q-checkbox
                            v-model="menu.ubah"
                            :disable="!modul.isActive"
                            color="primary"
                            dense
                          />
                        </td>
                        <td class="text-center">
                          <q-checkbox
                            v-model="menu.hapus"
                            :disable="!modul.isActive"
                            color="primary"
                            dense
                          />
                        </td>
                        <td class="text-center">
                          <q-checkbox
                            v-model="menu.approve"
                            :disable="!modul.isActive"
                            color="primary"
                            dense
                          />
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card>
          <div class="q-py-xl"></div>
        </div>
      </div>
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
const filter = ref('')
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
            menu.approve = savedMenu.approve || false
          }
        })
      }
    })
    matrixAkses.value = baseMatrix
  } else {
    baseMatrix.forEach((m) => {
      m.isActive = karyawan.akses?.includes(m.id) || false
    })
    matrixAkses.value = baseMatrix
  }

  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const handleSave = async () => {
  loading.value = true
  try {
    const karyawanRef = doc(db, 'karyawan', selectedKaryawan.value.id)
    const activeModuls = matrixAkses.value.filter((m) => m.isActive).map((m) => m.id)

    await updateDoc(karyawanRef, {
      permissions_detail: JSON.parse(JSON.stringify(matrixAkses.value)),
      akses: activeModuls,
    })

    $q.notify({
      type: 'positive',
      message: 'Hak akses spesifik berhasil disimpan!',
      position: 'top',
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
  { name: 'no', label: 'NO', align: 'left', field: 'no' },
  { name: 'nik', label: 'NIK', align: 'left', field: 'nik', sortable: true },
  { name: 'nama', label: 'NAMA KARYAWAN', align: 'left', field: 'nama', sortable: true },
  { name: 'jabatan', label: 'JABATAN', align: 'left', field: 'jabatan', sortable: true },
  { name: 'hak_modul', label: 'MODUL DIAKSES', align: 'left', field: 'akses' },
]
</script>

<script>
export default {
  name: 'AksesPage',
}
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    Helvetica,
    Arial,
    sans-serif;
}

.akses-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.rounded-borders {
  border-radius: 12px;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.modul-expansion {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.3s ease;
}

.modul-expansion:hover {
  background-color: #fafafa;
}

.matrix-table thead th {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 12px;
}

.matrix-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.hover-row:hover {
  background-color: #fff;
}

.border-white-2 {
  border: 3px solid white;
}

.transition-all {
  transition: all 0.3s ease;
}

.sticky-card {
  position: sticky;
  top: 100px;
}

.opacity-50 {
  opacity: 0.5;
}

.tracking-widest {
  letter-spacing: 0.1em;
}
</style>
