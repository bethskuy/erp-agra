<template>
  <q-page class="akses-page font-pro">
    <!-- =====================================================================================
         VIEW 1: LIST KARYAWAN
         ===================================================================================== -->
    <template v-if="currentView === 'list'">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bolder text-pink-7 font-pro">Manajemen Hak Akses 🔐</div>
          <div class="text-subtitle2 text-pink-5">
            Konfigurasi izin modul dan fitur secara spesifik per karyawan
          </div>
        </div>
      </div>

      <!-- SEARCH BAR -->
      <q-card flat class="cute-search-card q-mb-md">
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
                  <q-icon name="search" color="pink-6" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space class="gt-sm" />
            <div class="text-caption text-pink-5 text-weight-bold q-pr-md">
              Klik pada baris karyawan untuk mengatur izin spesifik 🧸
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <div class="mac-card q-mb-lg">
        <div class="mac-header">
          <div class="dots-row">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="mac-title">🔑 MATRIX AKSES KARYAWAN 🔑</div>
        </div>
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
                <!--
                  ✅ FIX: Cek isSuperRole yang sekarang juga mempertimbangkan
                  field is_super_admin dari Firestore
                -->
                <template v-if="isSuperRole(props.row)">
                  <q-badge
                    color="green-10"
                    text-color="white"
                    class="q-px-sm q-py-xs text-weight-bold"
                  >
                    <q-icon name="verified_user" size="xs" class="q-mr-xs" />
                    SEMUA MODUL (FULL ACCESS)
                  </q-badge>
                </template>
                <template v-else>
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
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>

    <!-- =====================================================================================
         VIEW 2: DETAIL MATRIX AKSES
         ===================================================================================== -->
    <template v-else>
      <div class="row items-center justify-between q-mb-lg">
        <div class="row items-center">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="currentView = 'list'"
            class="q-mr-md cute-btn-main"
          />
          <div>
            <div class="text-h5 text-weight-bold text-pink-7 font-pro">Konfigurasi Hak Akses 🔐</div>
            <div class="text-caption text-pink-5">
              Atur izin CRUD dan Approve untuk setiap menu di dalam modul
            </div>
          </div>
        </div>

        <q-btn
          @click="handleSave"
          class="cute-btn-pink q-px-xl text-weight-bold"
          :loading="loading"
          icon="save"
          label="SIMPAN PERUBAHAN ✨"
        />
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Sidebar Info Karyawan -->
        <div class="col-12 col-md-4">
          <q-card flat class="cute-form-card sticky-card q-mb-lg">
            <q-card-section class="saas-gradient-primary text-white text-center q-pa-lg rounded-top-24">
              <q-avatar size="100px" class="shadow-5 border-white-2 q-mb-md">
                <img :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
              </q-avatar>
              <div class="text-h6 text-weight-bold">{{ selectedKaryawan.nama }}</div>
              <div class="text-caption opacity-80">{{ selectedKaryawan.jabatan }}</div>
              <q-badge color="orange-9" class="q-mt-sm text-weight-bold">
                {{ selectedKaryawan.nik }}
              </q-badge>

              <!--
                ✅ FIX: Tampilkan badge sumber deteksi Super Admin
                agar admin tahu kenapa user ini mendapat full access
              -->
              <div class="q-mt-sm" v-if="isSuperRole(selectedKaryawan)">
                <q-badge
                  v-if="selectedKaryawan.is_super_admin === true"
                  color="green-8"
                  class="q-mr-xs"
                >
                  <q-icon name="verified" size="xs" class="q-mr-xs" />
                  TERSIMPAN: FULL ACCESS
                </q-badge>
                <q-badge v-else color="orange-8">
                  <q-icon name="warning" size="xs" class="q-mr-xs" />
                  BELUM DISIMPAN
                </q-badge>
              </div>
            </q-card-section>

            <q-card-section class="q-pa-md">
              <template v-if="isSuperRole(selectedKaryawan)">
                <div class="q-pa-md bg-green-1 rounded-borders text-center border-green-thin">
                  <q-icon name="verified_user" color="green-9" size="md" class="q-mb-sm" />
                  <div class="text-weight-bold text-green-9 text-subtitle2">FULL ACCESS</div>
                  <div class="text-caption text-green-8 q-mt-xs">
                    Role <strong>{{ selectedKaryawan.jabatan }}</strong> mendapat akses penuh ke
                    semua modul secara otomatis tanpa perlu konfigurasi manual.
                  </div>
                </div>

                <!--
                  ✅ FIX: Tampilkan warning jika is_super_admin belum tersimpan
                  di Firestore untuk user ini. Admin perlu klik simpan sekali.
                -->
                <div
                  v-if="selectedKaryawan.is_super_admin !== true"
                  class="q-mt-md q-pa-md bg-orange-1 rounded-borders border-orange-thin"
                >
                  <div class="row items-start no-wrap q-gutter-x-sm">
                    <q-icon name="warning_amber" color="orange-9" size="sm" class="q-mt-xs" />
                    <div>
                      <div class="text-weight-bold text-orange-9 text-caption">
                        PERLU DISIMPAN SEKALI
                      </div>
                      <div class="text-caption text-orange-8 q-mt-xs">
                        Klik <strong>"SIMPAN PERUBAHAN"</strong> untuk menulis flag
                        <code>is_super_admin</code> ke database. Ini memastikan semua halaman sistem
                        mengenali user ini sebagai Super Admin.
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
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
              </template>
            </q-card-section>
          </q-card>
        </div>

        <!-- Matrix Editor -->
        <div class="col-12 col-md-8">
          <template v-if="isSuperRole(selectedKaryawan)">
            <div class="mac-card overflow-hidden">
              <div class="mac-header">
                <div class="dots-row">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <div class="mac-title">👑 OTORITAS FULL ACCESS 👑</div>
              </div>
              <div class="q-pa-xl text-center">
                <q-icon name="admin_panel_settings" size="80px" color="green-8" class="q-mb-md" />
                <div class="text-h5 text-weight-bold text-green-9 q-mb-sm">
                  Akses Penuh Otomatis
                </div>
                <div class="text-body1 text-grey-7 q-mb-lg">
                  Karyawan dengan jabatan
                  <strong>{{ selectedKaryawan.jabatan }}</strong>
                  memiliki hak akses ke <strong>seluruh modul dan fitur</strong> sistem ERP secara
                  otomatis.
                </div>

                <!--
                  ✅ FIX: Tampilkan status simpan dengan jelas
                -->
                <div
                  v-if="selectedKaryawan.is_super_admin !== true"
                  class="q-mb-lg q-pa-md bg-orange-1 rounded-12 border-orange-thin text-left"
                >
                  <div class="row items-center q-gutter-x-sm">
                    <q-icon name="info_outline" color="orange-9" />
                    <div class="text-caption text-orange-9 text-weight-bold">
                      Flag <code>is_super_admin</code> belum tersimpan di database untuk akun ini.
                      Klik tombol simpan di bawah agar semua modul dapat diakses.
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="q-mb-lg q-pa-md bg-green-1 rounded-12 border-green-thin text-left"
                >
                  <div class="row items-center q-gutter-x-sm">
                    <q-icon name="check_circle" color="green-9" />
                    <div class="text-caption text-green-9 text-weight-bold">
                      Full access sudah tersimpan di database. User ini dapat mengakses semua modul.
                    </div>
                  </div>
                </div>

                <q-chip
                  v-for="mod in allModulIds"
                  :key="mod"
                  color="green-1"
                  text-color="green-9"
                  icon="check_circle"
                  class="text-weight-bold q-ma-xs"
                >
                  {{ mod.toUpperCase() }}
                </q-chip>

                <div class="q-mt-xl">
                  <q-btn
                    unelevated
                    color="pink-6"
                    icon="save"
                    label="SIMPAN (KONFIRMASI FULL ACCESS) ✨"
                    @click="handleSave"
                    :loading="loading"
                    class="cute-btn-pink q-px-xl text-weight-bold"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Matrix Normal untuk non-Super Admin -->
          <template v-else>
            <div class="mac-card overflow-hidden">
              <div class="mac-header">
                <div class="dots-row">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <div class="mac-title">🔑 MATRIX OTORISASI MODUL &amp; MENU 🔑</div>
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
            </div>
          </template>

          <div class="q-py-xl"></div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

// ============================================================================
// ✅ FIX: KONSTANTA ROLE SUPER
// Pengecekan sekarang 3 lapis:
// 1. Field is_super_admin === true (flag eksplisit di Firestore)
// 2. Field jabatan match SUPER_ROLES
// 3. Field role match SUPER_ROLES
// ============================================================================
const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']

/**
 * ✅ FIX UTAMA: isSuperRole sekarang cek 3 lapis
 * - Lapis 1: is_super_admin flag (paling reliable, disimpan saat save)
 * - Lapis 2: jabatan string match
 * - Lapis 3: role string match
 *
 * Dengan ini, si Hafid akan terdeteksi Super Admin meskipun
 * jabatannya sedikit berbeda ejaan, selama is_super_admin = true di Firestore.
 */
const isSuperRole = (karyawan) => {
  if (!karyawan) return false

  // ✅ Lapis 1: Cek field is_super_admin (paling reliable)
  if (karyawan.is_super_admin === true) return true

  // ✅ Lapis 2: Cek field jabatan (case-insensitive)
  const jabatan = (karyawan.jabatan || '').toLowerCase().trim()
  if (SUPER_ROLES.includes(jabatan)) return true

  // ✅ Lapis 3: Cek field role (case-insensitive)
  const role = (karyawan.role || '').toLowerCase().trim()
  if (SUPER_ROLES.includes(role)) return true

  return false
}

// ============================================================================
// GENERATE MATRIX dari routes.js
// ============================================================================
const generateMatrixFromRoutes = () => {
  const modulPaths = ['/konstruksi', '/absensi', '/manufaktur', '/management-karyawan']
  const filteredRoutes = routes.filter((r) => modulPaths.includes(r.path))

  return filteredRoutes.map((route) => {
    const modulId = route.path.replace('/', '')
    const label = route.path.replace('/', '').replace('-', ' ')
    const menus = []

    if (route.children) {
      route.children.forEach((child) => {
        if (!child.path || child.path === '') return
        if (child.path.includes('gudang')) return

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

    if (modulId === 'konstruksi') {
      menus.push({
        id: '_konstruksi_gudang',
        label: 'GUDANG & STOK',
        level: 1,
        lihat: false,
        buat: false,
        ubah: false,
        hapus: false,
        approve: false,
      })
    }

    if (modulId === 'manufaktur') {
      menus.push({
        id: '_manufaktur_gudang',
        label: 'GUDANG & STOK',
        level: 1,
        lihat: false,
        buat: false,
        ubah: false,
        hapus: false,
        approve: false,
      })
    }

    // ✅ Tambahkan menu absensi-harian-lepas ke modul absensi secara eksplisit
    // karena route ini mungkin belum terdaftar atau punya path khusus
    if (modulId === 'absensi') {
      const sudahAda = menus.some(
        (m) =>
          m.id.includes('absensi_harian_lepas') ||
          m.id.includes('harian-lepas') ||
          m.label.toLowerCase().includes('harian lepas'),
      )
      if (!sudahAda) {
        menus.push({
          id: '_absensi_harian_lepas',
          label: 'ABSENSI HARIAN-LEPAS',
          level: 2,
          lihat: false,
          buat: false,
          ubah: false,
          hapus: false,
          approve: false,
        })
      }
    }

    return { id: modulId, label: label, isActive: false, menus: menus }
  })
}

/**
 * Generate matrix dengan SEMUA izin aktif — untuk Super Admin
 */
const generateFullAccessMatrix = () => {
  const matrix = generateMatrixFromRoutes()
  return matrix.map((modul) => ({
    ...modul,
    isActive: true,
    menus: modul.menus.map((menu) => ({
      ...menu,
      lihat: true,
      buat: true,
      ubah: true,
      hapus: true,
      approve: true,
    })),
  }))
}

/**
 * Daftar semua label modul — untuk tampilan panel Super Admin
 */
const allModulIds = computed(() => generateMatrixFromRoutes().map((m) => m.label))

let unsubKaryawan = null

onMounted(() => {
  matrixAkses.value = generateMatrixFromRoutes()

  unsubKaryawan = onSnapshot(collection(db, 'karyawan'), (snapshot) => {
    karyawanList.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  })
})

onUnmounted(() => {
  if (unsubKaryawan) unsubKaryawan()
})

// ============================================================================
// BUKA MATRIX AKSES
// ============================================================================
const handleEditAkses = (karyawan) => {
  selectedKaryawan.value = karyawan

  // ✅ FIX: Jika Super Admin (deteksi 3 lapis) → set full access matrix
  if (isSuperRole(karyawan)) {
    matrixAkses.value = generateFullAccessMatrix()
    currentView.value = 'detail'
    window.scrollTo(0, 0)
    return
  }

  // Non-Super Admin: load dari permissions_detail yang tersimpan di Firestore
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
            menu.lihat = savedMenu.lihat || false
            menu.buat = savedMenu.buat || false
            menu.ubah = savedMenu.ubah || false
            menu.hapus = savedMenu.hapus || false
            menu.approve = savedMenu.approve || false
          }
        })
      }
    })
  } else {
    // Fallback: aktifkan modul berdasarkan field akses lama (array string)
    baseMatrix.forEach((m) => {
      m.isActive = karyawan.akses?.includes(m.id) || false
    })
  }

  matrixAkses.value = baseMatrix
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

// ============================================================================
// SIMPAN HAK AKSES
// ============================================================================
const handleSave = async () => {
  loading.value = true
  try {
    const karyawanRef = doc(db, 'karyawan', selectedKaryawan.value.id)

    if (isSuperRole(selectedKaryawan.value)) {
      // ✅ FIX UTAMA: Super Admin → simpan full access + is_super_admin: true
      // Field is_super_admin inilah yang menjadi kunci agar semua halaman lain
      // (monitoring, absensi, dll) bisa mengenali user ini sebagai Super Admin
      // tanpa bergantung pada pengecekan jabatan string yang bisa beda ejaan.
      const fullMatrix = generateFullAccessMatrix()
      const permissionsToSave = JSON.parse(JSON.stringify(fullMatrix))
      const aksesToSave = fullMatrix.map((m) => m.id)

      await updateDoc(karyawanRef, {
        permissions_detail: permissionsToSave,
        akses: aksesToSave,
        // ✅ Flag eksplisit — inilah yang dipakai halaman lain untuk cek akses
        is_super_admin: true,
      })

      // Update local state agar badge "BELUM DISIMPAN" langsung hilang
      selectedKaryawan.value = { ...selectedKaryawan.value, is_super_admin: true }

      $q.notify({
        type: 'positive',
        icon: 'verified_user',
        message: `Full access berhasil dikonfirmasi untuk ${selectedKaryawan.value.nama}! Semua modul kini dapat diakses.`,
        position: 'top',
        timeout: 4000,
      })
    } else {
      // Non-Super Admin → simpan matrix sesuai konfigurasi
      const activeModuls = matrixAkses.value.filter((m) => m.isActive).map((m) => m.id)
      const permissionsToSave = JSON.parse(JSON.stringify(matrixAkses.value))

      await updateDoc(karyawanRef, {
        permissions_detail: permissionsToSave,
        akses: activeModuls,
        // ✅ Pastikan flag false untuk non-Super Admin
        is_super_admin: false,
      })

      $q.notify({
        type: 'positive',
        message: 'Hak akses spesifik berhasil disimpan!',
        position: 'top',
      })
    }

    currentView.value = 'list'
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan: ' + error.message })
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
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');

.akses-page {
  padding: 16px;
  background-color: #ffe4e6; /* Cute pastel rose pink background */
  background-image: 
    radial-gradient(#ffd1dc 2px, transparent 2px), 
    radial-gradient(#ffd1dc 2px, transparent 2px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 600px) {
  .akses-page {
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .akses-page {
    padding: 32px 40px;
  }
}

.font-pro {
  font-family: 'Fredoka', sans-serif;
}

.saas-gradient-primary {
  background: linear-gradient(135deg, #db2777 0%, #ec4899 100%) !important;
}

.rounded-top-24 {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.border-white-2 {
  border: 3.5px solid white;
}

/* ==========================================
   CUTE SHADOWS, CARDS, BUBBLES
   ========================================== */
.cute-search-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 20px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-form-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

/* ==========================================
   CUTE BUTTONS
   ========================================== */
.cute-btn-main {
  background-color: #fff1f2 !important;
  border: 2.5px solid #fda4af !important;
  border-radius: 50px !important;
  color: #db2777 !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ffe4e6 !important;
}
.cute-btn-main:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

.cute-btn-pink {
  background-color: #db2777 !important;
  border: 2.5px solid #be185d !important;
  border-radius: 50px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-pink:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ec4899 !important;
}
.cute-btn-pink:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

/* ==========================================
   MAC WINDOW SHELL CARDS
   ========================================== */
.mac-card {
  background: #ffffff;
  border: 3px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 10px 0px #fecdd3, 0 16px 30px rgba(225, 29, 72, 0.08) !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mac-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 0px #fecdd3, 0 20px 35px rgba(225, 29, 72, 0.12) !important;
}

.mac-header {
  background: #fff0f2;
  border-bottom: 3px solid #ffb7c5;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.dots-row {
  display: flex;
  gap: 8px;
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

.mac-title {
  width: 100%;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #db2777;
}

/* ==========================================
   TABLE CUSTOM STYLING
   ========================================== */
.akses-table {
  background-color: transparent !important;
}

.akses-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff0f2 !important;
  color: #db2777 !important;
  font-family: 'Fredoka', sans-serif;
  font-weight: 800 !important;
  border-bottom: 3px solid #ffb7c5 !important;
}

.hover-bg:hover {
  background-color: rgba(219, 39, 119, 0.05) !important;
}

.border-subtle {
  border: 1px solid #ffe4e6 !important;
}

.border-green-thin {
  border: 1.5px dashed #4ade80;
  background: #f0fdf4;
}

.border-orange-thin {
  border: 1.5px dashed #fb923c;
  background: #fff7ed;
}

.modul-expansion {
  border-bottom: 1px dashed #ffe4e6;
  transition: all 0.2s ease;
}

.modul-expansion:hover {
  background-color: #fff1f2;
}

/* Matrix Table checkboxes and headers */
.matrix-table {
  background: #fff8f9 !important;
}

.matrix-table thead th {
  font-size: 0.75rem;
  font-weight: 800;
  color: #db2777;
  letter-spacing: 0.05em;
  padding: 12px;
  background-color: #fff0f2;
  border-bottom: 2px solid #ffccd5;
}

.matrix-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px dashed #ffe4e6;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  color: #db2777;
}

.hover-row:hover {
  background-color: #fff5f6;
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
